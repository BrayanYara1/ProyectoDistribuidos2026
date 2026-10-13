# ADR 001: PostgreSQL Relational Schema Design for Appointments

- **Status**: Approved
- **Date**: 2026-03-29
- **Authors**: Distributed Systems Architecture Team

## Context
Relational and transactional (ACID) consistency is required when booking, updating, and cancelling user appointments.

## Decision
Use PostgreSQL 15 as the storage engine with indexes on `patient_id`, `doctor_id`, and `appointment_date` to accelerate periodic queries.

## Consequences
- **Positive**: Strict transactional guarantees and schedule collision prevention.
- **Negative**: Need to execute ordered migrations on every deployment.
