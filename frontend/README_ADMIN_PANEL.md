# 🎯 Panel de Administrador - Centro Terapéutico Psyche

## 📋 **Descripción**

Panel de administración completo para gestionar psicólogos del sistema. Incluye autenticación JWT, CRUD completo de usuarios, y interfaz moderna con Tailwind CSS.

## 🚀 **Características**

### ✅ **Autenticación y Seguridad**
- Login con JWT tokens
- Validación de roles (solo administradores)
- Interceptores automáticos para tokens
- Logout automático en errores 401

### ✅ **Gestión de Psicólogos**
- **Crear**: Formulario completo con validaciones
- **Listar**: Tabla con información detallada
- **Editar**: Modal para modificar datos
- **Desactivar/Reactivar**: Control de estado de usuarios
- **Generador de contraseñas**: Automático y seguro

### ✅ **Interfaz de Usuario**
- Diseño responsive con Tailwind CSS
- Modales para formularios
- Estados de carga y errores
- Validaciones en tiempo real
- Iconos y componentes modernos

## 🛠️ **Instalación y Configuración**

### 1. **Instalar Dependencias**
```bash
cd frontend
npm install
```

### 2. **Configurar Backend**
Asegúrate de que el backend esté corriendo en `http://localhost:3002`

### 3. **Ejecutar el Frontend**
```bash
npm run dev
```

El panel estará disponible en: `http://localhost:5173`

## 🔐 **Credenciales por Defecto**

```
Email: admin@terapia.cl
Contraseña: Admin123!
```

## 📱 **Uso del Sistema**

### **1. Login**
- Accede a `http://localhost:5173`
- Ingresa las credenciales de administrador
- El sistema validará tu rol automáticamente

### **2. Panel Principal**
- **Header**: Información del usuario y botón de logout
- **Tabla de Psicólogos**: Lista todos los psicólogos registrados
- **Botón "Nuevo Psicólogo"**: Abre modal de creación

### **3. Crear Psicólogo**
- Click en "Nuevo Psicólogo"
- Completa el formulario:
  - **Obligatorios**: Nombres, Apellidos, Email, Contraseña
  - **Opcionales**: Teléfono, Fecha de nacimiento, Género
- **Generador de contraseñas**: Click en "Generar" para contraseña automática
- Click en "Crear Psicólogo"

### **4. Editar Psicólogo**
- Click en "Editar" en la fila del psicólogo
- Modifica los campos necesarios
- Click en "Guardar Cambios"

### **5. Desactivar/Reactivar**
- **Desactivar**: Click en "Desactivar" (confirmación requerida)
- **Reactivar**: Click en "Reactivar" (solo para usuarios inactivos)

## 🗂️ **Estructura de Archivos**

```
frontend/src/
├── servicios/
│   ├── auth.service.ts          # Autenticación y JWT
│   └── admin.service.ts         # API de administración
├── paginas/
│   ├── Login.tsx               # Página de login
│   └── PanelAdmin.tsx          # Panel principal
├── componentes/
│   ├── TablaPsicologos.tsx     # Tabla de psicólogos
│   ├── ModalCrearPsicologo.tsx # Modal de creación
│   └── ModalEditarPsicologo.tsx # Modal de edición
└── App.tsx                     # Enrutamiento principal
```

## 🔧 **Configuración de API**

### **URL Base**
```typescript
const API_BASE_URL = 'http://localhost:3002/api/v1';
```

### **Endpoints Utilizados**
- `POST /autenticacion/login` - Login
- `GET /admin/psicologos` - Listar psicólogos
- `POST /admin/psicologos` - Crear psicólogo
- `PUT /admin/psicologos/:id` - Actualizar psicólogo
- `PATCH /admin/psicologos/:id/desactivar` - Desactivar
- `PATCH /admin/psicologos/:id/reactivar` - Reactivar

## 🎨 **Estilos y Componentes**

### **Tailwind CSS**
- Diseño responsive
- Componentes modernos
- Estados hover y focus
- Colores consistentes

### **Componentes Reutilizables**
- Modales con backdrop
- Formularios con validación
- Tablas con acciones
- Botones con estados

## 🔒 **Seguridad**

### **Autenticación**
- Tokens JWT almacenados en localStorage
- Interceptores automáticos para requests
- Logout automático en errores 401
- Validación de roles en frontend

### **Validaciones**
- Campos obligatorios
- Formato de email
- Longitud de contraseña
- Formato de teléfono

## 🐛 **Solución de Problemas**

### **Error de CORS**
```bash
# En el backend, asegúrate de tener CORS configurado
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
```

### **Error de Conexión**
- Verifica que el backend esté corriendo en puerto 3002
- Revisa la consola del navegador para errores
- Verifica las credenciales de login

### **Error de Autenticación**
- Limpia localStorage: `localStorage.clear()`
- Reinicia la aplicación
- Verifica que el token no haya expirado

## 📊 **Estados de la Aplicación**

### **Loading States**
- Spinner durante carga de datos
- Botones deshabilitados durante requests
- Mensajes de "Cargando..."

### **Error States**
- Mensajes de error en rojo
- Validaciones en formularios
- Alertas para acciones críticas

### **Success States**
- Confirmaciones de acciones exitosas
- Actualización automática de datos
- Cierre automático de modales

## 🚀 **Próximas Mejoras**

- [ ] Filtros y búsqueda en tabla
- [ ] Paginación para muchos registros
- [ ] Exportar datos a Excel/PDF
- [ ] Notificaciones push
- [ ] Historial de cambios
- [ ] Dashboard con estadísticas

## 📞 **Soporte**

Para problemas o preguntas:
1. Revisa la consola del navegador
2. Verifica los logs del backend
3. Consulta la documentación de la API
4. Contacta al equipo de desarrollo

---

**¡El panel de administrador está listo para usar! 🎉** 