# ADR 001: API Gateway Pattern as Distributed Façade

- **Status**: Approved
- **Date**: 2026-03-29
- **Authors**: Distributed Systems Architecture Team

## Context
Clients (Web Dashboard and Android Mobile Apps) must not communicate directly with databases or multiple decoupled internal microservice endpoints for security, latency, and coupling reasons.

## Decision
Implement the API Gateway pattern to centralize:
1. Dynamic routing and request balancing.
2. Pre-validation of JWT Tokens and credential forwarding downstream.
3. Overload protection via Rate Limiting.

## Consequences
- **Positive**: Simplifies the API exposed to clients, isolating internal architecture.
- **Negative**: Represents a potential bottleneck if not scaled horizontally.
