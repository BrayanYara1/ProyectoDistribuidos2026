# ADR 001: Modular Kotlin MVVM Architecture for Appointments on Android

- **Status**: Approved
- **Date**: 2026-03-29
- **Authors**: Android Development Team

## Context
Goal is to avoid dependency overload in a monolithic Android codebase by splitting the app into domain feature modules.

## Decision
Create the `appt-mgmt-appointment-app` Android library module using MVVM, Kotlin Coroutines, and StateFlow for clean reactivity.

## Consequences
- **Positive**: Faster build times and strict isolation of appointment UI and use cases.
- **Negative**: Need to publish/link library artifacts internally.
