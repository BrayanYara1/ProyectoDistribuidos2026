# ADR 001: Bounded Context de Citas y Arquitectura Hexagonal

- **Estatus**: Aprobado
- **Fecha**: 2026-03-29
- **Autores**: Equipo de Arquitectura de Sistemas Distribuidos

## Contexto
La gestión de citas médicas involucra reglas de dominio específicas (validación de horarios, asociación paciente-médico, especialidades) que deben mantenerse aisladas de otros dominios como autenticación.

## Decisión
Definir un Bounded Context independiente (`appt-mgmt-appointment-api`) utilizando arquitectura hexagonal para aislar el modelo de dominio (`Appointment`) de los detalles de infraestructura.

## Consecuencias
- **Positivas**: Alta mantenibilidad, independencia de persistencia y facilidad para ejecutar pruebas TDD en aislamiento.
- **Negativas**: Necesidad de mantener DTOs de mapeo entre capas.
