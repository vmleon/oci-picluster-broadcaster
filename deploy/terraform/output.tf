
output "server_ssh" {
  value = "ssh opc@${oci_core_instance.server[0].public_ip}"
}

output "web_ssh" {
  value = "ssh opc@${oci_core_instance.web[0].public_ip}"
}

output "gen_ssh" {
  value = "ssh opc@${oci_core_instance.gen[0].public_ip}"
}

output "lb_public_ip" {
  value = "http://${oci_core_public_ip.reserved_ip.ip_address}"
}
