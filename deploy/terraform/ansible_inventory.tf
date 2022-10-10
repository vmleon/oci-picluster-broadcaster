resource "local_file" "ansible_inventory" {
  content = templatefile("${path.module}/ansible_inventory.tftpl",
    {
      web_hostnames     = oci_core_instance.web.*.hostname_label
      web_public_ips    = oci_core_instance.web.*.public_ip
      server_hostnames  = oci_core_instance.server.*.hostname_label
      server_public_ips = oci_core_instance.server.*.public_ip
      gen_hostnames     = oci_core_instance.gen.*.hostname_label
      gen_public_ips    = oci_core_instance.gen.*.public_ip
      api_hostnames     = oci_core_instance.api.*.hostname_label
      api_public_ips    = oci_core_instance.api.*.public_ip
    }
  )
  filename = "${path.module}/generated/server.ini"
}
