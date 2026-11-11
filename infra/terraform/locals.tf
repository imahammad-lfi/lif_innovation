data "aws_availability_zones" "available" {
  state = "available"
}

data "aws_caller_identity" "current" {}

data "aws_partition" "current" {}

locals {
  name_prefix = "${var.project_name}-${var.environment}"
  azs         = slice(data.aws_availability_zones.available.names, 0, var.availability_zone_count)

  public_subnet_cidrs  = [for index in range(var.availability_zone_count) : cidrsubnet(var.vpc_cidr, 4, index)]
  private_subnet_cidrs = [for index in range(var.availability_zone_count) : cidrsubnet(var.vpc_cidr, 4, index + 4)]

  site_url                = "https://www.${var.domain_name}"
  cms_fqdn                = "cms.${var.domain_name}"
  media_fqdn              = "media.${var.domain_name}"
  internal_namespace_name = "internal.${var.domain_name}"

  enquiry_emails_graph = var.enquiry_email_provider == "graph"

  web_image = "${aws_ecr_repository.web.repository_url}:${var.web_image_tag}"
  cms_image = "${aws_ecr_repository.cms.repository_url}:${var.cms_image_tag}"

  tags = {
    Project     = var.project_name
    Environment = var.environment
    ManagedBy   = "Terraform"
  }

  cloudflare_string_zone_settings = {
    ssl              = "strict"
    always_use_https = "on"
    min_tls_version  = "1.2"
    tls_1_3          = "on"
    brotli           = "on"
  }

  cloudflare_hsts = {
    strict_transport_security = {
      enabled            = true
      include_subdomains = true
      max_age            = 63072000
      nosniff            = true
      preload            = true
    }
  }
}
