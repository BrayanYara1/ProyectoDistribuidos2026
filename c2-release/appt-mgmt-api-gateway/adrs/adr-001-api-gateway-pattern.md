# ADR 001: Patrón API Gateway como Fachada Distribuida

- **Estatus**: Aprobado
- **Fecha**: 2026-03-29
- **Autores**: Equipo de Arquitectura de Sistemas Distribuidos

## Contexto
Los clientes (Web Dashboard y Apps Móviles Android) no deben comunicarse directamente con las bases de datos ni con múltiples endpoints desacoplados de microservicios internos por motivos de seguridad, latencia y acoplamiento.

## Decisión
Implementar el patrón API Gateway para centralizar:
1. Enrutamiento dinámico y balanceo de peticiones.
2. Validación previa de Tokens JWT y reenvío de credenciales a downstream.
3. Protección contra saturación mediante Rate Limiting.

## Consecuencias
- **Positivas**: Simplifica la API expuesta a los clientes, aislando la arquitectura interna.
- **Negativas**: Representa un punto potencial de estrangulamiento si no se escala horizontalmente.
