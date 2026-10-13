# Appointments Service Runbook

## Local start and health

```sh
docker compose up --build -d
docker compose ps
docker compose logs -f appointments-service
```

`GET /health/live` checks the process; `/health/ready` requires the turnos database and RabbitMQ. The gateway is the public entry point at `http://localhost:3000`.

## Broker outage / outbox recovery demo

1. Record a valid user JWT, then run `docker compose stop rabbitmq`.
2. Check `http://localhost:3000/health/live` (`200`) and request the appointments service readiness (`503` while the broker is down).
3. Submit an authenticated `POST /api/turnos`; it returns `202` and persists the request and event even without RabbitMQ.
4. Run `docker compose start rabbitmq`. Wait for `appointments-service` to report `ready`; the outbox relay publishes the stored event and the saga advances the turn.

## Compensating-saga demo

Set `DEMO_FAILURE_ENABLED=true` and a private `DEMO_FAILURE_TOKEN` in a local `.env`, restart Compose, arm `POST /api/demo/fail-next-saga`, then create an appointment. Poll `GET /api/turnos`: it should become `Cancelado`. Logs should show the reservation release and saga compensation.

## Data/index rollout

Before applying the unique active slot index to a populated environment, find and resolve duplicate active `(fecha, hora)` pairs. Never delete the `mongodb_data` volume during a demonstration or recovery exercise.
