# Changelog

Notable changes to Salud Activa are recorded here.

## [2.0.0] - 2026-10-08

### Added

- Added a local Docker Compose demo with a persistent MongoDB volume and container health checks.
- Added separate liveness and readiness endpoints and per-domain MongoDB status reporting.
- Added a deterministic test for API behavior while MongoDB is unavailable.

### Changed

- Reused one MongoDB connection for the logical per-domain databases, consistent with ADR-004 and Anexo J.
- Clarified ownership boundaries and documented the legacy domains that remain in the gateway.
- Extracted independently started Auth and Appointments services behind the backwards-compatible API Gateway.
- Added the Auth user/reservation REST contract and the Appointments booking saga with compensating release.
- Added an embedded, durable appointment outbox and RabbitMQ relay with retry/dead-letter handling.
- Preserved the web and Android `/api/auth` and `/api/turnos` routes and corrected the web appointment payload.
