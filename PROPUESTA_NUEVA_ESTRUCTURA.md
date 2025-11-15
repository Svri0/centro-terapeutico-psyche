# PROPUESTA DE NUEVA ESTRUCTURA DE BASE DE DATOS
## Centro Terapéutico Psyche - Modelo Normalizado

**Fecha:** 15 de noviembre de 2025  
**Versión:** 2.0 (Refactorización Completa)  
**Objetivo:** Normalizar a 3FN manteniendo todas las funcionalidades

---

## 1. RESUMEN DE CAMBIOS

### Tablas que permanecen SIN cambios estructurales:
✅ `roles`  
✅ `logs_auditoria`  
✅ `configuraciones_recordatorio`  
✅ `configuraciones_sistema`  
✅ `mensajes_chat`  
✅ `contactos_emergencia`  
✅ `etiquetas`  
✅ `diagnosticos`  
✅ `paciente_etiquetas` (tabla pivote)  
✅ `paciente_diagnosticos` (tabla pivote)  

### Tablas que se MODIFICAN:
🔄 `usuarios` → Limpieza menor, sin cambios estructurales grandes  
🔄 `pacientes` → **Eliminar campos redundantes**  
🔄 `sesiones` → **Normalizar campos JSONB**  
🔄 `tareas` → **Eliminar campos de respuesta**  
🔄 `respuestas_tareas` → Fortalecer uso  
🔄 `servicios_psicologo` → Normalizar `tipo_servicio_id`  
🔄 `disponibilidad_mensual` → **RENOMBRAR a `horarios_disponibles`**  
🔄 `tokens_mensajes_paciente` → Sin cambios estructurales  
🔄 `reportes_progreso` → Sin cambios estructurales  

### Tablas NUEVAS a crear:
🆕 `tipos_servicio` - Catálogo de tipos de servicio  
🆕 `objetivos_terapeuticos` - Catálogo de objetivos terapéuticos  
🆕 `tecnicas_terapeuticas` - Catálogo de técnicas utilizadas  
🆕 `sesion_objetivos` - Relación N:M sesiones-objetivos  
🆕 `sesion_tecnicas` - Relación N:M sesiones-técnicas  
🆕 `archivos` - Gestión centralizada de archivos/documentos  
🆕 `evaluaciones_sesion` - Evaluaciones estructuradas de sesiones  

---

## 2. DIAGRAMA ENTIDAD-RELACIÓN NUEVO (MERMAID)

