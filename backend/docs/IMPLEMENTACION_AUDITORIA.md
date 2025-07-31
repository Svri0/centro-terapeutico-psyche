# Implementación del Sistema de Auditoría

## Resumen

Se ha implementado un sistema completo de auditoría para el Centro Terapéutico Psyche que registra todas las acciones críticas realizadas por los administradores del sistema.

## Funcionalidades Implementadas

### 1. Servicio de Auditoría (`auditoria.service.ts`)

**Ubicación**: `backend/src/utilidades/auditoria.service.ts`

**Funcionalidades**:
- ✅ Creación centralizada de logs de auditoría
- ✅ Captura de información de la request (IP, User Agent, URL, método)
- ✅ Métodos específicos para cada tipo de acción crítica:
  - `logDesactivacionPsicologo()` - Desactivación de psicólogos
  - `logReactivacionPsicologo()` - Reactivación de psicólogos
  - `logEliminacionPsicologo()` - Eliminación permanente de psicólogos
  - `logEliminacionCita()` - Eliminación de citas específicas
  - `logReasignacionPaciente()` - Reasignación de pacientes
  - `logIntentoEliminacionFallido()` - Intentos fallidos de eliminación

### 2. Integración en Controladores

**Archivo**: `backend/src/controladores/admin.controlador.ts`

**Funciones modificadas**:
- ✅ `desactivarPsicologo()` - Agregado log de auditoría
- ✅ `reactivarPsicologo()` - Agregado log de auditoría
- ✅ `eliminarPsicologo()` - Agregado log de auditoría (exitoso y fallido)
- ✅ `eliminarCita()` - Agregado log de auditoría
- ✅ `reasignarPaciente()` - Agregado log de auditoría

**Nuevas funciones**:
- ✅ `obtenerLogsAuditoria()` - Endpoint para obtener logs con filtros
- ✅ `obtenerEstadisticasAuditoria()` - Endpoint para estadísticas

### 3. Endpoints de Auditoría

**Archivo**: `backend/src/rutas/admin.routes.ts`

**Nuevos endpoints**:
- ✅ `GET /admin/auditoria/logs` - Obtener logs de auditoría
- ✅ `GET /admin/auditoria/estadisticas` - Obtener estadísticas de auditoría

**Parámetros de filtrado**:
- `limit` - Número de registros por página
- `offset` - Desplazamiento para paginación
- `accion` - Filtrar por tipo de acción
- `fecha_inicio` - Filtrar desde fecha
- `fecha_fin` - Filtrar hasta fecha

### 4. Scripts de Prueba

**Scripts creados**:
- ✅ `test-auditoria.js` - Prueba completa del sistema de auditoría
- ✅ `test-endpoints-auditoria.js` - Prueba de endpoints de auditoría
- ✅ `generar-reporte-auditoria.js` - Generación de reportes de auditoría

## Estructura de Logs de Auditoría

### Campos Registrados

```typescript
interface LogAuditoria {
  id: string;                    // UUID único
  usuario_id?: string;           // ID del usuario que realizó la acción
  accion: string;                // Tipo de acción (ej: "DESACTIVACION_PSICOLOGO")
  tabla_afectada?: string;       // Tabla afectada (ej: "usuarios")
  registro_id?: string;          // ID del registro afectado
  valores_anteriores?: any;      // Estado anterior (JSON)
  valores_nuevos?: any;          // Estado nuevo (JSON)
  ip_address?: string;           // IP del usuario
  user_agent?: string;           // User Agent del navegador
  metadatos: any;                // Información adicional específica
  created_at: Date;              // Timestamp de la acción
}
```

### Tipos de Acciones Registradas

1. **DESACTIVACION_PSICOLOGO**
   - Registra cuando un psicólogo es desactivado
   - Incluye nombre del psicólogo y motivo

2. **REACTIVACION_PSICOLOGO**
   - Registra cuando un psicólogo es reactivado
   - Incluye nombre del psicólogo

3. **ELIMINACION_PSICOLOGO**
   - Registra eliminación permanente de psicólogos
   - Incluye detalles de registros relacionados

4. **ELIMINACION_CITA**
   - Registra eliminación de citas específicas
   - Incluye información de paciente y psicólogo

