output "server" {
  value = "http://${oci_core_instance.server[0].public_ip}"
}

output "server_ssh" {
  value = "ssh opc@${oci_core_instance.server[0].public_ip}"
}

output "web" {
  value = "http://${oci_core_instance.web[0].public_ip}"
}

output "web_ssh" {
  value = "ssh opc@${oci_core_instance.web[0].public_ip}"
}

output "lb_public_ip" {
  value = oci_core_public_ip.reserved_ip.ip_address
}
