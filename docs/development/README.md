# 👥 Guía de Desarrollo - Equipo Psyche

## 🎯 Roles del Equipo

### 👨‍💻 Desarrollador 1 - Backend & API
- **Responsabilidades:** APIs, autenticación, base de datos
- **Tecnologías:** Node.js, Express, PostgreSQL, Sequelize
- **Carpetas:** `backend/src/controllers`, `backend/src/routes`, `backend/src/models`

### 🎨 Desarrollador 2 - Frontend & PWA
- **Responsabilidades:** Interfaz de usuario, componentes, PWA
- **Tecnologías:** React, TypeScript, Tailwind CSS
- **Carpetas:** `frontend/src/components`, `frontend/src/pages`, `frontend/src/hooks`

### 🗄️ Desarrollador 3 - Base de Datos & DevOps
- **Responsabilidades:** Migraciones, Docker, despliegue
- **Tecnologías:** PostgreSQL, Docker, AWS
- **Carpetas:** `backend/src/config`, `docker/`, `docs/deployment/`

### 🤖 Desarrollador 4 - Machine Learning & Analytics
- **Responsabilidades:** Análisis de datos, ML, reportes
- **Tecnologías:** Python, scikit-learn, Node.js
- **Carpetas:** `ml-service/`, `backend/src/services/`

## 🚀 Flujo de Trabajo

### 1. Configuración Inicial
```bash
git clone [repo]
npm run install:all
npm run dev
```

### 2. Crear Rama de Desarrollo
```bash
git checkout -b feature/nombre-funcionalidad
```

### 3. Desarrollo
- Trabajar en tu área asignada
- Seguir convenciones de código
- Hacer commits frecuentes

### 4. Testing
```bash
npm run test
npm run lint
```

### 5. Pull Request
- Crear PR a `main`
- Revisión de código
- Merge después de aprobación

## 📁 Estructura de Carpetas por Desarrollador

### Backend Developer
```
backend/src/
├── controllers/     # Lógica de controladores
├── routes/         # Definición de rutas
├── models/         # Modelos de datos
├── middleware/     # Middleware personalizado
├── services/       # Lógica de negocio
└── utils/          # Utilidades
```

### Frontend Developer
```
frontend/src/
├── components/     # Componentes reutilizables
├── pages/         # Páginas de la aplicación
├── hooks/         # Custom hooks
├── services/      # Servicios de API
├── utils/         # Utilidades
└── styles/        # Estilos adicionales
```

### DevOps Developer
```
docker/            # Configuración de contenedores
docs/deployment/   # Documentación de despliegue
backend/config/    # Configuración de base de datos
```

### ML Developer
```
ml-service/
├── src/           # Código principal
├── models/        # Modelos de ML
├── scripts/       # Scripts de entrenamiento
└── data/          # Datos de entrenamiento
```

## 🔧 Comandos Útiles

### Desarrollo
```bash
npm run dev              # Desarrollo completo
npm run dev:backend      # Solo backend
npm run dev:frontend     # Solo frontend
npm run dev:ml           # Solo ML service
```

### Testing
```bash
npm run test             # Todos los tests
npm run test:backend     # Tests del backend
npm run test:frontend    # Tests del frontend
```

### Linting
```bash
npm run lint             # Verificar código
npm run lint:fix         # Corregir automáticamente
```

### Docker
```bash
npm run docker:up        # Levantar contenedores
npm run docker:down      # Bajar contenedores
npm run docker:logs      # Ver logs
```

## 📋 Convenciones de Código

### Nomenclatura
- **Archivos:** kebab-case (`user-controller.ts`)
- **Clases:** PascalCase (`UserController`)
- **Funciones:** camelCase (`getUserById`)
- **Constantes:** UPPER_SNAKE_CASE (`API_BASE_URL`)

### Estructura de Commits
```
feat: agregar autenticación JWT
fix: corregir validación de email
docs: actualizar README
refactor: reorganizar estructura de carpetas
```

### TypeScript
- Usar tipos estrictos
- Evitar `any`
- Documentar interfaces complejas

## 🐛 Debugging

### Backend
```bash
# Ver logs en tiempo real
npm run dev:backend

# Debug con nodemon
nodemon --inspect src/server.ts
```

### Frontend
```bash
# Ver logs en tiempo real
npm run dev:frontend

# Debug con React DevTools
# Instalar extensión en el navegador
```

## 📞 Comunicación

- **Slack/Discord:** Para comunicación diaria
- **GitHub Issues:** Para bugs y features
- **GitHub PRs:** Para revisión de código
- **Documentación:** Mantener actualizada

## 🎯 Próximos Pasos

1. **Sprint 1:** Autenticación y usuarios básicos
2. **Sprint 2:** Gestión de pacientes y sesiones
3. **Sprint 3:** Sistema de tareas y reportes
4. **Sprint 4:** Machine Learning y analytics 