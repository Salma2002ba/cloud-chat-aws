provider "aws" {
  region = var.aws_region
}

# Rôle IAM existant fourni par l'environnement AWS Academy
data "aws_iam_role" "lab_role" {
  name = var.lab_role_name
}

# Security Group pour l'Application (Lambda / ECS)
resource "aws_security_group" "app_sg" {
  name        = "app-security-group"
  description = "Security group for Lambda and ECS"
  vpc_id      = module.vpc.vpc_id

  # Egress (Sortie) : La Lambda doit pouvoir sortir partout (Internet + DB)
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1" # Tous les protocoles
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# Compte AWS courant : sert à construire l'URI ECR sans écrire l'identifiant en dur
data "aws_caller_identity" "current" {}
