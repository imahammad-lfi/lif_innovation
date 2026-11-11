output "alb_dns_name" {
  description = "Public ALB DNS name; Cloudflare CNAME records point here."
  value       = aws_lb.public.dns_name
}

output "web_ecr_repository_url" {
  description = "ECR repository used by the web image."
  value       = aws_ecr_repository.web.repository_url
}

output "cms_ecr_repository_url" {
  description = "ECR repository used by the CMS image."
  value       = aws_ecr_repository.cms.repository_url
}

output "cloudfront_domain_name" {
  description = "CloudFront distribution domain behind media.<domain>."
  value       = aws_cloudfront_distribution.media.domain_name
}

output "media_bucket_name" {
  description = "Private S3 bucket used for Strapi uploads."
  value       = aws_s3_bucket.media.id
}

output "rds_endpoint" {
  description = "Private PostgreSQL endpoint."
  value       = aws_db_instance.cms.address
}

output "rds_master_secret_arn" {
  description = "RDS-managed secret containing the database master credentials."
  value       = aws_db_instance.cms.master_user_secret[0].secret_arn
}

output "lead_token_secret_arn" {
  description = "Put the create-only lead API token printed by the seed job into this secret."
  value       = aws_secretsmanager_secret.lead_token.arn
}

output "turnstile_site_key" {
  description = "Public Turnstile site key; pass it as NEXT_PUBLIC_TURNSTILE_SITE_KEY during the web image build."
  value       = var.enable_turnstile ? cloudflare_turnstile_widget.site[0].sitekey : null
}
