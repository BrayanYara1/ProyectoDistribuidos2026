# ADR 001: Appointment Bounded Context and Hexagonal Architecture

- **Status**: Approved
- **Date**: 2026-03-29
- **Authors**: Distributed Systems Architecture Team

## Context
Medical appointment management involves specific domain rules (schedule validation, patient-doctor mapping, specialties) that must remain isolated from other domains such as authentication.

## Decision
Define an independent Bounded Context (`appt-mgmt-appointment-api`) using hexagonal architecture to isolate the domain model (`Appointment`) from infrastructure details.

## Consequences
- **Positive**: High maintainability, persistence independence, and easy isolated TDD test execution.
- **Negative**: Need to maintain mapping DTOs between layers.
