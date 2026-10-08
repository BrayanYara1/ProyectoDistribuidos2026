# Technical Master Documentation: Salud Activa Project

This document is the definitive technical reference for the Salud Activa ecosystem, covering the Android application, Node.js backend, and AWS infrastructure.

> **MVP 2 implementation note (2026-10-08):** For Auth and Appointments, the running local architecture is the independent-service Compose topology documented in [service catalog](docs/09-microservices/service-catalog.md), [contracts](docs/07-api/contracts/mvp2-contracts.md), and ADR-005. The older broad target diagrams below are not evidence of deployed AWS infrastructure; Medication, Studies, and Chat remain gateway legacy domains.

---

## 1. Architectural Decision Records (ADR)

### ADR-001: Documentation and Code Language
*   **ID:** ADR-001
*   **Status:** Accepted
*   **Date:** 2024-01-10
*   **Authors:** Maria Garcia — Tech Lead
*   **Decision:** All technical artifacts (code, documentation, database schemas, and git history) will be in **English**.
*   **Justification:** Eliminates the cognitive translation boundary, aligns with the global software ecosystem, and facilitates the use of AI tools and external contributors.

---

## 2. System Architecture Overview

### 2.1. Adopted Architectural Style
**Style:** Distributed modular monorepo for Auth and Appointments behind a backwards-compatible API Gateway. Those services run as independent Node.js processes, communicate over REST contracts and RabbitMQ events, and own separate logical MongoDB databases. Other domains remain in gateway legacy routes.

### 2.2. C4 Diagram — System Level (Context)

```mermaid
graph LN
  User((Patient/User))
  SaludActiva[Salud Activa System]
  FCM[Firebase Cloud Messaging]
  AWS[AWS Cloud Services]

  User -- Uses --> SaludActiva
  SaludActiva -- Sends Notifications --> FCM
  FCM -- Delivers to --> User
  SaludActiva -- Deployed on --> AWS
```

### 2.3. C4 Diagram — Container Level

```mermaid
graph TB
  subgraph "Salud Activa Ecosystem"
    subgraph "Android Client"
      App[Android App<br/>Kotlin/MVVM]
      LocalDB[(Room DB<br/>Local Cache)]
    end

    subgraph "AWS Infrastructure"
      ALB[Application Load Balancer]
      ECS[ECS Fargate<br/>Node.js API]
      RDS[(RDS PostgreSQL<br/>Relational Data)]
      Mongo[(MongoDB Atlas<br/>Document Store)]
    end
  end

  App -- HTTPS/JWT --> ALB
  ALB -- Routes --> ECS
  ECS -- Persists --> RDS
  ECS -- Stores --> Mongo
  App -- Syncs --> LocalDB
```

### 2.4. Service Catalog
*   **api-gateway:** Express gateway; serves current web routes and forwards `/api/auth/*`, `/api/turnos/*`, and `/api/demo/*`.
*   **auth-service:** Owns user records and idempotent appointment reservations.
*   **appointments-service:** Owns turns, booking saga, and embedded outbox.
*   **mongodb/rabbitmq:** One shared engine instance per Anexo J and durable event transport.
*   **android-app:** Kotlin native app with Room cache and compatible REST paths.
*   **terraform-infra:** Separate infrastructure code; the Compose MVP runtime does not imply an AWS deployment.

---

## 3. Data Models per Service

### 3.1. Modeling Principles
*   **Database per Service:** No shared database access.
*   **Standard Audit:** All tables include `id` (UUID), `created_at`, `updated_at`, and `deleted_at` (Soft Delete).

### 3.2. Relationship Diagram

```mermaid
erDiagram
    USERS ||--o{ APPOINTMENTS : schedules
    USERS ||--o{ MEDICATIONS : takes
    APPOINTMENTS }|--|| SPECIALTIES : belongs_to
    
    USERS {
        uuid id PK
        string email
        string full_name
    }
    
    APPOINTMENTS {
        uuid id PK
        uuid patient_id FK
        timestamptz appointment_date
        string status
    }
```

---

## 4. Functional Requirements (User Stories)

### HU-IAM-001: Secure Login
**As** a user, **I want** to log in with email/password **so that** I can access my medical history.
*   **AC1:** Securely store JWT in EncryptedSharedPreferences.
*   **AC2:** Support biometric bypass if a valid session exists.

### HU-SCHED-001: Appointment Scheduling
**As** a patient, **I want** to book an appointment **so that** I can see a doctor.
*   **AC1:** Allow offline booking with background sync via SyncWorker.

---

## 5. Non-Functional Requirements (NFR)

*   **Performance:** P95 Latency < 300ms for API calls. App cold start < 2s.
*   **Availability:** 99.9% uptime for the Backend API.
*   **Security:** TLS 1.2+ mandatory. JWT tokens expire in 1 hour. PII encrypted at rest.
*   **Maintainability:** >80% code coverage. CI pipeline < 6 minutes.

---

## 6. Hexagonal Architecture Guide

### 6.1. The Dependency Rule
**Dependencies always point inward: Infrastructure → Application → Domain.**
*   **Domain:** Contains Entities and Ports (Interfaces). No frameworks allowed.
*   **Application:** Implements Driving Ports (Use Cases).
*   **Infrastructure:** Implements Driven Ports (Repositories, API Clients).

---

## 7. Design Patterns and Microservices Guide

### 7.1. Resilience Patterns
*   **Circuit Breaker:** Applied to Backend → FCM communication to prevent cascading failures.
*   **Retry with Backoff:** Used in the Android SyncWorker for transient network errors.

### 7.2. Data Consistency
*   **Outbox Pattern:** The appointment request and its event are atomically appended in one MongoDB document; relay delivery is at least once and saga processing is idempotent.
*   **CQRS:** Segregates the write model (Commands) from the read model (Queries).

---

## 8. Disaster Recovery (DR)

| Scenario | RTO (Recovery Time) | RPO (Data Loss Window) |
|---------|---------------------|------------------------|
| Backend Failure | < 2 minutes (ECS Auto-restart) | 0 (Stateless) |
| DB Failure (RDS/Atlas) | < 5 minutes (Failover) | < 5 seconds |
| Regional Disaster | < 4 hours (Full AWS Redeploy) | < 1 hour |
