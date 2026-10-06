# 1. Repo ECR pour stocker l'image du chat
resource "aws_ecr_repository" "chat_repo" {
  name         = "projet-cc/chat"
  force_delete = true
}

# 2. Cluster ECS (Le "serveur" logique)
resource "aws_ecs_cluster" "main" {
  name = "chat-cluster"
}

# 3. Security Group pour le Load Balancer (ALB)
# Il accepte le trafic HTTP d'Internet
resource "aws_security_group" "lb_sg" {
  name   = "chat-lb-sg"
  vpc_id = module.vpc.vpc_id

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# Security Group du Conteneur ECS
resource "aws_security_group" "ecs_sg" {
  name        = "chat-ecs-sg"
  description = "Security Group for Chat ECS Task"
  vpc_id      = module.vpc.vpc_id

  # ENTREE : Seulement depuis le Load Balancer sur le port 3000
  ingress {
    from_port       = 3000
    to_port         = 3000
    protocol        = "tcp"
    security_groups = [aws_security_group.lb_sg.id]
  }

  # SORTIE : Tout autoriser (Internet pour npm install + accès BDD)
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_security_group_rule" "allow_ecs_to_db" {
  type      = "ingress"
  from_port = 5432
  to_port   = 5432
  protocol  = "tcp"

  # On attache cette règle au Security Group de la BDD (rds_sg)
  security_group_id = aws_security_group.rds_sg.id

  # On autorise le Security Group du Chat (ecs_sg)
  source_security_group_id = aws_security_group.ecs_sg.id
}

# 5. Application Load Balancer (ALB)
# C'est lui qui donne une URL stable à ton chat
resource "aws_lb" "chat_alb" {
  name               = "chat-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.lb_sg.id]
  subnets            = module.vpc.public_subnets
}

# 6. Target Group (Cible du LB)
resource "aws_lb_target_group" "chat_tg" {
  name        = "chat-tg"
  port        = 3000
  protocol    = "HTTP"
  target_type = "ip"
  vpc_id      = module.vpc.vpc_id

  health_check {
    path = "/health" # Assure-toi d'avoir cette route dans ton express !
  }

  # CRUCIAL POUR SOCKET.IO : Stickiness (Session Affinity)
  # Permet au client de rester connecté au même serveur
  stickiness {
    type            = "lb_cookie"
    enabled         = true
    cookie_duration = 86400
  }
}

# 7. Listener (Écouteur du LB)
resource "aws_lb_listener" "front_end" {
  load_balancer_arn = aws_lb.chat_alb.arn
  port              = "80"
  protocol          = "HTTP"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.chat_tg.arn
  }
}

# 8. Task Definition (La recette du conteneur)
resource "aws_ecs_task_definition" "chat_task" {
  family                   = "chat-service"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = 256
  memory                   = 512
  execution_role_arn       = data.aws_iam_role.lab_role.arn
  task_role_arn            = data.aws_iam_role.lab_role.arn

  container_definitions = jsonencode([
    {
      name      = "chat-container"
      image     = "${aws_ecr_repository.chat_repo.repository_url}:latest"
      essential = true
      portMappings = [
        {
          containerPort = 3000
          hostPort      = 3000
          protocol      = "tcp"
        }
      ]

      environment = [
        { name = "PORT", value = "3000" },

        # --- INFOS BDD ---
        { name = "DB_HOST", value = aws_db_instance.postgres.address },
        { name = "DB_PORT", value = "5432" },
        { name = "DB_USER", value = var.db_username },
        { name = "DB_PASSWORD", value = var.db_password },
        { name = "DB_NAME", value = "app_db" },
        { name = "DB_SSL", value = "true" }, # Important comme pour la Lambda
        { name = "DB_SYNC", value = "true" },
        { name = "JWT_SECRET", value = var.jwt_secret },
        { name = "AUTH_SERVICE_URL", value = aws_ssm_parameter.auth_api_url.value }
      ]

      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = "/ecs/chat-app" # Doit correspondre au nom créé en étape 1
          "awslogs-region"        = var.aws_region
          "awslogs-stream-prefix" = "ecs"
        }
      }
    }
  ])
}

# 9. Le Service ECS (Ce qui lance la tâche)
resource "aws_ecs_service" "chat_service" {
  name            = "chat-service"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.chat_task.arn
  desired_count   = 1 # On commence avec 1 seul serveur
  launch_type     = "FARGATE"

  network_configuration {
    subnets          = module.vpc.public_subnets # En public pour simplifier l'accès internet (npm install etc)
    security_groups  = [aws_security_group.ecs_sg.id]
    assign_public_ip = true
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.chat_tg.arn
    container_name   = "chat-container"
    container_port   = 3000
  }

  depends_on = [aws_lb_listener.front_end]
}

# Crée le dossier de stockage des logs sur AWS
resource "aws_cloudwatch_log_group" "chat_logs" {
  name              = "/ecs/chat-app"
  retention_in_days = 1 # Garde les logs 1 jour seulement (économie)
}

# 10. Output : L'URL à mettre dans ton Front React
output "chat_api_url" {
  value = "http://${aws_lb.chat_alb.dns_name}"
}