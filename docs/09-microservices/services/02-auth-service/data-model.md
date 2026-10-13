# Auth Service Data Model

**Engine:** MongoDB, logical database `SaludActiva_auth` on the one shared MongoDB instance required by Anexo J.

## Collection: `users`

The existing Mongoose `User` model is the authoritative source for identity and account profile data.

| Field | Type | Notes |
|---|---|---|
| `_id` | ObjectId | User identity included in JWT `userId` |
| `email` | String | Required, unique |
| `contrasena` | String | Required bcrypt hash; never returned by internal contracts |
| `nombre`, `telefono` | String | Minimal user profile |
| `fcmToken` | String/null | Notification delivery context |
| `tipoSanguineo`, `alergias`, `condiciones`, `contactoEmergencia` | String | Existing profile fields |

## Collection: `appointmentreservations`

| Field | Type | Notes |
|---|---|---|
| `reservationId` | String | Required and unique; equals the Appointments identifier |
| `userId` | String | Auth-owned user identifier |
| `status` | Enum | `RESERVED` or `RELEASED`; release is idempotent |
| `createdAt`, `updatedAt` | Date | Mongoose timestamps |

Reservations record the Auth side effect in the distributed booking saga. Appointments calls Auth REST contracts to create/release them and does not query this database.
