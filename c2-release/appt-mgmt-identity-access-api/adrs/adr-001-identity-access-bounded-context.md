# ADR 001: Identity Bounded Context and JWT Token Authentication

- **Status**: Approved
- **Date**: 2026-03-29
- **Authors**: Distributed Systems Architecture Team

## Context
The system requires secure, fast, stateless authentication to handle requests from both Web Frontend and Android Mobile Applications.

## Decision
Isolate the Identity and Access Bounded Context in `appt-mgmt-identity-access-api` issuing signed JWT tokens with expiration control to authorize downstream microservice requests.

## Consequences
- **Positive**: Total decoupling of credential management and high horizontal scalability.
- **Negative**: Need for active token revocation if roles change prior to token expiration.
