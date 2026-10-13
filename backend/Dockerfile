# --- Etapa 1: Construcción ---
FROM node:22-alpine AS builder

WORKDIR /app

# Copiar archivos de definición de dependencias
COPY package*.json ./

# Instalar dependencias reproducibles
RUN npm ci

# Copiar el código fuente
COPY . .

# --- Etapa 2: Producción ---
FROM node:22-alpine

# Definir variables de entorno de producción
ENV NODE_ENV=production
WORKDIR /app

# Copiar solo lo necesario desde la etapa de construcción
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app ./

# Eliminar dependencias de desarrollo para reducir la imagen
RUN npm prune --omit=dev

# Usar un usuario no raíz por seguridad (la imagen de node ya trae el usuario 'node')
USER node

# Exponer el puerto
EXPOSE 3000

# Comando para arrancar la app
CMD [ "node", "server.js" ]
