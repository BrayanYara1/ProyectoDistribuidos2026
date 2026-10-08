# Appointments Service

Owns appointment availability and lifecycle in `SaludActiva_turnos`. The API and saga worker run in the same service process; delivery and consumption are asynchronous through RabbitMQ.

## Responsibilities and boundaries

* Owns turn documents and the unique active `(fecha, hora)` slot constraint.
* Verifies bearer JWTs, then obtains user existence/context from Auth over the versioned internal REST contract. It does not query the Auth database.
* Writes booking requests and their outbox event in one MongoDB document.
* Coordinates Auth reservation and local appointment state in a saga; releases Auth reservations when the saga compensates.

## Endpoints

Public client endpoints are exposed only through the API Gateway at `/api/turnos`. Internal health endpoints are `/health/live` and `/health/ready`; readiness requires MongoDB and RabbitMQ.

## Local operation

Run `docker compose up --build -d appointments-service` from the repository root. Use `docker compose logs -f appointments-service`; events persist through broker outages and relay after reconnection.

The service consumes only `appointment.requested.v1`. Confirmation and cancellation events are emitted for downstream consumers.
