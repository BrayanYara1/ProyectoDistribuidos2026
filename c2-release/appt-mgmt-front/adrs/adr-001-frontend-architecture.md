# ADR 001: Lightweight and Decoupled Frontend Architecture

- **Status**: Approved
- **Date**: 2026-03-29
- **Authors**: Distributed Systems Architecture Team

## Context
A lightweight web dashboard with fast deployment and zero heavy build tooling overhead is required to interact with the system API Gateway.

## Decision
Use Vanilla HTML5/CSS3/Modular JavaScript with an API client abstraction layer (`apiClient.js`) and an Nginx container to serve static assets efficiently.

## Consequences
- **Positive**: Ultra-fast load times, universal compatibility, zero bundling overhead.
- **Negative**: Higher manual responsibility for state management on the client.
