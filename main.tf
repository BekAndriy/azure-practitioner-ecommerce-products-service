## Create a Resource Group for Storage
resource "azurerm_resource_group" "product_service_rg" {
  location = var.deploy_location
  name     = "arg-${var.service_name}-${var.env}"
}

## Create storage account for static files and the functions code
resource "azurerm_storage_account" "products_service_fa" {
  name     = "asa${var.service_name}${var.env}"
  location = var.deploy_location

  account_replication_type = "LRS"
  account_tier             = "Standard"
  account_kind             = "StorageV2"
  resource_group_name      = azurerm_resource_group.product_service_rg.name
}

resource "azurerm_storage_share" "products_service_fa" {
  name  = "ss-${var.service_name}-${var.env}"
  quota = 2

  storage_account_name = azurerm_storage_account.products_service_fa.name
}

resource "azurerm_service_plan" "product_service_plan" {
  name     = "asp-${var.service_name}-${var.env}"
  location = var.deploy_location

  os_type  = "Windows"
  sku_name = "Y1"

  resource_group_name = azurerm_resource_group.product_service_rg.name
}

resource "azurerm_application_insights" "products_service_fa" {
  name             = "appins-fa-${var.service_name}-${var.env}"
  application_type = "web"
  location         = var.deploy_location

  resource_group_name = azurerm_resource_group.product_service_rg.name
}

resource "azurerm_windows_function_app" "products_service" {
  name     = "fa-${var.service_name}-${var.env}"
  location = var.deploy_location

  service_plan_id     = azurerm_service_plan.product_service_plan.id
  resource_group_name = azurerm_resource_group.product_service_rg.name

  storage_account_name       = azurerm_storage_account.products_service_fa.name
  storage_account_access_key = azurerm_storage_account.products_service_fa.primary_access_key

  functions_extension_version = "~4"
  builtin_logging_enabled     = false

  site_config {
    always_on = false

    application_insights_key               = azurerm_application_insights.products_service_fa.instrumentation_key
    application_insights_connection_string = azurerm_application_insights.products_service_fa.connection_string

    # For production systems set this to false
    use_32_bit_worker = false

    # Enable function invocations from Azure Portal.
    # Allow all origins for course purposes
    cors {
      allowed_origins = ["*"]
    }

    application_stack {
      node_version = "~18"
    }
  }

  app_settings = {
    WEBSITE_CONTENTAZUREFILECONNECTIONSTRING = azurerm_storage_account.products_service_fa.primary_connection_string
    WEBSITE_CONTENTSHARE                     = azurerm_storage_share.products_service_fa.name
  }

  # The app settings changes cause downtime on the Function App. e.g. with Azure Function App Slots
  # Therefore it is better to ignore those changes and manage app settings separately off the Terraform.
  lifecycle {
    ignore_changes = [
      app_settings,
      tags["hidden-link: /app-insights-instrumentation-key"],
      tags["hidden-link: /app-insights-resource-id"],
      tags["hidden-link: /app-insights-conn-string"]
    ]
  }
}

# Cosmos DB

resource "azurerm_cosmosdb_account" "account_db_app" {
  name                      = "dbacc${var.service_name}${var.env}"
  location                  = var.deploy_location
  resource_group_name       = azurerm_resource_group.product_service_rg.name
  offer_type                = "Standard"
  kind                      = "GlobalDocumentDB"
  enable_automatic_failover = false
  enable_free_tier          = true
  geo_location {
    location          = var.deploy_location
    failover_priority = 0
  }
  consistency_policy {
    consistency_level       = "BoundedStaleness"
    max_interval_in_seconds = 300
    max_staleness_prefix    = 100000
  }
  depends_on = [
    azurerm_resource_group.product_service_rg
  ]
}

resource "azurerm_cosmosdb_sql_database" "main" {
  name                = "cosmosdb-sqldb-${var.service_name}-${var.env}"
  resource_group_name = azurerm_resource_group.product_service_rg.name
  account_name        = azurerm_cosmosdb_account.account_db_app.name
}

resource "azurerm_cosmosdb_sql_container" "products_container" {
  name                = "products"
  resource_group_name = azurerm_resource_group.product_service_rg.name
  account_name        = azurerm_cosmosdb_account.account_db_app.name
  database_name       = azurerm_cosmosdb_sql_database.main.name
  partition_key_path  = "/id"

  indexing_policy {
    excluded_path {
      path = "/*"
    }
  }
}

resource "azurerm_cosmosdb_sql_container" "stocks_container" {
  name                = "stocks"
  resource_group_name = azurerm_resource_group.product_service_rg.name
  account_name        = azurerm_cosmosdb_account.account_db_app.name
  database_name       = azurerm_cosmosdb_sql_database.main.name
  partition_key_path  = "/product_id"

  indexing_policy {
    excluded_path {
      path = "/*"
    }
  }
}
