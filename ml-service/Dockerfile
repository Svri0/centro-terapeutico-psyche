# Dockerfile para el servicio de Machine Learning
FROM node:18-alpine AS base

# Instalar dependencias del sistema necesarias para ML
RUN apk add --no-cache \
    python3 \
    py3-pip \
    make \
    g++ \
    postgresql-client

# Instalar dependencias de Python para ML
RUN pip3 install --no-cache-dir \
    numpy \
    pandas \
    scikit-learn \
    tensorflow

# Crear directorio de trabajo
WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Stage de desarrollo
FROM base AS development

# Instalar todas las dependencias de Node.js
RUN npm ci

# Copiar código fuente
COPY . .

# Crear directorios necesarios
RUN mkdir -p models data logs

# Exponer puerto
EXPOSE 3003

# Comando para desarrollo
CMD ["npm", "run", "dev"]

# Stage de producción
FROM base AS production

# Instalar solo dependencias de producción
RUN npm ci --only=production && npm cache clean --force

# Copiar código fuente
COPY . .

# Crear directorios necesarios
RUN mkdir -p models data logs dist

# Compilar si es necesario
RUN npm run build

# Crear usuario no-root
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Cambiar ownership de archivos
RUN chown -R nodejs:nodejs /app

# Cambiar a usuario no-root
USER nodejs

# Exponer puerto
EXPOSE 3003

# Comando para producción
CMD ["npm", "start"] 