# Git, Scrum, and Release Governance

## Branch and environment flow

| Branch | Purpose | Promotion |
|---|---|---|
| `hu-<id>-dev` | One bounded user story or fix | Pull request to `develop` |
| `develop` | Integrated development increment | Pull request to `qa` |
| `qa` | Release candidate validated with Compose and acceptance demo | Pull request to `main` |
| `main` | Accepted release history | Tag `vMAJOR.MINOR.PATCH` only after release criteria pass |

All promotions use reviewed pull requests with passing `MVP 2 quality` checks. Do not force-push shared branches or commit directly to `main`. The repository originally had only `main`; provision missing shared branches before opening PRs. The current local feature branch is `hu-mvp2-dev`.

## Commits

Use Conventional Commits, for example:

* `feat(appointments): coordinate booking saga with auth`
* `test(backend): verify outbox compensation`
* `docs(release): record MVP 2 acceptance evidence`

Keep each commit focused. Include the issue/HU identifier in the PR title or commit body when available.

## Scrum cadence and evidence

Plan a two-week sprint; keep stories under 13 SP and split work that exceeds the team capacity.

* **Planning:** record selected HUs, estimates, owners, dependencies, and acceptance criteria in the sprint backlog.
* **Daily stand-up:** each contributor answers yesterday/today/blockers; record blockers that change scope.
* **Refinement:** validate acceptance criteria, API/event compatibility, and rollout risks before a story enters the sprint.
* **Review:** demonstrate completed criteria on the integrated Compose runtime; link run output and collect product-owner acceptance.
* **Retrospective:** document observed outcomes and action owner/due date; do not claim actions before the meeting occurs.

See [MVP 2 release plan](../15-project-control/mvp2-release-plan.md) for scoped stories, acceptance evidence, and the demo checklist. The checklist is not a substitute for recording actual attendees or approvals.

## Definition of Ready

* User/value and scope are clear.
* Acceptance criteria are observable and testable.
* API/event contract and dependencies are understood.
* Size fits the sprint and an owner is assigned by the team.

## Definition of Done

* Implementation preserves the published client/service contract.
* Unit, integration, and contract tests pass in CI.
* Docker Compose configuration and all service images build.
* Required dependencies and failure/recovery behavior are verified in the live demo.
* README, contract, ADR, and changelog are updated.
* PR is reviewed and merged through the stated environment flow; release tag points at the accepted `main` commit.
