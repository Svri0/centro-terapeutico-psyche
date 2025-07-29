# 🏥 Centro Terapéutico Psyche

**Sistema integral de gestión para centro terapéutico** - Proyecto de titulación desarrollado con tecnologías modernas.

## 📋 Descripción

Centro Terapéutico Psyche es una aplicación web full-stack diseñada para la gestión integral de un centro de salud mental. Incluye funcionalidades para administrar pacientes, sesiones terapéuticas, tareas, reportes y un sistema completo de autenticación.

## 🚀 Tecnologías

### Backend

- **Node.js** con **TypeScript**
- **Express.js** - Framework web
- **PostgreSQL** - Base de datos principal
- **Redis** - Cache y sesiones
- **Sequelize** - ORM
- **JWT** - Autenticación
- **Docker** - Contenedorización (opcional)

### Frontend

- **React 18** con **TypeScript**
- **Vite** - Build tool y dev server
- **Tailwind CSS** - Framework de estilos
- **React Router** - Navegación

### Herramientas de Desarrollo

- **ESLint** - Linter de código
- **Prettier** - Formateador de código
- **Nodemon** - Auto-reload del servidor
- **Concurrently** - Ejecución paralela de scripts
- **Sistema de Logger profesional**

## 📁 Estructura del Proyecto

```
centro-terapeutico-psyche/
├── 📁 backend/                 # API Server (Express + TypeScript)
│   ├── 📁 src/
│   │   ├── 📁 controladores/   # Controladores de rutas
│   │   ├── 📁 modelos/         # Modelos de base de datos
│   │   ├── 📁 rutas/           # Definición de rutas
│   │   ├── 📁 utilidades/      # Funciones auxiliares y logger
│   │   ├── 📁 configuracion/   # Configuración de DB y servicios
│   │   └── servidor.ts         # Punto de entrada del servidor
│   ├── package.json
│   └── tsconfig.json
├── 📁 frontend/                # Cliente Web (React + Vite)
│   ├── 📁 src/
│   │   ├── 📁 componentes/     # Componentes reutilizables
│   │   ├── 📁 paginas/         # Páginas principales
│   │   ├── 📁 servicios/       # Servicios de API
│   │   └── 📁 utilidades/      # Tipos y utilidades
│   ├── package.json
│   └── vite.config.ts
├── 📁 shared/                  # Código compartido
├── 📁 scripts/                 # Scripts de automatización
├── 📁 docs/                    # Documentación
└── package.json               # Workspace principal
```

## 🛠️ Prerrequisitos

Antes de instalar, asegúrate de tener:

- **Node.js** >= 18.0.0
- **npm** >= 9.0.0
- **PostgreSQL** >= 14.0
- **Redis** >= 6.0 (opcional)
- **Git**

### Verificar versiones:

```bash
node --version
npm --version
git --version
```

## 📦 Instalación

### 1. Clonar el repositorio

```bash
git clone <url-del-repositorio>
cd centro-terapeutico-psyche
```

### 2. Instalar dependencias

```bash
# Instalar dependencias de todo el workspace
npm install
```

### 3. Configurar variables de entorno

```bash
# Copiar archivo de ejemplo
cp env.example .env

# Editar variables según tu configuración
# DATABASE_URL=postgresql://usuario:password@localhost:5432/psyche_db
# REDIS_URL=redis://localhost:6379
# JWT_SECRET=tu_jwt_secret_muy_seguro
```

### 4. Configurar base de datos

```bash
# Crear base de datos
createdb psyche_db

# Ejecutar migraciones
npm run db:migrate

# Ejecutar seeders (datos iniciales)
npm run db:seed
```

## 🚀 Ejecución

### Desarrollo (Recomendado)

```bash
# Ejecutar frontend y backend simultáneamente
npm run dev
```

**URLs disponibles:**

