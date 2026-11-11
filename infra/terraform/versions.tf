terraform {
  required_version = ">= 1.6.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.0"
    }
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "~> 5.26"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.7"
    }
  }

  # Bootstrap this backend separately, then uncomment and set the values for production state.
  # backend "s3" {
  #   bucket       = "linkfields-terraform-state"
  #   key          = "production/terraform.tfstate"
  #   region       = "eu-west-2"
  #   use_lockfile = true
  #   encrypt      = true
  # }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = local.tags
  }
}

# ACM certificates used by CloudFront must be created in us-east-1.
provider "aws" {
  alias  = "use1"
  region = "us-east-1"

  default_tags {
    tags = local.tags
  }
}

provider "cloudflare" {
  api_token = var.cloudflare_api_token
}
