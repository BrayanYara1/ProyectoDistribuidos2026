# Changelog - appt-mgmt-identity-access-db

## [2.0.0] - 2.0.0-c2-release
### Added
- PostgreSQL relational tables for users (`users`), roles (`roles`), role mapping (`user_roles`), and sessions (`user_sessions`).
- Numbered migration script (`001_create_users_roles.sql`).
- Test seed data for users and roles (`seed.sql`).
- SQL schema integrity unit tests.
- `release.md` bound to commit id `128074ea37dd11c0520637bc67794f803eee7580`.
