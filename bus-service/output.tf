output "location" {
  description = "The Azure region"
  value       = azurerm_resource_group.bus_service.location
}

output "namespace_name" {
  description = "Service Bus namespace name"
  value       = azurerm_servicebus_namespace.bus_service.name
}

output "queue_name" {
  description = "Service Bus queue name"
  value       = azurerm_servicebus_queue.bus_service.name
}

output "topic_name" {
  description = "Service Bus topic name"
  value       = azurerm_servicebus_topic.bus_service_topic.name
}