- **Frontend:** http://localhost:3002/
- **Backend API:** http://localhost:3004/api/v1
- **Dashboard del Sistema:** http://localhost:3004/dashboard
- **Health Check:** http://localhost:3004/salud

### Ejecución Individual

```bash
# Solo backend
npm run dev:backend

# Solo frontend
npm run dev:frontend
```

### Producción

```bash
# Construir para producción
npm run build

# Ejecutar en producción
npm start
```

## 📚 Scripts Disponibles

### Desarrollo

- `npm run dev` - Ejecuta frontend y backend en paralelo
- `npm run dev:backend` - Solo servidor backend
- `npm run dev:frontend` - Solo cliente frontend

### Base de Datos

- `npm run db:migrate` - Ejecutar migraciones
- `npm run db:seed` - Poblar datos iniciales
- `npm run db:reset` - Reiniciar base de datos

### Construcción

- `npm run build` - Construir para producción
- `npm run build:backend` - Solo backend
- `npm run build:frontend` - Solo frontend

### Calidad de Código

- `npm run lint` - Ejecutar ESLint
- `npm run lint:fix` - Corregir errores automáticamente
- `npm run format` - Formatear código con Prettier

### Utilidades

- `npm run clean` - Limpiar archivos de construcción
- `npm run reset` - Reiniciar todo el proyecto

## 🔌 API Endpoints

### Autenticación

- `POST /api/v1/auth/login` - Iniciar sesión
- `POST /api/v1/auth/register` - Registrar usuario
- `POST /api/v1/auth/logout` - Cerrar sesión
- `GET /api/v1/auth/profile` - Obtener perfil
- `PUT /api/v1/auth/profile` - Actualizar perfil
- `POST /api/v1/auth/change-password` - Cambiar contraseña

### Pacientes

- `GET /api/v1/patients` - Listar pacientes
- `POST /api/v1/patients` - Crear paciente
- `GET /api/v1/patients/:id` - Obtener paciente
- `PUT /api/v1/patients/:id` - Actualizar paciente
- `DELETE /api/v1/patients/:id` - Eliminar paciente

### Sesiones

- `GET /api/v1/sessions` - Listar sesiones
- `POST /api/v1/sessions` - Crear sesión
- `GET /api/v1/sessions/:id` - Obtener sesión
- `PUT /api/v1/sessions/:id` - Actualizar sesión

### Sistema

- `GET /salud` - Estado del servidor (JSON)
- `GET /dashboard` - Panel de control (HTML)
- `GET /` - Información general

## 🧪 Desarrollo

### Configuración Automática de Herramientas

El proyecto incluye scripts automatizados para configurar tu entorno:

```bash
# Verificar extensiones de VSCode/Cursor instaladas
./scripts/check-extensions.ps1

# Instalar extensiones automáticamente
./scripts/install-extensions.ps1

# Configurar terminal (encoding UTF-8)
./scripts/configurar-terminal.ps1
```

### Extensiones Recomendadas

- ES7+ React/Redux/React-Native snippets
- Tailwind CSS IntelliSense
- Prettier - Code formatter
- ESLint
- GitLens
- Auto Rename Tag
- Material Icon Theme
- Thunder Client
- Error Lens
- Path Intellisense
- TypeScript Next

### Sistema de Logger

El proyecto incluye un sistema de logging profesional:

```typescript
import { log } from "./utilidades/logger";

// Diferentes niveles de log
log.info("Información general");
log.warn("Advertencia");
log.error("Error crítico");
log.debug("Debug para desarrollo");

// Funciones especiales para servidor
log.servidor("Mensaje del servidor");
log.exito("Operación exitosa");
log.problema("Problema detectado");
log.critico("Error crítico del sistema");
```

## 🐛 Solución de Problemas

### Problemas de Puertos

```bash
# Liberar puertos ocupados
npx kill-port 3002 3004 3006 3008

# Ver puertos en uso
netstat -ano | findstr :300
```

