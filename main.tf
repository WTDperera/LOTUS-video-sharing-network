# ==============================================
# LOTUS VIDEO PLATFORM - TERRAFORM CONFIGURATION
# AWS EC2 Infrastructure as Code
# ==============================================

terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = "us-east-1"
}

resource "aws_instance" "lotus_server" {
  ami           = "ami-04b70fa74e45c3917"
  instance_type = "t2.micro"
  key_name      = "lotus-key"

  tags = {
    Name = "Lotus-Server"
  }
}

output "instance_public_ip" {
  description = "Public IP address of the EC2 instance"
  value       = aws_instance.lotus_server.public_ip
}
