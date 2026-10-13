# ADR 001: Arquitectura Modular Kotlin MVVM para Citas en Android

- **Estatus**: Aprobado
- **Fecha**: 2026-03-29
- **Autores**: Equipo de Desarrollo Android

## Contexto
Se busca evitar la sobrecarga de dependencias en un monolito Android dividiendo la app en módulos funcionales de dominio.

## Decisión
Crear el módulo Android de biblioteca `appt-mgmt-appointment-app` empleando MVVM, Kotlin Coroutines y StateFlow para reactividad limpia.

## Consecuencias
- **Positivas**: Tiempos de compilación más rápidos y aislamiento estricto de UI y casos de uso de citas.
- **Negativas**: Necesidad de publicar/enlazar artefactos de biblioteca internamente.
