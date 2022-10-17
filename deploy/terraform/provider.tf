terraform {
  required_providers {
    oci = {
      source  = "oracle/oci"
      version = "~> 4.80"
    }
  }
}

provider "oci" {
  tenancy_ocid = var.tenancy_ocid
  region       = var.region
}

variable "tenancy_ocid" {}

variable "region" {}

variable "compartment_ocid" {}

variable "ssh_public_key" {}

variable "config_file_profile" {}

variable "num_switches" {
  type    = number
  default = 1024
}

variable "num_ports" {
  type    = number
  default = 42
}

variable "broadcast_refresh_update" {
  type    = number
  default = 50
}

variable "gen_instances_per_node" {
  type    = number
  default = 3
}

variable "api_instances_per_node" {
  type    = number
  default = 2
}
