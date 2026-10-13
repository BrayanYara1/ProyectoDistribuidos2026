# ADR 001: Finite State Machine and Appointment Workflow Orchestration

- **Status**: Approved
- **Date**: 2026-03-29
- **Authors**: Distributed Systems Architecture Team

## Context
A medical appointment workflow involves multiple states (Requested, Confirmed, In Progress, Completed, Cancelled) and strict business rules that cannot be bypassed.

## Decision
Implement a dedicated state machine microservice (`AppointmentStateMachine`) that atomically validates every transition before persisting changes in the system.

## Consequences
- **Positive**: Prevents state inconsistencies, centralizes workflow business logic, and simplifies event auditing.
- **Negative**: Adds an extra network hop for appointment state mutations.
