# Changelog - appt-mgmt-identity-access-db

## [2.0.0] - 2.0.0-c2-release
### Añadido
- Tablas relacionales PostgreSQL para usuarios (`users`), roles (`roles`), asignación de roles (`user_roles`) y sesiones (`user_sessions`).
- Script de migraciones numerado (`001_create_users_roles.sql`).
- Datos semilla de prueba de usuarios y roles (`seed.sql`).
- Pruebas unitarias de integridad de esquemas SQL.
- `release.md` con commit id `128074ea37dd11c0520637bc67794f803eee7580`.
