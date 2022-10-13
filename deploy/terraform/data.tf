data "oci_identity_availability_domains" "ads" {
  compartment_id = var.tenancy_ocid
}

data "oci_objectstorage_namespace" "tenancy_namespace" {
  compartment_id = var.tenancy_ocid
}
