# Auth Service

Auth owns user identities and appointment reservations in `SaludActiva_auth`. The independently started Express process is implemented in `backend/services/auth-service/server.js`.

## Responsibilities and boundaries

* Preserves client registration, login, JWT, profile, and FCM-token routes under `/api/auth/*`.
* Signs the existing `userId` JWT claim to keep Android/web compatibility.
* Exposes authenticated internal user-context and appointment-reservation REST contracts to Appointments.
* Does not read or write the appointments database.

## Endpoints

* Public routes are available through the API Gateway at `http://localhost:3000/api/auth/*`.
* Internal routes `GET /internal/users/{id}`, `POST /internal/reservations`, and `DELETE /internal/reservations/{id}` require `x-service-token` and are not exposed through the gateway.
* `/health/live` checks process liveness; `/health/ready` requires `SaludActiva_auth`.

## Local operation

Run `docker compose up --build -d auth-service`. Use `docker compose logs -f auth-service` for logs. See [MVP 2 contracts](../../../07-api/contracts/mvp2-contracts.md).
