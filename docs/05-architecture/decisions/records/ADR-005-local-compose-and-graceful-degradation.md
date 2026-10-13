# ADR-005: Local Compose Runtime and Graceful Degradation

* **Status:** Accepted
* **Date:** 2026-10-08
* **Decision makers:** Salud Activa team

## Context

The repository needs a reproducible distributed runtime and an incident demonstration without breaking the existing Android/web API paths. The runtime must follow [ADR-004](ADR-004-data-isolation-per-domain.md): one MongoDB instance with a logical database per domain.

## Decision

The local demo uses Docker Compose to run an API Gateway, independently started Auth and Appointments services, one MongoDB instance with a persistent volume, and RabbitMQ.

* Auth owns users and appointment reservations.
* Appointments owns turnos and its embedded transactional outbox in `SaludActiva_turnos`.
* The synchronous user/reservation contract is authenticated with a shared internal service token.
* Appointment creation persists `PENDING` state and its `appointment.requested.v1` event in the same MongoDB document. The outbox relay publishes at least once to `salud-activa.events.v1`; consumers are idempotent.
* The appointment saga reserves against Auth, confirms the turn, or compensates by releasing the reservation and cancelling the turn.

The HTTP health contract separates process availability from dependency readiness:

* `GET /health/live` returns `200` while the HTTP process can serve requests.
* Each service's `GET /health/ready` reports required dependencies; appointments readiness includes MongoDB and RabbitMQ.
* `GET /api/status` preserves the gateway's existing `status: online` response and reports MongoDB connectivity.
* Broker interruption leaves newly accepted appointment events in MongoDB until the relay reconnects.

## Alternatives considered

* **One MongoDB container per domain:** rejected because Anexo J requires one instance per engine.
* **Use readiness as the container liveness check:** rejected because a MongoDB outage would restart a healthy API process and hide the intended degraded-mode behavior.
* **Fail service startup when a dependency is absent:** rejected because it prevents liveness reporting and the outbox recovery demonstration.

## Consequences

* Developers can start all services and brokers with `docker compose up --build -d`.
* Auth and Appointments are independently started/deployed Node processes; the existing gateway provides backwards-compatible client paths.
* MongoDB collections remain isolated by domain database. An existing legacy gateway route set for non-MVP-2 domains is retained.
