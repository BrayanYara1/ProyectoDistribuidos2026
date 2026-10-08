# Salud Activa MVP 2 — Service Catalog

## Runtime

| Service | Responsibility | Container port | Data ownership | Dependencies |
|---|---|---:|---|---|
| `api-gateway` (`backend/server.js`) | Backwards-compatible public API, web assets, rate limiting, routing | 3000 | Legacy domains only; no Auth/turnos writes | Auth, Appointments, MongoDB (legacy routes) |
| `auth-service` | Registration, login, JWT, user contract, appointment reservations | 3001 | `SaludActiva_auth` | MongoDB |
| `appointments-service` | Availability, appointment API, saga, outbox relay and consumer | 3002 | `SaludActiva_turnos` | MongoDB, Auth contract, RabbitMQ |
| `mongodb` | One MongoDB engine with a separate logical database per domain | 27017 | Persistent `mongodb_data` volume | — |
| `rabbitmq` | Durable event exchange, saga queue, dead-letter queue | 5672 | Broker-managed | — |

Only the API Gateway port is published to the host. Services use separate containers and processes, though they currently build from one Node.js package/repository. This catalog describes the running MVP 2 scope; `Medicamentos`, `Estudios`, and `Chat` remain legacy routes in the gateway and are not represented as independently deployed services yet.

## Communication and consistency

* Web and Android call the existing `/api/auth/*` and `/api/turnos/*` paths through the gateway.
* The appointments service verifies JWTs and retrieves user context through the authenticated Auth REST contract. It never reads the auth database.
* The booking saga asks Auth to reserve the patient/appointment pair. A successful reservation is followed by turn confirmation; permanent failures cancel the turn, and post-reservation failures release the Auth reservation as compensation.
* The appointment and `appointment.requested.v1` outbox event are stored in one MongoDB document. A polling relay publishes durable at-least-once messages to the `salud-activa.events.v1` topic exchange. The saga checks persisted appointment state before applying effects, making redelivery idempotent.
* MongoDB is one instance in accordance with Anexo J; Auth and Appointments use different logical databases and have separate write ownership.

## Local verification

Start with `docker compose up --build -d`; follow status with `docker compose ps`. The verified API is `http://localhost:3000`. See [MVP 2 contracts](../07-api/contracts/mvp2-contracts.md) and [ADR-005](../05-architecture/decisions/records/ADR-005-local-compose-and-graceful-degradation.md).
