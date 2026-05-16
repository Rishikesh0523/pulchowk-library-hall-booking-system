output "instance_id" {
  description = "EC2 instance ID"
  value       = aws_instance.app.id
}

output "public_ip" {
  description = "Public IP of the application server"
  value       = aws_instance.app.public_ip
}

output "public_dns" {
  description = "Public DNS of the application server"
  value       = aws_instance.app.public_dns
}

output "app_url" {
  description = "Frontend URL after deployment"
  value       = "http://${aws_instance.app.public_dns}"
}

output "grafana_url" {
  description = "Grafana dashboard URL"
  value       = "http://${aws_instance.app.public_dns}:3000"
}

output "prometheus_url" {
  description = "Prometheus URL"
  value       = "http://${aws_instance.app.public_dns}:9090"
}
