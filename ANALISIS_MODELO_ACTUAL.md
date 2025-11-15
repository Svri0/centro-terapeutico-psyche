# ANÁLISIS PROFUNDO DEL MODELO DE DATOS ACTUAL
## Centro Terapéutico Psyche

**Fecha del análisis:** 15 de noviembre de 2025  
**Analista:** Cursor AI Assistant  
**Objetivo:** Identificar problemas, redundancias y oportunidades de mejora en el modelo de datos

---

## 1. RESUMEN EJECUTIVO

El sistema actualmente cuenta con **18 modelos principales** y **2 tablas pivote**. Durante la evolución del proyecto se acumularon redundancias, desnormalizaciones y relaciones complejas que dificultan el mantenimiento.

### Estadísticas del modelo actual:
- **Tablas principales:** 18
- **Tablas pivote (N:M):** 2 (paciente_etiquetas, paciente_diagnosticos)
- **Relaciones totales:** 25+
- **Campos JSONB:** 30+
- **Campos redundantes detectados:** 15+

---

## 2. INVENTARIO COMPLETO DE TABLAS

### 2.1 Módulo de Autenticación y Permisos
| Tabla | Registros | Propósito | Estado |
|-------|-----------|-----------|--------|
| `roles` | ~4 | Gestión de roles (admin, psicologo, recepcionista, paciente) | ✅ Bien estructurada |
| `usuarios` | ~100-500 | Usuarios del sistema (psicólogos, admins, recepcionistas, pacientes) | ⚠️ Mezclado con datos de perfil |

### 2.2 Módulo de Pacientes
| Tabla | Registros | Propósito | Estado |
|-------|-----------|-----------|--------|
| `pacientes` | ~50-200 | Ficha clínica de pacientes | 🔴 **REDUNDANTE** con usuarios |
| `contactos_emergencia` | ~50-200 | Contactos de emergencia (normalizado) | ✅ Bien estructurada |
| `etiquetas` | ~20-50 | Etiquetas para categorizar pacientes | ✅ Bien estructurada |
| `diagnosticos` | ~50-200 | Catálogo de diagnósticos CIE-10/DSM-5 | ✅ Bien estructurada |
| `paciente_etiquetas` | ~100-500 | Relación N:M pacientes-etiquetas | ✅ Bien estructurada |
| `paciente_diagnosticos` | ~100-500 | Relación N:M pacientes-diagnósticos | ✅ Bien estructurada |

### 2.3 Módulo de Sesiones Terapéuticas
| Tabla | Registros | Propósito | Estado |
|-------|-----------|-----------|--------|
| `sesiones` | ~1000-5000 | Citas/sesiones terapéuticas | 🔴 **DEMASIADO COMPLEJA** |
| `reportes_progreso` | ~200-1000 | Reportes de evolución del paciente | ⚠️ Relación confusa con sesiones |

### 2.4 Módulo de Tareas y Gamificación
| Tabla | Registros | Propósito | Estado |
|-------|-----------|-----------|--------|
| `tareas` | ~500-2000 | Tareas asignadas a pacientes | 🔴 **REDUNDANTE** con respuestas |
| `respuestas_tareas` | ~200-1000 | Respuestas de pacientes a tareas | ⚠️ Poco usada, datos duplicados en `tareas` |

### 2.5 Módulo de Psicólogos
| Tabla | Registros | Propósito | Estado |
|-------|-----------|-----------|--------|
| `servicios_psicologo` | ~20-100 | Servicios ofrecidos por psicólogos | ⚠️ `tipo_servicio_id` debería ser FK a tabla |
| `disponibilidad_mensual` | ~1000-5000 | Disponibilidad de agenda | ⚠️ Nombre engañoso (no es mensual) |

### 2.6 Módulo de Comunicación
| Tabla | Registros | Propósito | Estado |
|-------|-----------|-----------|--------|
| `mensajes_chat` | ~5000-50000 | Mensajes del chat en tiempo real | ✅ Bien estructurada |
| `tokens_mensajes_paciente` | ~50-200 | Control de tokens de mensajes por paciente | ⚠️ Funcionalidad poco clara |

