# 🏥 Centro Terapéutico Psyche

Sistema completo de gestión para centro terapéutico con funcionalidades para psicólogos y pacientes.

## 📋 **Resumen de Funcionalidades Implementadas**

### ✅ **Sistema de Autenticación**
- Login/Logout para psicólogos y administradores
- JWT tokens para autenticación segura
- Middleware de autenticación para rutas protegidas
- Gestión de roles (psicólogo, admin)

### ✅ **Panel de Administración**
- Gestión completa de psicólogos (crear, editar, eliminar)
- Dashboard con estadísticas
- Interfaz moderna y responsive
- Validaciones de formularios

### ✅ **Panel del Psicólogo**
- **Dashboard personalizado** con estadísticas de sesiones
- **Gestión de perfil** con subida de imágenes y avatares
- **Sistema de disponibilidad semanal** con validaciones
- **Gestión de servicios** con tipos predefinidos
- **Sistema de notificaciones** con popups animados
- **Validación de duplicados** en servicios

### ✅ **Base de Datos**
- PostgreSQL con Sequelize ORM
- Migraciones para todas las tablas
- Modelos con relaciones y validaciones
- Soft deletes para datos importantes

### ✅ **Backend API**
- RESTful API con Express.js
- Controladores para todas las entidades
- Validación de datos con middleware
- Logging y manejo de errores
- CORS configurado

### ✅ **Frontend**
- React con TypeScript
- Tailwind CSS para estilos
- Componentes reutilizables
- Responsive design
- Hot reload con Vite

## 🚨 **CONFIGURACIÓN CRÍTICA - PUERTO 3002**

### ⚠️ **IMPORTANTE PARA EL EQUIPO**
**EL BACKEND DEBE CORRER SIEMPRE EN EL PUERTO 3002**

```bash
# ✅ CORRECTO - Puerto 3002
cd backend
npm run dev
# Backend corriendo en: http://localhost:3002

# ❌ INCORRECTO - Puerto alternativo
# El backend NO debe usar puertos 3007, 3008, etc.
```

### 🔍 **Verificación Rápida**
```bash
# Verificar que funciona
.\scripts\verificar-puerto-3002.ps1

# O manualmente
curl http://localhost:3002/salud
```

### 🛠️ **Si el Puerto 3002 Está Ocupado**
```bash
# Solución automática
.\scripts\clean-ports.ps1

# O matar procesos Node
Get-Process | Where-Object {$_.ProcessName -eq "node"} | Stop-Process -Force
```

**📋 Documentación completa**: Ver `PUERTO_3002_OBLIGATORIO.md`

---

## 🚀 **Instalación y Configuración**

### 📋 Requisitos Previos
- Node.js 18+ 
- PostgreSQL 12+
- Git

### 🔧 Pasos de Instalación

1. **Clonar el repositorio**
   ```bash
   git clone <tu-repositorio>
   cd centro-terapeutico-psyche
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   cd backend && npm install
   cd ../frontend && npm install
   ```

3. **Configurar variables de entorno (RÁPIDO)**
   ```bash
   cd backend
   node scripts/setup-rapido.js
   ```
   *Solo necesitas tu contraseña de PostgreSQL - el resto ya está configurado*

4. **Configurar base de datos**
   ```bash
   npm run db:migrate
   npm run db:seed
   ```

5. **Crear usuario administrador**
   ```bash
   npm run crear-admin
   ```

6. **Ejecutar el servidor**
   ```bash
   npm run dev
   ```

## 🔐 **Configuración del Equipo**

### 📧 Configuración del Equipo
El equipo comparte la misma configuración:
- ✅ Email: `dentrodepsyche@gmail.com` (compartido)
- ✅ Contraseña de aplicación: ya configurada
- ✅ JWT Secret: ya configurado
- ✅ Puerto: 3002 (estándar)
- 🔐 Solo necesitas tu contraseña de PostgreSQL local

### 🛠️ Scripts Útiles
- `node scripts/setup-rapido.js` - **CONFIGURACIÓN RÁPIDA** (solo PostgreSQL)
- `node scripts/setup-roman.js` - **CONFIGURACIÓN AUTOMÁTICA PARA ROMÁN** (detecta OS)
- `node scripts/setup-env.js` - Configuración completa personalizada
- `npm run crear-admin` - Crear usuario administrador (admin@admin.cl / admin123)
- `node scripts/verificar-usuarios-admin.js` - Diagnosticar problemas de admin
- `node scripts/verificar-admin-rapido.js` - Verificar admin estándar
- `node scripts/test-email-real.js` - Probar envío de emails

