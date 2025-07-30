# 🏥 Centro Terapéutico Psyche

**Sistema de Gestión Terapéutica con Gamificación**

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18+-blue.svg)](https://reactjs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-blue.svg)](https://www.postgresql.org/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

## 📋 **Descripción del Proyecto**

El **Centro Terapéutico Psyche** es una plataforma integral de gestión terapéutica que combina herramientas profesionales de psicología con elementos de gamificación para mejorar la experiencia del paciente y optimizar el trabajo del terapeuta.

### **🎯 Características Principales**

- **👥 Gestión de Pacientes**: Registro, historial clínico y seguimiento
- **📅 Programación de Sesiones**: Calendario inteligente y recordatorios
- **📝 Sistema de Tareas**: Asignación y seguimiento de ejercicios terapéuticos
- **🎮 Gamificación**: Puntos, niveles y logros para motivar a los pacientes
- **📊 Reportes y Estadísticas**: Análisis de progreso y métricas
- **🔐 Autenticación Segura**: Sistema de roles y permisos
- **📱 Interfaz Moderna**: Diseño responsive y accesible

### **⚠️ Estado Actual del Desarrollo**

#### **🔐 Sistema de Login**
- ✅ **Backend**: Endpoints de autenticación implementados (`/login`, `/registro`, `/logout`)
- ✅ **Estructura**: Controladores, rutas y middleware de autenticación creados
- ⚠️ **Frontend**: Interfaz de login creada pero **aún no conectada** al backend
- 🔄 **Estado**: En desarrollo - pendiente integración completa frontend-backend

#### **📋 Funcionalidades Implementadas**
- ✅ Backend API REST completa
- ✅ Base de datos configurada
- ✅ Sistema de mensajes personalizados
- ✅ Logging profesional
- ✅ Estructura de carpetas organizada
- ⚠️ Frontend básico (pendiente integración con backend)

---

## 🚀 **Inicio Rápido**

### **📋 Prerrequisitos**

- **Node.js 18+** ([Descargar](https://nodejs.org/))
- **PostgreSQL 15+** ([Descargar](https://www.postgresql.org/download/))
- **Git** ([Descargar](https://git-scm.com/))

### **⚡ Instalación Rápida**

```bash
# 1. Clonar el repositorio
git clone https://github.com/Svri0/centro-terapeutico-psyche.git
cd centro-terapeutico-psyche

# 2. Configurar variables de entorno
cp env.example .env
# Editar .env con tus configuraciones

# 3. Instalar dependencias
cd backend; npm install
cd ../frontend; npm install

# 4. Configurar base de datos
createdb psyche_db
cd ../backend; npm run db:migrate

# 5. Iniciar el proyecto
npm run dev
```

### **⚠️ IMPORTANTE - Contraseñas Individuales**

Cada desarrollador debe usar su propia contraseña de PostgreSQL:

```env
DB_PASSWORD=TU_CONTRASEÑA_PERSONAL_DE_POSTGRESQL
```

### **🎯 URLs Importantes**

- **🌐 Dashboard**: http://localhost:3010/dashboard
- **📊 API Salud**: http://localhost:3010/salud
- **🎨 Frontend**: http://localhost:3008
- **📋 API Docs**: http://localhost:3010/api/v1

---

## 🏗️ **Arquitectura del Proyecto**

```
centro-terapeutico-psyche/
├── 📁 backend/                 # API REST (Node.js + TypeScript)
│   ├── 📁 src/
│   │   ├── 📁 controladores/   # Lógica de negocio
│   │   ├── 📁 modelos/         # Modelos de datos
│   │   ├── 📁 rutas/           # Definición de endpoints
│   │   ├── 📁 utilidades/      # Funciones auxiliares
│   │   └── servidor.ts         # Punto de entrada
│   ├── 📁 migrations/          # Migraciones de BD
│   └── 📁 seeders/             # Datos de ejemplo
├── 📁 frontend/                # Interfaz web (React + TypeScript)
│   ├── 📁 src/
│   │   ├── 📁 componentes/     # Componentes reutilizables
│   │   ├── 📁 paginas/         # Páginas de la aplicación
│   │   ├── 📁 servicios/       # Llamadas a la API
│   │   └── 📁 utilidades/      # Funciones auxiliares
├── 📁 docs/                    # Documentación
├── 📁 docker/                  # Configuración Docker
└── 📁 scripts/                 # Scripts de automatización
```

---

## 🛠️ **Tecnologías Utilizadas**

### **🔧 Backend**

- **Node.js** - Runtime de JavaScript
- **Express.js** - Framework web
- **TypeScript** - Lenguaje tipado
- **PostgreSQL** - Base de datos relacional
- **Sequelize** - ORM para Node.js
- **JWT** - Autenticación
- **bcrypt** - Encriptación de contraseñas

### **🎨 Frontend**

- **React 18** - Biblioteca de UI
- **TypeScript** - Lenguaje tipado
- **Vite** - Build tool
- **Tailwind CSS** - Framework CSS
- **React Router** - Enrutamiento
- **Axios** - Cliente HTTP

### **🛠️ Herramientas de Desarrollo**

- **ESLint** - Linter de código
- **Prettier** - Formateador de código
- **Jest** - Framework de testing
- **Docker** - Contenedores
- **Git** - Control de versiones

---

## 📚 **Documentación**

### **📖 Guías de Usuario**

- [🚀 Guía de Onboarding](docs/ONBOARDING_EQUIPO.md) - Para nuevos miembros del equipo
- [🛠️ Configuración de Desarrollo](docs/development/DEVELOPMENT_SETUP.md) - Setup del entorno
- [🐛 Solución de Problemas](docs/SOLUCION_ERRORES.md) - Troubleshooting común

### **🔧 Documentación Técnica**

- [📋 API Documentation](docs/API_DOCUMENTATION.md) - Endpoints y respuestas
- [🗄️ Base de Datos](docs/DATABASE_SCHEMA.md) - Esquema y relaciones
- [🎨 Componentes Frontend](docs/FRONTEND_COMPONENTS.md) - Guía de componentes

### **🚀 Deployment**

- [🐳 Docker Setup](docs/DOCKER_SETUP.md) - Configuración con Docker
- [☁️ Production Deployment](docs/PRODUCTION_DEPLOYMENT.md) - Despliegue en producción

---

## 🤝 **Contribuir al Proyecto**

### **👥 Para Nuevos Colaboradores**

1. **📖 Leer**: [Guía de Onboarding](docs/ONBOARDING_EQUIPO.md)
2. **🎯 Asignar**: Issues en GitHub
3. **💻 Desarrollar**: Seguir el flujo de trabajo
4. **🤝 Contribuir**: Hacer pull requests

### **🔄 Flujo de Trabajo**

```bash
# 1. Crear rama para nueva funcionalidad
git checkout -b feature/nombre-funcionalidad

# 2. Desarrollar y hacer commits
git add .
git commit -m "feat: descripción del cambio"

# 3. Push y crear Pull Request
git push origin feature/nombre-funcionalidad
```

### **📋 Convenciones de Commits**

- `feat:` - Nueva funcionalidad
- `fix:` - Corrección de bug
- `docs:` - Documentación
- `style:` - Formato de código
- `refactor:` - Refactorización
- `test:` - Tests
- `chore:` - Tareas de mantenimiento

---

## 🧪 **Testing**

```bash
# Ejecutar todos los tests
npm run test

# Tests en modo watch
npm run test:watch

# Tests con coverage
npm run test:coverage
```

---

## 🐳 **Docker**

```bash
# Construir imagen
docker build -t psyche-backend ./backend
docker build -t psyche-frontend ./frontend

# Ejecutar con Docker Compose
docker-compose up -d

# Ver logs
docker-compose logs -f
```

---

## 📊 **Scripts Útiles**

### **🔧 Backend**

```bash
npm run dev              # Servidor de desarrollo
npm run build            # Compilar TypeScript
npm run start            # Ejecutar versión compilada
npm run lint             # Verificar código
npm run lint:fix         # Corregir automáticamente
npm run test             # Ejecutar tests
npm run db:migrate       # Ejecutar migraciones
npm run db:seed          # Cargar datos de ejemplo
```

### **🎨 Frontend**

```bash
npm run dev              # Servidor de desarrollo
npm run build            # Build para producción
npm run preview          # Preview del build
npm run lint             # Verificar código
npm run lint:fix         # Corregir automáticamente
```

### **🛠️ Scripts Globales**

```bash
# Setup automático para el equipo
./scripts/setup-team.ps1

# Limpiar puertos ocupados
npm run kill-ports

# Verificar salud del sistema
npm run health
```

---

## 🐛 **Solución de Problemas Comunes**

### **❌ Puerto 3001 ocupado**

```bash
npm run kill-ports
# o
npx kill-port 3001 3004 3006 3008 3010 3011 3012
```

### **❌ Base de datos no conecta**

```bash
# Verificar PostgreSQL
pg_isready -h localhost -p 5432

# Crear base de datos
createdb psyche_db

# Ejecutar migraciones
npm run db:migrate
```

### **❌ Dependencias no instalan**

```bash
# Limpiar cache
npm cache clean --force

# Reinstalar
rm -rf node_modules package-lock.json
npm install
```

---

## 📈 **Roadmap del Proyecto**

### **🎯 Versión 1.0 (Actual)**

- ✅ Sistema de autenticación
- ✅ Gestión básica de pacientes
- ✅ Programación de sesiones
- ✅ Sistema de tareas
- ✅ Gamificación básica

### **🚀 Versión 1.1 (Próxima)**

- 📊 Reportes avanzados
- 📱 Aplicación móvil
- 🤖 Chatbot de asistencia
- 📧 Notificaciones por email

### **🌟 Versión 2.0 (Futuro)**

- 🧠 IA para análisis de progreso
- 📹 Sesiones por videollamada
- 🔗 Integración con wearables
- 🌐 API pública

---

## 📞 **Contacto y Soporte**

### **👥 Equipo de Desarrollo**

- **👨‍💻 Líder Técnico**: [Tu nombre] - [tu-email@psyche.cl]
- **🎨 Diseñador UX**: [Nombre] - [email]
- **🔧 DevOps**: [Nombre] - [email]

### **📞 Soporte Técnico**

- **🚨 Emergencias**: Crear issue en GitHub con label "urgent"
- **❓ Dudas**: Usar GitHub Discussions
- **🐛 Bugs**: Crear issue con template de bug

---

## 📄 **Licencia**

Este proyecto está bajo la Licencia MIT. Ver el archivo [LICENSE](LICENSE) para más detalles.

---

## 🙏 **Agradecimientos**

- **👥 Equipo de Desarrollo** - Por su dedicación y esfuerzo
- **🏥 Psicólogos Colaboradores** - Por su feedback y validación
- **💡 Comunidad Open Source** - Por las herramientas utilizadas

---

**🏥 Centro Terapéutico Psyche - Transformando la terapia digital**

_Última actualización: Julio 2025_
