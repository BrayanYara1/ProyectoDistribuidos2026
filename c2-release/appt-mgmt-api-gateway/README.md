# appt-mgmt-api-gateway

> Single entry point: authentication, routing and rate limiting

Part of the **LMS Library / Appointment Management** distributed system — team `code-corhuila`, Grupo 2.
Governance and documentation live in [`library-docs`](https://github.com/code-corhuila/library-docs).

## Branching & Governance

Three permanent branches:
```
develop  <--PR--  feat/... fix/... chore/...
qa       <--PR--  qa/...
main     <--PR--  release/...  hotfix/...
```

`main` requires **1 approval from `@ariel5253`**.

## Arquitectura y Componentes
- **Enrutamiento unificado**: Redirección de llamadas hacia microservicios IAM (`3001`), Citas (`3002`) y Workflow (`3003`).
- **Seguridad & Tokens**: Inspection y reenvío de headers `authorization` mediante `authForwarder`.
- **Protección**: Limitación de frecuencia de consumo mediante `rateLimiter`.

## Instrucciones de Ejecución
```bash
# Instalar dependencias
npm install

# Iniciar servicio en puerto 8080
npm start

# Ejecutar pruebas unitarias TDD
npm test
```
