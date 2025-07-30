# 🔐 Sistema de Autenticación - Centro Terapéutico Psyche

## 📋 Descripción General

El sistema de autenticación del Centro Terapéutico Psyche proporciona una solución completa y segura para la gestión de usuarios, incluyendo autenticación JWT, roles de usuario, y protección de rutas.

## 🏗️ Arquitectura del Sistema

### **Componentes Principales**

1. **Modelo Usuario** (`backend/src/modelos/Usuario.ts`)
   - Gestión de usuarios con Sequelize
   - Hasheo automático de contraseñas con bcrypt
   - Validaciones de datos
   - Métodos de utilidad

2. **Servicio JWT** (`backend/src/servicios/jwt.service.ts`)
   - Generación y verificación de tokens
   - Tokens de acceso y refresco
   - Manejo de expiración de tokens

3. **Middleware de Autenticación** (`backend/src/intermediarios/auth.middleware.ts`)
   - Verificación de tokens
   - Control de roles
   - Protección de rutas

4. **Controlador de Autenticación** (`backend/src/controladores/autenticacion.controlador.ts`)
   - Endpoints de autenticación
   - Gestión de perfiles
   - Cambio de contraseñas

## 🔑 Roles de Usuario

### **Tipos de Rol**

- **`admin`** - Administrador del sistema
- **`psicologo`** - Psicólogo/Terapeuta
- **`paciente`** - Paciente del centro
- **`recepcionista`** - Personal de recepción

### **Permisos por Rol**

| Rol           | Pacientes     | Sesiones       | Tareas          | Reportes | Usuarios |
| ------------- | ------------- | -------------- | --------------- | -------- | -------- |
| admin         | ✅ CRUD       | ✅ CRUD        | ✅ CRUD         | ✅ CRUD  | ✅ CRUD  |
| psicologo     | ✅ CRUD       | ✅ CRUD        | ✅ CRUD         | ✅ Ver   | ❌       |
| paciente      | ✅ Ver propio | ✅ Ver propias | ✅ CRUD propias | ❌       | ❌       |
| recepcionista | ✅ Ver        | ✅ Ver         | ❌              | ❌       | ❌       |

## 🚀 Endpoints de Autenticación

### **Rutas Públicas**

#### **POST** `/api/v1/auth/login`

Iniciar sesión de usuario.

**Body:**

```json
{
  "email": "juan.perez@psyche.cl",
  "password": "password123"
}
```

**Respuesta:**

```json
{
  "success": true,
  "mensaje": "Inicio de sesión exitoso",
  "data": {
    "usuario": {
      "id": 1,
      "nombre": "Dr. Juan Pérez",
      "email": "juan.perez@psyche.cl",
      "rol": "psicologo",
      "especialidad": "Psicología Clínica",
      "activo": true
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "expiresIn": 86400
    }
  }
}
```

#### **POST** `/api/v1/auth/registro`

Registrar nuevo usuario.

**Body:**

```json
{
  "nombre": "Nuevo Usuario",
  "email": "nuevo@psyche.cl",
  "password": "password123",
  "rol": "paciente",
  "telefono": "+56912345678"
}
```

#### **POST** `/api/v1/auth/refresh`

Refrescar token de acceso.

**Body:**

```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### **Rutas Protegidas**

#### **GET** `/api/v1/auth/perfil`

Obtener perfil del usuario autenticado.

**Headers:**

```
Authorization: Bearer <access_token>
```

#### **PUT** `/api/v1/auth/perfil`

Actualizar perfil del usuario.

**Headers:**

```
Authorization: Bearer <access_token>
```

**Body:**

```json
{
  "nombre": "Nuevo Nombre",
  "telefono": "+56987654321",
  "especialidad": "Nueva Especialidad"
}
```

#### **PUT** `/api/v1/auth/cambiar-password`

Cambiar contraseña del usuario.

**Headers:**

```
Authorization: Bearer <access_token>
```

**Body:**

```json
{
  "passwordActual": "password123",
  "passwordNuevo": "nuevaPassword456"
}
```

#### **POST** `/api/v1/auth/logout`

Cerrar sesión del usuario.

**Headers:**

```
Authorization: Bearer <access_token>
```

## 🛡️ Middleware de Protección

### **verificarAuth**

Verifica que el usuario esté autenticado.

```typescript
import { verificarAuth } from "../intermediarios/auth.middleware";

router.get("/ruta-protegida", verificarAuth, controlador);
```

### **verificarRol**

Verifica que el usuario tenga el rol requerido.

```typescript
import { verificarRol } from "../intermediarios/auth.middleware";

