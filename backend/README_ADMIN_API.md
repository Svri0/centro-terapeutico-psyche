# API de Administrador - Centro Terapéutico Psyche

## Descripción

Esta API permite a los administradores gestionar las cuentas de psicólogos en el sistema del Centro Terapéutico Psyche. Incluye funcionalidades completas de CRUD con validaciones de seguridad y control de acceso.

## Características Implementadas

✅ **Control de acceso por rol**: Solo administradores pueden acceder  
✅ **Creación de psicólogos**: Con validaciones y hasheo de contraseñas  
✅ **Edición y desactivación**: Gestión completa de cuentas  
✅ **Subdominio protegido**: Solo funciona desde `admin.terapia.cl`  
✅ **Validaciones robustas**: Campos obligatorios, formatos, unicidad  
✅ **Transacciones de BD**: Integridad de datos garantizada  
✅ **Logging completo**: Auditoría de todas las operaciones  
✅ **Documentación completa**: API docs y ejemplos de uso  

## Estructura de Archivos

```
backend/src/
├── middleware/
│   ├── auth.middleware.ts          # Autenticación y autorización
│   └── validation.middleware.ts    # Validaciones de entrada
├── controladores/
│   └── admin.controlador.ts        # Lógica de negocio
├── rutas/
│   └── admin.routes.ts             # Definición de endpoints
└── docs/
    └── API_ADMIN.md                # Documentación completa
```

## Endpoints Disponibles

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/v1/admin/psicologos` | Obtener todos los psicólogos |
| GET | `/api/v1/admin/psicologos/:id` | Obtener psicólogo por ID |
| POST | `/api/v1/admin/psicologos` | Crear nuevo psicólogo |
| PUT | `/api/v1/admin/psicologos/:id` | Actualizar psicólogo |
| PATCH | `/api/v1/admin/psicologos/:id/desactivar` | Desactivar psicólogo |
| PATCH | `/api/v1/admin/psicologos/:id/reactivar` | Reactivar psicólogo |

## Instalación y Configuración

### 1. Dependencias Requeridas

Asegúrate de tener instaladas las siguientes dependencias:

```bash
npm install bcryptjs jsonwebtoken uuid
npm install --save-dev @types/bcryptjs @types/jsonwebtoken @types/uuid
```

### 2. Variables de Entorno

Agrega las siguientes variables a tu archivo `.env`:

```env
# JWT
JWT_SECRET=tu_secreto_super_seguro_y_largo

# Base de datos (ya configuradas)
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=VMlover01!
DB_NAME=psyche_db

# Configuración del servidor
NODE_ENV=development
PORT=3002
```

### 3. Base de Datos

**Opción A: Configuración automática (Recomendado)**

```bash
# Ejecutar script de configuración completo
npm run setup:admin
```

**Opción B: Configuración manual**

```bash
# Ejecutar migraciones
npm run db:migrate

# Ejecutar seeders (crea roles iniciales)
npm run db:seed
```

**Nota**: Si obtienes errores de duplicación, usa la Opción A o consulta `SOLUCION_MIGRACIONES.md`

### 4. Verificar Instalación

```bash
# Iniciar el servidor
npm run dev

# Verificar que el servidor esté funcionando
curl http://localhost:3002/salud
```

## Uso de la API

### Autenticación

Todas las peticiones requieren un token JWT en el header:

```bash
Authorization: Bearer <tu_token_jwt>
```

### Ejemplo de Crear Psicólogo

```bash
curl -X POST http://localhost:3002/api/v1/admin/psicologos \
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

### Ejemplo de Obtener Psicólogos

```bash
curl -X GET http://localhost:3002/api/v1/admin/psicologos \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Seguridad

### Middleware de Autenticación

- **verificarToken**: Valida JWT y extrae información del usuario
- **verificarAdmin**: Verifica que el usuario tenga rol de administrador
- **verificarSubdominioAdmin**: Valida que la petición venga del subdominio admin

### Validaciones

- **validarCrearPsicologo**: Valida datos para crear psicólogo
- **validarActualizarPsicologo**: Valida datos para actualizar psicólogo
- **validarIdPsicologo**: Valida formato UUID del ID

### Características de Seguridad

- Contraseñas hasheadas con bcrypt (12 salt rounds)
- Validación de formato de email
- Verificación de unicidad de email
- Transacciones de base de datos
- Logging de todas las operaciones
- Control de acceso por subdominio

## Códigos de Respuesta

### Éxito
- `200`: Operación exitosa
- `201`: Recurso creado exitosamente

### Errores de Cliente
- `400`: Datos de validación incorrectos
- `401`: No autorizado (token faltante o inválido)
- `403`: Prohibido (sin permisos de administrador)
- `404`: Recurso no encontrado
- `409`: Conflicto (email duplicado, estado incorrecto)

### Errores de Servidor
- `500`: Error interno del servidor

## Pruebas

Para ejecutar las pruebas (requiere instalar supertest):

```bash
# Instalar supertest
npm install --save-dev supertest @types/supertest

# Ejecutar pruebas
npm test
```

## Logging

Todas las operaciones se registran usando el sistema de logging existente:

```typescript
import { log } from '../utilidades/logger';

log.info('Nuevo psicólogo creado:', email);
log.error('Error en crearPsicologo:', error);
```

## Base de Datos

### Tablas Utilizadas

- **usuarios**: Almacena información de psicólogos
- **roles**: Define roles del sistema (administrador, psicólogo, paciente)

### Campos Importantes

- `rol_id`: Referencia al rol (1=admin, 2=psicólogo, 3=paciente)
- `activo`: Estado de la cuenta (true/false)
- `email_verificado`: Estado de verificación de email
- `token_activacion`: Token para activar cuenta

## Configuración de Producción

### Variables de Entorno

```env
NODE_ENV=production
JWT_SECRET=secreto_muy_seguro_y_largo_en_produccion
```

### Seguridad Adicional

1. **HTTPS**: Configurar certificados SSL
2. **Rate Limiting**: Implementar límites de peticiones
3. **CORS**: Configurar orígenes permitidos
4. **Helmet**: Configuraciones adicionales de seguridad

## Troubleshooting

### Error: "Rol de psicólogo no encontrado"

```bash
# Verificar que los seeders se ejecutaron correctamente
npm run db:seed

# Verificar roles en la base de datos
SELECT * FROM roles WHERE nombre = 'psicologo';
```

### Error: "Token inválido"

```bash
# Verificar variable JWT_SECRET en .env
echo $JWT_SECRET

# Verificar que el token esté en el formato correcto
Authorization: Bearer <token>
```

### Error: "Acceso denegado desde subdominio"

```bash
# Para desarrollo, modificar el middleware temporalmente
# En auth.middleware.ts, comentar la validación de subdominio
```

## Contribución

1. Crear rama para nueva funcionalidad
2. Implementar cambios con pruebas
3. Documentar cambios en API_ADMIN.md
4. Crear pull request

## Soporte

Para soporte técnico, contactar al equipo de desarrollo:
- Email: soporte@psyche.cl
- Documentación: `/docs/API_ADMIN.md` 