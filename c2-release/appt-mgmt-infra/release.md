# Release Info - appt-mgmt-infra

- **Component**: `appt-mgmt-infra`
- **Version**: `v2.0.0`
- **Delivery**: `c2-release`
- **Commit ID**: `128074ea37dd11c0520637bc67794f803eee7580`
- **Date**: 2026-03-29

## Description
This repository contains the Infrastructure as Code (IaC) definition using Terraform for AWS and Docker Compose orchestration for local development and CI environments across all system microservices.

## Deployment Instructions

### Local Environment (Docker Compose)
```bash
docker-compose up -d
```

### AWS Environment (Terraform)
```bash
cd terraform
terraform init
terraform plan
terraform apply
```
