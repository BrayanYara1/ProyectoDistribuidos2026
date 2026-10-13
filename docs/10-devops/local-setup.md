# Local Setup — Salud Activa MVP 2

## Prerequisites

* Docker Desktop 24+ with its Linux container engine running; Docker Compose v2.
* Node.js 18+ and npm 9+ only if running backend tests outside containers.
* Ports 3000 (gateway), MongoDB 27017, and RabbitMQ 5672 available. Only gateway is published by Compose.

Verify Docker before starting: `docker info` and `docker compose version`.

## Start the integrated runtime

From the repository root:

```powershell
Copy-Item .env.example .env
# Replace the three example secrets in .env with random local-only values.
docker compose config --quiet
docker compose up --build -d
docker compose ps
```

Wait for `mongodb`, `rabbitmq`, `auth-service`, `appointments-service`, and `backend` to show `healthy`. The gateway serves the web client and public API at `http://localhost:3000`. Auth and Appointments are private to the Compose network.

If port 3000 is already used, set `BACKEND_PORT=3100` in `.env` and use `http://localhost:3100`.

## Smoke test and booking saga

Register a local user and sign in through the gateway:

```powershell
curl.exe -X POST http://localhost:3000/api/auth/register -H "Content-Type: application/json" -d "{\"nombre\":\"Demo User\",\"email\":\"demo@example.test\",\"contrasena\":\"DemoPass123\"}"
curl.exe -X POST http://localhost:3000/api/auth/login -H "Content-Type: application/json" -d "{\"email\":\"demo@example.test\",\"contrasena\":\"DemoPass123\"}"
```

Use the returned JWT for authenticated `GET /api/turnos`, `GET /api/turnos/check-availability?fecha=2026-10-30&hora=09:00`, and `POST /api/turnos`. A successful create returns `202` with `estado: Pendiente`; the saga later changes it to `Confirmado`.

To demonstrate compensation locally, use the Compose-local default `DEMO_FAILURE_ENABLED=true` and set a private `DEMO_FAILURE_TOKEN` in `.env`. Restart Compose, arm the injection endpoint, and create a turn:

```powershell
docker compose up -d --force-recreate appointments-service
curl.exe -X POST http://localhost:3000/api/demo/fail-next-saga -H "x-demo-token: YOUR_LOCAL_DEMO_FAILURE_TOKEN"
```

The next booking is accepted, then reaches `Cancelado`; Appointments calls Auth to release its reservation. Verify logs with `docker compose logs appointments-service auth-service`. The API is not ready for production while demo failure injection is enabled.

## Graceful degradation / outbox recovery

1. With a valid JWT, stop RabbitMQ: `docker compose stop rabbitmq`.
2. Check `http://localhost:3000/health/live` remains `200`.
3. Check Appointments readiness (from inside its container) with `docker compose exec appointments-service node -e "fetch('http://localhost:3002/health/ready').then(async r=>{console.log(r.status,await r.text());process.exit(r.status===503?0:1)})"`.
4. Submit an authenticated `POST /api/turnos`. It returns `202`; the event remains in the same MongoDB document's outbox.
5. Restore the broker: `docker compose start rabbitmq`. The appointments relay reconnects and processes pending events.
6. Confirm with `docker compose ps` and `docker compose logs appointments-service`.

For a separate MongoDB outage, stop/start only `mongodb`; liveness remains available, readiness becomes degraded and Mongoose reconnects after restoration.

## Tests and cleanup

```powershell
Push-Location backend
npm ci
npm test
Pop-Location
docker compose down
```

`docker compose down` keeps the persistent `mongodb_data` volume. **Never use `docker compose down -v` for the demo data.**

## Git flow for MVP 2

* Work in `hu-<id>-dev`; open a reviewed PR to `develop`.
* Promote the same tested commit from `develop` to `qa` through a PR and run the live demo.
* Promote the accepted QA commit to `main` through a release PR; update ADRs/CHANGELOG and tag `v2.0.0` only after checks pass.
* The GitHub Actions workflow runs tests, Compose validation, and image builds on pushes/PRs. It does not claim to deploy AWS environments.
