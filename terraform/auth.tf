# 1. La Lambda
resource "aws_lambda_function" "auth" {
  function_name = "auth-service"
  role          = data.aws_iam_role.lab_role.arn # Utilise le LabRole existant
  package_type  = "Image"
  image_uri     = "${data.aws_caller_identity.current.account_id}.dkr.ecr.${var.aws_region}.amazonaws.com/projet-cc/auth:${var.auth_image_tag}"
  timeout       = 30

  memory_size = 512

  vpc_config {
    subnet_ids = module.vpc.private_subnets
    # On remplace le default par notre nouveau groupe
    security_group_ids = [aws_security_group.app_sg.id]
  }

  environment {
    variables = {
      # Terraform va récupérer l'adresse de la DB qu'il vient de créer
      DB_HOST     = aws_db_instance.postgres.address
      DB_PORT     = "5432"
      DB_USER     = var.db_username
      DB_PASSWORD = var.db_password
      DB_NAME     = "app_db"
      DB_SSL      = "true"
      JWT_SECRET  = var.jwt_secret
      # Important pour TypeORM : Auto-création des tables
      # (À mettre à false en vraie prod, mais true pour ton projet étudiant)
      TYPEORM_SYNCHRONIZE = "true"
    }
  }
}

# 2. L'API Gateway (Pour rendre la Lambda accessible via HTTP)
resource "aws_apigatewayv2_api" "auth_api" {
  name          = "auth-api"
  protocol_type = "HTTP"
}

resource "aws_apigatewayv2_integration" "auth_lambda" {
  api_id           = aws_apigatewayv2_api.auth_api.id
  integration_type = "AWS_PROXY"
  integration_uri  = aws_lambda_function.auth.invoke_arn
}

resource "aws_apigatewayv2_route" "any" {
  api_id    = aws_apigatewayv2_api.auth_api.id
  route_key = "ANY /{proxy+}" # Capture toutes les routes (/login, /register...)
  target    = "integrations/${aws_apigatewayv2_integration.auth_lambda.id}"
}

resource "aws_lambda_permission" "api_gw" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.auth.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.auth_api.execution_arn}/*/*"
}

resource "aws_apigatewayv2_stage" "default" {
  api_id = aws_apigatewayv2_api.auth_api.id

  name = "$default"

  auto_deploy = true
}

resource "aws_ssm_parameter" "auth_api_url" {
  name  = "/app/auth/api_url" # Le chemin "clé"
  type  = "String"
  value = aws_apigatewayv2_api.auth_api.api_endpoint # La valeur dynamique
}

# 3. Output (Pour récupérer l'URL à la fin)
output "auth_url" {
  value = aws_apigatewayv2_api.auth_api.api_endpoint
}