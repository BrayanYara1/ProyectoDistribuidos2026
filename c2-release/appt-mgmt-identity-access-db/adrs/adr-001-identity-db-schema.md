# ADR 001: Esquema de Almacenamiento Relacional RBAC para IAM

- **Estatus**: Aprobado
- **Fecha**: 2026-03-29
- **Autores**: Equipo de Arquitectura de Sistemas Distribuidos

## Contexto
Se debe garantizar que los datos de autenticación estén aislados físicamente o lógicamente de la base de datos de citas de negocio para cumplir con principios de seguridad y DDD.

## Decisión
Desplegar una base de datos PostgreSQL separada (`iam_db`) dedicada únicamente al registro de usuarios, hashes de contraseñas y permisos RBAC.

## Consecuencias
- **Positivas**: Máxima privacidad y aislamiento de datos sensibles. Cumplimiento de normativas de seguridad.
- **Negativas**: Necesidad de gestionar dos motores o bases de datos relacionales independientes.
