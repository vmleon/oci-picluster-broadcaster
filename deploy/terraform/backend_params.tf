resource "local_file" "backend_params" {
  content = templatefile("${path.module}/backend_params.tftpl",
    {
      cluster_size             = var.cluster_size
      broadcast_refresh_update = var.broadcast_refresh_update
    }
  )
  filename = "${path.module}/generated/backend_params.json"
}
