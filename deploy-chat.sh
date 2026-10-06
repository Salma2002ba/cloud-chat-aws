#!/bin/bash
# Déploie le microservice de messagerie sur Amazon ECS Fargate :
# build de l'image Docker, push vers ECR, redéploiement du service.

# Arrêter le script si une commande échoue
set -euo pipefail

REGION="${AWS_REGION:-us-east-1}"
ACCOUNT_ID="$(aws sts get-caller-identity --query Account --output text)"
ECR_REPO="$ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com"

echo "========================================"
echo "🚀 DÉPLOIEMENT DU SERVICE CHAT (ECS)"
echo "========================================"

echo "🐳 Connexion à ECR..."
aws ecr get-login-password --region "$REGION" | docker login --username AWS --password-stdin "$ECR_REPO"

echo "🏗️  Build de l'image Docker..."
docker build -f microservice-messaging/Dockerfile -t "$ECR_REPO/projet-cc/chat:latest" ./microservice-messaging

echo "⬆️  Push vers AWS ECR..."
docker push "$ECR_REPO/projet-cc/chat:latest"

echo "🔄 Redéploiement du service ECS..."
aws ecs update-service --cluster chat-cluster --service chat-service --force-new-deployment --region "$REGION" > /dev/null

echo "✅ SERVICE CHAT DÉPLOYÉ"
