# Environments and Promotion Flow

## Environment status

| Environment | Purpose | Runtime / update | Data | Status |
|---|---|---|---|---|
| Local | Development, automated tests, acceptance demo | Docker Compose: Gateway, Auth, Appointments, MongoDB, RabbitMQ | Synthetic local records in persistent Docker volume | Implemented |
| Dev | Integration from reviewed `develop` | Promote PR after CI | Synthetic only | Branch target; no deployed environment is configured in this repository |
| QA | Release-candidate validation from `qa` | Compose live demo and acceptance review | Synthetic only | Branch target; no deployed environment is configured in this repository |
| Production | Real users | `main` release tag and separate approved deployment | Production managed secrets/data | Not deployed by the MVP 2 workflow |

## Runtime configuration

Compose reads the root `.env` file; use [.env.example](../../.env.example) only as a local template. Required values are:

| Variable | Purpose | Handling |
|---|---|---|
| `JWT_SECRET` | Signs/verifies client JWTs | Replace local example with a random secret; production secret manager only |
| `SERVICE_TOKEN` | Auth REST service contract | Shared only between internal containers; rotate per environment |
| `DEMO_FAILURE_TOKEN` | Protects local compensation-failure injection | Local-only; never enable the route in production |
| `DEMO_FAILURE_ENABLED` | Gates failure injection | `true` only in throwaway local Compose |
| `BACKEND_PORT` | Host gateway port | Defaults to `3000` |

Never reuse local secrets in Dev, QA, or Production.

## CI and promotion

`.github/workflows/mvp2-quality.yml` runs backend tests, validates Compose, and builds all images on the HU branch, environment branches, tags, and pull requests. It does not deploy to AWS.

Promotion is `hu-<id>-dev` → PR `develop` → PR `qa` → PR `main`. QA acceptance must include the saga compensation and broker outage/recovery demonstrations. Tag `v2.0.0` only on the final accepted `main` commit. The release plan is [here](../15-project-control/mvp2-release-plan.md).

## Rollback

For local demos, restore the affected service with `docker compose up -d <service>` and retain the MongoDB volume. Do not use `docker compose down -v`. Production rollback and database index migration require an environment-specific deployment procedure; no production deployment is configured by this repository.
