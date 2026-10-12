# Release v2.0.0 - Control de Commits y Entregables

**Fecha de Entrega:** 13 de Octubre  
**Tag de Release:** `v2.0.0`

---

## 📌 Identificación de Commits por Repositorio

| Repositorio | Tag | Commit ID (Hash) | Descripción |
| :--- | :--- | :--- | :--- |
| **GestionTurnosApp** (Backend & Android App) | `v2.0.0` | `89af5bd778d87066f9a1e8df6502f664c2ecff96` | MVP 2 Release Final con orquestación de microservicios, RabbitMQ, Docker Compose y CI/CD configurado. |
| *(Repo Frontend / Portal adicional si aplica)* | `v2.0.0` | `<commit-id-repo-2>` | *(Completar si se utiliza un segundo repositorio)* |

---

## 📦 Generación de Entregables (.zip sin `node_modules`)

Para generar el archivo `.zip` del código fuente limpio para la entrega en `c2-release`:

```bash
# Comando git archive (excluye automáticamente node_modules y archivos no rastreados)
git archive --format=zip --output=GestionTurnosApp-v2.0.0.zip v2.0.0
```

> **Nota:** Alternativamente, el archivo `.zip` se puede descargar directamente desde GitHub en la sección **Releases -> Source code (zip)** del tag `v2.0.0`.

---

## ⚙️ Configuración de CI/CD (GitHub Actions)
- **Workflow:** `.github/workflows/mvp2-quality.yml`
- **Triggers:** Exclusivamente Pull Requests (`PR`) hacia ramas `develop` y `qa`.
- **Estrategia de Concurrencia:** `concurrency` con `cancel-in-progress: true`.
- **Timeout Máximo:** `timeout-minutes: 10`.

---

## 🚀 Orquestación de Servicios con Docker Compose

```bash
# Iniciar la pila completa de servicios
docker compose up -d --build

# Verificar estado y healthchecks
docker compose ps
```

**Servicios Orquestados:**
1. `backend` (API Gateway / Backend principal) -> `http://localhost:3000`
2. `auth-service` (Servicio de Autenticación) -> `http://localhost:3001`
3. `appointments-service` (Servicio de Citas/Turnos) -> `http://localhost:3002`
4. `rabbitmq` (Bús de Mensajes / Cola asíncrona) -> `amqp://localhost:5672`
5. `mongodb` (Base de Datos MongoDB 7.0) -> `mongodb://localhost:27017`