## 🚀 **Tecnologías Utilizadas**

### **Backend**
- Node.js + Express.js
- TypeScript
- PostgreSQL + Sequelize ORM
- JWT para autenticación
- Multer para upload de archivos
- Nodemon para desarrollo

### **Frontend**
- React 18 + TypeScript
- Vite para build y dev server
- Tailwind CSS
- React Router DOM
- Axios para API calls
- React DatePicker

### **Base de Datos**
- PostgreSQL
- Migraciones con Sequelize CLI
- Índices optimizados
- Constraints de integridad

## 📁 **Estructura del Proyecto**

```
centro-terapeutico-psyche/
├── backend/
│   ├── src/
│   │   ├── configuracion/
│   │   ├── controladores/
│   │   ├── middleware/
│   │   ├── modelos/
│   │   ├── rutas/
│   │   ├── utilidades/
│   │   └── servidor.ts
│   ├── migrations/
│   ├── seeders/
│   └── scripts/
├── frontend/
│   ├── src/
│   │   ├── componentes/
│   │   ├── paginas/
│   │   ├── servicios/
│   │   ├── utilidades/
│   │   └── types/
│   └── public/
├── docker/
└── docs/
```

## 🎯 **Funcionalidades Principales Implementadas**

### **1. Sistema de Autenticación**
- ✅ Login con email/password
- ✅ JWT tokens seguros
- ✅ Middleware de autenticación
- ✅ Gestión de roles

### **2. Panel de Administración**
- ✅ Dashboard con estadísticas
- ✅ CRUD completo de psicólogos
- ✅ Interfaz moderna y responsive
- ✅ Validaciones en tiempo real

### **3. Panel del Psicólogo**
- ✅ **Dashboard personalizado** con métricas
- ✅ **Gestión de perfil** con imágenes
- ✅ **Sistema de disponibilidad semanal**
- ✅ **Gestión de servicios** con tipos predefinidos
- ✅ **Notificaciones** con popups animados
- ✅ **Validación de duplicados** en servicios

### **4. Base de Datos**
- ✅ **Tabla usuarios** con roles
- ✅ **Tabla disponibilidad_semanal** para horarios
- ✅ **Tabla servicios_psicologo** para servicios
- ✅ **Índices optimizados** y constraints
- ✅ **Migraciones** para todas las tablas

### **5. API RESTful**
- ✅ **Endpoints de autenticación**
- ✅ **CRUD de psicólogos** (admin)
- ✅ **Gestión de disponibilidad**
- ✅ **Gestión de servicios**
- ✅ **Validaciones** y manejo de errores

## 🔧 **Configuración y Instalación**

### **Prerrequisitos**
- Node.js 18+
- PostgreSQL 12+
- npm o yarn

### **Instalación**