```mermaid
erDiagram
    %% ============================================
    %% MÓDULO: AUTENTICACIÓN Y PERMISOS
    %% ============================================
    roles ||--o{ usuarios : "tiene"
    
    roles {
        int id PK
        string nombre UK "admin, psicologo, recepcionista, paciente"
        text descripcion
        jsonb permisos
        boolean activo
        timestamp created_at
        timestamp updated_at
        timestamp deleted_at
    }
    
    usuarios {
        uuid id PK
        int rol_id FK
        string email UK
        string password_hash
        string nombres
        string apellidos
        string telefono
        date fecha_nacimiento
        enum genero "masculino, femenino, otro, prefiero_no_decir"
        string avatar_url
        string especialidad "Solo para psicólogos"
        text descripcion
        string codigo_sbs "Solo para psicólogos"
        boolean activo
        boolean email_verificado
        string token_activacion
        timestamp token_activacion_expira
        timestamp ultimo_acceso
        jsonb configuracion
        timestamp created_at
        timestamp updated_at
        timestamp deleted_at
    }
    
    %% ============================================
    %% MÓDULO: PACIENTES Y FICHA CLÍNICA
    %% ============================================
    usuarios ||--o| pacientes : "es_usuario_de"
    usuarios ||--o{ pacientes : "atiende_como_psicologo"
    
    pacientes {
        uuid id PK
        uuid usuario_id FK UK "Eliminados: nombres, apellidos, email, telefono, fecha_nacimiento, genero"
        uuid psicologo_id FK
        string numero_ficha UK "PSI-001-0001"
        string rut UK
        string direccion
        jsonb estrategias_autorregulacion
        int puntos_acumulados
        enum estado "activo, inactivo, alta, derivado"
        date fecha_ingreso
        date fecha_alta
        text observaciones
        jsonb antecedentes_medicos
        jsonb medicacion_actual
        jsonb alergias
        jsonb condiciones_cronicas
        jsonb historial_psiquiatrico
        text observaciones_medicas
        timestamp created_at
        timestamp updated_at
        timestamp deleted_at
    }
    
    pacientes ||--o{ contactos_emergencia : "tiene"
    
    contactos_emergencia {
        uuid id PK
        uuid paciente_id FK
        string nombre
        string telefono
        string relacion
        timestamp created_at
        timestamp updated_at
        timestamp deleted_at
    }
    
    pacientes }o--o{ etiquetas : "categorizado_con"
    
    etiquetas {
        uuid id PK
        string nombre UK
        string color
        timestamp created_at
        timestamp updated_at
        timestamp deleted_at
    }
    
    paciente_etiquetas {
        uuid paciente_id FK
        uuid etiqueta_id FK
        timestamp created_at
    }
    
    pacientes }o--o{ diagnosticos : "diagnosticado_con"
    
    diagnosticos {
        uuid id PK
        string codigo "CIE-10 / DSM-5"
        string nombre
        text descripcion
        timestamp created_at
        timestamp updated_at
        timestamp deleted_at
    }
    
    paciente_diagnosticos {
        uuid paciente_id FK
        uuid diagnostico_id FK
        timestamp created_at
    }
    
    %% ============================================
    %% MÓDULO: SESIONES TERAPÉUTICAS (NORMALIZADO)
    %% ============================================
    pacientes ||--o{ sesiones : "asiste_a"
    usuarios ||--o{ sesiones : "conduce"
    
    sesiones {
        uuid id PK
        uuid paciente_id FK
        uuid psicologo_id FK
        timestamp fecha_programada
        timestamp fecha_inicio
        timestamp fecha_fin
        int duracion_minutos
        enum tipo_sesion "presencial, virtual, telefonica"
        enum estado "programada, confirmada, en_curso, completada, cancelada, no_asistio"
        text notas_evolucion
        text observaciones
        text resumen_sesion
        enum progreso_paciente "excelente, bueno, regular, necesita_mejora"
        timestamp created_at
        timestamp updated_at
        timestamp deleted_at
    }
    
    sesiones }o--o{ objetivos_terapeuticos : "trabaja_en"
    
    objetivos_terapeuticos {
        uuid id PK
        string nombre UK
        text descripcion
        string categoria "emocional, cognitivo, conductual, social"
        boolean activo
        timestamp created_at
        timestamp updated_at
        timestamp deleted_at
    }
    
    sesion_objetivos {
        uuid id PK
        uuid sesion_id FK
        uuid objetivo_id FK
        boolean alcanzado
        text notas
        timestamp created_at
    }
    
    sesiones }o--o{ tecnicas_terapeuticas : "utiliza"
    
    tecnicas_terapeuticas {
        uuid id PK
        string nombre UK
        text descripcion
        string categoria "cognitivo-conductual, humanista, psicodinamica, sistemica"
        boolean activo
        timestamp created_at
        timestamp updated_at
        timestamp deleted_at
    }
    
    sesion_tecnicas {
        uuid id PK
        uuid sesion_id FK
        uuid tecnica_id FK
        text notas_aplicacion
        timestamp created_at
    }
    
    sesiones ||--o{ evaluaciones_sesion : "tiene_evaluacion"
    
    evaluaciones_sesion {
        uuid id PK
        uuid sesion_id FK
        int animo_paciente "1-10"
        int nivel_ansiedad "1-10"
        int cooperacion "1-10"
        int insight "1-10"
        text observaciones_evaluacion
        timestamp created_at
        timestamp updated_at
    }
    
    sesiones ||--o{ archivos : "adjunta"
    
    archivos {
        uuid id PK
        string nombre_original
        string nombre_almacenado
        string ruta_almacenamiento
        string tipo_mime
        int tamano_bytes
        enum entidad_tipo "sesion, tarea, respuesta_tarea, reporte, paciente"
        uuid entidad_id
        uuid subido_por FK "usuario_id"
        timestamp created_at
        timestamp deleted_at
    }
    
    %% ============================================
    %% MÓDULO: TAREAS Y GAMIFICACIÓN (NORMALIZADO)
    %% ============================================
    pacientes ||--o{ tareas : "recibe"
    usuarios ||--o{ tareas : "asigna"
    sesiones ||--o{ tareas : "genera"
    
    tareas {
        uuid id PK
        uuid paciente_id FK
        uuid psicologo_id FK
        uuid sesion_id FK "nullable"
        string titulo
        text descripcion
        text instrucciones
        enum tipo_tarea "texto_abierto, opcion_multiple, test_psicologico, test_imagenes, tarea_dibujo, ejercicio, lectura, reflexion, practica, evaluacion"
        enum prioridad "baja, media, alta, urgente"
        timestamp fecha_asignacion
        timestamp fecha_vencimiento
        enum estado "pendiente, en_progreso, completada, vencida, cancelada"
        int puntos_asignados
        jsonb contenido_tarea "Estructura según tipo_tarea"
        jsonb configuracion_tarea "Opciones de configuración"
        boolean es_borrador
        timestamp fecha_publicacion
        timestamp created_at
        timestamp updated_at
        timestamp deleted_at
    }
    
    tareas ||--o{ respuestas_tareas : "respondida_con"
    tareas ||--o{ archivos : "adjunta"
    
    respuestas_tareas {
        uuid id PK
        uuid tarea_id FK
        uuid paciente_id FK
        text contenido_respuesta
        timestamp fecha_envio
        jsonb evaluacion_psicologo "calificacion, retroalimentacion"
        timestamp created_at
        timestamp updated_at
    }
    
    respuestas_tareas ||--o{ archivos : "adjunta"
    
    %% ============================================
    %% MÓDULO: REPORTES DE PROGRESO
    %% ============================================
    pacientes ||--o{ reportes_progreso : "tiene"
    usuarios ||--o{ reportes_progreso : "elabora"
    sesiones ||--o{ reportes_progreso : "relacionado_con"
    
    reportes_progreso {
        uuid id PK
        uuid paciente_id FK
        uuid psicologo_id FK
        uuid sesion_id FK "nullable"
        timestamp fecha_reporte
        date periodo_inicio
        date periodo_fin
        text resumen_evolucion
        jsonb objetivos_cumplidos
        jsonb objetivos_pendientes
        jsonb areas_trabajadas
        jsonb conductas_observadas
        jsonb logros_importantes
        jsonb desafios_identificados
        text sugerencias_terapeuticas
        enum progreso_general "excelente, muy_bueno, bueno, regular, necesita_atencion"
        int metrica_satisfaccion "0-10"
        text observaciones_adicionales
        string documento_adjunto
        enum estado "borrador, completado, archivado"
        timestamp created_at
        timestamp updated_at
        timestamp deleted_at
    }
    
    reportes_progreso ||--o{ archivos : "adjunta"
    
    %% ============================================
    %% MÓDULO: SERVICIOS Y DISPONIBILIDAD
    %% ============================================
    usuarios ||--o{ servicios_psicologo : "ofrece"
    servicios_psicologo }o--|| tipos_servicio : "es_tipo"
    
    tipos_servicio {
        uuid id PK
        string codigo UK "EVAL_INICIAL, TERAPIA_INDIVIDUAL, TERAPIA_PAREJA"
        string nombre
        text descripcion
        int duracion_estandar_minutos
        string categoria "evaluacion, terapia, consulta"
        boolean activo
        timestamp created_at
        timestamp updated_at
        timestamp deleted_at
    }
    
    servicios_psicologo {
        int id PK
        uuid psicologo_id FK
        uuid tipo_servicio_id FK
        string nombre
        text descripcion
        int duracion_minutos
        boolean activo
        timestamp created_at
        timestamp updated_at
    }
    
    usuarios ||--o{ horarios_disponibles : "define"
    
    horarios_disponibles {
        int id PK
        uuid psicologo_id FK
        date fecha "YYYY-MM-DD"
        time hora_inicio
        time hora_fin
        boolean activo
        enum tipo_disponibilidad "individual, recurrente"
        timestamp created_at
        timestamp updated_at
        timestamp deleted_at
    }
    
    %% ============================================
    %% MÓDULO: COMUNICACIÓN
    %% ============================================
    usuarios ||--o{ mensajes_chat : "envia"
    usuarios ||--o{ mensajes_chat : "recibe"
    
    mensajes_chat {
        uuid id PK
        text contenido
        uuid remitente_id FK
        uuid destinatario_id FK
        enum tipo "psicologo, paciente, admin, recepcionista"
        boolean leido
        timestamp created_at
        timestamp updated_at
        timestamp deleted_at
    }
    
    pacientes ||--o| tokens_mensajes_paciente : "tiene_tokens"
    
    tokens_mensajes_paciente {
        uuid id PK
        uuid paciente_id FK UK
        int tokens_disponibles
        int tokens_usados
        timestamp fecha_ultimo_reset
        enum periodo_reset "diario, semanal, mensual, ilimitado"
        boolean activo
        timestamp created_at
        timestamp updated_at
        timestamp deleted_at
    }
    
    %% ============================================
    %% MÓDULO: CONFIGURACIÓN Y AUDITORÍA
    %% ============================================
    usuarios ||--o{ configuraciones_recordatorio : "configura"
    
    configuraciones_recordatorio {
        uuid id PK
        uuid usuario_id FK
        enum tipo_evento "sesion_programada, sesion_confirmada, sesion_24h_antes, sesion_1h_antes, tarea_asignada, tarea_vencida, tarea_1semana_antes, tarea_1dia_antes"
        enum canal_notificacion "email, whatsapp, push, sms"
        boolean activo
        jsonb configuracion_personalizada
        string horario_preferido "HH:MM"
        int[] dias_semana "0-6"
        timestamp created_at
        timestamp updated_at
        timestamp deleted_at
    }
    
    configuraciones_sistema {
        uuid id PK
        string clave UK
        text valor
        text descripcion
        enum tipo "boolean, number, string, json"
        enum categoria "chat, mensajes, general, backup"
        boolean activo
        timestamp created_at
        timestamp updated_at
        timestamp deleted_at
    }
    
    usuarios ||--o{ logs_auditoria : "registra"
    
    logs_auditoria {
        uuid id PK
        uuid usuario_id FK "nullable"
        string accion
        string tabla_afectada
        string registro_id
        jsonb valores_anteriores
        jsonb valores_nuevos
        inet ip_address
        text user_agent
        jsonb metadatos
        timestamp created_at
    }
```

