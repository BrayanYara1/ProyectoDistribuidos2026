# Release Info - appt-mgmt-api-gateway

- **Component**: `appt-mgmt-api-gateway`
- **Version**: `v2.0.0`
- **Delivery**: `c2-release`
- **Commit ID**: `128074ea37dd11c0520637bc67794f803eee7580`
- **Date**: 2026-03-29

## Description
Single Entry Point for all external client requests (Web & Mobile) to the system microservices.

## Environment Variables
- `PORT`: Listening port (default `8080`).
- `IAM_API_URL`: Identity and access authentication microservice URL.
- `APPOINTMENT_API_URL`: Appointment management microservice URL.
- `WORKFLOW_URL`: Appointment workflow engine service URL.
