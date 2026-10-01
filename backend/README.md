# Backend - GestionTurnos

Este es el servidor de API para la aplicación GestionTurnos, construido con Node.js y Express.

## Estructura de Carpetas
- `models/`: Definiciones de esquemas de Mongoose (MongoDB).
- `server.js`: Punto de entrada de la aplicación y definición de rutas.
- `Dockerfile`: Configuración para la creación de la imagen de contenedor.

## API Endpoints
- `POST /api/auth/register`: Registro de nuevos usuarios.
- `POST /api/auth/login`: Autenticación y obtención de token JWT.
- `GET /api/turnos`: Obtener turnos del usuario autenticado.
- `GET /api/turnos/check-availability?fecha=YYYY-MM-DD&hora=HH:mm`: Consultar disponibilidad de un horario.
- `POST /api/turnos`: Crear un nuevo turno.
- `GET /api/status`: Verificar estado del servidor y conexión a DB.

## Pruebas
Desde esta carpeta, instala dependencias y ejecuta las pruebas:

```bash
npm ci
npm test -- --runInBand
npm run test:coverage -- --runInBand
```