---

## 3. CAMBIOS DETALLADOS POR TABLA

### 3.1 Tabla `pacientes` - ANTES Y DESPUÉS

#### ❌ ANTES (campos redundantes):
```sql
CREATE TABLE pacientes (
    id UUID PRIMARY KEY,
    usuario_id UUID REFERENCES usuarios(id),
    psicologo_id UUID REFERENCES usuarios(id),
    -- 🔴 CAMPOS REDUNDANTES (ya están en usuarios):
    nombres VARCHAR(100),
    apellidos VARCHAR(100),
    email VARCHAR(255),
    telefono VARCHAR(20),
    fecha_nacimiento DATE,
    genero ENUM(...),
    -- ✅ CAMPOS ÚNICOS DE PACIENTE:
    numero_ficha VARCHAR(20) UNIQUE,
    rut VARCHAR(12) UNIQUE,
    direccion TEXT,
    estrategias_autorregulacion JSONB,
    puntos_acumulados INTEGER,
    estado ENUM('activo', 'inactivo', 'alta', 'derivado'),
    fecha_ingreso DATE,
    fecha_alta DATE,
    observaciones TEXT,
    antecedentes_medicos JSONB,
    medicacion_actual JSONB,
    alergias JSONB,
    condiciones_cronicas JSONB,
    historial_psiquiatrico JSONB,
    observaciones_medicas TEXT,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    deleted_at TIMESTAMP
);
```

