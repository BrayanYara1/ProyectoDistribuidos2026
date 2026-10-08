# MVP 2 — Corte 2 Release Plan

## Backlog and acceptance evidence

| HU | Story | Estimate | Acceptance criteria | Evidence/status |
|---|---|---:|---|---|
| HU-MVP2-01 | As a client, I want Auth and Appointments to run independently behind the existing gateway so client routes remain stable. | 5 SP | Separate Compose processes; gateway preserves Android/web endpoint and payload contracts; no direct Auth DB access from Appointments. | `backend/services/*`, gateway proxy and Auth REST contract tests — implemented. |
| HU-MVP2-02 | As the Appointments service, I want a durable, versioned event outbox so requests survive broker interruption. | 5 SP | Business state and outbox event stored in one MongoDB document; persistent AMQP delivery; retry/dead-letter policy; relay on recovery. | Turno embedded outbox, `appointment.requested.v1`, RabbitMQ relay — implemented; Compose runtime check required. |
| HU-MVP2-03 | As a patient, I want booking to coordinate with Auth and compensate failures so domain state remains consistent. | 8 SP | Idempotent Auth reservation; success confirms; permanent failure cancels; post-reservation failure releases reservation; event re-delivery has no duplicate side effects. | Saga unit tests cover confirm, compensation, permanent rejection, transient retry and duplicate delivery — implemented. |
| HU-MVP2-04 | As a reviewer, I want a live failure demonstration so I can observe graceful degradation and recovery. | 3 SP | Stop RabbitMQ; liveness remains 200; readiness degrades; new outbox entry remains; broker restoration drains it. A separately armed saga failure demonstrates compensation. | Verified locally on 2026-10-08: liveness `200`, Appointments readiness `503`, new booking accepted with unpublished outbox event; after RabbitMQ restart the event was published and saga reached `Confirmado`. Controlled saga failure reached `Cancelado` and Auth reservation `RELEASED`. |
| HU-MVP2-05 | As the team, we want release evidence so the tested increment can be promoted reproducibly. | 3 SP | CI runs tests/config/build; service/event contracts and ADRs are current; CHANGELOG and tag match shipped code. | GitHub Actions, contracts, ADR-004/005, changelog, tests, Compose build, and local runtime acceptance verified. Promotion PRs and `v2.0.0` remain pending; no release tag has been created. |

**Total:** 24 SP. Backlog items are split below the 13-point epic ceiling.

## Scrum execution checklist

* **Planning:** confirm stories, estimates, dependencies, and acceptance criteria in this backlog before the sprint starts.
* **Daily stand-up:** each contributor records yesterday/today/blockers; escalation goes to the sprint owner.
* **Refinement:** review API/event compatibility, migration/index risk, and story estimates before pulling additional work.
* **Review:** run the local Compose smoke test, broker-outage/outbox-recovery demo, and compensating-saga demo in `10-devops/local-setup.md`.
* **Retrospective:** record what worked, what failed, and named action owners after the live demo.

This repository has no source evidence for named attendees or meetings. Do not treat this checklist as proof a ceremony occurred; add actual dates, participants, decisions, and action owners when the team conducts each ceremony.

## Branch and release flow

Use `hu-<id>-dev` → reviewed PR to `develop` → reviewed promotion PR to `qa` → release PR to `main`. Run quality checks at every boundary. Use a GitHub release tag only for the exact accepted `main` commit after the live demo and release approval.

The local repo initially contained only `main`; the MVP work starts on `hu-mvp2-dev`. Do not claim a PR or environment deployment unless GitHub records it.

At the release check, `origin` still had no `develop` or `qa` branches. Confirm or establish those promotion targets with repository maintainers before claiming the required reviewed PR sequence or tagging the release.

## Release exit criteria

- [x] `npm test` and Compose image build pass (`6` suites, `22` tests; all three service images built).
- [x] All five Compose services report healthy.
- [x] Client-compatible register/login and appointment request are smoke-tested through the gateway; normal saga reached `Confirmado`.
- [x] Broker outage and recovery verified: liveness stayed `200`, Appointments readiness became `503`, the accepted outbox event remained pending, and replay completed after RabbitMQ restarted.
- [x] Controlled saga compensation verified; the appointment reached `Cancelado` and Auth reservation status was `RELEASED`.
- [ ] Branch promotion, review approval, changelog and ADR updates are linked.
- [ ] `v2.0.0` is created on the accepted `main` commit; no tag before all criteria pass.
