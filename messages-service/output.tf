output "storage_account" {
  description = "Storage account for Profiles"
  value       = azurerm_storage_account.products_service_fa.name
}
