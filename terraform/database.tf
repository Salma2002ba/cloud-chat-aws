# database.tf

# 1. Groupe de sécurité pour la DB
resource "aws_security_group" "rds_sg" {
  name        = "rds-security-group"
  description = "Allow Postgres access"
  vpc_id      = module.vpc.vpc_id

  # INGRESS : On autorise spécifiquement l'App SG
  ingress {
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.app_sg.id] # <--- LA CLEF EST ICI
  }

  # Garde l'Egress par défaut
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# 2. Le groupe de sous-réseaux (Où placer la DB)
resource "aws_db_subnet_group" "rds_subnet_group" {
  name       = "main-subnet-group"
  subnet_ids = module.vpc.private_subnets # On cache la DB dans le réseau privé

  tags = {
    Name = "My DB subnet group"
  }
}

# 3. L'instance Postgres elle-même
resource "aws_db_instance" "postgres" {
  identifier        = "projet-cc"
  engine            = "postgres"
  engine_version    = "16.11"       # Ou une version récente dispo sur us-east-1
  instance_class    = "db.t3.micro" # Le moins cher / Free tier
  allocated_storage = 20            # 20 GB
  storage_type      = "gp2"

  username = var.db_username
  password = var.db_password

  db_name = "app_db" # Nom de la base de données initiale

  db_subnet_group_name   = aws_db_subnet_group.rds_subnet_group.name
  vpc_security_group_ids = [aws_security_group.rds_sg.id]

  skip_final_snapshot = true  # IMPORTANT pour l'atelier (sinon le destroy plante)
  publicly_accessible = false # Sécurité : pas d'accès direct depuis internet
}