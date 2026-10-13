# ADR 001: Infrastructure Stack and Orchestration Selection

- **Status**: Approved
- **Date**: 2026-03-29
- **Authors**: Distributed Systems Architecture Team

## Context
The appointment management system requires an elastic, highly available infrastructure that is easy to orchestrate in both local development and cloud environments (AWS).

## Decision
Adopt:
1. **Terraform**: As a declarative Infrastructure as Code (IaC) tool for provisioning AWS resources (VPC, ECS, RDS PostgreSQL).
2. **Docker Compose**: To orchestrate local containers reflecting the distributed topology of all 10 services.

## Consequences
- **Positive**: Total reproducibility across environments, automated deployments, and infrastructure decoupling.
- **Negative**: Need to maintain updated Terraform manifests alongside AWS component updates.
