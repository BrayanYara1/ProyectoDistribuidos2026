# Changelog - appt-mgmt-workflow

## [2.0.0] - 2.0.0-c2-release
### Added
- `AppointmentStateMachine` finite state machine to manage appointment transitions (`REQUESTED` -> `CONFIRMED` -> `IN_PROGRESS` -> `COMPLETED` / `CANCELLED`).
- `WorkflowEngine` orchestration service aligned with hexagonal architecture / DDD.
- `EventPublisher` domain event publisher for asynchronous notifications.
- TDD unit tests verifying valid and invalid transitions.
- `release.md` bound to commit id `128074ea37dd11c0520637bc67794f803eee7580`.