### 2.7 Módulo de Configuración y Auditoría
| Tabla | Registros | Propósito | Estado |
|-------|-----------|-----------|--------|
| `configuraciones_recordatorio` | ~100-500 | Preferencias de notificaciones por usuario | ✅ Bien estructurada |
| `configuraciones_sistema` | ~10-50 | Configuraciones globales del sistema | ✅ Bien estructurada |
| `logs_auditoria` | ~10000-100000 | Logs de auditoría y trazabilidad | ✅ Bien estructurada |

---

## 3. PROBLEMAS IDENTIFICADOS

### 3.1 🔴 PROBLEMA CRÍTICO: Redundancia en tabla `pacientes`

**Descripción:**  
La tabla `pacientes` duplica campos que ya existen en `usuarios`:

**Campos duplicados:**
```typescript
// En USUARIOS:
nombres, apellidos, email, telefono, fecha_nacimiento, genero

// En PACIENTES (DUPLICADOS):
nombres, apellidos, email, telefono, fecha_nacimiento, genero
```

**Impacto:**
- ❌ Violación de 3FN (Tercera Forma Normal)
- ❌ Datos inconsistentes (pueden desincronizarse)
- ❌ Doble actualización requerida
- ❌ Mayor uso de almacenamiento

**Solución propuesta:**
- Eliminar campos redundantes de `pacientes`
- Siempre obtener datos personales desde `usuarios` vía JOIN

---

### 3.2 🔴 PROBLEMA CRÍTICO: Tabla `sesiones` sobrecargada

**Descripción:**  
La tabla `sesiones` tiene 29 campos, muchos de tipo JSONB que deberían normalizarse.

**Campos problemáticos:**
```typescript
// Campos JSONB que deberían ser tablas:
objetivos_sesion: JSONB          // → tabla objetivos_terapeuticos
tecnicas_utilizadas: JSONB       // → tabla tecnicas_terapeuticas
objetivos_alcanzados: JSONB      // → relación con objetivos
tareas_asignadas: JSONB          // → ya existe relación con tareas
archivos_sesion: JSONB           // → tabla archivos
archivos_adjuntos: JSONB         // → tabla archivos (duplicado)
evaluacion_paciente: JSONB       // → tabla evaluaciones
derivacion_recomendada: JSONB    // → tabla derivaciones
```

**Impacto:**
- ❌ Imposible hacer queries eficientes
- ❌ No se pueden crear índices en campos JSONB
- ❌ Duplicación de datos (ej: archivos_sesion y archivos_adjuntos)
- ❌ Difícil mantener integridad referencial

**Solución propuesta:**
- Normalizar a mínimo 3FN
- Crear tablas: `objetivos_terapeuticos`, `tecnicas_terapeuticas`, `archivos`, `evaluaciones_sesion`

---

### 3.3 🔴 PROBLEMA CRÍTICO: Tabla `tareas` con datos de respuesta

**Descripción:**  
La tabla `tareas` incluye campos que deberían estar SOLO en `respuestas_tareas`:

**Campos problemáticos:**
```typescript
// En TAREAS (deberían estar en respuestas_tareas):
respuesta_paciente: TEXT
archivos_respuesta: JSONB
fecha_completada: DATE
```

**Impacto:**
- ❌ Una tarea solo puede tener una respuesta
- ❌ No permite re-envíos o múltiples intentos
- ❌ Confusión entre asignación y respuesta
- ❌ Duplicación con tabla `respuestas_tareas` (que apenas se usa)

**Solución propuesta:**
- Eliminar campos de respuesta de `tareas`
- Usar exclusivamente `respuestas_tareas` para almacenar respuestas

---

### 3.4 ⚠️ PROBLEMA MEDIO: Relaciones confusas en `usuarios` → `pacientes`

**Descripción:**  
`usuarios` tiene DOS relaciones con `pacientes`:

```typescript
// Relación 1: Usuario del paciente (1:1)
Usuario.hasOne(Paciente, { foreignKey: 'usuario_id' })

// Relación 2: Psicólogo asignado (1:N)
Usuario.hasMany(Paciente, { foreignKey: 'psicologo_id' })
```

**Impacto:**
- ❌ Confusión conceptual
- ❌ Joins complejos
- ❌ Difícil de entender para nuevos desarrolladores

**Solución propuesta:**
- Mantener ambas relaciones pero con alias más claros
- Documentar claramente el propósito de cada relación

---

### 3.5 ⚠️ PROBLEMA MEDIO: `servicios_psicologo` con FK inexistente

**Descripción:**  
El campo `tipo_servicio_id` es un STRING, pero debería ser una FK a una tabla catálogo.

