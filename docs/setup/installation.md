# 🚀 Guía de Instalación

## 📋 Prerrequisitos

- **Node.js** 18+ 
- **PostgreSQL** 15+
- **Docker Desktop** (opcional)
- **Git**

## 🔧 Instalación Paso a Paso

### 1. Clonar el Repositorio

```bash
git clone https://github.com/equipo-psyche/centro-terapeutico-psyche.git
cd centro-terapeutico-psyche
```

### 2. Instalar Dependencias

```bash
npm run install:all
```

### 3. Configurar Variables de Entorno

```bash
cp env.example .env
# Editar .env con tus configuraciones
```

### 4. Configurar Base de Datos

```bash
# Crear base de datos PostgreSQL
createdb psyche_db

# Ejecutar migraciones (cuando estén listas)
npm run db:migrate --workspace=backend
```

### 5. Ejecutar el Proyecto

```bash
# Desarrollo completo
npm run dev

# Solo backend
npm run dev:backend

# Solo frontend
npm run dev:frontend
```

## 🌐 Puertos por Defecto

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:3002
- **ML Service:** http://localhost:3003
- **PostgreSQL:** localhost:5432

## ✅ Verificación

1. **Backend:** http://localhost:3002/health
2. **Frontend:** http://localhost:3000

## 🐳 Docker (Opcional)

```bash
npm run docker:up
```

## 🆘 Solución de Problemas

### Puerto Ocupado
```bash
npm run clean:ports
```

### Errores de Dependencias
```bash
rm -rf node_modules package-lock.json
npm install
``` 