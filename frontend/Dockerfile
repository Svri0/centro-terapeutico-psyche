# Multi-stage Dockerfile para el frontend
FROM node:18-alpine AS base

# Instalar dependencias del sistema
RUN apk add --no-cache libc6-compat

# Crear directorio de trabajo
WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Stage de desarrollo
FROM base AS development

# Instalar todas las dependencias
RUN npm ci

# Copiar código fuente
COPY . .

# Exponer puerto
EXPOSE 3000

# Comando para desarrollo
CMD ["npm", "run", "dev"]

# Stage de build
FROM base AS builder

# Instalar dependencias
RUN npm ci

# Copiar código fuente
COPY . .

# Build de la aplicación
RUN npm run build

# Stage de producción
FROM nginx:alpine AS production

# Instalar Node.js para SSR si es necesario
RUN apk add --no-cache nodejs npm

# Copiar archivos compilados
COPY --from=builder /app/dist /usr/share/nginx/html

# Copiar configuración de nginx
COPY docker/nginx/nginx.conf /etc/nginx/nginx.conf

# Crear usuario no-root
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Exponer puerto
EXPOSE 3000

# Comando para producción
CMD ["nginx", "-g", "daemon off;"] 