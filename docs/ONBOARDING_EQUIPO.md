# 🚀 Guía de Onboarding - Centro Terapéutico Psyche

## 👋 ¡Bienvenido al Equipo!

Esta guía te ayudará a configurar el proyecto **Centro Terapéutico Psyche** en tu máquina local.

---

## 📋 **Prerrequisitos**

### **🛠️ Herramientas Necesarias:**

```bash
# Verificar versiones instaladas
node --version    # Debe ser >= 18.0.0
npm --version     # Debe ser >= 8.0.0
git --version     # Cualquier versión reciente
```

### **📦 Instalar si no tienes:**

- **Node.js 18+**: [Descargar aquí](https://nodejs.org/)
- **Git**: [Descargar aquí](https://git-scm.com/)
- **PostgreSQL**: [Descargar aquí](https://www.postgresql.org/download/)

---

## 🚀 **Configuración Rápida (5 minutos)**

### **1. 📥 Clonar el Repositorio**

```bash
# Clonar el proyecto
git clone https://github.com/tu-usuario/centro-terapeutico-psyche.git

# Entrar al directorio
cd centro-terapeutico-psyche
```

### **2. 🔧 Configurar Variables de Entorno**

```bash
# Copiar archivo de ejemplo
cp env.example .env

# Editar variables (usar tu editor preferido)
code .env
```

**Configuración mínima en `.env`:**

```env
# Base de datos
DB_HOST=localhost
DB_PORT=5432
DB_NAME=psyche_db
DB_USER=postgres
DB_PASSWORD=TU_CONTRASEÑA_PERSONAL_DE_POSTGRESQL

# Servidor
PORT=3002
NODE_ENV=development

# JWT
JWT_SECRET=tu_secreto_super_seguro_aqui
```

**⚠️ IMPORTANTE:** Cada desarrollador debe usar su propia contraseña de PostgreSQL que configuró durante la instalación.

### **3. 📦 Instalar Dependencias**

```bash
# Instalar dependencias del backend
cd backend
npm install

# Instalar dependencias del frontend
cd ../frontend
npm install

# Volver al directorio raíz
cd ..
```

### **4. 🗄️ Configurar Base de Datos**

#### **🔐 Configuración de Contraseñas Individuales**

**Cada desarrollador debe:**

1. **Usar su propia contraseña** de PostgreSQL (la que configuró durante la instalación)
2. **No compartir contraseñas** entre miembros del equipo
3. **Configurar su archivo `.env`** con su contraseña personal

**Ejemplos de configuración:**

```env
# Desarrollador 1
DB_PASSWORD=mi_contraseña_123

# Desarrollador 2
DB_PASSWORD=postgres2024

# Desarrollador 3
DB_PASSWORD=admin123
```

#### **📋 Pasos para Configurar Base de Datos:**

```bash
# Crear base de datos PostgreSQL
createdb psyche_db

# Ejecutar migraciones
cd backend
npm run db:migrate

# Opcional: Cargar datos de ejemplo
npm run db:seed
```

### **5. 🚀 Iniciar el Proyecto**

```bash
# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: Frontend
cd frontend
npm run dev
```

---

## ✅ **Verificar que Todo Funciona**

### **🌐 URLs de Verificación:**

- **Dashboard Backend**: http://localhost:3002/dashboard
- **API de Salud**: http://localhost:3002/salud
- **Frontend**: http://localhost:3000 (o el puerto que indique)

### **🔍 Comandos de Verificación:**

```bash
# Verificar salud del backend
curl http://localhost:3002/salud

# Verificar puertos ocupados
netstat -ano | findstr :300

# Ver logs del backend
cd backend
npm run logs
```

---

## 🛠️ **Comandos Útiles para Desarrollo**

### **📦 Backend (desde `/backend`)**

```bash
# Desarrollo
npm run dev              # Servidor de desarrollo
npm run dev:clean        # Limpiar puertos + desarrollo

# Base de datos
npm run db:migrate       # Ejecutar migraciones
npm run db:seed          # Cargar datos de ejemplo
npm run db:reset         # Resetear base de datos

# Calidad de código
npm run lint             # Verificar código
npm run lint:fix         # Corregir automáticamente
npm run format           # Formatear código
npm run type-check       # Verificar tipos TypeScript

# Testing
npm run test             # Ejecutar tests
npm run test:watch       # Tests en modo watch

# Build
npm run build            # Compilar TypeScript
npm run start            # Ejecutar versión compilada
```

### **🎨 Frontend (desde `/frontend`)**

```bash
# Desarrollo
npm run dev              # Servidor de desarrollo
npm run build            # Build para producción
npm run preview          # Preview del build

# Calidad de código
npm run lint             # Verificar código
npm run lint:fix         # Corregir automáticamente
npm run format           # Formatear código
```

---

## 🐛 **Solución de Problemas Comunes**

### **❌ Error: Puerto 3002 ocupado**

```bash
# Solución rápida
npm run kill-ports

# O manualmente
npx kill-port 3002 3004 3006 3008 3010 3011 3012
```

### **❌ Error: Base de datos no conecta**

```bash
# Verificar PostgreSQL
pg_isready -h localhost -p 5432

# Crear base de datos si no existe
createdb psyche_db

# Verificar variables de entorno
cat .env | grep DB_
```

### **❌ Error: Dependencias no instalan**

```bash
# Limpiar cache
npm cache clean --force

# Eliminar node_modules y reinstalar
rm -rf node_modules package-lock.json
npm install
```

### **❌ Error: TypeScript no compila**

```bash
# Verificar configuración
npm run type-check

# Reinstalar dependencias de TypeScript
npm install typescript @types/node --save-dev
```

---

## 📚 **Estructura del Proyecto**

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

## 🎯 **Flujo de Trabajo Recomendado**

### **🔄 Para Nuevas Funcionalidades:**

1. **Crear rama**: `git checkout -b feature/nombre-funcionalidad`
2. **Desarrollar**: Hacer cambios en el código
3. **Testear**: `npm run test` y pruebas manuales
4. **Lint**: `npm run lint:fix` para limpiar código
5. **Commit**: `git commit -m "feat: descripción del cambio"`
6. **Push**: `git push origin feature/nombre-funcionalidad`
7. **Pull Request**: Crear PR en GitHub

### **🐛 Para Correcciones:**

1. **Crear rama**: `git checkout -b fix/nombre-problema`
2. **Corregir**: Arreglar el problema
3. **Testear**: Verificar que funciona
4. **Commit**: `git commit -m "fix: descripción de la corrección"`
5. **Push y PR**: Igual que funcionalidades

---

## 📖 **Recursos de Aprendizaje**

### **📚 Documentación del Proyecto:**

- **📋 API Docs**: http://localhost:3002/api/v1 (cuando esté corriendo)
- **🏥 Dashboard**: http://localhost:3002/dashboard
- **📄 README**: Ver archivo `README.md` en la raíz

### **🔗 Tecnologías Usadas:**

- **Backend**: Node.js, Express, TypeScript, PostgreSQL, Sequelize
- **Frontend**: React, TypeScript, Vite, Tailwind CSS
- **Herramientas**: ESLint, Prettier, Jest, Docker

### **📚 Recursos Externos:**

- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Express.js Guide](https://expressjs.com/en/guide/routing.html)
- [React Documentation](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/docs)

---

## 🤝 **Comunicación del Equipo**

### **📱 Canales de Comunicación:**

- **💬 Discord/Slack**: Para comunicación diaria
- **📧 Email**: Para comunicaciones formales
- **📋 GitHub Issues**: Para reportar bugs y features
- **📝 GitHub Discussions**: Para debates técnicos

### **📅 Reuniones:**

- **Daily Standup**: Lunes a Viernes, 9:00 AM
- **Sprint Planning**: Cada 2 semanas
- **Code Review**: Antes de cada merge

---

## 🎉 **¡Listo para Contribuir!**

### **✅ Checklist de Onboarding:**

- [ ] ✅ Repositorio clonado
- [ ] ✅ Variables de entorno configuradas
- [ ] ✅ Dependencias instaladas
- [ ] ✅ Base de datos configurada
- [ ] ✅ Backend corriendo en puerto 3002
- [ ] ✅ Frontend corriendo en puerto 3000
- [ ] ✅ Dashboard accesible en http://localhost:3002/dashboard
- [ ] ✅ API de salud respondiendo en http://localhost:3002/salud

### **🚀 Próximos Pasos:**

1. **📖 Leer**: Documentación técnica en `/docs`
2. **🎯 Asignar**: Issues en GitHub
3. **💻 Desarrollar**: Seguir el flujo de trabajo
4. **🤝 Contribuir**: Hacer pull requests

---

## 🆘 **¿Necesitas Ayuda?**

### **👥 Contacto del Equipo:**

- **👨‍💻 Líder Técnico**: [Tu nombre] - [tu-email@psyche.cl]
- **🎨 Diseñador UX**: [Nombre] - [email]
- **🔧 DevOps**: [Nombre] - [email]

### **📞 Soporte Técnico:**

- **🚨 Emergencias**: Crear issue en GitHub con label "urgent"
- **❓ Dudas**: Usar GitHub Discussions
- **🐛 Bugs**: Crear issue con template de bug

---

**¡Bienvenido al equipo del Centro Terapéutico Psyche! 🏥✨**

_Última actualización: Julio 2025_
