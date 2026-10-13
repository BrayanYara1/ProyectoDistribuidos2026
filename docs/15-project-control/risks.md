# MVP 2 Risk Register

Review during backlog refinement and at the retrospective after the acceptance demo.

| ID | Risk | Probability | Impact | Mitigation | Trigger / response | Status |
|---|---|---|---|---|---|---|
| R-MVP2-01 | Existing duplicate active slots prevent creation of the unique `(fecha, hora)` index. | Medium | High | Before deployment to populated MongoDB, find and resolve duplicate active records; test index creation on a backup. | Index build error: stop rollout, keep old service version and clean duplicates through an approved data task. | Open for non-empty deployment; clean local volume expected. |
| R-MVP2-02 | RabbitMQ outage delays saga completion. | Medium | High | Embedded outbox persists requests; bounded consumer retries and a dead-letter queue retain poison events. | Readiness is 503 or pending events grow: restore broker, inspect DLQ and replay only after correction. | Mitigated; live outage/recovery acceptance required. |
| R-MVP2-03 | Example/default secrets are reused outside local Compose. | Medium | Critical | Use separate environment secrets and rotate JWT/service/demo tokens; disable demo injection outside local. | Any secret appears in an external environment or repository: rotate, revoke affected sessions, and audit access. | Open until deployment config is established. |
| R-MVP2-04 | Auth REST is a synchronous dependency for Appointments context/reservation. | Medium | High | Short request timeout, explicit 503 response, retry transient saga events; do not access Auth DB directly. | Auth contract unavailable: leave booking pending/outbox-backed and restore Auth before draining. | Mitigated; multi-service live acceptance required. |
| R-MVP2-05 | Existing gateway legacy domains are still coupled to the monolith. | High | Medium | Keep scope explicit; do not claim Medicines, Studies, or Chat as independently deployable services. | A roadmap requires independent scaling/ownership: plan extraction as separate HUs and contracts. | Accepted for MVP 2 scope. |
