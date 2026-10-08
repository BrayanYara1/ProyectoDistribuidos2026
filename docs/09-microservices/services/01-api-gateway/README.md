# Salud Activa API Gateway

> **Single entry point** to the system. Receives all frontend requests and routes them
> to the corresponding service. It is the authoritative owner of the routing rules.

The implementation is `backend/server.js`, port 3000. This is a backwards-compatible gateway: it routes Auth and Appointments to independent service processes, serves the existing web UI, and keeps legacy routes for domains not yet extracted. It currently retains a MongoDB connection for those legacy endpoints.

---

## Location in the architecture

| Field | Value |
|-------|-------|
| Number in catalog | 01 |
| Local port | 3000 |
| Repository | [Service repo URL] |
| DB engine | MongoDB connection used only for legacy domains |
| Communicates with | auth-service, appointments-service |
| Consumed by | Web frontend, mobile app, third-party tools |

---

## Responsibilities (what this service DOES)

- Route `/api/auth/*` to Auth and `/api/turnos/*` plus `/api/demo/*` to Appointments.
- Preserve existing Android/web request paths and apply global rate limiting.
- Report liveness separately from readiness and downstream service health.

## Out of scope (what it does NOT do)

- **Does not handle business logic** — only routes
- **Does not verify resource permissions** — only verifies the JWT is valid (authorization is done by each service)
- **Does not own auth/appointment data** — those databases belong to their respective services.

---

## How to run it locally

```bash
# From the project root
docker compose up --build -d

# Verify it is working
curl http://localhost:3000/health/live
```

**Expected response:**
```json
{ "status": "alive", "timestamp": "..." }
```

---

## Related documents

- [data-model.md](./data-model.md) — Not applicable (no own DB)
- [events.md](./events.md) — Not applicable (does not emit domain events)
- [decisions.md](./decisions.md) — Gateway design decisions
- [runbook.md](./runbook.md) — Operation in production
- [MVP 2 service contracts](../../../07-api/contracts/mvp2-contracts.md)

---

## Design decisions

See: `09-microservices/services/01-api-gateway/decisions.md`

Relevant decisions include:
- **ADR-002** — Why [Kong / Nginx / custom Express] was chosen as the gateway base
- **ADR-003** — Authentication strategy at the gateway vs. in each service

---

## Routing pattern

```
Client → :3000/api/auth/*   → auth-service :3001
Client → :3000/api/turnos/* → appointments-service :3002
Client → :3000/[legacy]     → existing gateway routes
```

Routing configuration: `backend/server.js`; local runtime: root `docker-compose.yml`.