router.get("/admin-only", verificarAuth, verificarRol("admin"), controlador);
router.get(
  "/psicologos",
  verificarAuth,
  verificarRol("psicologo", "admin"),
  controlador
);
```

### **verificarPropietarioOAdmin**

Verifica que el usuario sea propietario del recurso o admin.

```typescript
import { verificarPropietarioOAdmin } from "../intermediarios/auth.middleware";

router.put(
  "/perfil/:id",
  verificarAuth,
  verificarPropietarioOAdmin("id"),
  controlador
);
```

## 🔧 Configuración

### **Variables de Entorno**

```env
# JWT Configuration
JWT_SECRET=tu_jwt_secret_super_seguro
JWT_REFRESH_SECRET=tu_refresh_secret_super_seguro
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=psyche_password
DB_NAME=psyche_db
```

### **Instalación de Dependencias**

```bash
# Backend
cd backend
npm install bcryptjs jsonwebtoken

# Tipos para TypeScript
npm install --save-dev @types/bcryptjs @types/jsonwebtoken
```

## 🧪 Pruebas del Sistema

### **Script de Pruebas Automatizadas**

```bash
# Ejecutar pruebas de autenticación
cd backend
node scripts/test-auth.js
```

### **Pruebas Manuales con Thunder Client**

1. **Login:**

   ```
   POST http://localhost:3002/api/v1/auth/login
   Content-Type: application/json

   {
     "email": "juan.perez@psyche.cl",
     "password": "password123"
   }
   ```

2. **Obtener Perfil:**

   ```
   GET http://localhost:3002/api/v1/auth/perfil
   Authorization: Bearer <token_del_login>
   ```

3. **Actualizar Perfil:**

   ```
   PUT http://localhost:3002/api/v1/auth/perfil
   Authorization: Bearer <token_del_login>
   Content-Type: application/json

   {
     "nombre": "Dr. Juan Pérez Actualizado",
     "telefono": "+56987654321"
   }
   ```

## 👥 Usuarios de Prueba

El sistema incluye usuarios de prueba predefinidos:

| Email                      | Password    | Rol           | Nombre                |
| -------------------------- | ----------- | ------------- | --------------------- |
| admin@psyche.cl            | admin123    | admin         | Administrador Sistema |
| juan.perez@psyche.cl       | password123 | psicologo     | Dr. Juan Pérez        |
| maria.gonzalez@psyche.cl   | password123 | psicologo     | Dra. María González   |
| carlos.rodriguez@psyche.cl | password123 | paciente      | Carlos Rodríguez      |
| ana.silva@psyche.cl        | password123 | paciente      | Ana Silva             |
| pedro.lopez@psyche.cl      | password123 | recepcionista | Pedro López           |

## 🔒 Seguridad

### **Características de Seguridad**

- ✅ **Hasheo de contraseñas** con bcrypt (12 rounds)
- ✅ **Tokens JWT** con expiración configurable
- ✅ **Refresh tokens** para renovación automática
- ✅ **Validación de roles** en middleware
- ✅ **Protección CSRF** con Helmet
- ✅ **Rate limiting** (configurable)
- ✅ **Logging de autenticación** para auditoría

### **Buenas Prácticas**

1. **Nunca almacenar tokens** en localStorage (usar httpOnly cookies en producción)
2. **Implementar logout** en el frontend al expirar tokens
3. **Validar tokens** en cada petición protegida
4. **Usar HTTPS** en producción
5. **Rotar secrets** regularmente
6. **Monitorear logs** de autenticación

## 🚨 Solución de Problemas

### **Error: "Token inválido o expirado"**

- Verificar que el token esté en el header `Authorization: Bearer <token>`
- Verificar que el token no haya expirado
- Verificar que el usuario esté activo en la base de datos

### **Error: "No tienes permisos para acceder a este recurso"**

- Verificar que el usuario tenga el rol requerido
- Verificar que el middleware de roles esté configurado correctamente

### **Error: "Usuario no encontrado o inactivo"**

- Verificar que el usuario exista en la base de datos
- Verificar que el campo `activo` sea `true`

### **Error: "Credenciales inválidas"**

- Verificar que el email y password sean correctos
- Verificar que el usuario esté activo

## 📚 Recursos Adicionales

- [Documentación de JWT](https://jwt.io/)
- [Documentación de bcrypt](https://github.com/dcodeIO/bcrypt.js/)
- [Guía de Seguridad OWASP](https://owasp.org/www-project-top-ten/)
- [Documentación de Sequelize](https://sequelize.org/)

---

**¿Necesitas ayuda?** Consulta con el equipo de desarrollo o revisa los logs del servidor para más detalles.
