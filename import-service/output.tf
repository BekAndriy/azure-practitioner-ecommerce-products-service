output "location" {
  description = "The Azure region"
  value       = azurerm_resource_group.import_service_rg.location
}

output "storage_account" {
  description = "Storage account for Profiles"
  value       = azurerm_storage_account.import_service_fa.name
}

output "storage_account_import_products" {
  description = "Storage account for imported products"
  value       = azurerm_storage_account.sa_import_products.name
}
