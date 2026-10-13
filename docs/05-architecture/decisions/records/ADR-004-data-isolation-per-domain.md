# ADR-004: Cumplimiento de Anexo J — Base de Datos Única por Motor y Esquema por Dominio

* **Status:** Aceptado (Conforme a Anexo J 2026B)
* **Fecha:** 2026-09-29
* **Autores:** Equipo de Arquitectura - Salud Activa / GestionTurnosApp

---

## 1. Contexto y Anexo J (Corrección a la Norma)
Conforme a la expedición del **Anexo J — Corrección: Arquitectura del proyecto y base de datos única (2026B)**:
- Se deroga la exigencia previa de tener instancias de base de datos y contenedores separados por dominio (numerales 7.1 y 4.5.4 derogados).
- **Nueva Exigencia (Numerales J.2, J.3 y J.4):**
  - **Instancia Única por Motor:** Existe una única instancia y contenedor de MongoDB (y PostgreSQL) con su respectivo volumen persistente.
  - **Base de Datos / Esquema por Dominio dentro de la Instancia Única:** Para MongoDB, *"el equivalente del esquema es una base de datos por dominio dentro de esa instancia"* (`SaludActiva_auth`, `SaludActiva_turnos`, `SaludActiva_medicamentos`, `SaludActiva_estudios`, `SaludActiva_chat`).
  - **Aislamiento de Escritura:** Cada servicio escribe exclusivamente en la base/esquema de su dominio (`<dominio>_app`).

---

## 2. Decisión de Arquitectura
Se actualizó la persistencia del backend Node.js en [backend/config/dbConnections.js](../../../../backend/config/dbConnections.js) para cumplir con las disposiciones de Anexo J:

1. **Instancia Única con Bases de Datos Lógicas por Dominio:**
   El backend se conecta a la instancia única de MongoDB Atlas o local (`MONGODB_URI`) y agrega el sufijo del dominio al nombre base de la URI. Por ejemplo, para `SaludActiva`, crea/usa:
   - **Auth Domain:** `SaludActiva_auth`
   - **Turnos Domain:** `SaludActiva_turnos`
   - **Medicamentos Domain:** `SaludActiva_medicamentos`
   - **Estudios Domain:** `SaludActiva_estudios`
   - **Chat Domain:** `SaludActiva_chat`

   Una conexión MongoDB compartida reutiliza el pool de conexiones y selecciona estas bases lógicas con `useDb`; no se crean cinco instancias físicas.
   `MONGODB_URI` es la única URI activa; las antiguas variables `AUTH_MONGODB_URI`, `TURNOS_MONGODB_URI`, `MEDICAMENTOS_MONGODB_URI`, `ESTUDIOS_MONGODB_URI` y `CHAT_MONGODB_URI` se reportan como configuración obsoleta.

2. **Aislamiento Lógico de Persistencia:**
   Cada modelo Mongoose se vincula a la base de datos de su dominio y no comparte colecciones con otros dominios. La separación de bases no constituye por sí sola límites de servicio: algunas rutas actuales todavía leen o actualizan datos de usuario desde otros flujos y deben migrarse a contratos antes de afirmar propiedad exclusiva de datos. La instancia y el volumen MongoDB son compartidos conforme al Anexo J.

---

## 3. Justificación y Beneficios
- **Alineación con Anexo J:** Prevalece y reemplaza el numeral 7 previo de la norma.
- **Gestión Eficiente de Recursos:** Un solo contenedor/instancia con un único volumen persistente para MongoDB, mientras se mantiene la separación lógica de esquemas por dominio.
- **Operación:** Una conexión y un pool se comparten entre las bases lógicas; una interrupción del motor afecta a todos los dominios y se recupera mediante la reconexión de MongoDB.
