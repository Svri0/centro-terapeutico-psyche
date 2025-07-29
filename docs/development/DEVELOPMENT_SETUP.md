# 🚀 Guía de Configuración de Desarrollo

## 📋 Prerrequisitos

### Software Requerido
- **Node.js 18+** - [Descargar](https://nodejs.org/)
- **Docker Desktop** - [Descargar](https://www.docker.com/products/docker-desktop/)
- **Git** - [Descargar](https://git-scm.com/)
- **VS Code o Cursor** - [VS Code](https://code.visualstudio.com/) | [Cursor](https://cursor.sh/)

### Verificación de Instalación
```bash
node --version    # Debe ser v18.0.0 o superior
npm --version     # Debe ser v9.0.0 o superior
docker --version  # Debe estar instalado
git --version     # Debe estar instalado
```

## 🔧 Configuración Inicial

### 1. Clonar el Repositorio
```bash
git clone https://github.com/tu-usuario/centro-terapeutico-psyche.git
cd centro-terapeutico-psyche
```

### 2. Configuración Automática (Recomendado)
```powershell
# Windows (PowerShell)
.\scripts\setup-dev.ps1

# O manualmente:
npm run setup:dev
```

### 3. Configuración Manual
```bash
# Instalar dependencias
npm run install:all

# Configurar variables de entorno
cp env.example backend/.env

# Iniciar servicios de base de datos
docker-compose up -d postgres redis

# Ejecutar migraciones
npm run db:migrate
npm run db:seed
```

## 🏗️ Estructura del Proyecto

```
centro-terapeutico-psyche/
├── .vscode/                 # Configuración de VS Code
│   ├── extensions.json      # Extensiones recomendadas
│   └── settings.json        # Configuración del workspace
├── backend/                 # API Node.js + TypeScript
│   ├── src/
│   │   ├── controladores/   # Controladores de la API
│   │   ├── modelos/         # Modelos de Sequelize
│   │   ├── rutas/           # Definición de rutas
│   │   ├── configuracion/   # Configuración de BD y app
│   │   ├── migrations/      # Migraciones de BD
│   │   └── seeders/         # Datos iniciales
│   ├── .eslintrc.js         # Configuración ESLint
│   ├── .prettierrc          # Configuración Prettier
│   └── Dockerfile           # Configuración Docker
├── frontend/                # PWA React + TypeScript
│   ├── src/
│   │   ├── componentes/     # Componentes React
│   │   ├── paginas/         # Páginas de la aplicación
│   │   ├── ganchos/         # Custom hooks
│   │   └── servicios/       # Servicios y API calls
│   ├── .eslintrc.js         # Configuración ESLint
│   ├── .prettierrc          # Configuración Prettier
│   └── Dockerfile           # Configuración Docker
├── ml-service/              # Servicio de Machine Learning
├── shared/                  # Tipos y utilidades compartidas
├── docker-compose.yml       # Orquestación de servicios
└── scripts/                 # Scripts de automatización
```

## 🛠️ Comandos de Desarrollo

### Desarrollo Local
```bash
# Iniciar todos los servicios
npm run dev

# Iniciar servicios individuales
npm run dev:backend    # Solo backend (puerto 3001)
npm run dev:frontend   # Solo frontend (puerto 3000)
npm run dev:ml         # Solo ML service (puerto 3003)
```

### Base de Datos
```bash
# Migraciones
npm run db:migrate          # Ejecutar migraciones
npm run db:migrate:undo     # Deshacer última migración
npm run db:migrate:undo:all # Deshacer todas las migraciones

# Seeders
npm run db:seed            # Ejecutar seeders
npm run db:seed:undo       # Deshacer seeders

# Utilidades
npm run db:reset           # Resetear BD completa
npm run db:fresh           # Rehacer migraciones + seeders
```

### Calidad de Código
```bash
# Linting
npm run lint              # Verificar código
npm run lint:fix          # Arreglar problemas automáticamente

# Formateo
npm run format            # Formatear código
npm run format:check      # Verificar formateo

# Testing
npm run test              # Ejecutar tests
npm run test:coverage     # Tests con cobertura
```

### Docker
```bash
# Servicios completos
docker-compose up --build    # Iniciar todos los servicios
docker-compose down          # Detener servicios
docker-compose logs -f       # Ver logs en tiempo real

# Servicios individuales
docker-compose up -d postgres redis  # Solo BD y cache
docker-compose restart backend       # Reiniciar backend
```

## 🔌 Extensiones de VS Code/Cursor

### Instalación Automática
Al abrir el proyecto, VS Code/Cursor te sugerirá instalar las extensiones recomendadas automáticamente.

### Lista de Extensiones
- ✅ ES7+ React/Redux/React-Native snippets
- ✅ Tailwind CSS IntelliSense
- ✅ Prettier - Code formatter
- ✅ ESLint
- ✅ GitLens
- ✅ Auto Rename Tag
- ✅ Bracket Pair Colorizer
- ✅ Material Icon Theme
- ✅ Thunder Client
- ✅ Error Lens
- ✅ Path Intellisense
- ✅ TypeScript Importer

Ver documentación completa: [SETUP_EXTENSIONS.md](./SETUP_EXTENSIONS.md)

## 🌐 URLs de Desarrollo

| Servicio | URL | Descripción |
|----------|-----|-------------|
| Frontend | http://localhost:3000 | Aplicación React PWA |
| Backend API | http://localhost:3001 | API REST Node.js |
| ML Service | http://localhost:3003 | Servicio de Machine Learning |
| pgAdmin | http://localhost:5050 | Gestión de PostgreSQL |
| Docs API | http://localhost:3001/docs | Documentación de la API |

### Credenciales por Defecto
- **pgAdmin**: admin@psyche.cl / admin123
- **PostgreSQL**: postgres / psyche_password

## 🔄 Flujo de Desarrollo

### 1. Crear Nueva Feature
```bash
git checkout -b feature/nueva-funcionalidad
```

### 2. Desarrollo
- Escribe código siguiendo las convenciones del proyecto
- ESLint y Prettier se ejecutan automáticamente
- Los tests se ejecutan en modo watch

### 3. Pre-commit
```bash
git add .
git commit -m "feat: agregar nueva funcionalidad"
```
- Se ejecutan automáticamente:
  - ESLint (arregla errores automáticamente)
  - Prettier (formatea código)
  - Tests unitarios

### 4. Push y PR
```bash
git push origin feature/nueva-funcionalidad
```

## 🧪 Testing

### Backend
```bash
cd backend
npm run test              # Ejecutar tests
npm run test:watch        # Tests en modo watch
npm run test:coverage     # Cobertura de tests
```

### Frontend
```bash
cd frontend
npm run test              # Ejecutar tests
npm run test:ui           # UI de tests con Vitest
npm run test:coverage     # Cobertura de tests
```

## 🐛 Solución de Problemas

### Puerto ya en uso
```bash
# Matar procesos en puertos específicos
npx kill-port 3000 3001 3003 5432
```

### Problemas con Docker
```bash
# Limpiar contenedores y volúmenes
docker-compose down -v
docker system prune -f
docker-compose up --build
```

### Problemas con node_modules
```bash
# Limpiar y reinstalar dependencias
rm -rf node_modules package-lock.json
npm run install:all
```

### Base de datos corrupta
```bash
# Resetear base de datos completa
npm run db:reset
```

## 📚 Recursos Adicionales

- [Documentación de la API](../api/README.md)
- [Guía de Componentes](../frontend/COMPONENTS.md)
- [Convenciones de Código](./CODING_CONVENTIONS.md)
- [Guía de Testing](./TESTING.md)

## 🆘 Soporte

Si tienes problemas con la configuración:

1. Revisa esta documentación
2. Consulta los logs con `docker-compose logs -f`
3. Pregunta en el canal de desarrollo del equipo
4. Crea un issue en GitHub con detalles del problema

---

¡Feliz desarrollo! 🚀 