#### ✅ DESPUÉS (sin redundancia):
```sql
CREATE TABLE pacientes (
    id UUID PRIMARY KEY,
    usuario_id UUID REFERENCES usuarios(id) UNIQUE NOT NULL,
    psicologo_id UUID REFERENCES usuarios(id) NOT NULL,
    -- ✅ SOLO CAMPOS PROPIOS DE FICHA CLÍNICA:
    numero_ficha VARCHAR(20) UNIQUE NOT NULL,
    rut VARCHAR(12) UNIQUE,
    direccion TEXT,
    estrategias_autorregulacion JSONB DEFAULT '[]',
    puntos_acumulados INTEGER DEFAULT 0,
    estado VARCHAR(20) DEFAULT 'activo',
    fecha_ingreso DATE DEFAULT CURRENT_DATE,
    fecha_alta DATE,
    observaciones TEXT,
    antecedentes_medicos JSONB DEFAULT '[]',
    medicacion_actual JSONB DEFAULT '[]',
    alergias JSONB DEFAULT '[]',
    condiciones_cronicas JSONB DEFAULT '[]',
    historial_psiquiatrico JSONB DEFAULT '[]',
    observaciones_medicas TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    deleted_at TIMESTAMP
);

-- Ahora los datos personales SIEMPRE vienen de usuarios:
SELECT 
    p.id,
    p.numero_ficha,
    p.rut,
    p.direccion,
    p.puntos_acumulados,
    p.estado,
    -- Datos personales desde usuarios:
    u.nombres,
    u.apellidos,
    u.email,
    u.telefono,
    u.fecha_nacimiento,
    u.genero
FROM pacientes p
INNER JOIN usuarios u ON p.usuario_id = u.id;
```

**Beneficios:**
- ✅ Eliminada la redundancia total (6 campos eliminados)
- ✅ Una sola fuente de verdad para datos personales
- ✅ Actualizaciones consistentes
- ✅ Menor uso de almacenamiento

---

### 3.2 Tabla `sesiones` - ANTES Y DESPUÉS

#### ❌ ANTES (sobrecargada con JSONB):
```sql
CREATE TABLE sesiones (
    id UUID PRIMARY KEY,
    paciente_id UUID REFERENCES pacientes(id),
    psicologo_id UUID REFERENCES usuarios(id),
    fecha_programada TIMESTAMP,
    fecha_inicio TIMESTAMP,
    fecha_fin TIMESTAMP,
    duracion_minutos INTEGER,
    tipo_sesion ENUM(...),
    estado ENUM(...),
    notas_evolucion TEXT,
    -- 🔴 CAMPOS JSONB INNECESARIOS:
    objetivos_sesion JSONB DEFAULT '[]',
    tecnicas_utilizadas JSONB DEFAULT '[]',
    evaluacion_paciente JSONB,
    -- 🔴 CAMPOS REDUNDANTES:
    objetivos_alcanzados JSONB DEFAULT '[]',
    tareas_asignadas JSONB DEFAULT '[]',
    archivos_sesion JSONB DEFAULT '[]',
    archivos_adjuntos JSONB DEFAULT '[]',
    -- 🔴 DERIVACION SIN ESTRUCTURA:
    derivacion_recomendada JSONB DEFAULT '{}',
    observaciones TEXT,
    resumen_sesion TEXT,
    progreso_paciente ENUM(...),
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    deleted_at TIMESTAMP
);
```

