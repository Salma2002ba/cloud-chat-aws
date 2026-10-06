#!/bin/bash
# Déploie le frontend sur Amazon S3 : les URL des API et le nom du bucket sont lus
# dans les sorties Terraform, rien n'est écrit en dur.

# Arrêter le script si une commande échoue
set -euo pipefail

echo "========================================"
echo "🚀 DÉPLOIEMENT DU FRONTEND (S3)"
echo "========================================"

AUTH_URL="$(terraform -chdir=terraform output -raw auth_url)"
CHAT_URL="$(terraform -chdir=terraform output -raw chat_api_url)"
BUCKET="$(terraform -chdir=terraform output -raw s3_bucket_name)"

# 1. Écrire la configuration de production du front (lue par Vite au build)
cat > ui-chat/.env.production <<ENV
VITE_AUTH_API_URL=$AUTH_URL
VITE_CHAT_API_URL=$CHAT_URL
ENV

# 2. Installer les dépendances et construire le projet
cd ui-chat
npm ci
npm run build
cd ..

# 3. Envoyer vers S3
aws s3 sync ./ui-chat/dist "s3://$BUCKET" --delete

echo "✅ FRONTEND DÉPLOYÉ : $(terraform -chdir=terraform output -raw website_url)"