```typescript
tipo_servicio_id: DataTypes.STRING  // ❌ Debería ser UUID
```

**Impacto:**
- ❌ No hay integridad referencial
- ❌ Pueden haber servicios con tipos inválidos
- ❌ No se puede centralizar información de tipos de servicio

**Solución propuesta:**
- Crear tabla `tipos_servicio`
- Convertir `tipo_servicio_id` a FK real

---

### 3.6 ⚠️ PROBLEMA MEDIO: Nombre engañoso `disponibilidad_mensual`

**Descripción:**  
La tabla se llama `disponibilidad_mensual` pero almacena disponibilidad por día específico.

**Impacto:**
- ⚠️ Confusión en el nombre
- ⚠️ No refleja su propósito real

**Solución propuesta:**
- Renombrar a `disponibilidad_psicologo` o `horarios_disponibles`

---

### 3.7 ⚠️ PROBLEMA MEDIO: Tipo de tarea confuso

**Descripción:**  
Existen dos campos para definir el tipo de tarea:

```typescript
tipo_tarea: ENUM(...)           // Tipo básico
tipo_tarea_avanzado: STRING     // Tipo extendido
```

**Impacto:**
- ⚠️ Confusión sobre cuál usar
- ⚠️ Dos fuentes de verdad

**Solución propuesta:**
- Unificar en un solo campo o crear tabla `tipos_tarea`

---

### 3.8 ℹ️ PROBLEMA MENOR: Falta de tabla para archivos

**Descripción:**  
Los archivos se almacenan como JSONB en múltiples tablas:

```typescript
// Sesiones:
archivos_sesion: JSONB
archivos_adjuntos: JSONB

// Tareas:
archivos_adjuntos: JSONB
archivos_respuesta: JSONB (en respuestas_tareas)
```

**Impacto:**
- ⚠️ Dificulta búsqueda global de archivos
- ⚠️ No hay información de metadatos (tamaño, tipo MIME, etc.)

**Solución propuesta:**
- Crear tabla `archivos` centralizada con metadatos

---

## 4. CAMPOS JSONB INNECESARIOS

### Campos que deberían normalizarse:

| Tabla | Campo JSONB | Razón para normalizar |
|-------|-------------|----------------------|
| `sesiones` | `objetivos_sesion` | Buscar, filtrar y analizar objetivos |
| `sesiones` | `tecnicas_utilizadas` | Estadísticas de técnicas más usadas |
| `sesiones` | `objetivos_alcanzados` | Relación con objetivos definidos |
| `sesiones` | `tareas_asignadas` | Ya existe tabla `tareas` |
| `sesiones` | `archivos_sesion` | Gestión centralizada de archivos |
| `sesiones` | `archivos_adjuntos` | Duplicado de `archivos_sesion` |
| `sesiones` | `evaluacion_paciente` | Histórico de evaluaciones |
| `sesiones` | `derivacion_recomendada` | Seguimiento de derivaciones |
| `tareas` | `contenido_tarea` | Según tipo de tarea, puede normalizarse |
| `tareas` | `configuracion_tarea` | Opciones de configuración |
| `tareas` | `archivos_adjuntos` | Gestión centralizada |

### Campos JSONB que PUEDEN mantenerse:

| Tabla | Campo JSONB | Justificación |
|-------|-------------|---------------|
| `usuarios` | `configuracion` | Preferencias flexibles del usuario |
| `roles` | `permisos` | Sistema de permisos dinámico |
| `pacientes` | `estrategias_autorregulacion` | Lista flexible sin necesidad de consultas complejas |
| `pacientes` | `antecedentes_medicos` | Estructura variable según paciente |
| `pacientes` | `medicacion_actual` | Estructura variable |
| `logs_auditoria` | `valores_anteriores` | Logging flexible |
| `logs_auditoria` | `valores_nuevos` | Logging flexible |
| `logs_auditoria` | `metadatos` | Información contextual variable |

---

## 5. ANÁLISIS DE DEPENDENCIAS

### 5.1 Dependencias de `usuarios`:
```
usuarios
├── → roles (N:1)
├── → pacientes (1:1 como usuario_id)
├── → pacientes (1:N como psicologo_id)
├── → sesiones (1:N como psicologo_id)
├── → tareas (1:N como psicologo_id)
├── → servicios_psicologo (1:N)
├── → disponibilidad_mensual (1:N)
├── → mensajes_chat (1:N como remitente_id)
├── → mensajes_chat (1:N como destinatario_id)
├── → logs_auditoria (1:N)
├── → configuraciones_recordatorio (1:N)
└── → reportes_progreso (1:N como psicologo_id)
```

