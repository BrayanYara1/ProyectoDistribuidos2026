# Changelog - appt-mgmt-workflow

## [2.0.0] - 2.0.0-c2-release
### Añadido
- Máquina de estados finitos `AppointmentStateMachine` para gestionar transiciones de citas (`SOLICITADO` -> `CONFIRMADO` -> `EN_PROCESO` -> `FINALIZADO` / `CANCELADO`).
- Servicio de orquestación `WorkflowEngine` alineado con arquitectura hexagonal / DDD.
- Publicador de eventos de dominio `EventPublisher` para notificaciones asíncronas.
- Pruebas unitarias TDD comprobando transiciones válidas e inválidas.
- `release.md` con commit id `128074ea37dd11c0520637bc67794f803eee7580`.
