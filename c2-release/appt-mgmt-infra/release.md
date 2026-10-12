# Release Info - appt-mgmt-infra

- **Componente**: `appt-mgmt-infra`
- **Versión**: `v2.0.0`
- **Entrega**: `c2-release`
- **Commit ID**: `128074ea37dd11c0520637bc67794f803eee7580`
- **Fecha**: 2026-03-29

## Descripción
Este repositorio contiene la definición de infraestructura como código (IaC) en Terraform para AWS y la orquestación en Docker Compose para el entorno de desarrollo e integración contínua de todos los microservicios del sistema de gestión de citas médicas.

## Instrucciones de Despliegue

### Entorno Local (Docker Compose)
```bash
docker-compose up -d
```

### Entorno AWS (Terraform)
```bash
cd terraform
terraform init
terraform plan
terraform apply
```
