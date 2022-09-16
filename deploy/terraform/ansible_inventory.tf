resource "local_file" "ansible_inventory" {
  content = templatefile("${path.module}/ansible_inventory.tftpl",
    {
      public_ip = oci_core_instance.server[0].public_ip
    }
  )
  filename = "${path.module}/generated/server.ini"
}
