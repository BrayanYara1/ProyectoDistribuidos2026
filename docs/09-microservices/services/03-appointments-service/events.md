# Appointments Service Events

## Exchange and delivery

* Exchange: durable topic `salud-activa.events.v1`.
* Queue: durable `appointments.saga.v1`, bound to `appointment.requested.v1`.
* Outbox: embedded in the appointment document and saved with the business record before publication.
* Delivery: at least once. The relay marks an event published only after RabbitMQ confirms it. A crash between publish and marking may redeliver; the saga is idempotent by appointment ID and state.
* Poison events retry six times and are routed to `appointments.saga.v1.dead`.

## Event catalog

| Event | Producer | Consumer | Payload |
|---|---|---|---|
| `appointment.requested.v1` | Appointments outbox | Appointment saga | `appointmentId`, `userId`, `demoFail` |
| `appointment.confirmed.v1` | Appointment saga outbox | Future notification/analytics consumers | `appointmentId`, `reservationId` |
| `appointment.cancelled.v1` | Appointment/saga outbox | Future notification/analytics consumers | `appointmentId`, `userId` |

## Saga steps

1. Persist the appointment as `Pendiente` with `sagaStatus: PENDING` and a `appointment.requested.v1` outbox event.
2. Relay the event to RabbitMQ and consume it in the saga worker.
3. Reserve `(appointmentId, userId)` through Auth's idempotent REST contract.
4. On success, mark the appointment `Confirmado` and append `appointment.confirmed.v1`.
5. On permanent rejection, mark it `Cancelado` and append `appointment.cancelled.v1`.
6. If a post-reservation step fails, release the Auth reservation before persisting the compensated/cancelled state.

Transient failures are retried. No service reads another service's MongoDB database.