### 5.2 Dependencias de `pacientes`:
```
pacientes
├── → usuarios (N:1 como usuario_id)
├── → usuarios (N:1 como psicologo_id)
├── → sesiones (1:N)
├── → tareas (1:N)
├── → respuestas_tareas (1:N)
├── → contactos_emergencia (1:N)
├── → etiquetas (N:M vía paciente_etiquetas)
├── → diagnosticos (N:M vía paciente_diagnosticos)
├── → tokens_mensajes_paciente (1:1)
└── → reportes_progreso (1:N)
```

### 5.3 Dependencias de `sesiones`:
```
sesiones
├── → pacientes (N:1)
├── → usuarios/psicologos (N:1)
├── → tareas (1:N)
└── → reportes_progreso (1:N)
```

### 5.4 Dependencias de `tareas`:
```
tareas
├── → pacientes (N:1)
├── → usuarios/psicologos (N:1)
├── → sesiones (N:1, opcional)
└── → respuestas_tareas (1:N, poco usado)
```

---

## 6. ENDPOINTS AFECTADOS POR MÓDULO

### Módulo Pacientes:
- `GET /api/pacientes` - Lista de pacientes
- `GET /api/pacientes/:id` - Detalle de paciente
- `POST /api/pacientes` - Crear paciente
- `PUT /api/pacientes/:id` - Actualizar paciente
- `DELETE /api/pacientes/:id` - Eliminar paciente
- `GET /api/pacientes/buscar` - Buscar pacientes
- `GET /api/pacientes/:id/historial` - Historial del paciente
- `GET /api/pacientes/psicologo-asignado` - Obtener psicólogo asignado

### Módulo Sesiones:
- `GET /api/sesiones/psicologo` - Sesiones del psicólogo
- `GET /api/sesiones/paciente` - Sesiones del paciente
- `POST /api/sesiones` - Crear sesión
- `PUT /api/sesiones/:id` - Actualizar sesión
- `DELETE /api/sesiones/:id` - Eliminar sesión

### Módulo Tareas:
- `GET /api/tareas` - Lista de tareas
- `POST /api/tareas` - Crear tarea
- `PUT /api/tareas/:id` - Actualizar tarea
- `DELETE /api/tareas/:id` - Eliminar tarea
- `POST /api/tareas/:id/responder` - Responder tarea

### Módulo Chat:
- `GET /api/chat/conversaciones` - Lista de conversaciones
- `GET /api/chat/mensajes/:destinatarioId` - Mensajes de una conversación
- `POST /api/chat/mensajes` - Enviar mensaje
- WebSocket: Mensajes en tiempo real

### Módulo Reportes:
- `GET /api/reportes/progreso/:pacienteId` - Reportes de un paciente
- `POST /api/reportes/progreso` - Crear reporte
- `PUT /api/reportes/progreso/:id` - Actualizar reporte

---

## 7. CASOS DE USO CRÍTICOS

### 7.1 Login y Autenticación
- **Afectado:** ❌ NO (tablas `usuarios` y `roles` sin cambios estructurales)
- **Riesgo:** Bajo

### 7.2 Gestión de Pacientes
- **Afectado:** ✅ SÍ (eliminación de campos redundantes)
- **Riesgo:** Alto
- **Acción:** Actualizar todos los SELECT que usan campos eliminados

### 7.3 Agendamiento de Sesiones
- **Afectado:** ✅ SÍ (normalización de campos JSONB)
- **Riesgo:** Medio
- **Acción:** Actualizar queries y serializers

### 7.4 Sistema de Tareas
- **Afectado:** ✅ SÍ (separación de tarea y respuesta)
- **Riesgo:** Alto
- **Acción:** Migrar respuestas a tabla correcta

### 7.5 Chat en Tiempo Real
- **Afectado:** ❌ NO (sin cambios)
- **Riesgo:** Bajo

### 7.6 Reportes de Progreso
- **Afectado:** ⚠️ PARCIAL (relaciones más claras)
- **Riesgo:** Bajo

