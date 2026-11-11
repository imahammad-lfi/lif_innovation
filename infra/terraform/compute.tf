resource "aws_ecr_repository" "web" {
  name                 = "${local.name_prefix}/web"
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }
}

resource "aws_ecr_repository" "cms" {
  name                 = "${local.name_prefix}/cms"
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }
}

resource "aws_ecr_lifecycle_policy" "web" {
  repository = aws_ecr_repository.web.name
  policy = jsonencode({
    rules = [{
      rulePriority = 1
      description  = "Keep the newest thirty images"
      selection    = { tagStatus = "any", countType = "imageCountMoreThan", countNumber = 30 }
      action       = { type = "expire" }
    }]
  })
}

resource "aws_ecr_lifecycle_policy" "cms" {
  repository = aws_ecr_repository.cms.name
  policy = jsonencode({
    rules = [{
      rulePriority = 1
      description  = "Keep the newest thirty images"
      selection    = { tagStatus = "any", countType = "imageCountMoreThan", countNumber = 30 }
      action       = { type = "expire" }
    }]
  })
}

resource "aws_cloudwatch_log_group" "web" {
  name              = "/ecs/${local.name_prefix}/web"
  retention_in_days = var.log_retention_days
}

resource "aws_cloudwatch_log_group" "cms" {
  name              = "/ecs/${local.name_prefix}/cms"
  retention_in_days = var.log_retention_days
}

resource "aws_ecs_cluster" "main" {
  name = local.name_prefix

  setting {
    name  = "containerInsights"
    value = "enhanced"
  }
}

data "aws_iam_policy_document" "ecs_assume_role" {
  statement {
    effect  = "Allow"
    actions = ["sts:AssumeRole"]
    principals {
      type        = "Service"
      identifiers = ["ecs-tasks.amazonaws.com"]
    }
  }
}

resource "aws_iam_role" "task_execution" {
  name               = "${local.name_prefix}-ecs-execution"
  assume_role_policy = data.aws_iam_policy_document.ecs_assume_role.json
}

resource "aws_iam_role_policy_attachment" "task_execution_managed" {
  role       = aws_iam_role.task_execution.name
  policy_arn = "arn:${data.aws_partition.current.partition}:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

data "aws_iam_policy_document" "task_execution_secrets" {
  statement {
    effect  = "Allow"
    actions = ["secretsmanager:GetSecretValue", "kms:Decrypt"]
    resources = compact([
      aws_secretsmanager_secret.strapi.arn,
      aws_secretsmanager_secret.revalidate.arn,
      aws_secretsmanager_secret.lead_token.arn,
      aws_db_instance.cms.master_user_secret[0].secret_arn,
      var.enable_turnstile ? aws_secretsmanager_secret.turnstile[0].arn : null,
      local.enquiry_emails_graph ? aws_secretsmanager_secret.ms_graph_client_secret[0].arn : null,
    ])
  }
}

resource "aws_iam_role_policy" "task_execution_secrets" {
  name   = "${local.name_prefix}-read-secrets"
  role   = aws_iam_role.task_execution.id
  policy = data.aws_iam_policy_document.task_execution_secrets.json
}

resource "aws_iam_role" "cms_task" {
  name               = "${local.name_prefix}-cms-task"
  assume_role_policy = data.aws_iam_policy_document.ecs_assume_role.json
}

data "aws_iam_policy_document" "cms_task" {
  statement {
    sid       = "MediaBucketAccess"
    effect    = "Allow"
    actions   = ["s3:ListBucket"]
    resources = [aws_s3_bucket.media.arn]
  }

  statement {
    sid       = "MediaObjectAccess"
    effect    = "Allow"
    actions   = ["s3:GetObject", "s3:PutObject", "s3:DeleteObject"]
    resources = ["${aws_s3_bucket.media.arn}/*"]
  }

  statement {
    sid    = "EcsExec"
    effect = "Allow"
    actions = [
      "ssmmessages:CreateControlChannel", "ssmmessages:CreateDataChannel",
      "ssmmessages:OpenControlChannel", "ssmmessages:OpenDataChannel",
    ]
    resources = ["*"]
  }
}

resource "aws_iam_role_policy" "cms_task" {
  name   = "${local.name_prefix}-media-and-exec"
  role   = aws_iam_role.cms_task.id
  policy = data.aws_iam_policy_document.cms_task.json
}

resource "aws_iam_role" "web_task" {
  name               = "${local.name_prefix}-web-task"
  assume_role_policy = data.aws_iam_policy_document.ecs_assume_role.json
}

resource "aws_iam_role_policy" "web_task_exec" {
  name = "${local.name_prefix}-web-ecs-exec"
  role = aws_iam_role.web_task.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect   = "Allow"
      Action   = ["ssmmessages:CreateControlChannel", "ssmmessages:CreateDataChannel", "ssmmessages:OpenControlChannel", "ssmmessages:OpenDataChannel"]
      Resource = "*"
    }]
  })
}

