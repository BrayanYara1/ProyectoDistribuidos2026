# ADR 001: Bounded Context de Identidad y Autenticación Basada en Tokens JWT

- **Estatus**: Aprobado
- **Fecha**: 2026-03-29
- **Autores**: Equipo de Arquitectura de Sistemas Distribuidos

## Contexto
El sistema requiere autenticación segura, rápida y sin estado (stateless) para atender peticiones tanto del Frontend Web como de las Aplicaciones Móviles Android.

## Decisión
Aislar el Bounded Context de Identidad y Accesos en `appt-mgmt-identity-access-api` emitiendo tokens firmados JWT con expiración controlada para autorizar peticiones hacia otros microservicios.

## Consecuencias
- **Positivas**: Desacoplamiento total de la gestión de contraseñas y alta escalabilidad horizontal.
- **Negativas**: Necesidad de revocación activa de tokens si un rol cambia antes de la expiración.