### Problemas de Base de Datos

```bash
# Reiniciar base de datos
npm run db:reset

# Verificar conexión
npm run db:test
```

### Problemas de Node Modules

```bash
# Limpiar e reinstalar
rm -rf node_modules package-lock.json
npm install
```

### Problemas de ESLint/Prettier

```bash
# Regenerar configuración
npm run lint:reset
```

## 🔧 Configuración de Desarrollo

### VSCode/Cursor Settings

El proyecto incluye configuración automática para:

- Formateo automático al guardar
- ESLint integrado
- Configuración de TypeScript
- Snippets personalizados
- Tema y iconos optimizados

### Variables de Entorno

```env
# Servidor
PORT=3002
NODE_ENV=development

# Base de Datos
DATABASE_URL=postgresql://usuario:password@localhost:5432/psyche_db

# Autenticación
JWT_SECRET=tu_jwt_secret_muy_seguro
JWT_EXPIRE=24h

# Redis (opcional)
REDIS_URL=redis://localhost:6379

# Logs
LOG_LEVEL=debug
```

## 🐳 Docker (Opcional)

Si prefieres usar Docker:

```bash
# Construir contenedores
docker-compose build

# Ejecutar en desarrollo
docker-compose up -d

# Ver logs
docker-compose logs -f

# Parar servicios
docker-compose down
```

## 📊 Versionado

Este proyecto sigue **Semantic Versioning** (SemVer):

### Historial de Versiones

#### v1.0.0 (2025-07-29)

**🎉 Lanzamiento Inicial**

- ✅ Sistema completo de autenticación JWT
- ✅ CRUD de pacientes y sesiones
- ✅ API RESTful documentada
- ✅ Dashboard de administración
- ✅ Sistema de logging profesional
- ✅ Manejo inteligente de puertos
- ✅ Respuestas API estandarizadas
- ✅ Configuración automática de desarrollo
- ✅ Scripts de automatización
- ✅ Documentación completa

### Próximas Versiones

- **v1.1.0** - Sistema de reportes avanzados
- **v1.2.0** - Integración con servicios de terceros
- **v2.0.0** - Migración a microservicios

## 🤝 Contribución

### Flujo de Trabajo

1. Fork del proyecto
2. Crear rama feature (`git checkout -b feature/nueva-caracteristica`)
3. Commit cambios (`git commit -m 'Agregar nueva característica'`)
4. Push a la rama (`git push origin feature/nueva-caracteristica`)
5. Crear Pull Request

### Estándares de Código

- Usar **TypeScript** en todo el código
- Seguir guías de **ESLint** y **Prettier**
- Escribir tests para nuevas funcionalidades
- Documentar funciones complejas
- Usar **commits semánticos**

### Commits Semánticos

```
feat: nueva funcionalidad
fix: corrección de bug
docs: actualización de documentación
style: cambios de formato
refactor: refactorización de código
test: agregar o modificar tests
chore: tareas de mantenimiento
```

## 📞 Soporte

### Recursos

- 📚 **Documentación:** `/docs`
- 🐛 **Issues:** GitHub Issues
- 💬 **Discusiones:** GitHub Discussions
- 📧 **Email:** soporte@psyche-center.com

### Problemas Comunes

Consulta `/docs/SOLUCION_ERRORES.md` para soluciones a problemas frecuentes.

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver `LICENSE` para más detalles.

## 👨‍💼 Autor

**Desarrollado por:** [Tu Nombre]  
**Proyecto de Titulación** - [Tu Institución]  
**Año:** 2025

---

## 🎯 Comandos Rápidos

```bash
# Configuración inicial completa
git clone <repo> && cd centro-terapeutico-psyche && npm install && npm run dev

# Verificar que todo funcione
curl http://localhost:3004/salud

# Abrir dashboard
# http://localhost:3004/dashboard
```

**¡Feliz desarrollo! 🚀✨**