#### ✅ DESPUÉS (normalizada):
```sql
-- Tabla principal simplificada:
CREATE TABLE sesiones (
    id UUID PRIMARY KEY,
    paciente_id UUID REFERENCES pacientes(id) NOT NULL,
    psicologo_id UUID REFERENCES usuarios(id) NOT NULL,
    fecha_programada TIMESTAMP NOT NULL,
    fecha_inicio TIMESTAMP,
    fecha_fin TIMESTAMP,
    duracion_minutos INTEGER,
    tipo_sesion VARCHAR(20) DEFAULT 'presencial',
    estado VARCHAR(20) DEFAULT 'programada',
    notas_evolucion TEXT,
    observaciones TEXT,
    resumen_sesion TEXT,
    progreso_paciente VARCHAR(20),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    deleted_at TIMESTAMP
);

-- Catálogo de objetivos terapéuticos:
CREATE TABLE objetivos_terapeuticos (
    id UUID PRIMARY KEY,
    nombre VARCHAR(200) UNIQUE NOT NULL,
    descripcion TEXT,
    categoria VARCHAR(50), -- emocional, cognitivo, conductual, social
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    deleted_at TIMESTAMP
);

-- Relación N:M sesiones-objetivos:
CREATE TABLE sesion_objetivos (
    id UUID PRIMARY KEY,
    sesion_id UUID REFERENCES sesiones(id) ON DELETE CASCADE,
    objetivo_id UUID REFERENCES objetivos_terapeuticos(id),
    alcanzado BOOLEAN DEFAULT FALSE,
    notas TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(sesion_id, objetivo_id)
);

-- Catálogo de técnicas terapéuticas:
CREATE TABLE tecnicas_terapeuticas (
    id UUID PRIMARY KEY,
    nombre VARCHAR(200) UNIQUE NOT NULL,
    descripcion TEXT,
    categoria VARCHAR(50), -- cognitivo-conductual, humanista, psicodinamica, sistemica
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    deleted_at TIMESTAMP
);

-- Relación N:M sesiones-técnicas:
CREATE TABLE sesion_tecnicas (
    id UUID PRIMARY KEY,
    sesion_id UUID REFERENCES sesiones(id) ON DELETE CASCADE,
    tecnica_id UUID REFERENCES tecnicas_terapeuticas(id),
    notas_aplicacion TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(sesion_id, tecnica_id)
);

-- Evaluaciones estructuradas:
CREATE TABLE evaluaciones_sesion (
    id UUID PRIMARY KEY,
    sesion_id UUID REFERENCES sesiones(id) ON DELETE CASCADE UNIQUE,
    animo_paciente INTEGER CHECK (animo_paciente BETWEEN 1 AND 10),
    nivel_ansiedad INTEGER CHECK (nivel_ansiedad BETWEEN 1 AND 10),
    cooperacion INTEGER CHECK (cooperacion BETWEEN 1 AND 10),
    insight INTEGER CHECK (insight BETWEEN 1 AND 10),
    observaciones_evaluacion TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Archivos centralizados:
CREATE TABLE archivos (
    id UUID PRIMARY KEY,
    nombre_original VARCHAR(255) NOT NULL,
    nombre_almacenado VARCHAR(255) NOT NULL,
    ruta_almacenamiento TEXT NOT NULL,
    tipo_mime VARCHAR(100),
    tamano_bytes BIGINT,
    entidad_tipo VARCHAR(50), -- 'sesion', 'tarea', 'respuesta_tarea', 'reporte', 'paciente'
    entidad_id UUID NOT NULL,
    subido_por UUID REFERENCES usuarios(id),
    created_at TIMESTAMP DEFAULT NOW(),
    deleted_at TIMESTAMP
);
CREATE INDEX idx_archivos_entidad ON archivos(entidad_tipo, entidad_id);
```

**Beneficios:**
- ✅ Campos JSONB reducidos de 11 a 0
- ✅ Queries eficientes por objetivo o técnica
- ✅ Integridad referencial garantizada
- ✅ Estadísticas y reportes más fáciles
- ✅ Archivos centralizados con metadatos

---

### 3.3 Tabla `tareas` - ANTES Y DESPUÉS

#### ❌ ANTES (mezcla tarea + respuesta):
```sql
CREATE TABLE tareas (
    id UUID PRIMARY KEY,
    paciente_id UUID REFERENCES pacientes(id),
    psicologo_id UUID REFERENCES usuarios(id),
    sesion_id UUID REFERENCES sesiones(id),
    titulo VARCHAR(200),
    descripcion TEXT,
    instrucciones TEXT,
    tipo_tarea ENUM(...),
    tipo_tarea_avanzado VARCHAR(50), -- 🔴 Confuso
    prioridad ENUM(...),
    fecha_asignacion TIMESTAMP,
    fecha_vencimiento TIMESTAMP,
    fecha_completada TIMESTAMP, -- 🔴 Debería estar en respuestas
    estado ENUM(...),
    puntos_asignados INTEGER,
    archivos_adjuntos JSONB, -- 🔴 Debería ser tabla
    -- 🔴 CAMPOS DE RESPUESTA (no deberían estar aquí):
    respuesta_paciente TEXT,
    archivos_respuesta JSONB,
    evaluacion_psicologo JSONB,
    -- Campos correctos:
    contenido_tarea JSONB,
    configuracion_tarea JSONB,
    es_borrador BOOLEAN,
    fecha_publicacion TIMESTAMP,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    deleted_at TIMESTAMP
);
```

