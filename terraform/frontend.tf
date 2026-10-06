# 1. On génère un ID aléatoire pour avoir un nom de bucket unique au monde
resource "random_id" "bucket_suffix" {
  byte_length = 4
}

# 2. Le Bucket S3
resource "aws_s3_bucket" "front" {
  bucket        = "projet-cc-front-${random_id.bucket_suffix.hex}"
  force_destroy = true # Permet de tout supprimer avec terraform destroy sans erreur
}

# 3. On déverrouille l'accès public (par défaut S3 bloque tout)
resource "aws_s3_bucket_public_access_block" "public_access" {
  bucket = aws_s3_bucket.front.id

  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false
}

# 4. La Politique de sécurité (Qui a le droit de lire ?)
# -> "Tout le monde (*) a le droit de faire GetObject"
resource "aws_s3_bucket_policy" "public_read" {
  bucket     = aws_s3_bucket.front.id
  depends_on = [aws_s3_bucket_public_access_block.public_access]

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid       = "PublicReadGetObject"
        Effect    = "Allow"
        Principal = "*"
        Action    = "s3:GetObject"
        Resource  = "${aws_s3_bucket.front.arn}/*"
      },
    ]
  })
}

# 5. Configuration "Site Web Statique"
# C'est ici qu'on gère le problème des routes React (SPA)
resource "aws_s3_bucket_website_configuration" "website" {
  bucket = aws_s3_bucket.front.id

  index_document {
    suffix = "index.html"
  }

  # Astuce React : Si on cherche une page qui n'existe pas (ex: /login),
  # S3 renvoie index.html et laisse React gérer la route.
  error_document {
    key = "index.html"
  }
}

# 6. OUTPUT : L'URL finale de ton site
output "website_url" {
  value = "http://${aws_s3_bucket_website_configuration.website.website_endpoint}"
}

output "s3_bucket_name" {
  value = aws_s3_bucket.front.bucket
}