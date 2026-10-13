# ADR 001: Selección de Stack de Infraestructura y Orquestación

- **Estatus**: Aprobado
- **Fecha**: 2026-03-29
- **Autores**: Equipo de Arquitectura de Sistemas Distribuidos

## Contexto
El sistema de gestión de citas médicas requiere una infraestructura elástica, altamente disponible y fácil de orquestar tanto en entornos locales de desarrollo como en entornos de nube (AWS).

## Decisión
Se decide adoptar:
1. **Terraform**: Como herramienta declarativa de Infraestructura como Código (IaC) para provisión de recursos AWS (VPC, ECS, RDS PostgreSQL).
2. **Docker Compose**: Para orquestar contenedores locales que reflejan la topología distribuida de los 10 servicios.

## Consecuencias
- **Positivas**: Reproducibilidad total entre ambientes, despliegues automatizables y desacoplamiento de infraestructura.
- **Negativas**: Necesidad de mantener actualizados los manifiestos de Terraform a la par de los cambios en componentes de AWS.