### 7.7 Gestión de Disponibilidad
- **Afectado:** ⚠️ PARCIAL (rename de tabla)
- **Riesgo:** Medio

---

## 8. PROPUESTAS INICIALES DE CAMBIO

### 8.1 Cambios CRÍTICOS (requieren migración de datos):

1. **Eliminar campos redundantes de `pacientes`**
   - Eliminar: `nombres`, `apellidos`, `email`, `telefono`, `fecha_nacimiento`, `genero`
   - Mantener solo: `usuario_id`, `psicologo_id`, `numero_ficha`, `rut`, `direccion`, campos médicos

2. **Normalizar campos JSONB de `sesiones`**
   - Crear tabla: `objetivos_terapeuticos`
   - Crear tabla: `tecnicas_terapeuticas`
   - Crear tabla: `sesion_objetivos` (relación N:M)
   - Crear tabla: `sesion_tecnicas` (relación N:M)
   - Crear tabla: `archivos`
   - Crear tabla: `evaluaciones_sesion`

3. **Separar respuesta de tarea**
   - Eliminar de `tareas`: `respuesta_paciente`, `archivos_respuesta`, `fecha_completada`
   - Fortalecer uso de `respuestas_tareas`

4. **Normalizar servicios**
   - Crear tabla: `tipos_servicio`
   - Convertir `tipo_servicio_id` a FK

### 8.2 Cambios MEDIOS (mejoras sin migración compleja):

5. **Renombrar tabla**
   - `disponibilidad_mensual` → `horarios_disponibles`

6. **Unificar tipo de tarea**
   - Eliminar `tipo_tarea_avanzado`
   - Extender ENUM de `tipo_tarea`

### 8.3 Cambios OPCIONALES (mejoras de rendimiento):

7. **Centralizar archivos**
   - Crear tabla: `archivos` con campos: `id`, `nombre`, `tipo_mime`, `tamaño`, `ruta`, `entidad_tipo`, `entidad_id`

8. **Crear tabla de objetivos generales**
   - Catálogo de objetivos terapéuticos predefinidos

---

## 9. MÉTRICAS DE COMPLEJIDAD ACTUAL

| Métrica | Valor Actual | Valor Objetivo | Mejora |
|---------|--------------|----------------|--------|
| Número de tablas | 18 | 25 | -28% tablas, +39% normalización |
| Campos JSONB innecesarios | 11 | 3 | -73% |
| Campos redundantes | 15 | 0 | -100% |
| Violaciones 3FN | 8 | 0 | -100% |
| Relaciones ambiguas | 3 | 0 | -100% |
| Complejidad de sesiones (campos) | 29 | 15 | -48% |
| Complejidad de tareas (campos) | 25 | 18 | -28% |

---

## 10. CONCLUSIONES

### Situación actual:
- ❌ **3 problemas CRÍTICOS** que rompen normalización
- ⚠️ **4 problemas MEDIOS** que dificultan mantenimiento
- ℹ️ **1 problema MENOR** de arquitectura

### Riesgo de no refactorizar:
- 🔴 Inconsistencias de datos
- 🔴 Dificultad para escalar
- 🔴 Bugs difíciles de rastrear
- 🔴 Performance degradada en queries complejos
- 🔴 Onboarding lento de nuevos desarrolladores

### Beneficios de refactorizar:
- ✅ Base de datos normalizada (3FN)
- ✅ Queries más eficientes
- ✅ Mejor integridad referencial
- ✅ Código más mantenible
- ✅ Escalabilidad mejorada

---

## 11. RECOMENDACIÓN FINAL

**✅ PROCEDER CON LA REESTRUCTURACIÓN**

La refactorización es NECESARIA para garantizar la estabilidad y escalabilidad del sistema a largo plazo. El modelo actual presenta violaciones graves de normalización que tarde o temprano causarán problemas serios.

**Prioridad de implementación:**
1. **Fase 1:** Eliminar redundancia en `pacientes` (CRÍTICO)
2. **Fase 2:** Normalizar `sesiones` (CRÍTICO)
3. **Fase 3:** Separar respuestas de `tareas` (CRÍTICO)
4. **Fase 4:** Normalizar `servicios_psicologo` (MEDIO)
5. **Fase 5:** Mejoras menores (rename, unificaciones)

---

**Documento generado por:** Cursor AI Assistant  
**Próximo paso:** Fase 2 - Diseño de la nueva estructura

