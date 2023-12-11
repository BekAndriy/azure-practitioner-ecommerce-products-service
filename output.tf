output "location" {
  description = "The Azure region"
  value       = azurerm_resource_group.product_service_rg.location
}

output "storage_account" {
  description = "Storage account for Profiles"
  value       = azurerm_storage_account.products_service_fa.name
}
