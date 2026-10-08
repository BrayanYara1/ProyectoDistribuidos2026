# Salud Activa - Gestión de Bienestar Médico

## Descripción
**Salud Activa** es una plataforma para la gestión de turnos y bienestar médico. El proyecto incluye una aplicación móvil Android nativa, una API Node.js y despliegue de infraestructura en AWS.

## Arquitectura del Proyecto
El cliente Android conserva una arquitectura MVVM. El backend del MVP 2 ejecuta como servicios desplegables independientes dentro del mismo repositorio; cada servicio es dueño de sus bases MongoDB lógicas conforme al Anexo J:

1.  **App Android (`/app`):** 
    - **MVVM:** Separación clara entre la lógica de negocio (ViewModels) y la interfaz (Fragments).
    - **Repository Pattern:** Centralización del acceso a datos (API y Caché Offline).
    - **Data Binding / View Binding:** Interfaz reactiva y limpia.
    - Retrofit + OkHttp para la comunicación con el backend (v2.11.0).
    - Kotlin Coroutines para operaciones asíncronas fluidas.
    - Material Design 3 para una experiencia de usuario profesional y accesible.

2.  **Backend (`/backend`):**
    - `backend/server.js`: API Gateway que mantiene las rutas existentes de web y Android y enruta auth y turnos a sus servicios.
    - `backend/services/auth-service`: registro, login, JWT, contratos internos de usuario y reservas.
    - `backend/services/appointments-service`: turnos, saga de reserva, outbox y consumidor/publicador RabbitMQ.
    - `backend/services/*`: Node.js + Express; `backend/models/` conserva modelos por base de datos de dominio.
    - MongoDB y RabbitMQ forman una instancia de cada motor en el Compose local.

3.  **Infraestructura (`/terraform_aws`):**
    - Infraestructura como Código (IaC) usando Terraform.
    - Despliegue en AWS ECS Fargate (Serverless Containers).
    - Base de Datos Relacional RDS (PostgreSQL).
    - Load Balancer (ALB) para distribución de tráfico y alta disponibilidad global.

## Containerización
El backend está completamente containerizado para asegurar la paridad entre entornos.
- **Dockerfile:** Utiliza una construcción multi-etapa basada en Node-Alpine para minimizar el tamaño de la imagen.

## Ejecución Local

### Demo integrada backend + MongoDB

Desde la raíz del repositorio:

```powershell
Copy-Item .env.example .env
# Replace the example values with random local-only secrets.
docker compose up --build -d
docker compose ps
```

La API Gateway queda en `http://localhost:3000` (configurable mediante `BACKEND_PORT`). Para demostrar degradación y recuperación, detén el broker con `docker compose stop rabbitmq`: la API sigue viva, readiness queda degradada y las solicitudes aceptadas permanecen en el outbox. Restaura el broker con `docker compose start rabbitmq`; el outbox reenvía los eventos pendientes.

La saga de reserva coordina turnos con el contrato REST de Auth. La inyección protegida de fallo (`POST /api/demo/fail-next-saga`) fuerza un error posterior a la reserva y verifica que la compensación libera la reserva y cancela el turno. Requiere `DEMO_FAILURE_TOKEN`; está desactivada por defecto fuera del Compose local.

### Backend
1. Entra a la carpeta `backend/`.
2. Instala las dependencias: `npm ci`.
3. Crea un archivo `.env` con las variables necesarias.
4. Ejecuta: `npm start`.

### Android
1. Abre el proyecto en Android Studio.
2. Sincroniza Gradle.
3. El `BASE_URL` apunta por defecto a la nube pública de Salud Activa.
4. Ejecuta la app en un emulador o dispositivo físico.

## Infraestructura en AWS
Para desplegar la infraestructura:
1. Ve a `terraform_aws/`.
2. Ejecuta `terraform init`.
3. Ejecuta `terraform apply`.
