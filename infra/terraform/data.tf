resource "aws_db_subnet_group" "cms" {
  name       = "${local.name_prefix}-cms"
  subnet_ids = values(aws_subnet.private)[*].id

  tags = { Name = "${local.name_prefix}-cms" }
}

resource "aws_db_parameter_group" "postgres" {
  name   = "${local.name_prefix}-postgres18"
  family = "postgres18"

  parameter {
    name  = "rds.force_ssl"
    value = "1"
  }

  tags = { Name = "${local.name_prefix}-postgres18" }
}

resource "aws_security_group" "rds" {
  name        = "${local.name_prefix}-rds"
  description = "PostgreSQL only from the CMS ECS tasks"
  vpc_id      = aws_vpc.main.id

  ingress {
    description     = "CMS tasks"
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.cms_tasks.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = { Name = "${local.name_prefix}-rds" }
}

resource "aws_db_instance" "cms" {
  identifier = "${local.name_prefix}-cms"

  engine         = "postgres"
  engine_version = "18"
  instance_class = var.rds_instance_class

  db_name  = "linkfields"
  username = "linkfields"
  port     = 5432

  manage_master_user_password = true

  allocated_storage     = var.rds_allocated_storage_gb
  max_allocated_storage = var.rds_max_allocated_storage_gb
  storage_type          = "gp3"
  storage_encrypted     = true

  db_subnet_group_name   = aws_db_subnet_group.cms.name
  vpc_security_group_ids = [aws_security_group.rds.id]
  parameter_group_name   = aws_db_parameter_group.postgres.name
  publicly_accessible    = false
  multi_az               = var.rds_multi_az

  backup_retention_period   = var.rds_backup_retention_days
  backup_window             = "02:00-03:00"
  maintenance_window        = "sun:03:00-sun:04:00"
  deletion_protection       = var.deletion_protection
  skip_final_snapshot       = !var.deletion_protection
  final_snapshot_identifier = null

  auto_minor_version_upgrade = true
  copy_tags_to_snapshot      = true
  apply_immediately          = false

  tags = { Name = "${local.name_prefix}-cms" }
}
