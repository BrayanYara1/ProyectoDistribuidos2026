# MVP 2 Service and Event Contracts

These versioned contracts preserve the routes consumed by the existing Android and web clients while Auth and Appointments run as independent services.

## External API

Requests are routed through the gateway at `http://localhost:3000`. The JWT issued by Auth is sent as `Authorization: Bearer <token>`.

### Auth

| Method | Path | Request | Result |
|---|---|---|---|
| `POST` | `/api/auth/register` | `{ nombre, email, telefono?, contrasena }` | `201 { mensaje, email }` |
| `POST` | `/api/auth/login` | `{ email, contrasena }` | `200 { mensaje, usuario, token }` |
| `PUT` | `/api/auth/profile` | User profile fields | `200` updated user |
| `POST` | `/api/auth/fcm-token` | `{ token }` | `200` |
| `POST` | `/api/auth/verify` | Existing verification payload | `200` compatibility response |
| `POST` | `/api/auth/resend-code` | Existing verification payload | `200` compatibility response |

The JWT subject remains in the `userId` claim to preserve the mobile/web contract.

### Appointments

| Method | Path | Request | Result |
|---|---|---|---|
| `GET` | `/api/turnos` | Bearer token | `200` appointments owned by that user |
| `GET` | `/api/turnos/check-availability?fecha=…&hora=…` | Bearer token | `200 { disponible: boolean }` |
| `POST` | `/api/turnos` | `{ fecha, hora, pacienteNombre?, nombre?, doctor?, medico?, especialidad?, motivo? }` | `202` appointment with `estado: Pendiente`; confirmation is asynchronous |
| `DELETE` | `/api/turnos/{id}` | Bearer token | `200`; cancellation event is written to the outbox |
| `POST` | `/api/demo/fail-next-saga` | `x-demo-token` header; local Compose only | `202 { status: failure_armed }` |

Active `(fecha, hora)` slots have a unique MongoDB index. Cancelled slots are reusable. The web client sends `doctor` and `pacienteNombre`; legacy `medico`/`nombre` fields are accepted during transition.

## Internal REST contract: Auth

All paths require `x-service-token`; these endpoints are internal to the Compose network and are not routed from the public gateway.

* `GET /internal/users/{id}` → `200` minimal user context; `404` if the Auth owner has no such user.
* `POST /internal/reservations` with `{ reservationId, userId }` → idempotent `200 { reservationId, status: RESERVED }`; `404` for an unknown user; `409` for conflicting reservation state.
* `DELETE /internal/reservations/{reservationId}` → idempotent release for saga compensation.

The Auth database is the source of truth for user and reservation records. Appointments persists only the Auth user identifier, not a cross-database Mongoose reference.

## Events

AMQP exchange: durable topic exchange `salud-activa.events.v1`. Payload envelope:

```json
{
  "eventId": "appointment-id:appointment.requested.v1",
  "type": "appointment.requested.v1",
  "version": 1,
  "occurredAt": "2026-10-08T15:00:00.000Z",
  "payload": {
    "appointmentId": "appointment-id",
    "userId": "auth-user-id",
    "demoFail": false
  }
}
```

* `appointment.requested.v1`: emitted by Appointments' embedded outbox, consumed by the appointment saga.
* `appointment.confirmed.v1`: emitted after Auth reservation and appointment confirmation.
* `appointment.cancelled.v1`: emitted after permanent saga rejection, compensation, or user cancellation.
* Consumer effects are idempotent by appointment ID/state. Outbox publish is at least once; consumers must not assume exactly-once delivery.
* Failed consumer messages retry up to six deliveries and then enter `appointments.saga.v1.dead`.

## Failure demonstration

With local Compose running, register and log in to obtain a token. Arm one controlled post-reservation failure, create a turn, then poll the user's turns until it reaches `Cancelado`. The saga must have released its Auth reservation. Separately stop RabbitMQ: the API remains live, readiness becomes degraded, and accepted requests remain in the persistent outbox until broker recovery.

`DEMO_FAILURE_ENABLED` defaults to false. Use a non-default `DEMO_FAILURE_TOKEN` outside a throwaway local environment; never expose the failure-injection route in production.
