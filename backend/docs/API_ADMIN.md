# API de Administrador - Gestión de Psicólogos

## Descripción General

Esta API permite a los administradores gestionar las cuentas de psicólogos en el sistema del Centro Terapéutico Psyche. Todas las rutas requieren autenticación JWT y permisos de administrador.

## Autenticación

Todas las rutas requieren un token JWT válido en el header `Authorization`:
```
Authorization: Bearer <token>
```

## Base URL

```
https://admin.terapia.cl/api/v1/admin
```

## Endpoints

### 1. Obtener Todos los Psicólogos

**GET** `/psicologos`

Obtiene la lista completa de psicólogos registrados en el sistema.

#### Respuesta Exitosa (200)
```json
{
  "success": true,
  "mensaje": "Psicólogos obtenidos exitosamente",
  "data": [
    {
      "id": "uuid-del-psicologo",
      "nombres": "Juan Carlos",
      "apellidos": "González Pérez",
      "email": "juan.gonzalez@terapia.cl",
      "telefono": "+56912345678",
      "fecha_nacimiento": "1985-03-15",
      "genero": "masculino",
      "activo": true,
      "email_verificado": true,
      "ultimo_acceso": "2024-01-15T10:30:00Z",
      "created_at": "2024-01-01T09:00:00Z",
      "rol_nombre": "psicologo"
    }
  ],
  "codigo": "ADMIN_001",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### 2. Obtener Psicólogo por ID

**GET** `/psicologos/:id`

Obtiene la información detallada de un psicólogo específico.

#### Parámetros
- `id` (UUID): ID único del psicólogo

#### Respuesta Exitosa (200)
```json
{
  "success": true,
  "mensaje": "Psicólogo obtenido exitosamente",
  "data": {
    "id": "uuid-del-psicologo",
    "nombres": "Juan Carlos",
    "apellidos": "González Pérez",
    "email": "juan.gonzalez@terapia.cl",
    "telefono": "+56912345678",
    "fecha_nacimiento": "1985-03-15",
    "genero": "masculino",
    "activo": true,
    "email_verificado": true,
    "ultimo_acceso": "2024-01-15T10:30:00Z",
    "created_at": "2024-01-01T09:00:00Z",
    "updated_at": "2024-01-10T14:20:00Z",
    "rol_nombre": "psicologo"
  },
  "codigo": "ADMIN_010",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### 3. Crear Nuevo Psicólogo

**POST** `/psicologos`

Crea una nueva cuenta de psicólogo en el sistema.

#### Cuerpo de la Petición
```json
{
  "nombres": "María Elena",
  "apellidos": "Rodríguez Silva",
  "email": "maria.rodriguez@terapia.cl",
  "password": "Contraseña123!",
  "telefono": "+56987654321",
  "fecha_nacimiento": "1990-07-22",
  "genero": "femenino"
}
```

#### Campos Requeridos
- `nombres` (string, mínimo 2 caracteres)
- `apellidos` (string, mínimo 2 caracteres)
- `email` (string, formato válido de email)
- `password` (string, mínimo 8 caracteres)

#### Campos Opcionales
- `telefono` (string)
- `fecha_nacimiento` (string, formato YYYY-MM-DD)
- `genero` (string: "masculino", "femenino", "otro", "prefiero_no_decir")

#### Respuesta Exitosa (201)
```json
{
  "success": true,
  "mensaje": "Psicólogo creado exitosamente. Se ha enviado un email de activación.",
  "data": {
    "usuario": {
      "id": "nuevo-uuid-generado",
      "nombres": "María Elena",
      "apellidos": "Rodríguez Silva",
      "email": "maria.rodriguez@terapia.cl",
      "created_at": "2024-01-15T10:30:00Z"
    },
    "token_activacion": "token-para-activacion"
  },
  "codigo": "ADMIN_007",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### 4. Actualizar Psicólogo

**PUT** `/psicologos/:id`

Actualiza la información de un psicólogo existente.

#### Parámetros
- `id` (UUID): ID único del psicólogo

#### Cuerpo de la Petición
```json
{
  "nombres": "María Elena",
  "apellidos": "Rodríguez Silva",
  "email": "maria.rodriguez.nueva@terapia.cl",
  "telefono": "+56987654321",
  "fecha_nacimiento": "1990-07-22",
  "genero": "femenino"
}
```

#### Respuesta Exitosa (200)
```json
{
  "success": true,
  "mensaje": "Psicólogo actualizado exitosamente",
  "data": {
    "id": "uuid-del-psicologo",
    "campos_actualizados": 3
  },
  "codigo": "ADMIN_016",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### 5. Desactivar Psicólogo

**PATCH** `/psicologos/:id/desactivar`

Desactiva la cuenta de un psicólogo (desactivación lógica).

#### Parámetros
- `id` (UUID): ID único del psicólogo

#### Respuesta Exitosa (200)
```json
{
  "success": true,
  "mensaje": "Psicólogo desactivado exitosamente",
  "data": {
    "id": "uuid-del-psicologo",
    "nombres": "Juan Carlos",
    "apellidos": "González Pérez",
    "estado": "desactivado"
  },
  "codigo": "ADMIN_020",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### 6. Reactivar Psicólogo

**PATCH** `/psicologos/:id/reactivar`

Reactiva la cuenta de un psicólogo previamente desactivado.

#### Parámetros
- `id` (UUID): ID único del psicólogo

#### Respuesta Exitosa (200)
```json
{
  "success": true,
  "mensaje": "Psicólogo reactivado exitosamente",
  "data": {
    "id": "uuid-del-psicologo",
    "nombres": "Juan Carlos",
    "apellidos": "González Pérez",
    "estado": "activado"
  },
  "codigo": "ADMIN_024",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

## Códigos de Error

### Errores de Autenticación
- `AUTH_101`: Token de acceso requerido
- `AUTH_102`: Token inválido o expirado
- `AUTH_103`: Error al verificar el token
- `AUTH_104`: Usuario no autenticado
- `AUTH_105`: Acceso denegado. Se requieren permisos de administrador
- `AUTH_107`: Acceso denegado. Esta funcionalidad solo está disponible desde el subdominio admin

### Errores de Validación
- `VAL_001`: Datos de validación incorrectos (crear psicólogo)
- `VAL_003`: Datos de validación incorrectos (actualizar psicólogo)
- `VAL_005`: ID de psicólogo es requerido
- `VAL_006`: Formato de ID inválido

### Errores de Administrador
- `ADMIN_002`: Error al obtener la lista de psicólogos
- `ADMIN_003`: Nombres, apellidos, email y contraseña son requeridos
- `ADMIN_004`: Formato de email inválido
- `ADMIN_005`: El email ya está registrado en el sistema
- `ADMIN_006`: Error: Rol de psicólogo no encontrado en el sistema
- `ADMIN_008`: Error al crear el psicólogo
- `ADMIN_009`: Psicólogo no encontrado
- `ADMIN_011`: Error al obtener el psicólogo
- `ADMIN_012`: Psicólogo no encontrado
- `ADMIN_013`: Formato de email inválido
- `ADMIN_014`: El email ya está registrado por otro usuario
- `ADMIN_015`: No se proporcionaron campos para actualizar
- `ADMIN_017`: Error al actualizar el psicólogo
- `ADMIN_018`: Psicólogo no encontrado
- `ADMIN_019`: El psicólogo ya está desactivado
- `ADMIN_021`: Error al desactivar el psicólogo
- `ADMIN_022`: Psicólogo no encontrado
- `ADMIN_023`: El psicólogo ya está activo
- `ADMIN_025`: Error al reactivar el psicólogo

## Ejemplos de Uso

### Ejemplo 1: Crear un nuevo psicólogo
```bash
curl -X POST https://admin.terapia.cl/api/v1/admin/psicologos \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "nombres": "Ana María",
    "apellidos": "López García",
    "email": "ana.lopez@terapia.cl",
    "password": "ContraseñaSegura123!",
    "telefono": "+56911223344",
    "fecha_nacimiento": "1988-12-05",
    "genero": "femenino"
  }'
```

### Ejemplo 2: Obtener todos los psicólogos
```bash
curl -X GET https://admin.terapia.cl/api/v1/admin/psicologos \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Ejemplo 3: Actualizar información de psicólogo
```bash
curl -X PUT https://admin.terapia.cl/api/v1/admin/psicologos/UUID-DEL-PSICOLOGO \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "telefono": "+56999887766",
    "email": "ana.lopez.nueva@terapia.cl"
  }'
```

### Ejemplo 4: Desactivar psicólogo
```bash
curl -X PATCH https://admin.terapia.cl/api/v1/admin/psicologos/UUID-DEL-PSICOLOGO/desactivar \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Notas Importantes

1. **Subdominio Requerido**: Todas las operaciones deben realizarse desde `admin.terapia.cl`
2. **Permisos**: Solo usuarios con rol de administrador pueden acceder a estos endpoints
3. **Validaciones**: Todos los datos de entrada son validados antes de procesarse
4. **Transacciones**: Las operaciones de escritura utilizan transacciones de base de datos
5. **Logging**: Todas las operaciones son registradas para auditoría
6. **Email de Activación**: Al crear un psicólogo, se genera un token de activación que debe enviarse por email
7. **Desactivación Lógica**: Los psicólogos no se eliminan, solo se marcan como inactivos

## Seguridad

- Todas las contraseñas se hashean con bcrypt antes de almacenarse
- Se valida el formato de email y unicidad
- Se utilizan transacciones para mantener la integridad de datos
- Se registran todas las operaciones para auditoría
- Se valida el subdominio para restringir el acceso 

## Resumen de la Implementación

He implementado completamente la funcionalidad de "Gestión de Usuarios" para el administrador del Centro Terapéutico Psyche. Aquí está el resumen de lo que se ha creado:

### ✅ **Funcionalidades Implementadas**

1. **Control de Acceso por Rol**
   - Middleware de autenticación JWT
   - Verificación de rol de administrador
   - Protección por subdominio (`admin.terapia.cl`)

2. **Creación de Psicólogos**
   - Formulario completo con validaciones
   - Hasheo de contraseñas con bcrypt
   - Asignación automática del rol "psicólogo"
   - Verificación de unicidad de email
   - Generación de token de activación

3. **Edición y Desactivación**
   - Listado de psicólogos registrados
   - Edición de información personal
   - Desactivación lógica (sin borrar registros)
   - Reactivación de cuentas

4. **Seguridad y Validaciones**
   - Validaciones robustas de entrada
   - Manejo de errores específicos
   - Transacciones de base de datos
   - Logging completo para auditoría

###  **Archivos Creados**

1. **`backend/src/middleware/auth.middleware.ts`** - Autenticación y autorización
2. **`backend/src/middleware/validation.middleware.ts`** - Validaciones de entrada
3. **`backend/src/controladores/admin.controlador.ts`** - Lógica de negocio
4. **`backend/src/rutas/admin.routes.ts`** - Definición de endpoints
5. **`backend/docs/API_ADMIN.md`** - Documentación completa de la API
6. **`backend/README_ADMIN_API.md`** - Guía de instalación y configuración
7. **`backend/test/admin.test.ts`** - Pruebas unitarias

###  **Endpoints Disponibles**

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/v1/admin/psicologos` | Obtener todos los psicólogos |
| GET | `/api/v1/admin/psicologos/:id` | Obtener psicólogo por ID |
| POST | `/api/v1/admin/psicologos` | Crear nuevo psicólogo |
| PUT | `/api/v1/admin/psicologos/:id` | Actualizar psicólogo |
| PATCH | `/api/v1/admin/psicologos/:id/desactivar` | Desactivar psicólogo |
| PATCH | `/api/v1/admin/psicologos/:id/reactivar` | Reactivar psicólogo |

### ️ **Características de Seguridad**

- **Autenticación JWT** con verificación de tokens
- **Autorización por rol** (solo administradores)
- **Protección por subdominio** (`admin.terapia.cl`)
- **Validaciones robustas** de todos los datos de entrada
- **Hasheo de contraseñas** con bcrypt (12 salt rounds)
- **Transacciones de BD** para integridad de datos
- **Logging completo** para auditoría
- **Manejo de errores** específicos y seguros

### 📚 **Documentación**

- **API completa** con ejemplos de uso
- **Códigos de error** detallados
- **Guía de instalación** paso a paso
- **Ejemplos de curl** para pruebas
- **Troubleshooting** para problemas comunes

### 🚀 **Próximos Pasos**

1. **Instalar dependencias**:
   ```bash
   npm install bcryptjs jsonwebtoken uuid
   npm install --save-dev @types/bcryptjs @types/jsonwebtoken @types/uuid
   ```

2. **Configurar variables de entorno**:
   ```env
   JWT_SECRET=tu_secreto_super_seguro_y_largo
   ```

3. **Ejecutar migraciones**:
   ```bash
   npm run db:migrate
   npm run db:seed
   ```

4. **Probar la API**:
   ```bash
   npm run dev
   curl http://localhost:3002/salud
   ```

La implementación está completa y lista para usar. Todos los requisitos han sido cumplidos con las mejores prácticas de seguridad y desarrollo. 