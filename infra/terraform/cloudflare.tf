# DNS validation records are deliberately DNS-only; public traffic records below remain proxied.
resource "cloudflare_dns_record" "regional_validation" {
  for_each = var.enable_cloudflare ? {
    for option in aws_acm_certificate.regional.domain_validation_options : option.domain_name => option
  } : {}

  zone_id = var.cloudflare_zone_id
  name    = trimsuffix(each.value.resource_record_name, ".")
  type    = each.value.resource_record_type
  content = each.value.resource_record_value
  ttl     = 60
  proxied = false
}

resource "aws_acm_certificate_validation" "regional" {
  certificate_arn         = aws_acm_certificate.regional.arn
  validation_record_fqdns = [for record in cloudflare_dns_record.regional_validation : record.name]
}

resource "cloudflare_dns_record" "media_validation" {
  for_each = var.enable_cloudflare ? {
    for option in aws_acm_certificate.media.domain_validation_options : option.domain_name => option
  } : {}

  zone_id = var.cloudflare_zone_id
  name    = trimsuffix(each.value.resource_record_name, ".")
  type    = each.value.resource_record_type
  content = each.value.resource_record_value
  ttl     = 60
  proxied = false
}

resource "aws_acm_certificate_validation" "media" {
  provider                = aws.use1
  certificate_arn         = aws_acm_certificate.media.arn
  validation_record_fqdns = [for record in cloudflare_dns_record.media_validation : record.name]
}

resource "cloudflare_dns_record" "site" {
  for_each = var.enable_cloudflare ? {
    apex = { name = "@", content = aws_lb.public.dns_name }
    www  = { name = "www", content = aws_lb.public.dns_name }
    cms  = { name = "cms", content = aws_lb.public.dns_name }
  } : {}

  zone_id = var.cloudflare_zone_id
  name    = each.value.name
  type    = "CNAME"
  content = each.value.content
  ttl     = 1
  proxied = true
}

resource "cloudflare_dns_record" "media" {
  count = var.enable_cloudflare ? 1 : 0

  zone_id = var.cloudflare_zone_id
  name    = "media"
  type    = "CNAME"
  content = aws_cloudfront_distribution.media.domain_name
  ttl     = 1
  proxied = true
}

resource "cloudflare_zone_setting" "security" {
  for_each = var.enable_cloudflare ? local.cloudflare_string_zone_settings : tomap({})

  zone_id    = var.cloudflare_zone_id
  setting_id = each.key
  value      = each.value
}

resource "cloudflare_zone_setting" "hsts" {
  count = var.enable_cloudflare ? 1 : 0

  zone_id    = var.cloudflare_zone_id
  setting_id = "security_header"
  value      = local.cloudflare_hsts
}

resource "cloudflare_ruleset" "redirect" {
  count = var.enable_cloudflare && var.enable_cloudflare_rules ? 1 : 0

  zone_id     = var.cloudflare_zone_id
  name        = "Canonical host redirect"
  description = "Redirect the apex domain to the canonical www host"
  kind        = "zone"
  phase       = "http_request_dynamic_redirect"
  rules = [{
    action      = "redirect"
    description = "Apex to www"
    enabled     = true
    expression  = "http.host eq \"${var.domain_name}\""
    action_parameters = {
      from_value = {
        status_code           = 301
        preserve_query_string = true
        target_url = {
          expression = "concat(\"https://www.${var.domain_name}\", http.request.uri.path)"
        }
      }
    }
  }]
}

resource "cloudflare_ruleset" "cache" {
  count = var.enable_cloudflare && var.enable_cloudflare_rules ? 1 : 0

  zone_id     = var.cloudflare_zone_id
  name        = "Website cache policy"
  description = "Cache immutable Next assets and bypass APIs and Strapi administration"
  kind        = "zone"
  phase       = "http_request_cache_settings"
  rules = [
    {
      action      = "set_cache_settings"
      description = "Cache Next static assets for one year"
      enabled     = true
      expression  = "starts_with(http.request.uri.path, \"/_next/static/\") or starts_with(http.request.uri.path, \"/_next/image\")"
      action_parameters = {
        cache = true
        edge_ttl = {
          mode    = "override_origin"
          default = 31536000
        }
        browser_ttl = {
          mode    = "override_origin"
          default = 31536000
        }
      }
    },
    {
      action      = "set_cache_settings"
      description = "Never cache APIs or the Strapi administration UI"
      enabled     = true
      expression  = "starts_with(http.request.uri.path, \"/api/\") or starts_with(http.request.uri.path, \"/admin\")"
      action_parameters = {
        cache = false
      }
    },
  ]
}

resource "cloudflare_ruleset" "contact_protection" {
  count = var.enable_cloudflare && var.enable_cloudflare_rules ? 1 : 0

  zone_id     = var.cloudflare_zone_id
  name        = "Contact endpoint protection"
  description = "Challenge suspicious direct POSTs to the contact endpoint"
  kind        = "zone"
  phase       = "http_request_firewall_custom"
  rules = [{
    # Turnstile's token is in the POST body and is verified by Next.js; the edge cannot inspect it safely.
    # Log this sensitive endpoint and let the adjacent rate-limit rule block abuse.
    action      = "log"
    description = "Log contact form POSTs; rate limiting is enforced in http_ratelimit"
    enabled     = true
    expression  = "http.request.method eq \"POST\" and http.request.uri.path eq \"/api/contact\""
  }]
}

resource "cloudflare_ruleset" "contact_rate_limit" {
  count = var.enable_cloudflare && var.enable_cloudflare_rules ? 1 : 0

  zone_id     = var.cloudflare_zone_id
  name        = "Contact endpoint rate limit"
  description = "Limit contact form abuse per source IP"
  kind        = "zone"
  phase       = "http_ratelimit"
  rules = [{
    action      = "block"
    description = "Ten contact submissions per minute per IP"
    enabled     = true
    expression  = "http.request.method eq \"POST\" and http.request.uri.path eq \"/api/contact\""
    ratelimit = {
      characteristics     = ["ip.src", "cf.colo.id"]
      period              = 60
      requests_per_period = 10
      mitigation_timeout  = 600
    }
  }]
}

resource "cloudflare_turnstile_widget" "site" {
  count = var.enable_turnstile ? 1 : 0

  account_id = var.cloudflare_account_id
  name       = "${local.name_prefix} website contact form"
  domains    = [var.domain_name, "www.${var.domain_name}"]
  mode       = "managed"
  region     = "world"
}

resource "aws_secretsmanager_secret_version" "turnstile" {
  count = var.enable_turnstile ? 1 : 0

  secret_id     = aws_secretsmanager_secret.turnstile[0].id
  secret_string = cloudflare_turnstile_widget.site[0].secret
}
