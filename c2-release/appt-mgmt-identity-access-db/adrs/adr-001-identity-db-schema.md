# ADR 001: Relational RBAC Storage Schema for IAM

- **Status**: Approved
- **Date**: 2026-03-29
- **Authors**: Distributed Systems Architecture Team

## Context
Authentication data must be physically or logically isolated from business appointment databases to meet security principles and DDD guidelines.

## Decision
Deploy a separate PostgreSQL database (`iam_db`) dedicated solely to user records, password hashes, and RBAC permissions.

## Consequences
- **Positive**: Maximum privacy and sensitive data isolation. Compliance with security standards.
- **Negative**: Need to manage two independent relational database instances.
