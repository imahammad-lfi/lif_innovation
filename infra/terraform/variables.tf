variable "aws_region" {
  description = "AWS region for the workload."
  type        = string
  default     = "eu-west-2"
}

variable "project_name" {
  description = "Short, DNS-safe project prefix."
  type        = string
  default     = "linkfields"
}

variable "environment" {
  description = "Deployment environment name."
  type        = string
  default     = "production"
}

variable "domain_name" {
  description = "Authoritative website domain."
  type        = string
  default     = "linkfields.com"
}

variable "cloudflare_zone_id" {
  description = "Cloudflare zone ID for domain_name. Required when Cloudflare is enabled."
  type        = string
  default     = ""
}

variable "cloudflare_account_id" {
  description = "Cloudflare account ID used for the optional Turnstile widget."
  type        = string
  default     = ""
}

variable "cloudflare_api_token" {
  description = "Cloudflare API token with DNS, Zone Settings, Rulesets, and optional Turnstile permissions. Prefer TF_VAR_cloudflare_api_token."
  type        = string
  sensitive   = true
  default     = null
}

variable "enable_cloudflare" {
  description = "Manage Cloudflare DNS, zone settings, certificates' DNS validation, and edge rules."
  type        = bool
  default     = true
}

variable "enable_cloudflare_rules" {
  description = "Manage cache, redirect, WAF, and rate-limit rules. Disable on plans that do not support the configured rulesets."
  type        = bool
  default     = true
}

variable "enable_turnstile" {
  description = "Create a Cloudflare Turnstile widget and store its secret in AWS Secrets Manager."
  type        = bool
  default     = false
}

variable "vpc_cidr" {
  description = "CIDR block for the VPC."
  type        = string
  default     = "10.42.0.0/16"
}

variable "availability_zone_count" {
  description = "Number of AZs, constrained to two for this topology."
  type        = number
  default     = 2
  validation {
    condition     = var.availability_zone_count == 2
    error_message = "This deployment is designed for exactly two availability zones."
  }
}

variable "single_nat_gateway" {
  description = "Use one NAT gateway to reduce cost; set false for one NAT gateway per AZ."
  type        = bool
  default     = true
}

variable "enable_s3_gateway_endpoint" {
  description = "Add an S3 gateway endpoint to avoid NAT charges for S3 traffic."
  type        = bool
  default     = true
}

variable "cloudflare_ipv4_cidrs" {
  description = "Cloudflare IPv4 proxy ranges allowed to reach the ALB. Keep aligned with https://www.cloudflare.com/ips-v4/."
  type        = list(string)
  default = [
    "173.245.48.0/20", "103.21.244.0/22", "103.22.200.0/22", "103.31.4.0/22",
    "141.101.64.0/18", "108.162.192.0/18", "190.93.240.0/20", "188.114.96.0/20",
    "197.234.240.0/22", "198.41.128.0/17", "162.158.0.0/15", "104.16.0.0/13",
    "104.24.0.0/14", "172.64.0.0/13", "131.0.72.0/22",
  ]
}

variable "rds_instance_class" {
  description = "RDS PostgreSQL instance class."
  type        = string
  default     = "db.t4g.medium"
}

variable "rds_allocated_storage_gb" {
  description = "Initial RDS GP3 storage in GiB."
  type        = number
  default     = 50
}

variable "rds_max_allocated_storage_gb" {
  description = "Maximum RDS storage autoscaling capacity in GiB."
  type        = number
  default     = 200
}

variable "rds_backup_retention_days" {
  description = "Automated backup retention in days."
  type        = number
  default     = 14
}

variable "rds_multi_az" {
  description = "Use Multi-AZ RDS standby for production availability."
  type        = bool
  default     = true
}

variable "deletion_protection" {
  description = "Protect RDS and media from accidental deletion. Set false only for disposable environments."
  type        = bool
  default     = true
}

variable "web_cpu" {
  description = "Fargate web task CPU units."
  type        = number
  default     = 512
}

variable "web_memory" {
  description = "Fargate web task memory MiB."
  type        = number
  default     = 1024
}

variable "cms_cpu" {
  description = "Fargate CMS task CPU units."
  type        = number
  default     = 1024
}

variable "cms_memory" {
  description = "Fargate CMS task memory MiB."
  type        = number
  default     = 2048
}

variable "web_desired_count" {
  description = "Initial desired web task count; autoscaling maintains at least two."
  type        = number
  default     = 2
}

variable "cms_desired_count" {
  description = "Desired CMS task count. Run one writer because local Strapi migrations are startup work."
  type        = number
  default     = 1
}

variable "web_min_capacity" {
  description = "Minimum web task count."
  type        = number
  default     = 2
}

variable "web_max_capacity" {
  description = "Maximum web task count."
  type        = number
  default     = 10
}

variable "web_image_tag" {
  description = "ECR tag deployed by the web ECS task definition. Push this tag before first service creation."
  type        = string
  default     = "latest"
}

variable "cms_image_tag" {
  description = "ECR tag deployed by the CMS ECS task definition. Push this tag before first service creation."
  type        = string
  default     = "latest"
}

variable "log_retention_days" {
  description = "CloudWatch Logs retention period."
  type        = number
  default     = 30
}

variable "web_task_count_enabled" {
  description = "Set false only during bootstrap while ECR images are not yet available; services and autoscaling remain otherwise production defaults."
  type        = bool
  default     = true
}

variable "enquiry_email_provider" {
  description = "How the CMS sends enquiry emails (thank-you + sales alert): \"graph\" (Microsoft 365 via Microsoft Graph) or \"none\" (emails off; leads are still stored). With \"graph\", put the client secret into the ms_graph_client_secret_arn secret before deploying the CMS."
  type        = string
  default     = "none"
  validation {
    condition     = contains(["graph", "none"], var.enquiry_email_provider)
    error_message = "enquiry_email_provider must be \"graph\" or \"none\"."
  }
}

variable "ms_graph_tenant_id" {
  description = "Entra ID directory (tenant) ID of the email app registration (enquiry_email_provider = \"graph\")."
  type        = string
  default     = ""
}

variable "ms_graph_client_id" {
  description = "Application (client) ID of the email app registration (needs the Mail.Send application permission)."
  type        = string
  default     = ""
}

variable "ms_graph_sender" {
  description = "Mailbox enquiry emails are sent from."
  type        = string
  default     = "sales@linkfields.com"
}

variable "enquiry_notify_to" {
  description = "Comma-separated recipients of the internal sales alert for each enquiry."
  type        = string
  default     = "sales@linkfields.com"
}
