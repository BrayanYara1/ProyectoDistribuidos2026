# Changelog - appt-mgmt-api-gateway

## [2.0.0] - 2.0.0-c2-release
### Añadido
- Enrutamiento unificado de endpoints API REST hacia microservicios IAM, Appointments y Workflow.
- Middleware de inspección y reenvío de encabezados de autenticación JWT (`authForwarder`).
- Middleware de limitación de frecuencia de peticiones (`rateLimiter`).
- Pruebas unitarias e integración TDD con Jest y Supertest.
- Dockerfile y configuración para despliegue en contenedor.
- `release.md` con commit id `128074ea37dd11c0520637bc67794f803eee7580`.
