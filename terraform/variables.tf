# Les valeurs sensibles ne sont jamais écrites dans le code : elles viennent d'un fichier
# terraform.tfvars (ignoré par Git) ou de variables d'environnement TF_VAR_*.
# Modèle : terraform.tfvars.example

variable "aws_region" {
  description = "Région AWS du déploiement"
  type        = string
  default     = "us-east-1"
}

variable "lab_role_name" {
  description = "Rôle IAM existant utilisé par Lambda et ECS (LabRole dans AWS Academy)"
  type        = string
  default     = "LabRole"
}

variable "db_username" {
  description = "Utilisateur administrateur de la base PostgreSQL"
  type        = string
  default     = "admin_chatuser"
}

variable "db_password" {
  description = "Mot de passe de la base PostgreSQL"
  type        = string
  sensitive   = true
}

variable "jwt_secret" {
  description = "Secret de signature des jetons JWT"
  type        = string
  sensitive   = true
}

variable "auth_image_tag" {
  description = "Tag de l'image Docker du microservice d'authentification dans ECR"
  type        = string
  default     = "latest"
}