1. **Clonar el repositorio**
```bash
git clone <repository-url>
cd centro-terapeutico-psyche
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**
```bash
cp env.example .env
# Editar .env con tus credenciales de DB
```

4. **Configurar base de datos**
```bash
cd backend
npm run migrate
npm run seed
```

5. **Ejecutar en desarrollo**
```bash
npm run dev
```

### **Puertos por defecto**
- Frontend: http://localhost:3000
- Backend: http://localhost:3002
- Base de datos: localhost:5432

## 📊 **Base de Datos**

### **Tablas Principales**

#### **usuarios**
- Gestión de psicólogos y administradores
- Roles y permisos
- Información personal y profesional

#### **disponibilidad_semanal**
- Horarios semanales de psicólogos
- Validación de 40 horas máximo
- Gestión de feriados y vacaciones

#### **servicios_psicologo**
- Servicios ofrecidos por cada psicólogo
- Tipos predefinidos con categorías
- Validación de duplicados

## 🎨 **Interfaz de Usuario**

### **Panel de Administración**
- Dashboard con estadísticas
- Gestión completa de psicólogos
- Interfaz moderna con Tailwind CSS

### **Panel del Psicólogo**
- **Dashboard personalizado** con métricas
- **Gestión de perfil** con avatares
- **Sistema de disponibilidad** semanal
- **Gestión de servicios** con validaciones
- **Notificaciones** animadas

## 🔒 **Seguridad**

- ✅ JWT tokens para autenticación
- ✅ Middleware de autenticación
- ✅ Validación de roles
- ✅ Sanitización de datos
- ✅ CORS configurado
- ✅ Soft deletes para datos importantes

## 📈 **Próximos Pasos a Implementar**

### **🔥 Prioridad Alta**

#### **1. Vista del Paciente**
- [ ] **Crear componente PanelPaciente**
- [ ] **Sistema de registro de pacientes**
- [ ] **Visualización de servicios del psicólogo**
- [ ] **Sistema de reserva de citas**
- [ ] **Integración con disponibilidad del psicólogo**

#### **2. Sistema de Citas**
- [ ] **Modelo de citas en base de datos**
- [ ] **API para crear/editar/cancelar citas**
- [ ] **Validación de disponibilidad**
- [ ] **Notificaciones de citas**
- [ ] **Historial de citas**

#### **3. Asignación Paciente-Psicólogo**
- [ ] **Lógica de asignación automática**
- [ ] **Relación paciente-psicólogo**
- [ ] **Filtrado de servicios por psicólogo**
- [ ] **Dashboard específico por psicólogo**

### **⚡ Prioridad Media**

#### **4. Mejoras en Panel del Psicólogo**
- [ ] **Dashboard con estadísticas reales**
- [ ] **Sistema de notificaciones avanzado**
- [ ] **Gestión de pacientes asignados**
- [ ] **Reportes de sesiones**

#### **5. Sistema de Mensajería**
- [ ] **Chat entre psicólogo y paciente**
- [ ] **Notificaciones en tiempo real**
- [ ] **Historial de mensajes**
- [ ] **Archivos adjuntos**

#### **6. Sistema de Pagos**
- [ ] **Integración con pasarela de pagos**
- [ ] **Gestión de facturación**
- [ ] **Historial de transacciones**
- [ ] **Reportes financieros**

### **📋 Prioridad Baja**

#### **7. Funcionalidades Avanzadas**
- [ ] **Subida de documentos** (consentimientos, evaluaciones)
- [ ] **Sistema de reportes y analytics**
- [ ] **Exportación de datos**
- [ ] **Backup automático**

#### **8. Mejoras de UX/UI**
- [ ] **Temas personalizables**
- [ ] **Modo oscuro**
- [ ] **Accesibilidad mejorada**
- [ ] **PWA (Progressive Web App)**

#### **9. Testing y QA**
- [ ] **Tests unitarios**
- [ ] **Tests de integración**
- [ ] **Tests end-to-end**
- [ ] **CI/CD pipeline**

## 🐛 **Problemas Conocidos**

### **Errores de TypeScript**
- ✅ **Arreglado**: Errores TS7030 en controladores
- ✅ **Arreglado**: Errores TS2614 en imports
- ✅ **Arreglado**: Manejo de errores en servicios

### **Problemas de Puerto**
- ✅ **Arreglado**: Puerto dinámico para backend
- ✅ **Arreglado**: Configuración de CORS
- ✅ **Arreglado**: Variables de entorno

## 📝 **Notas de Desarrollo**

### **Comandos Útiles**

```bash
# Desarrollo
npm run dev                    # Ejecutar frontend + backend
npm run dev:frontend          # Solo frontend
npm run dev:backend           # Solo backend

# Base de datos
npm run migrate               # Ejecutar migraciones
npm run seed                  # Ejecutar seeders
npm run db:reset             # Resetear base de datos

# Build
npm run build                # Build de producción
npm run preview              # Preview de build
```

### **Scripts de Prueba**
- `backend/scripts/test-*.js` - Scripts de prueba para API
- `backend/scripts/crear-*.js` - Scripts para crear datos de prueba

## 🤝 **Contribución**

1. Fork el proyecto
2. Crear una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir un Pull Request

## 📄 **Licencia**

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.

## 👥 **Equipo**

- **Desarrollador Principal**: [Tu Nombre]
- **Fecha de Inicio**: Agosto 2025
- **Estado**: En desarrollo activo

---

## 🎉 **Estado Actual del Proyecto**

### ✅ **Completado (100%)**
- Sistema de autenticación
- Panel de administración
- Panel del psicólogo (funcionalidades principales)
- Base de datos completa
- API RESTful funcional
- Interfaz de usuario moderna

### 🔄 **En Progreso (0%)**
- Vista del paciente
- Sistema de citas
- Asignación paciente-psicólogo

### 📋 **Pendiente (0%)**
- Sistema de mensajería
- Sistema de pagos
- Funcionalidades avanzadas

**Progreso General: 70% completado** 🚀
