# ADR 001: Diseño de Esquema Relacional PostgreSQL para Citas Médicas

- **Estatus**: Aprobado
- **Fecha**: 2026-03-29
- **Autores**: Equipo de Arquitectura de Sistemas Distribuidos

## Contexto
Se requiere garantizar la consistencia relacional y transaccional (ACID) en la reserva, actualización y cancelación de citas de los usuarios.

## Decisión
Usar PostgreSQL 15 como motor de almacenamiento con índices en `patient_id`, `doctor_id` y `appointment_date` para acelerar consultas periódicas.

## Consecuencias
- **Positivas**: Garantía de transaccionalidad estricta y prevención de colisiones de horario.
- **Negativas**: Necesidad de ejecutar migraciones ordenadas en cada despliegue.