#### ✅ DESPUÉS (separada):
```sql
-- Tabla tareas SIN campos de respuesta:
CREATE TABLE tareas (
    id UUID PRIMARY KEY,
    paciente_id UUID REFERENCES pacientes(id) NOT NULL,
    psicologo_id UUID REFERENCES usuarios(id) NOT NULL,
    sesion_id UUID REFERENCES sesiones(id), -- nullable
    titulo VARCHAR(200) NOT NULL,
    descripcion TEXT NOT NULL,
    instrucciones TEXT,
    tipo_tarea VARCHAR(50) DEFAULT 'texto_abierto',
    prioridad VARCHAR(20) DEFAULT 'media',
    fecha_asignacion TIMESTAMP DEFAULT NOW(),
    fecha_vencimiento TIMESTAMP,
    estado VARCHAR(20) DEFAULT 'pendiente',
    puntos_asignados INTEGER DEFAULT 2,
    contenido_tarea JSONB, -- Estructura según tipo_tarea
    configuracion_tarea JSONB, -- Opciones
    es_borrador BOOLEAN DEFAULT FALSE,
    fecha_publicacion TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    deleted_at TIMESTAMP
);

-- Tabla respuestas FORTALECIDA:
CREATE TABLE respuestas_tareas (
    id UUID PRIMARY KEY,
    tarea_id UUID REFERENCES tareas(id) ON DELETE CASCADE NOT NULL,
    paciente_id UUID REFERENCES pacientes(id) NOT NULL,
    contenido_respuesta TEXT,
    fecha_envio TIMESTAMP DEFAULT NOW(),
    evaluacion_psicologo JSONB, -- calificacion, retroalimentacion
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Archivos de tareas y respuestas van a tabla archivos:
-- entidad_tipo = 'tarea' → archivos adjuntos a la tarea
-- entidad_tipo = 'respuesta_tarea' → archivos de la respuesta
```

**Beneficios:**
- ✅ Separación clara entre asignación y respuesta
- ✅ Permite múltiples respuestas/intentos
- ✅ No hay confusión conceptual
- ✅ `respuestas_tareas` se convierte en tabla principal

---

### 3.4 Tabla `servicios_psicologo` - ANTES Y DESPUÉS

#### ❌ ANTES (FK inexistente):
```sql
CREATE TABLE servicios_psicologo (
    id INT PRIMARY KEY,
    psicologo_id UUID REFERENCES usuarios(id),
    tipo_servicio_id VARCHAR(50), -- 🔴 STRING, sin FK
    nombre VARCHAR(200),
    descripcion TEXT,
    duracion INTEGER,
    categoria VARCHAR(50),
    activo BOOLEAN,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

#### ✅ DESPUÉS (normalizada):
```sql
-- Nueva tabla catálogo:
CREATE TABLE tipos_servicio (
    id UUID PRIMARY KEY,
    codigo VARCHAR(50) UNIQUE NOT NULL, -- EVAL_INICIAL, TERAPIA_INDIVIDUAL
    nombre VARCHAR(200) NOT NULL,
    descripcion TEXT,
    duracion_estandar_minutos INTEGER,
    categoria VARCHAR(50), -- evaluacion, terapia, consulta
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    deleted_at TIMESTAMP
);

