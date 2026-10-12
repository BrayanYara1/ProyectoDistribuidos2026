# Release Info - appt-mgmt-api-gateway

- **Componente**: `appt-mgmt-api-gateway`
- **Versión**: `v2.0.0`
- **Entrega**: `c2-release`
- **Commit ID**: `128074ea37dd11c0520637bc67794f803eee7580`
- **Fecha**: 2026-03-29

## Descripción
Punto único de entrada (Single Entry Point) para todas las peticiones externas del cliente web y móvil hacia los microservicios del sistema.

## Variables de Entorno
- `PORT`: Puerto de escucha (por defecto `8080`).
- `IAM_API_URL`: URL del microservicio de autenticación e identidad.
- `APPOINTMENT_API_URL`: URL del microservicio de gestión de citas.
- `WORKFLOW_URL`: URL del motor de flujo de trabajo de citas.
