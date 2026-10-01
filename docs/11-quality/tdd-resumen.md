# TDD resumido

## Propósito

Desarrollar cada comportamiento mediante pruebas que guíen el diseño y confirmen los criterios de aceptación.

## Ciclo Red-Green-Refactor

1. **Red:** escribir primero la prueba más pequeña que describa el comportamiento. Ejecutarla y confirmar que falla por la razón esperada.
2. **Green:** implementar únicamente lo necesario para que la prueba pase. Ejecutar de nuevo la prueba y la suite relacionada.
3. **Refactor:** simplificar o mejorar el código sin cambiar el comportamiento. Volver a ejecutar las pruebas.

## Ejemplo: disponibilidad de turnos

- **Red:** probar `GET /api/turnos/check-availability` sin `fecha` y sin `hora`; ambos casos deben responder `400`.
- **Green:** validar ambos parámetros antes de consultar MongoDB y responder `400` si falta alguno.
- **Refactor:** mantener la validación clara, conservar el contrato HTTP y confirmar que la suite continúa verde.

Prueba: `backend/tests/status.test.js`

Implementación: `backend/routes/turnos.js`

## Ejecución

Desde `backend/`:

```bash
npm test -- --runInBand
npm run test:coverage -- --runInBand
```

La suite cubre estado, autenticación, disponibilidad, horarios ocupados y cancelados, y los caminos principales de listar, crear y cancelar turnos.

## Criterios para las pruebas

- Rápidas, aisladas, repetibles, automáticas y escritas antes del código.
- Cubrir casos válidos y errores relevantes; evitar depender de servicios externos en pruebas unitarias.
- El workflow de backend exige **80% de cobertura de líneas en `routes/turnos.js`** y genera el reporte global del backend.

## Estado de este incremento

- La conexión a MongoDB se inicia solo al ejecutar `node server.js`; importar la app desde Jest no conecta a Atlas.
- Las pruebas simulan MongoDB y notificaciones push para que los resultados no dependan de esos servicios.
- `docs/07-api/contracts/openapi/turnos-service.yaml` documenta el endpoint de disponibilidad.
- `.github/workflows/backend-ci.yml` ejecuta instalación reproducible, tests y cobertura en pull requests y pushes a `main`.