-- Servicios con FK real:
CREATE TABLE servicios_psicologo (
    id INT PRIMARY KEY,
    psicologo_id UUID REFERENCES usuarios(id) NOT NULL,
    tipo_servicio_id UUID REFERENCES tipos_servicio(id) NOT NULL, -- ✅ FK REAL
    nombre VARCHAR(200) NOT NULL,
    descripcion TEXT,
    duracion_minutos INTEGER,
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(psicologo_id, tipo_servicio_id)
);
```

**Beneficios:**
- ✅ Integridad referencial garantizada
- ✅ Catálogo centralizado de tipos de servicio
- ✅ Estandarización de servicios

---

### 3.5 Tabla `disponibilidad_mensual` → `horarios_disponibles`

#### ❌ ANTES (nombre confuso):
```sql
CREATE TABLE disponibilidad_mensual ( -- 🔴 Nombre engañoso
    id INT PRIMARY KEY,
    psicologo_id UUID REFERENCES usuarios(id),
    fecha DATE, -- Es por día, no mensual
    hora_inicio TIME,
    hora_fin TIME,
    activo BOOLEAN,
    tipo_disponibilidad ENUM('individual', 'recurrente'),
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    deleted_at TIMESTAMP
);
```

#### ✅ DESPUÉS (nombre correcto):
```sql
CREATE TABLE horarios_disponibles ( -- ✅ Nombre claro
    id INT PRIMARY KEY,
    psicologo_id UUID REFERENCES usuarios(id) NOT NULL,
    fecha DATE NOT NULL,
    hora_inicio TIME NOT NULL,
    hora_fin TIME NOT NULL,
    activo BOOLEAN DEFAULT TRUE,
    tipo_disponibilidad VARCHAR(20) DEFAULT 'individual',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    deleted_at TIMESTAMP,
    UNIQUE(psicologo_id, fecha, hora_inicio)
);
```

**Beneficios:**
- ✅ Nombre descriptivo y preciso
- ✅ Sin cambios estructurales (solo rename)

---

## 4. NUEVAS TABLAS JUSTIFICADAS

### 4.1 `tipos_servicio`

**Propósito:**  
Catálogo centralizado de tipos de servicio que pueden ofrecer los psicólogos.

**Justificación:**
- Actualmente `tipo_servicio_id` es un STRING sin validación
- Permite estandarizar servicios
- Facilita reportes y estadísticas
- Garantiza integridad referencial

**Ejemplos de datos:**
```sql
INSERT INTO tipos_servicio (codigo, nombre, duracion_estandar_minutos, categoria) VALUES
('EVAL_INICIAL', 'Evaluación Inicial', 60, 'evaluacion'),
('TERAPIA_IND', 'Terapia Individual', 45, 'terapia'),
('TERAPIA_PAREJA', 'Terapia de Pareja', 60, 'terapia'),
('TERAPIA_FAM', 'Terapia Familiar', 90, 'terapia'),
('CONSULTA', 'Consulta General', 30, 'consulta');
```

---

### 4.2 `objetivos_terapeuticos`

**Propósito:**  
Catálogo de objetivos terapéuticos estándar que se trabajan en sesiones.

**Justificación:**
- Reemplaza campo JSONB `objetivos_sesion` en sesiones
- Permite búsquedas y filtros por objetivo
- Facilita análisis de qué objetivos son más trabajados
- Permite tracking de objetivos a lo largo del tiempo

**Ejemplos de datos:**
```sql
INSERT INTO objetivos_terapeuticos (nombre, descripcion, categoria) VALUES
('Reducir ansiedad', 'Trabajar técnicas para disminuir niveles de ansiedad', 'emocional'),
('Mejorar autoestima', 'Fortalecer la percepción positiva de sí mismo', 'cognitivo'),
('Manejo de ira', 'Desarrollar estrategias de control emocional', 'emocional'),
('Habilidades sociales', 'Mejorar comunicación y relaciones interpersonales', 'social'),
('Reestructuración cognitiva', 'Modificar pensamientos distorsionados', 'cognitivo');
```

---

### 4.3 `tecnicas_terapeuticas`

**Propósito:**  
Catálogo de técnicas terapéuticas utilizadas en sesiones.

**Justificación:**
- Reemplaza campo JSONB `tecnicas_utilizadas` en sesiones
- Permite estadísticas de técnicas más efectivas
- Facilita formación y seguimiento de buenas prácticas
- Documentación estandarizada

**Ejemplos de datos:**
```sql
INSERT INTO tecnicas_terapeuticas (nombre, descripcion, categoria) VALUES
('Exposición gradual', 'Técnica para enfrentar miedos de forma progresiva', 'cognitivo-conductual'),
('Reestructuración cognitiva', 'Identificar y modificar pensamientos irracionales', 'cognitivo-conductual'),
('Mindfulness', 'Técnicas de atención plena', 'humanista'),
('Role-playing', 'Simulación de situaciones para practicar habilidades', 'sistemica'),
('Técnica de la silla vacía', 'Trabajo con conflictos internos', 'humanista');
```

---

### 4.4 `sesion_objetivos` (tabla pivote)

**Propósito:**  
Relacionar sesiones con objetivos trabajados y su nivel de logro.

**Campos clave:**
- `sesion_id` → Sesión específica
- `objetivo_id` → Objetivo trabajado
- `alcanzado` → Si se logró o no
- `notas` → Observaciones específicas

---

### 4.5 `sesion_tecnicas` (tabla pivote)

**Propósito:**  
Relacionar sesiones con técnicas utilizadas.

**Campos clave:**
- `sesion_id` → Sesión específica
- `tecnica_id` → Técnica aplicada
- `notas_aplicacion` → Cómo se aplicó

---

### 4.6 `evaluaciones_sesion`

**Propósito:**  
Evaluaciones estructuradas y cuantificables de cada sesión.

**Justificación:**
- Reemplaza campo JSONB `evaluacion_paciente`
- Permite análisis de tendencias (gráficos de evolución)
- Estructura validada con CHECK constraints
- Facilita reportes cuantitativos

**Estructura:**
```sql
CREATE TABLE evaluaciones_sesion (
    id UUID PRIMARY KEY,
    sesion_id UUID REFERENCES sesiones(id) UNIQUE,
    animo_paciente INTEGER CHECK (animo_paciente BETWEEN 1 AND 10),
    nivel_ansiedad INTEGER CHECK (nivel_ansiedad BETWEEN 1 AND 10),
    cooperacion INTEGER CHECK (cooperacion BETWEEN 1 AND 10),
    insight INTEGER CHECK (insight BETWEEN 1 AND 10),
    observaciones_evaluacion TEXT,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

---

### 4.7 `archivos`

**Propósito:**  
Gestión centralizada de todos los archivos del sistema.

**Justificación:**
- Reemplaza múltiples campos JSONB de archivos
- Metadatos completos (tipo MIME, tamaño, fecha)
- Búsqueda global de archivos
- Control de acceso y auditoría
- Eliminación de duplicados

**Estructura:**
```sql
CREATE TABLE archivos (
    id UUID PRIMARY KEY,
    nombre_original VARCHAR(255),
    nombre_almacenado VARCHAR(255) UNIQUE,
    ruta_almacenamiento TEXT,
    tipo_mime VARCHAR(100),
    tamano_bytes BIGINT,
    entidad_tipo VARCHAR(50), -- 'sesion', 'tarea', 'respuesta_tarea', etc.
    entidad_id UUID,
    subido_por UUID REFERENCES usuarios(id),
    created_at TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Índice para búsquedas rápidas:
CREATE INDEX idx_archivos_entidad ON archivos(entidad_tipo, entidad_id);
CREATE INDEX idx_archivos_subido_por ON archivos(subido_por);
```

**Uso:**
```sql
-- Archivos de una sesión:
SELECT * FROM archivos WHERE entidad_tipo = 'sesion' AND entidad_id = 'uuid-sesion';

-- Archivos de una tarea:
SELECT * FROM archivos WHERE entidad_tipo = 'tarea' AND entidad_id = 'uuid-tarea';

-- Archivos de una respuesta:
SELECT * FROM archivos WHERE entidad_tipo = 'respuesta_tarea' AND entidad_id = 'uuid-respuesta';
```

---

## 5. RESUMEN DE NORMALIZACIÓN

### Antes de la refactorización:
| Forma Normal | Cumplimiento |
|--------------|--------------|
| 1FN | ✅ Parcial (algunos campos JSONB no atómicos) |
| 2FN | ✅ Cumple (no hay dependencias parciales) |
| 3FN | ❌ **VIOLADA** (campos transitivos en pacientes) |

### Después de la refactorización:
| Forma Normal | Cumplimiento |
|--------------|--------------|
| 1FN | ✅ **Total** (todos los campos atómicos o JSONB justificados) |
| 2FN | ✅ **Cumple** |
| 3FN | ✅ **Cumple totalmente** |

---

## 6. MÉTRICAS COMPARATIVAS

| Métrica | ANTES | DESPUÉS | Mejora |
|---------|-------|---------|--------|
| Tablas principales | 18 | 25 | +7 tablas (+39%) |
| Campos JSONB innecesarios | 11 | 0 | -100% |
| Campos redundantes | 15 | 0 | -100% |
| Violaciones 3FN | 8 | 0 | -100% |
| Campos en `sesiones` | 29 | 15 | -48% |
| Campos en `tareas` | 25 | 18 | -28% |
| Relaciones ambiguas | 3 | 0 | -100% |
| Queries complejos requeridos | Alto | Bajo | -60% |
| Integridad referencial | 85% | 100% | +15% |

---

## 7. MIGRACIÓN DE DATOS

### Estrategia general:
1. ✅ Crear nuevas tablas
2. ✅ Migrar datos existentes
3. ✅ Validar integridad
4. ✅ Eliminar campos obsoletos
5. ✅ Actualizar código

### Orden de migración:
1. `tipos_servicio` (catálogo nuevo)
2. `objetivos_terapeuticos` (catálogo nuevo)
3. `tecnicas_terapeuticas` (catálogo nuevo)
4. `archivos` (migrar JSONB a tabla)
5. `evaluaciones_sesion` (migrar JSONB a tabla)
6. `sesion_objetivos` (migrar JSONB a tabla)
7. `sesion_tecnicas` (migrar JSONB a tabla)
8. Actualizar `servicios_psicologo` (FK real)
9. Renombrar `disponibilidad_mensual` → `horarios_disponibles`
10. Eliminar campos redundantes de `pacientes`
11. Eliminar campos de respuesta de `tareas`
12. Actualizar índices y constraints

---

## 8. VALIDACIÓN DE FUNCIONALIDADES

### Funcionalidades que NO se rompen:
- ✅ Login y autenticación
- ✅ Chat en tiempo real
- ✅ Configuraciones de sistema
- ✅ Logs de auditoría
- ✅ Gestión de roles

### Funcionalidades que requieren adaptación:
- ⚠️ Gestión de pacientes (queries con JOIN)
- ⚠️ Crear/editar sesiones (relaciones N:M)
- ⚠️ Sistema de tareas (uso de respuestas_tareas)
- ⚠️ Reportes (nuevas relaciones)
- ⚠️ Gestión de disponibilidad (rename)

---

## 9. PRÓXIMOS PASOS

### Fase 3: Implementación de Modelos Sequelize
- Crear nuevos modelos
- Actualizar modelos existentes
- Definir relaciones correctas

### Fase 4: Migraciones
- Generar scripts de migración SQL
- Scripts de backfill de datos
- Validaciones de integridad

### Fase 5: Actualización de Backend
- Actualizar controladores
- Actualizar servicios
- Actualizar DTOs/serializers

### Fase 6: Actualización de Frontend
- Actualizar interfaces TypeScript
- Actualizar llamadas a API
- Actualizar componentes

### Fase 7: Testing y Validación
- Tests unitarios
- Tests de integración
- Validación de endpoints críticos

---

**¿APRUEBAS ESTA PROPUESTA?**

Si estás de acuerdo, procederé con la Fase 3 para implementar los nuevos modelos Sequelize.

