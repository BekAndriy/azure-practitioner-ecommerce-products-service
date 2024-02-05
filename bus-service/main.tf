## Create a Resource Group for Storage
resource "azurerm_resource_group" "bus_service" {
  location = var.deploy_location
  name     = "rg-${var.service_name}-${var.env}"
}

resource "azurerm_servicebus_namespace" "bus_service" {
  name                = "sb-${var.service_name}-namespace-${var.env}"
  location            = azurerm_resource_group.bus_service.location
  resource_group_name = azurerm_resource_group.bus_service.name

  # should be Standard or Premium to support topics
  sku = "Standard"
}

resource "azurerm_servicebus_queue" "bus_service" {
  name         = "sb_${var.service_name}-queue-${var.env}"
  namespace_id = azurerm_servicebus_namespace.bus_service.id

  enable_partitioning = true
}

resource "azurerm_servicebus_topic" "bus_service_topic" {
  name         = "sb_${var.service_name}-topic-${var.env}"
  namespace_id = azurerm_servicebus_namespace.bus_service.id

  enable_partitioning = true
}

# for additional handlers after the product failed event
resource "azurerm_servicebus_subscription" "bus_topic_failed" {
  name                      = "sb_${var.service_name}-failed-topic-${var.env}"
  topic_id                  = azurerm_servicebus_topic.bus_service_topic.id
  max_delivery_count        = 1
  enable_batched_operations = true
}

# for additional handlers after the product saved event
resource "azurerm_servicebus_subscription" "bus_topic_success" {
  name                      = "sb_${var.service_name}-success-topic-${var.env}"
  topic_id                  = azurerm_servicebus_topic.bus_service_topic.id
  max_delivery_count        = 1
  enable_batched_operations = true
}

resource "azurerm_servicebus_subscription_rule" "bus_topic_failed_rule" {
  name            = "sb_${var.service_name}_failed_rule"
  subscription_id = azurerm_servicebus_subscription.bus_topic_failed.id
  filter_type     = "CorrelationFilter"

  correlation_filter {
    properties = {
      type = "failed"
    }
  }
}

resource "azurerm_servicebus_subscription_rule" "bus_topic_success_rule" {
  name            = "sb_${var.service_name}_success_rule"
  subscription_id = azurerm_servicebus_subscription.bus_topic_success.id
  filter_type     = "CorrelationFilter"

  correlation_filter {
    properties = {
      type = "success"
    }
  }
}
