output "server" {
  value = "http://${oci_core_instance.server[0].public_ip}"
}


output "ssh" {
  value = "ssh opc@${oci_core_instance.server[0].public_ip}"
}
