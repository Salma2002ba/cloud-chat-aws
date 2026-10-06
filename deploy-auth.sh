#!/bin/bash
# Déploie le microservice d'authentification sur AWS Lambda :
# build de l'image Docker, push vers ECR, mise à jour de la fonction.

# Arrêter le script si une commande échoue
set -euo pipefail

REGION="${AWS_REGION:-us-east-1}"
ACCOUNT_ID="$(aws sts get-caller-identity --query Account --output text)"
ECR_REPO="$ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com"

echo "========================================"
echo "🚀 DÉPLOIEMENT DU SERVICE AUTH (LAMBDA)"
echo "========================================"

echo "🐳 Connexion à ECR..."
aws ecr get-login-password --region "$REGION" | docker login --username AWS --password-stdin "$ECR_REPO"

echo "🏗️  Build de l'image Docker (Lambda)..."
docker build -f microservice-auth/Dockerfile.lambda -t "$ECR_REPO/projet-cc/auth:latest" ./microservice-auth

echo "⬆️  Push vers AWS ECR..."
docker push "$ECR_REPO/projet-cc/auth:latest"

echo "🔄 Mise à jour de la Lambda..."
# On force la Lambda à recharger l'image, même si le tag n'a pas changé
aws lambda update-function-code --function-name auth-service --image-uri "$ECR_REPO/projet-cc/auth:latest" --region "$REGION" > /dev/null

echo "✅ SERVICE AUTH DÉPLOYÉ"
