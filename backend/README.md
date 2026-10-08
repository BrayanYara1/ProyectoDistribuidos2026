# Backend - Salud Activa

Backend Node.js/Express compuesto por el API Gateway, Auth Service y Appointments Service.

## Ejecucion local integrada

Desde la raiz del repositorio, inicia Gateway, Auth, Appointments, MongoDB y RabbitMQ:

```sh
docker compose up --build -d
docker compose ps
```

La API Gateway queda en `http://localhost:3000`. Auth y Appointments solo se exponen dentro de la red Compose. Las rutas públicas `/api/auth/*` y `/api/turnos/*` se enrutan a los servicios propietarios.

### Demo de degradacion controlada

1. Registra/inicia sesión por `/api/auth/register` y `/api/auth/login`; conserva el JWT.
2. Arma el fallo: `POST /api/demo/fail-next-saga` con header `x-demo-token`.
3. Crea un turno en `POST /api/turnos`; recibe `202` y `estado: Pendiente`.
4. Consulta `GET /api/turnos`; la saga compensará la reserva y dejará el turno como `Cancelado`.
5. Para degradación del broker, ejecuta `docker compose stop rabbitmq`; liveness permanece `200`, readiness de appointments pasa a `503` y el outbox persiste. Inicia de nuevo con `docker compose start rabbitmq`.

El volumen `mongodb_data` preserva los datos al detener los contenedores. No uses `docker compose down -v` si necesitas conservarlos.

> El secreto JWT predeterminado de Compose es solo para desarrollo local. Define `JWT_SECRET` antes de usar cualquier despliegue no local.

## Pruebas

```sh
cd backend
npm ci
npm test
```

Las pruebas cubren estado degradado, contratos REST entre servicios, idempotencia/compensación de saga y cierre de turno. No requieren servicios externos:

```sh
cd backend
npm ci
npm test
```
