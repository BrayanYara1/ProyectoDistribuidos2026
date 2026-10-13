# ADR 001: Máquina de Estados Finitos y Orquestación del Flujo de Citas

- **Estatus**: Aprobado
- **Fecha**: 2026-03-29
- **Autores**: Equipo de Arquitectura de Sistemas Distribuidos

## Contexto
El flujo de una cita médica implica múltiples estados (Solicitada, Confirmada, En Proceso, Finalizada, Cancelada) y reglas de negocio estrictas que no pueden saltarse.

## Decisión
Implementar un microservicio dedicado a la máquina de estados (`AppointmentStateMachine`) que valide atómicamente cada transición antes de persistir los cambios en el sistema.

## Consecuencias
- **Positivas**: Evita inconsistencias de estado, centraliza la lógica de negocio del flujo y facilita la auditoría de eventos.
- **Negativas**: Añade una llamada de red adicional en las mutaciones de estado de una cita.
