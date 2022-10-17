output "lb_public_ip" {
  value = "http://${oci_core_public_ip.reserved_ip.ip_address}"
}