5. **REASIGNACION_PACIENTE**
   - Registra reasignación de pacientes
   - Incluye psicólogo anterior y nuevo

6. **INTENTO_ELIMINACION_FALLIDO**
   - Registra intentos fallidos de eliminación
   - Incluye motivo del fallo

## Información Capturada

### Metadatos Específicos

Cada tipo de acción incluye metadatos específicos:

```typescript
// Desactivación de psicólogo
{
  tipo: 'desactivacion',
  psicologo_nombre: 'Dr. Juan Pérez',
  motivo?: string
}

// Eliminación de cita
{
  tipo: 'eliminacion_cita',
  paciente_id: 'uuid',
  psicologo_id: 'uuid',
  fecha_cita: '2024-01-15'
}

// Reasignación de paciente
{
  tipo: 'reasignacion_paciente',
  paciente_nombre: 'María González',
  psicologo_anterior_id: 'uuid',
  psicologo_nuevo_id: 'uuid'
}
```

### Información de Request

- **IP Address**: Dirección IP del usuario
- **User Agent**: Navegador y sistema operativo
- **URL**: Endpoint accedido
- **Method**: Método HTTP utilizado
- **Headers**: Información de headers (sin datos sensibles)

## Uso de los Scripts

### 1. Probar Sistema de Auditoría

```bash
cd backend
node scripts/test-auditoria.js
```

### 2. Probar Endpoints de Auditoría

```bash
cd backend
node scripts/test-endpoints-auditoria.js
```

### 3. Generar Reportes

```bash
cd backend
# Reporte general
node scripts/generar-reporte-auditoria.js

# Reporte específico de reasignaciones
node scripts/generar-reporte-auditoria.js reasignaciones

# Reporte específico de eliminaciones
node scripts/generar-reporte-auditoria.js eliminaciones
```

## Consultas SQL Útiles

### Ver Logs Recientes
```sql
SELECT * FROM logs_auditoria 
ORDER BY created_at DESC 
LIMIT 10;
```

### Estadísticas por Tipo de Acción
```sql
SELECT accion, COUNT(*) as total 
FROM logs_auditoria 
GROUP BY accion 
ORDER BY total DESC;
```

### Logs de un Usuario Específico
```sql
SELECT * FROM logs_auditoria 
WHERE usuario_id = 'uuid-del-usuario' 
ORDER BY created_at DESC;
```

### Logs de una Fecha Específica
```sql
SELECT * FROM logs_auditoria 
WHERE DATE(created_at) = '2024-01-15' 
ORDER BY created_at DESC;
```

## Beneficios del Sistema

### 1. Trazabilidad Completa
- ✅ Todas las acciones críticas quedan registradas
- ✅ Información detallada de quién, cuándo y qué se hizo
- ✅ Contexto completo de cada acción

### 2. Cumplimiento Normativo
- ✅ Registro de auditoría para cumplimiento legal
- ✅ Trazabilidad de cambios en datos sensibles
- ✅ Evidencia de acciones administrativas

### 3. Seguridad
- ✅ Detección de actividades sospechosas
- ✅ Registro de intentos fallidos
- ✅ Información de origen de las acciones

### 4. Análisis y Reportes
- ✅ Estadísticas de uso del sistema
- ✅ Identificación de patrones de comportamiento
- ✅ Reportes personalizados por tipo de acción

## Próximos Pasos Opcionales

1. **Validaciones Adicionales en Frontend**
   - Confirmaciones adicionales para acciones críticas
   - Validación de permisos específicos

2. **Reportes Avanzados**
   - Dashboard de auditoría en tiempo real
   - Alertas automáticas para acciones críticas
   - Exportación de reportes en diferentes formatos

3. **Integración con Sistema de Notificaciones**
   - Alertas por email para acciones críticas
   - Notificaciones en tiempo real para administradores

## Notas Técnicas

- Los logs se crean de forma asíncrona para no afectar el rendimiento
- Los errores en la creación de logs no interrumpen el flujo principal
- La información sensible (tokens) se oculta en los logs
- El sistema es escalable y puede manejar grandes volúmenes de datos 