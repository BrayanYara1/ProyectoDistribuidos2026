# Appointments Service Data Model

**Engine:** MongoDB, logical database `SaludActiva_turnos` on the single shared instance required by Anexo J.

## Collection: `turnos`

| Field | Type | Owner | Notes |
|---|---|---|---|
| `_id` | UUID | Appointments | Saga correlation and event idempotency key |
| `usuarioId` | String | Auth assigns; Appointments stores | Opaque Auth user identifier; never a cross-database reference |
| `fecha`, `hora` | String | Appointments | Active pair has a unique compound index |
| `pacienteNombre`, `doctor`, `especialidad`, `motivo` | String | Appointments snapshot | Client-compatible booking details |
| `estado` | String | Appointments | `Pendiente`, `Confirmado`, or `Cancelado` |
| `sagaStatus` | Enum | Appointments | `PENDING`, `COMPLETED`, `COMPENSATED` |
| `outboxEvents[]` | Embedded subdocument | Appointments | Event id, type/version, occurrence time, payload, publish time; persisted atomically with the turn |

Cancelled appointments are excluded from the unique active-slot index and keep their outbox history.