resource "aws_service_discovery_private_dns_namespace" "internal" {
  name        = local.internal_namespace_name
  description = "Private ECS service discovery for ${local.name_prefix}"
  vpc         = aws_vpc.main.id
}

resource "aws_service_discovery_service" "cms" {
  name = "cms"

  dns_config {
    namespace_id = aws_service_discovery_private_dns_namespace.internal.id
    dns_records {
      ttl  = 10
      type = "A"
    }
    routing_policy = "MULTIVALUE"
  }

  health_check_custom_config {
  }
}

resource "aws_security_group" "alb" {
  name        = "${local.name_prefix}-alb"
  description = "HTTPS and HTTP only from Cloudflare proxy IPv4 ranges"
  vpc_id      = aws_vpc.main.id

  dynamic "ingress" {
    for_each = toset(var.cloudflare_ipv4_cidrs)
    content {
      description = "Cloudflare HTTPS"
      from_port   = 443
      to_port     = 443
      protocol    = "tcp"
      cidr_blocks = [ingress.value]
    }
  }

  dynamic "ingress" {
    for_each = toset(var.cloudflare_ipv4_cidrs)
    content {
      description = "Cloudflare HTTP redirect"
      from_port   = 80
      to_port     = 80
      protocol    = "tcp"
      cidr_blocks = [ingress.value]
    }
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_security_group" "web_tasks" {
  name        = "${local.name_prefix}-web-tasks"
  description = "Web application tasks"
  vpc_id      = aws_vpc.main.id

  ingress {
    from_port       = 3000
    to_port         = 3000
    protocol        = "tcp"
    security_groups = [aws_security_group.alb.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_security_group" "cms_tasks" {
  name        = "${local.name_prefix}-cms-tasks"
  description = "Strapi CMS tasks"
  vpc_id      = aws_vpc.main.id

  ingress {
    description     = "Public ALB"
    from_port       = 1337
    to_port         = 1337
    protocol        = "tcp"
    security_groups = [aws_security_group.alb.id]
  }

  ingress {
    description     = "Internal Next.js server-side data access"
    from_port       = 1337
    to_port         = 1337
    protocol        = "tcp"
    security_groups = [aws_security_group.web_tasks.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_lb" "public" {
  name                       = "${local.name_prefix}-public"
  internal                   = false
  load_balancer_type         = "application"
  security_groups            = [aws_security_group.alb.id]
  subnets                    = values(aws_subnet.public)[*].id
  drop_invalid_header_fields = true
}

resource "aws_lb_target_group" "web" {
  name        = "${local.name_prefix}-web"
  port        = 3000
  protocol    = "HTTP"
  target_type = "ip"
  vpc_id      = aws_vpc.main.id

  health_check {
    enabled             = true
    path                = "/api/health"
    matcher             = "200"
    healthy_threshold   = 2
    unhealthy_threshold = 3
  }
}

resource "aws_lb_target_group" "cms" {
  name        = "${local.name_prefix}-cms"
  port        = 1337
  protocol    = "HTTP"
  target_type = "ip"
  vpc_id      = aws_vpc.main.id

  health_check {
    enabled             = true
    path                = "/_health"
    matcher             = "204"
    healthy_threshold   = 2
    unhealthy_threshold = 3
  }
}

resource "aws_acm_certificate" "regional" {
  domain_name               = var.domain_name
  subject_alternative_names = ["www.${var.domain_name}", local.cms_fqdn]
  validation_method         = "DNS"

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_lb_listener" "http" {
  load_balancer_arn = aws_lb.public.arn
  port              = 80
  protocol          = "HTTP"

  default_action {
    type = "redirect"
    redirect {
      port        = "443"
      protocol    = "HTTPS"
      status_code = "HTTP_301"
    }
  }
}

resource "aws_lb_listener" "https" {
  load_balancer_arn = aws_lb.public.arn
  port              = 443
  protocol          = "HTTPS"
  ssl_policy        = "ELBSecurityPolicy-TLS13-1-2-2021-06"
  certificate_arn   = aws_acm_certificate_validation.regional.certificate_arn

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.web.arn
  }
}

resource "aws_lb_listener_rule" "cms" {
  listener_arn = aws_lb_listener.https.arn
  priority     = 10

  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.cms.arn
  }

  condition {
    host_header { values = [local.cms_fqdn] }
  }
}

resource "aws_ecs_task_definition" "cms" {
  family                   = "${local.name_prefix}-cms"
  requires_compatibilities = ["FARGATE"]
  network_mode             = "awsvpc"
  cpu                      = tostring(var.cms_cpu)
  memory                   = tostring(var.cms_memory)
  execution_role_arn       = aws_iam_role.task_execution.arn
  task_role_arn            = aws_iam_role.cms_task.arn

  container_definitions = jsonencode([{
    name         = "cms"
    image        = local.cms_image
    essential    = true
    portMappings = [{ containerPort = 1337, protocol = "tcp" }]
    environment = concat([
      { name = "HOST", value = "0.0.0.0" }, { name = "PORT", value = "1337" },
      { name = "PUBLIC_URL", value = "https://${local.cms_fqdn}" }, { name = "IS_PROXIED", value = "true" },
      { name = "PROXY_MAX_IPS_COUNT", value = "2" }, { name = "DATABASE_CLIENT", value = "postgres" },
      { name = "DATABASE_HOST", value = aws_db_instance.cms.address }, { name = "DATABASE_PORT", value = "5432" },
      { name = "DATABASE_NAME", value = aws_db_instance.cms.db_name }, { name = "DATABASE_USERNAME", value = aws_db_instance.cms.username },
      { name = "DATABASE_SSL", value = "true" }, { name = "DATABASE_SSL_REJECT_UNAUTHORIZED", value = "true" },
      { name = "DATABASE_POOL_MIN", value = "2" }, { name = "DATABASE_POOL_MAX", value = "10" },
      { name = "UPLOAD_PROVIDER", value = "aws-s3" }, { name = "AWS_BUCKET", value = aws_s3_bucket.media.id },
      { name = "AWS_REGION", value = var.aws_region }, { name = "AWS_ACL", value = "private" },
      { name = "CDN_URL", value = "https://${local.media_fqdn}" }, { name = "UPLOAD_SIZE_LIMIT", value = "52428800" },
      { name = "CORS_ORIGINS", value = "${local.site_url},https://${local.cms_fqdn}" },
      { name = "CSP_MEDIA_HOSTS", value = "https://${local.media_fqdn}" },
      { name = "WEBSITE_REVALIDATE_URL", value = "http://web.${local.internal_namespace_name}:3000/api/revalidate" },
      # Enquiry emails (apps/cms/src/utils/enquiry-email.ts; docs/CMS-BRANDING-AND-EMAIL.md).
      { name = "WEBSITE_URL", value = local.site_url },
      { name = "ENQUIRY_EMAILS_ENABLED", value = tostring(local.enquiry_emails_graph) },
      { name = "ENQUIRY_NOTIFY_TO", value = var.enquiry_notify_to },
      ], local.enquiry_emails_graph ? [
      { name = "EMAIL_PROVIDER", value = "graph" },
      { name = "MS_GRAPH_TENANT_ID", value = var.ms_graph_tenant_id },
      { name = "MS_GRAPH_CLIENT_ID", value = var.ms_graph_client_id },
      { name = "MS_GRAPH_SENDER", value = var.ms_graph_sender },
    ] : [])
    secrets = concat([
      { name = "APP_KEYS", valueFrom = "${aws_secretsmanager_secret.strapi.arn}:APP_KEYS::" },
      { name = "API_TOKEN_SALT", valueFrom = "${aws_secretsmanager_secret.strapi.arn}:API_TOKEN_SALT::" },
      { name = "ADMIN_JWT_SECRET", valueFrom = "${aws_secretsmanager_secret.strapi.arn}:ADMIN_JWT_SECRET::" },
      { name = "TRANSFER_TOKEN_SALT", valueFrom = "${aws_secretsmanager_secret.strapi.arn}:TRANSFER_TOKEN_SALT::" },
      { name = "ENCRYPTION_KEY", valueFrom = "${aws_secretsmanager_secret.strapi.arn}:ENCRYPTION_KEY::" },
      { name = "JWT_SECRET", valueFrom = "${aws_secretsmanager_secret.strapi.arn}:JWT_SECRET::" },
      { name = "DATABASE_PASSWORD", valueFrom = "${aws_db_instance.cms.master_user_secret[0].secret_arn}:password::" },
      { name = "WEBSITE_REVALIDATE_SECRET", valueFrom = aws_secretsmanager_secret.revalidate.arn },
      ], local.enquiry_emails_graph ? [
      { name = "MS_GRAPH_CLIENT_SECRET", valueFrom = aws_secretsmanager_secret.ms_graph_client_secret[0].arn },
    ] : [])
    logConfiguration = {
      logDriver = "awslogs"
      options   = { awslogs-group = aws_cloudwatch_log_group.cms.name, awslogs-region = var.aws_region, awslogs-stream-prefix = "ecs" }
    }
    healthCheck = { command = ["CMD-SHELL", "node -e \"require('http').get('http://127.0.0.1:1337/_health',r=>process.exit(r.statusCode===204?0:1)).on('error',()=>process.exit(1))\""], interval = 30, timeout = 5, retries = 3, startPeriod = 30 }
  }])
}

resource "aws_ecs_task_definition" "web" {
  family                   = "${local.name_prefix}-web"
  requires_compatibilities = ["FARGATE"]
  network_mode             = "awsvpc"
  cpu                      = tostring(var.web_cpu)
  memory                   = tostring(var.web_memory)
  execution_role_arn       = aws_iam_role.task_execution.arn
  task_role_arn            = aws_iam_role.web_task.arn

  container_definitions = jsonencode([{
    name         = "web"
    image        = local.web_image
    essential    = true
    portMappings = [{ containerPort = 3000, protocol = "tcp" }]
    environment = [
      { name = "CONTENT_SOURCE", value = "strapi" },
      { name = "STRAPI_URL", value = "http://cms.${local.internal_namespace_name}:1337" },
      { name = "NEXT_PUBLIC_SITE_URL", value = local.site_url },
      { name = "MEDIA_HOSTS", value = local.media_fqdn },
    ]
    secrets = concat([
      { name = "REVALIDATE_SECRET", valueFrom = aws_secretsmanager_secret.revalidate.arn },
      { name = "STRAPI_LEAD_TOKEN", valueFrom = aws_secretsmanager_secret.lead_token.arn },
    ], var.enable_turnstile ? [{ name = "TURNSTILE_SECRET_KEY", valueFrom = aws_secretsmanager_secret.turnstile[0].arn }] : [])
    logConfiguration = {
      logDriver = "awslogs"
      options   = { awslogs-group = aws_cloudwatch_log_group.web.name, awslogs-region = var.aws_region, awslogs-stream-prefix = "ecs" }
    }
    healthCheck = { command = ["CMD-SHELL", "node -e \"require('http').get('http://127.0.0.1:3000/api/health',r=>process.exit(r.statusCode===200?0:1)).on('error',()=>process.exit(1))\""], interval = 30, timeout = 5, retries = 3, startPeriod = 15 }
  }])
}

resource "aws_ecs_service" "cms" {
  name                              = "cms"
  cluster                           = aws_ecs_cluster.main.id
  task_definition                   = aws_ecs_task_definition.cms.arn
  desired_count                     = var.web_task_count_enabled ? var.cms_desired_count : 0
  launch_type                       = "FARGATE"
  enable_execute_command            = true
  health_check_grace_period_seconds = 60

  deployment_circuit_breaker {
    enable   = true
    rollback = true
  }

  network_configuration {
    subnets          = values(aws_subnet.private)[*].id
    security_groups  = [aws_security_group.cms_tasks.id]
    assign_public_ip = false
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.cms.arn
    container_name   = "cms"
    container_port   = 1337
  }

  service_registries { registry_arn = aws_service_discovery_service.cms.arn }

  depends_on = [aws_lb_listener.https]
}

resource "aws_ecs_service" "web" {
  name                              = "web"
  cluster                           = aws_ecs_cluster.main.id
  task_definition                   = aws_ecs_task_definition.web.arn
  desired_count                     = var.web_task_count_enabled ? var.web_desired_count : 0
  launch_type                       = "FARGATE"
  enable_execute_command            = true
  health_check_grace_period_seconds = 45

  deployment_circuit_breaker {
    enable   = true
    rollback = true
  }

  network_configuration {
    subnets          = values(aws_subnet.private)[*].id
    security_groups  = [aws_security_group.web_tasks.id]
    assign_public_ip = false
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.web.arn
    container_name   = "web"
    container_port   = 3000
  }

  depends_on = [aws_lb_listener.https, aws_ecs_service.cms]
}

resource "aws_appautoscaling_target" "web" {
  max_capacity       = var.web_max_capacity
  min_capacity       = var.web_min_capacity
  resource_id        = "service/${aws_ecs_cluster.main.name}/${aws_ecs_service.web.name}"
  scalable_dimension = "ecs:service:DesiredCount"
  service_namespace  = "ecs"
}

resource "aws_appautoscaling_policy" "web_cpu" {
  name               = "${local.name_prefix}-web-cpu"
  policy_type        = "TargetTrackingScaling"
  resource_id        = aws_appautoscaling_target.web.resource_id
  scalable_dimension = aws_appautoscaling_target.web.scalable_dimension
  service_namespace  = aws_appautoscaling_target.web.service_namespace

  target_tracking_scaling_policy_configuration {
    target_value = 60
    predefined_metric_specification { predefined_metric_type = "ECSServiceAverageCPUUtilization" }
  }
}

resource "aws_appautoscaling_policy" "web_requests" {
  name               = "${local.name_prefix}-web-requests"
  policy_type        = "TargetTrackingScaling"
  resource_id        = aws_appautoscaling_target.web.resource_id
  scalable_dimension = aws_appautoscaling_target.web.scalable_dimension
  service_namespace  = aws_appautoscaling_target.web.service_namespace

  target_tracking_scaling_policy_configuration {
    target_value = 1000
    predefined_metric_specification {
      predefined_metric_type = "ALBRequestCountPerTarget"
      resource_label         = "${aws_lb.public.arn_suffix}/${aws_lb_target_group.web.arn_suffix}"
    }
  }
}
