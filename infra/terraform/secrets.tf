resource "random_password" "app_key_one" {
  length  = 48
  special = false
}

resource "random_password" "app_key_two" {
  length  = 48
  special = false
}

resource "random_password" "api_token_salt" {
  length  = 48
  special = false
}

resource "random_password" "admin_jwt_secret" {
  length  = 48
  special = false
}

resource "random_password" "transfer_token_salt" {
  length  = 48
  special = false
}

resource "random_password" "encryption_key" {
  length  = 48
  special = false
}

resource "random_password" "jwt_secret" {
  length  = 48
  special = false
}

resource "random_password" "revalidate_secret" {
  length  = 48
  special = false
}

resource "aws_secretsmanager_secret" "strapi" {
  name                    = "${local.name_prefix}/strapi"
  description             = "Strapi application cryptographic secrets"
  recovery_window_in_days = var.deletion_protection ? 30 : 0
}

resource "aws_secretsmanager_secret_version" "strapi" {
  secret_id = aws_secretsmanager_secret.strapi.id
  secret_string = jsonencode({
    APP_KEYS            = "${random_password.app_key_one.result},${random_password.app_key_two.result}"
    API_TOKEN_SALT      = random_password.api_token_salt.result
    ADMIN_JWT_SECRET    = random_password.admin_jwt_secret.result
    TRANSFER_TOKEN_SALT = random_password.transfer_token_salt.result
    ENCRYPTION_KEY      = random_password.encryption_key.result
    JWT_SECRET          = random_password.jwt_secret.result
  })
}

resource "aws_secretsmanager_secret" "revalidate" {
  name                    = "${local.name_prefix}/revalidate"
  description             = "Shared Strapi to Next.js on-demand revalidation secret"
  recovery_window_in_days = var.deletion_protection ? 30 : 0
}

resource "aws_secretsmanager_secret_version" "revalidate" {
  secret_id     = aws_secretsmanager_secret.revalidate.id
  secret_string = random_password.revalidate_secret.result
}

# The seed job creates the API token. Terraform deliberately creates only its secret container so
# the token never exists in source control or Terraform state. Put its printed value into this secret.
resource "aws_secretsmanager_secret" "lead_token" {
  name                    = "${local.name_prefix}/strapi-lead-token"
  description             = "Operator-populated Strapi API token limited to api::lead.lead.create"
  recovery_window_in_days = var.deletion_protection ? 30 : 0
}

resource "aws_secretsmanager_secret" "turnstile" {
  count                   = var.enable_turnstile ? 1 : 0
  name                    = "${local.name_prefix}/turnstile"
  description             = "Cloudflare Turnstile server-side secret key"
  recovery_window_in_days = var.deletion_protection ? 30 : 0
}
