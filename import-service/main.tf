## Create a Resource Group for Storage
resource "azurerm_resource_group" "import_service_rg" {
  location = var.deploy_location
  name     = "arg-${var.service_name}-${var.env}"
}

## Create storage account for static files and the functions code
resource "azurerm_storage_account" "import_service_fa" {
  name     = "asa${var.service_name}${var.env}"
  location = var.deploy_location

  account_replication_type = "LRS"
  account_tier             = "Standard"
  account_kind             = "StorageV2"
  resource_group_name      = azurerm_resource_group.import_service_rg.name
}

resource "azurerm_storage_share" "import_service_fa" {
  name  = "ss-${var.service_name}-${var.env}"
  quota = 2

  storage_account_name = azurerm_storage_account.import_service_fa.name
}

resource "azurerm_service_plan" "import_service_plan" {
  name     = "asp-${var.service_name}-${var.env}"
  location = var.deploy_location

  os_type  = "Windows"
  sku_name = "Y1"

  resource_group_name = azurerm_resource_group.import_service_rg.name
}

resource "azurerm_application_insights" "import_service_fa" {
  name             = "appins-fa-${var.service_name}-${var.env}"
  application_type = "web"
  location         = var.deploy_location

  resource_group_name = azurerm_resource_group.import_service_rg.name
}

resource "azurerm_windows_function_app" "import_service" {
  name     = "fa-${var.service_name}-${var.env}"
  location = var.deploy_location

  service_plan_id     = azurerm_service_plan.import_service_plan.id
  resource_group_name = azurerm_resource_group.import_service_rg.name

  storage_account_name       = azurerm_storage_account.import_service_fa.name
  storage_account_access_key = azurerm_storage_account.import_service_fa.primary_access_key

  functions_extension_version = "~4"
  builtin_logging_enabled     = false

  site_config {
    always_on = false

    application_insights_key               = azurerm_application_insights.import_service_fa.instrumentation_key
    application_insights_connection_string = azurerm_application_insights.import_service_fa.connection_string

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
    WEBSITE_CONTENTAZUREFILECONNECTIONSTRING = azurerm_storage_account.import_service_fa.primary_connection_string
    WEBSITE_CONTENTSHARE                     = azurerm_storage_share.import_service_fa.name
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

# STORAGE ACCOUNT for static files
/* Docs: https://registry.terraform.io/providers/hashicorp/azurerm/latest/docs/resources/storage_account */
resource "azurerm_storage_account" "sa_import_products" {
  name                = "importproducts016${var.env}"
  resource_group_name = azurerm_resource_group.import_service_rg.name
  location            = var.deploy_location

  account_tier                    = "Standard"
  account_replication_type        = "LRS" /*  GRS, RAGRS, ZRS, GZRS, RAGZRS */
  access_tier                     = "Cool"
  enable_https_traffic_only       = true
  allow_nested_items_to_be_public = true
  shared_access_key_enabled       = true
  public_network_access_enabled   = true

  blob_properties {
    cors_rule {
      # only for development
      allowed_origins = ["*"]
      allowed_headers = ["*"]
      allowed_methods = ["PUT"]
      # as field can't be empty we need some header
      exposed_headers    = ["any"]
      max_age_in_seconds = 60
    }
  }
}

/* Docs: https://registry.terraform.io/providers/hashicorp/azurerm/latest/docs/resources/storage_container */
resource "azurerm_storage_container" "sa_import_products_uploaded_container" {
  name                  = "uploaded"
  storage_account_name  = azurerm_storage_account.sa_import_products.name
  container_access_type = "private"
}

/* Docs: https://registry.terraform.io/providers/hashicorp/azurerm/latest/docs/resources/storage_container */
resource "azurerm_storage_container" "sa_import_products_parsed_container" {
  name                  = "parsed"
  storage_account_name  = azurerm_storage_account.sa_import_products.name
  container_access_type = "private"
}
