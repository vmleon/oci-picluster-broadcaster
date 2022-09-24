resource "local_file" "ansible_inventory" {
  content = templatefile("${path.module}/ansible_inventory.tftpl",
    {
      web_public_ip    = oci_core_instance.web[0].public_ip
      server_public_ip = oci_core_instance.server[0].public_ip
      gen_public_ip    = oci_core_instance.gen[0].public_ip
    }
  )
  filename = "${path.module}/generated/server.ini"
}
