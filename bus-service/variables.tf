variable "deploy_location" {
  type        = string
  default     = "northeurope"
  description = "The Azure Region in which all resources in this example should be created."
}

variable "service_name" {
  type        = string
  default     = "bus016"
  description = "Unique name of the service. Used to generate names for AZ services."
}

variable "env" {
  type        = string
  default     = "dev"
  description = "Environment name."
}
