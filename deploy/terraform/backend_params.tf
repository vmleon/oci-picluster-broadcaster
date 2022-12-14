resource "local_file" "backend_params" {
  content = templatefile("${path.module}/backend_params.tftpl",
    {
      num_switches             = var.num_switches
      num_ports                = var.num_ports
      broadcast_refresh_update = var.broadcast_refresh_update
      gen_instances_per_node   = var.gen_instances_per_node
      api_instances_per_node   = var.api_instances_per_node
      server_url               = oci_core_public_ip.reserved_ip.ip_address
    }
  )
  filename = "${path.module}/generated/backend_params.json"
}
