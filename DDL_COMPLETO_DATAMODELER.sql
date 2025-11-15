-- ============================================================================
-- CENTRO TERAPÉUTICO PSYCHE - DDL COMPLETO PARA DATA MODELER
-- Base de Datos Normalizada a 3FN
-- PostgreSQL 14+
-- Fecha: 15 de noviembre de 2025
-- Versión: 2.0 (Reestructuración completa)
-- 
-- CARACTERÍSTICAS:
-- - Foreign Keys explícitas con nombres
-- - Constraints con nombres descriptivos
-- - ON DELETE CASCADE/SET NULL explícitos
-- - Orden de creación correcto (padres primero)
-- - SQL estándar PostgreSQL (compatible con Data Modeler)
-- ============================================================================

-- ============================================================================
-- PASO 1: LIMPIEZA (DROP DE TABLAS EN ORDEN INVERSO)
-- ============================================================================

DROP TABLE IF EXISTS logs_auditoria CASCADE;
DROP TABLE IF EXISTS configuraciones_sistema CASCADE;
DROP TABLE IF EXISTS configuraciones_recordatorio CASCADE;
DROP TABLE IF EXISTS mensajes_chat CASCADE;
DROP TABLE IF EXISTS reportes_progreso CASCADE;
DROP TABLE IF EXISTS archivos CASCADE;
DROP TABLE IF EXISTS respuestas_tareas CASCADE;
DROP TABLE IF EXISTS tareas CASCADE;
DROP TABLE IF EXISTS evaluaciones_sesion CASCADE;
DROP TABLE IF EXISTS sesion_tecnicas CASCADE;
DROP TABLE IF EXISTS sesion_objetivos CASCADE;
DROP TABLE IF EXISTS horarios_disponibles CASCADE;
DROP TABLE IF EXISTS servicios_psicologo CASCADE;
DROP TABLE IF EXISTS sesiones CASCADE;
DROP TABLE IF EXISTS tokens_mensajes_paciente CASCADE;
DROP TABLE IF EXISTS paciente_diagnosticos CASCADE;
DROP TABLE IF EXISTS paciente_etiquetas CASCADE;
DROP TABLE IF EXISTS contactos_emergencia CASCADE;
DROP TABLE IF EXISTS tecnicas_terapeuticas CASCADE;
DROP TABLE IF EXISTS objetivos_terapeuticos CASCADE;
DROP TABLE IF EXISTS tipos_servicio CASCADE;
DROP TABLE IF EXISTS diagnosticos CASCADE;
DROP TABLE IF EXISTS etiquetas CASCADE;
DROP TABLE IF EXISTS pacientes CASCADE;
DROP TABLE IF EXISTS usuarios CASCADE;
DROP TABLE IF EXISTS roles CASCADE;

-- ============================================================================
-- PASO 2: HABILITAR EXTENSIONES
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- PASO 3: CREACIÓN DE TABLAS (EN ORDEN DE DEPENDENCIAS)
-- ============================================================================

-- ----------------------------------------------------------------------------
-- TABLA 1: roles (SIN DEPENDENCIAS)
-- ----------------------------------------------------------------------------
CREATE TABLE roles (
    id SERIAL,
    nombre VARCHAR(50) NOT NULL,
    descripcion TEXT,
    permisos JSONB NOT NULL DEFAULT '[]',
    activo BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    
    CONSTRAINT pk_roles PRIMARY KEY (id),
    CONSTRAINT uq_roles_nombre UNIQUE (nombre)
);

COMMENT ON TABLE roles IS 'Roles del sistema: admin, psicologo, recepcionista, paciente';
COMMENT ON COLUMN roles.permisos IS 'Permisos del rol en formato JSON';

-- ----------------------------------------------------------------------------
-- TABLA 2: usuarios (DEPENDE DE: roles)
-- ----------------------------------------------------------------------------
CREATE TABLE usuarios (
    id UUID DEFAULT gen_random_uuid(),
    rol_id INTEGER NOT NULL,
    email VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    nombres VARCHAR(100) NOT NULL,
    apellidos VARCHAR(100) NOT NULL,
    telefono VARCHAR(20),
    fecha_nacimiento DATE,
    genero VARCHAR(30),
    avatar_url VARCHAR(500),
    especialidad TEXT,
    descripcion TEXT,
    codigo_sbs VARCHAR(50),
    activo BOOLEAN NOT NULL DEFAULT true,
    email_verificado BOOLEAN NOT NULL DEFAULT false,
    token_activacion VARCHAR(255),
    token_activacion_expira TIMESTAMP,
    ultimo_acceso TIMESTAMP,
    configuracion JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    
    CONSTRAINT pk_usuarios PRIMARY KEY (id),
    CONSTRAINT uq_usuarios_email UNIQUE (email),
    CONSTRAINT ck_usuarios_genero CHECK (genero IN ('masculino', 'femenino', 'otro', 'prefiero_no_decir'))
);

COMMENT ON TABLE usuarios IS 'Usuarios del sistema (todos los roles)';
COMMENT ON COLUMN usuarios.especialidad IS 'Solo para psicólogos';
COMMENT ON COLUMN usuarios.codigo_sbs IS 'Código SBS - Solo para psicólogos';

-- ----------------------------------------------------------------------------
-- TABLA 3: etiquetas (SIN DEPENDENCIAS)
-- ----------------------------------------------------------------------------
CREATE TABLE etiquetas (
    id UUID DEFAULT gen_random_uuid(),
    nombre VARCHAR(100) NOT NULL,
    color VARCHAR(20),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    
    CONSTRAINT pk_etiquetas PRIMARY KEY (id),
    CONSTRAINT uq_etiquetas_nombre UNIQUE (nombre)
);

COMMENT ON TABLE etiquetas IS 'Etiquetas para categorizar pacientes';

-- ----------------------------------------------------------------------------
-- TABLA 4: diagnosticos (SIN DEPENDENCIAS)
-- ----------------------------------------------------------------------------
CREATE TABLE diagnosticos (
    id UUID DEFAULT gen_random_uuid(),
    codigo VARCHAR(50),
    nombre VARCHAR(200) NOT NULL,
    descripcion TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    
    CONSTRAINT pk_diagnosticos PRIMARY KEY (id)
);

COMMENT ON TABLE diagnosticos IS 'Catálogo de diagnósticos (CIE-10, DSM-5)';
COMMENT ON COLUMN diagnosticos.codigo IS 'Código CIE-10 o DSM-5';

-- ----------------------------------------------------------------------------
-- TABLA 5: tipos_servicio (SIN DEPENDENCIAS)
-- ----------------------------------------------------------------------------
CREATE TABLE tipos_servicio (
    id UUID DEFAULT gen_random_uuid(),
    codigo VARCHAR(50) NOT NULL,
    nombre VARCHAR(200) NOT NULL,
    descripcion TEXT,
    duracion_estandar_minutos INTEGER NOT NULL,
    categoria VARCHAR(20) NOT NULL,
    activo BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    
    CONSTRAINT pk_tipos_servicio PRIMARY KEY (id),
    CONSTRAINT uq_tipos_servicio_codigo UNIQUE (codigo),
    CONSTRAINT ck_tipos_servicio_categoria CHECK (categoria IN ('evaluacion', 'terapia', 'consulta'))
);

COMMENT ON TABLE tipos_servicio IS 'Catálogo de tipos de servicio';

-- ----------------------------------------------------------------------------
-- TABLA 6: objetivos_terapeuticos (SIN DEPENDENCIAS)
-- ----------------------------------------------------------------------------
CREATE TABLE objetivos_terapeuticos (
    id UUID DEFAULT gen_random_uuid(),
    nombre VARCHAR(200) NOT NULL,
    descripcion TEXT,
    categoria VARCHAR(50) NOT NULL,
    activo BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    
    CONSTRAINT pk_objetivos_terapeuticos PRIMARY KEY (id),
    CONSTRAINT uq_objetivos_terapeuticos_nombre UNIQUE (nombre),
    CONSTRAINT ck_objetivos_terapeuticos_categoria CHECK (categoria IN ('emocional', 'cognitivo', 'conductual', 'social'))
);

COMMENT ON TABLE objetivos_terapeuticos IS 'Catálogo de objetivos terapéuticos';

-- ----------------------------------------------------------------------------
-- TABLA 7: tecnicas_terapeuticas (SIN DEPENDENCIAS)
-- ----------------------------------------------------------------------------
CREATE TABLE tecnicas_terapeuticas (
    id UUID DEFAULT gen_random_uuid(),
    nombre VARCHAR(200) NOT NULL,
    descripcion TEXT,
    categoria VARCHAR(50) NOT NULL,
    activo BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    
    CONSTRAINT pk_tecnicas_terapeuticas PRIMARY KEY (id),
    CONSTRAINT uq_tecnicas_terapeuticas_nombre UNIQUE (nombre),
    CONSTRAINT ck_tecnicas_terapeuticas_categoria CHECK (categoria IN ('cognitivo-conductual', 'humanista', 'psicodinamica', 'sistemica'))
);

COMMENT ON TABLE tecnicas_terapeuticas IS 'Catálogo de técnicas terapéuticas';

-- ----------------------------------------------------------------------------
-- TABLA 8: pacientes (DEPENDE DE: usuarios)
-- ----------------------------------------------------------------------------
CREATE TABLE pacientes (
    id UUID DEFAULT gen_random_uuid(),
    usuario_id UUID NOT NULL,
    psicologo_id UUID NOT NULL,
    numero_ficha VARCHAR(20) NOT NULL,
    rut VARCHAR(12),
    direccion TEXT,
    estrategias_autorregulacion JSONB NOT NULL DEFAULT '[]',
    puntos_acumulados INTEGER NOT NULL DEFAULT 0,
    estado VARCHAR(20) NOT NULL DEFAULT 'activo',
    fecha_ingreso DATE NOT NULL DEFAULT CURRENT_DATE,
    fecha_alta DATE,
    observaciones TEXT,
    antecedentes_medicos JSONB NOT NULL DEFAULT '[]',
    medicacion_actual JSONB NOT NULL DEFAULT '[]',
    alergias JSONB NOT NULL DEFAULT '[]',
    condiciones_cronicas JSONB NOT NULL DEFAULT '[]',
    historial_psiquiatrico JSONB NOT NULL DEFAULT '[]',
    observaciones_medicas TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    
    CONSTRAINT pk_pacientes PRIMARY KEY (id),
    CONSTRAINT uq_pacientes_usuario_id UNIQUE (usuario_id),
    CONSTRAINT uq_pacientes_numero_ficha UNIQUE (numero_ficha),
    CONSTRAINT uq_pacientes_rut UNIQUE (rut),
    CONSTRAINT ck_pacientes_estado CHECK (estado IN ('activo', 'inactivo', 'alta', 'derivado'))
);

COMMENT ON TABLE pacientes IS 'Ficha clínica de pacientes (datos personales en tabla usuarios)';
COMMENT ON COLUMN pacientes.usuario_id IS 'Usuario asociado (1:1) - nombres, apellidos, email vienen de usuarios';

-- ----------------------------------------------------------------------------
-- TABLA 9: contactos_emergencia (DEPENDE DE: pacientes)
-- ----------------------------------------------------------------------------
CREATE TABLE contactos_emergencia (
    id UUID DEFAULT gen_random_uuid(),
    paciente_id UUID NOT NULL,
    nombre VARCHAR(200) NOT NULL,
    telefono VARCHAR(20),
    relacion VARCHAR(50),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    
    CONSTRAINT pk_contactos_emergencia PRIMARY KEY (id)
);

COMMENT ON TABLE contactos_emergencia IS 'Contactos de emergencia de pacientes (1:N)';

-- ----------------------------------------------------------------------------
-- TABLA 10: paciente_etiquetas (DEPENDE DE: pacientes, etiquetas)
-- ----------------------------------------------------------------------------
CREATE TABLE paciente_etiquetas (
    paciente_id UUID NOT NULL,
    etiqueta_id UUID NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT pk_paciente_etiquetas PRIMARY KEY (paciente_id, etiqueta_id)
);

COMMENT ON TABLE paciente_etiquetas IS 'Relación N:M entre pacientes y etiquetas';

-- ----------------------------------------------------------------------------
-- TABLA 11: paciente_diagnosticos (DEPENDE DE: pacientes, diagnosticos)
-- ----------------------------------------------------------------------------
CREATE TABLE paciente_diagnosticos (
    paciente_id UUID NOT NULL,
    diagnostico_id UUID NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT pk_paciente_diagnosticos PRIMARY KEY (paciente_id, diagnostico_id)
);

COMMENT ON TABLE paciente_diagnosticos IS 'Relación N:M entre pacientes y diagnósticos';

-- ----------------------------------------------------------------------------
-- TABLA 12: tokens_mensajes_paciente (DEPENDE DE: pacientes)
-- ----------------------------------------------------------------------------
CREATE TABLE tokens_mensajes_paciente (
    id UUID DEFAULT gen_random_uuid(),
    paciente_id UUID NOT NULL,
    tokens_disponibles INTEGER NOT NULL DEFAULT 0,
    tokens_usados INTEGER NOT NULL DEFAULT 0,
    fecha_ultimo_reset TIMESTAMP,
    periodo_reset VARCHAR(20) NOT NULL DEFAULT 'ilimitado',
    activo BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    
    CONSTRAINT pk_tokens_mensajes_paciente PRIMARY KEY (id),
    CONSTRAINT uq_tokens_mensajes_paciente_id UNIQUE (paciente_id),
    CONSTRAINT ck_tokens_mensajes_periodo_reset CHECK (periodo_reset IN ('diario', 'semanal', 'mensual', 'ilimitado'))
);

COMMENT ON TABLE tokens_mensajes_paciente IS 'Control de tokens de mensajes por paciente (1:1)';

-- ----------------------------------------------------------------------------
-- TABLA 13: sesiones (DEPENDE DE: pacientes, usuarios)
-- ----------------------------------------------------------------------------
CREATE TABLE sesiones (
    id UUID DEFAULT gen_random_uuid(),
    paciente_id UUID NOT NULL,
    psicologo_id UUID NOT NULL,
    fecha_programada TIMESTAMP NOT NULL,
    fecha_inicio TIMESTAMP,
    fecha_fin TIMESTAMP,
    duracion_minutos INTEGER,
    tipo_sesion VARCHAR(20) NOT NULL DEFAULT 'presencial',
    estado VARCHAR(20) NOT NULL DEFAULT 'programada',
    notas_evolucion TEXT,
    observaciones TEXT,
    resumen_sesion TEXT,
    progreso_paciente VARCHAR(20),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    
    CONSTRAINT pk_sesiones PRIMARY KEY (id),
    CONSTRAINT ck_sesiones_tipo_sesion CHECK (tipo_sesion IN ('presencial', 'virtual', 'telefonica')),
    CONSTRAINT ck_sesiones_estado CHECK (estado IN ('programada', 'confirmada', 'en_curso', 'completada', 'cancelada', 'no_asistio')),
    CONSTRAINT ck_sesiones_progreso_paciente CHECK (progreso_paciente IN ('excelente', 'bueno', 'regular', 'necesita_mejora'))
);

COMMENT ON TABLE sesiones IS 'Sesiones terapéuticas (campos JSONB normalizados a tablas relacionadas)';

-- ----------------------------------------------------------------------------
-- TABLA 14: servicios_psicologo (DEPENDE DE: usuarios, tipos_servicio)
-- ----------------------------------------------------------------------------
CREATE TABLE servicios_psicologo (
    id SERIAL,
    psicologo_id UUID NOT NULL,
    tipo_servicio_id UUID NOT NULL,
    nombre VARCHAR(200) NOT NULL,
    descripcion TEXT NOT NULL,
    duracion_minutos INTEGER NOT NULL,
    activo BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT pk_servicios_psicologo PRIMARY KEY (id),
    CONSTRAINT uq_servicios_psicologo_psicologo_tipo UNIQUE (psicologo_id, tipo_servicio_id)
);

COMMENT ON TABLE servicios_psicologo IS 'Servicios ofrecidos por psicólogos (FK real a tipos_servicio)';

-- ----------------------------------------------------------------------------
-- TABLA 15: horarios_disponibles (DEPENDE DE: usuarios)
-- ----------------------------------------------------------------------------
CREATE TABLE horarios_disponibles (
    id SERIAL,
    psicologo_id UUID NOT NULL,
    fecha DATE NOT NULL,
    hora_inicio TIME NOT NULL,
    hora_fin TIME NOT NULL,
    activo BOOLEAN NOT NULL DEFAULT true,
    tipo_disponibilidad VARCHAR(20) NOT NULL DEFAULT 'individual',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    
    CONSTRAINT pk_horarios_disponibles PRIMARY KEY (id),
    CONSTRAINT uq_horarios_disponibles_psicologo_fecha_hora UNIQUE (psicologo_id, fecha, hora_inicio),
    CONSTRAINT ck_horarios_disponibles_tipo CHECK (tipo_disponibilidad IN ('individual', 'recurrente'))
);

COMMENT ON TABLE horarios_disponibles IS 'Horarios disponibles de psicólogos (antes: disponibilidad_mensual)';

-- ----------------------------------------------------------------------------
-- TABLA 16: sesion_objetivos (DEPENDE DE: sesiones, objetivos_terapeuticos)
-- ----------------------------------------------------------------------------
CREATE TABLE sesion_objetivos (
    id UUID DEFAULT gen_random_uuid(),
    sesion_id UUID NOT NULL,
    objetivo_id UUID NOT NULL,
    alcanzado BOOLEAN NOT NULL DEFAULT false,
    notas TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT pk_sesion_objetivos PRIMARY KEY (id),
    CONSTRAINT uq_sesion_objetivos_sesion_objetivo UNIQUE (sesion_id, objetivo_id)
);

COMMENT ON TABLE sesion_objetivos IS 'Relación N:M entre sesiones y objetivos terapéuticos';

-- ----------------------------------------------------------------------------
-- TABLA 17: sesion_tecnicas (DEPENDE DE: sesiones, tecnicas_terapeuticas)
-- ----------------------------------------------------------------------------
CREATE TABLE sesion_tecnicas (
    id UUID DEFAULT gen_random_uuid(),
    sesion_id UUID NOT NULL,
    tecnica_id UUID NOT NULL,
    notas_aplicacion TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT pk_sesion_tecnicas PRIMARY KEY (id),
    CONSTRAINT uq_sesion_tecnicas_sesion_tecnica UNIQUE (sesion_id, tecnica_id)
);

COMMENT ON TABLE sesion_tecnicas IS 'Relación N:M entre sesiones y técnicas terapéuticas';

-- ----------------------------------------------------------------------------
-- TABLA 18: evaluaciones_sesion (DEPENDE DE: sesiones)
-- ----------------------------------------------------------------------------
CREATE TABLE evaluaciones_sesion (
    id UUID DEFAULT gen_random_uuid(),
    sesion_id UUID NOT NULL,
    animo_paciente INTEGER,
    nivel_ansiedad INTEGER,
    cooperacion INTEGER,
    insight INTEGER,
    observaciones_evaluacion TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT pk_evaluaciones_sesion PRIMARY KEY (id),
    CONSTRAINT uq_evaluaciones_sesion_sesion_id UNIQUE (sesion_id),
    CONSTRAINT ck_evaluaciones_sesion_animo_paciente CHECK (animo_paciente BETWEEN 1 AND 10),
    CONSTRAINT ck_evaluaciones_sesion_nivel_ansiedad CHECK (nivel_ansiedad BETWEEN 1 AND 10),
    CONSTRAINT ck_evaluaciones_sesion_cooperacion CHECK (cooperacion BETWEEN 1 AND 10),
    CONSTRAINT ck_evaluaciones_sesion_insight CHECK (insight BETWEEN 1 AND 10)
);

COMMENT ON TABLE evaluaciones_sesion IS 'Evaluaciones estructuradas de sesiones (1:1)';

-- ----------------------------------------------------------------------------
-- TABLA 19: tareas (DEPENDE DE: pacientes, usuarios, sesiones)
-- ----------------------------------------------------------------------------
CREATE TABLE tareas (
    id UUID DEFAULT gen_random_uuid(),
    paciente_id UUID NOT NULL,
    psicologo_id UUID NOT NULL,
    sesion_id UUID,
    titulo VARCHAR(200) NOT NULL,
    descripcion TEXT NOT NULL,
    instrucciones TEXT,
    tipo_tarea VARCHAR(50) NOT NULL DEFAULT 'texto_abierto',
    prioridad VARCHAR(20) NOT NULL DEFAULT 'media',
    fecha_asignacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_vencimiento TIMESTAMP,
    estado VARCHAR(20) NOT NULL DEFAULT 'pendiente',
    puntos_asignados INTEGER NOT NULL DEFAULT 2,
    contenido_tarea JSONB,
    configuracion_tarea JSONB,
    es_borrador BOOLEAN NOT NULL DEFAULT false,
    fecha_publicacion TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    
    CONSTRAINT pk_tareas PRIMARY KEY (id),
    CONSTRAINT ck_tareas_tipo_tarea CHECK (tipo_tarea IN ('texto_abierto', 'opcion_multiple', 'test_psicologico', 'test_imagenes', 'tarea_dibujo', 'ejercicio', 'lectura', 'reflexion', 'practica', 'evaluacion')),
    CONSTRAINT ck_tareas_prioridad CHECK (prioridad IN ('baja', 'media', 'alta', 'urgente')),
    CONSTRAINT ck_tareas_estado CHECK (estado IN ('pendiente', 'en_progreso', 'completada', 'vencida', 'cancelada'))
);

COMMENT ON TABLE tareas IS 'Tareas asignadas a pacientes (respuestas en tabla separada)';

-- ----------------------------------------------------------------------------
-- TABLA 20: respuestas_tareas (DEPENDE DE: tareas, pacientes)
-- ----------------------------------------------------------------------------
CREATE TABLE respuestas_tareas (
    id UUID DEFAULT gen_random_uuid(),
    tarea_id UUID NOT NULL,
    paciente_id UUID NOT NULL,
    contenido_respuesta TEXT,
    fecha_envio TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    evaluacion_psicologo JSONB,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT pk_respuestas_tareas PRIMARY KEY (id)
);

COMMENT ON TABLE respuestas_tareas IS 'Respuestas de pacientes a tareas (1:N permite múltiples intentos)';

-- ----------------------------------------------------------------------------
-- TABLA 21: archivos (DEPENDE DE: usuarios)
-- ----------------------------------------------------------------------------
CREATE TABLE archivos (
    id UUID DEFAULT gen_random_uuid(),
    nombre_original VARCHAR(255) NOT NULL,
    nombre_almacenado VARCHAR(255) NOT NULL,
    ruta_almacenamiento TEXT NOT NULL,
    tipo_mime VARCHAR(100),
    tamano_bytes BIGINT,
    entidad_tipo VARCHAR(50) NOT NULL,
    entidad_id UUID NOT NULL,
    subido_por UUID,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    
    CONSTRAINT pk_archivos PRIMARY KEY (id),
    CONSTRAINT uq_archivos_nombre_almacenado UNIQUE (nombre_almacenado),
    CONSTRAINT ck_archivos_entidad_tipo CHECK (entidad_tipo IN ('sesion', 'tarea', 'respuesta_tarea', 'reporte', 'paciente'))
);

COMMENT ON TABLE archivos IS 'Gestión centralizada de archivos del sistema';

-- ----------------------------------------------------------------------------
-- TABLA 22: reportes_progreso (DEPENDE DE: pacientes, usuarios, sesiones)
-- ----------------------------------------------------------------------------
CREATE TABLE reportes_progreso (
    id UUID DEFAULT gen_random_uuid(),
    paciente_id UUID NOT NULL,
    psicologo_id UUID NOT NULL,
    sesion_id UUID,
    fecha_reporte TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    periodo_inicio DATE NOT NULL,
    periodo_fin DATE NOT NULL,
    resumen_evolucion TEXT NOT NULL,
    objetivos_cumplidos JSONB NOT NULL DEFAULT '[]',
    objetivos_pendientes JSONB NOT NULL DEFAULT '[]',
    areas_trabajadas JSONB NOT NULL DEFAULT '[]',
    conductas_observadas JSONB NOT NULL DEFAULT '[]',
    logros_importantes JSONB NOT NULL DEFAULT '[]',
    desafios_identificados JSONB NOT NULL DEFAULT '[]',
    sugerencias_terapeuticas TEXT NOT NULL,
    progreso_general VARCHAR(30) NOT NULL,
    metrica_satisfaccion INTEGER,
    observaciones_adicionales TEXT,
    documento_adjunto VARCHAR(255),
    estado VARCHAR(20) NOT NULL DEFAULT 'borrador',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    
    CONSTRAINT pk_reportes_progreso PRIMARY KEY (id),
    CONSTRAINT ck_reportes_progreso_progreso_general CHECK (progreso_general IN ('excelente', 'muy_bueno', 'bueno', 'regular', 'necesita_atencion')),
    CONSTRAINT ck_reportes_progreso_metrica_satisfaccion CHECK (metrica_satisfaccion BETWEEN 0 AND 10),
    CONSTRAINT ck_reportes_progreso_estado CHECK (estado IN ('borrador', 'completado', 'archivado'))
);

COMMENT ON TABLE reportes_progreso IS 'Reportes de progreso del paciente';

-- ----------------------------------------------------------------------------
-- TABLA 23: mensajes_chat (DEPENDE DE: usuarios)
-- ----------------------------------------------------------------------------
CREATE TABLE mensajes_chat (
    id UUID DEFAULT gen_random_uuid(),
    contenido TEXT NOT NULL,
    remitente_id UUID NOT NULL,
    destinatario_id UUID NOT NULL,
    tipo VARCHAR(20) NOT NULL,
    leido BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    
    CONSTRAINT pk_mensajes_chat PRIMARY KEY (id),
    CONSTRAINT ck_mensajes_chat_tipo CHECK (tipo IN ('psicologo', 'paciente', 'admin', 'recepcionista'))
);

COMMENT ON TABLE mensajes_chat IS 'Mensajes del chat en tiempo real';

-- ----------------------------------------------------------------------------
-- TABLA 24: configuraciones_recordatorio (DEPENDE DE: usuarios)
-- ----------------------------------------------------------------------------
CREATE TABLE configuraciones_recordatorio (
    id UUID DEFAULT gen_random_uuid(),
    usuario_id UUID NOT NULL,
    tipo_evento VARCHAR(50) NOT NULL,
    canal_notificacion VARCHAR(20) NOT NULL,
    activo BOOLEAN NOT NULL DEFAULT true,
    configuracion_personalizada JSONB DEFAULT '{}',
    horario_preferido VARCHAR(5),
    dias_semana INTEGER[] DEFAULT ARRAY[1, 2, 3, 4, 5],
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    
    CONSTRAINT pk_configuraciones_recordatorio PRIMARY KEY (id),
    CONSTRAINT ck_configuraciones_recordatorio_tipo_evento CHECK (tipo_evento IN ('sesion_programada', 'sesion_confirmada', 'sesion_24h_antes', 'sesion_1h_antes', 'tarea_asignada', 'tarea_vencida', 'tarea_1semana_antes', 'tarea_1dia_antes')),
    CONSTRAINT ck_configuraciones_recordatorio_canal CHECK (canal_notificacion IN ('email', 'whatsapp', 'push', 'sms'))
);

COMMENT ON TABLE configuraciones_recordatorio IS 'Configuraciones de recordatorios por usuario';

-- ----------------------------------------------------------------------------
-- TABLA 25: configuraciones_sistema (SIN DEPENDENCIAS)
-- ----------------------------------------------------------------------------
CREATE TABLE configuraciones_sistema (
    id UUID DEFAULT gen_random_uuid(),
    clave VARCHAR(100) NOT NULL,
    valor TEXT NOT NULL,
    descripcion TEXT,
    tipo VARCHAR(20) NOT NULL DEFAULT 'string',
    categoria VARCHAR(20) NOT NULL DEFAULT 'general',
    activo BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    
    CONSTRAINT pk_configuraciones_sistema PRIMARY KEY (id),
    CONSTRAINT uq_configuraciones_sistema_clave UNIQUE (clave),
    CONSTRAINT ck_configuraciones_sistema_tipo CHECK (tipo IN ('boolean', 'number', 'string', 'json')),
    CONSTRAINT ck_configuraciones_sistema_categoria CHECK (categoria IN ('chat', 'mensajes', 'general', 'backup'))
);

COMMENT ON TABLE configuraciones_sistema IS 'Configuraciones globales del sistema';

-- ----------------------------------------------------------------------------
-- TABLA 26: logs_auditoria (DEPENDE DE: usuarios - OPCIONAL)
-- ----------------------------------------------------------------------------
CREATE TABLE logs_auditoria (
    id UUID DEFAULT gen_random_uuid(),
    usuario_id UUID,
    accion VARCHAR(100) NOT NULL,
    tabla_afectada VARCHAR(50),
    registro_id VARCHAR(100),
    valores_anteriores JSONB,
    valores_nuevos JSONB,
    ip_address INET,
    user_agent TEXT,
    metadatos JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT pk_logs_auditoria PRIMARY KEY (id)
);

COMMENT ON TABLE logs_auditoria IS 'Logs de auditoría del sistema';

-- ============================================================================
-- PASO 4: AGREGAR FOREIGN KEYS (CONSTRAINTS EXPLÍCITOS)
-- ============================================================================

-- ----------------------------------------------------------------------------
-- FOREIGN KEYS DE: usuarios
-- ----------------------------------------------------------------------------
ALTER TABLE usuarios
    ADD CONSTRAINT fk_usuarios_rol_id
    FOREIGN KEY (rol_id)
    REFERENCES roles(id)
    ON DELETE RESTRICT;

-- ----------------------------------------------------------------------------
-- FOREIGN KEYS DE: pacientes
-- ----------------------------------------------------------------------------
ALTER TABLE pacientes
    ADD CONSTRAINT fk_pacientes_usuario_id
    FOREIGN KEY (usuario_id)
    REFERENCES usuarios(id)
    ON DELETE CASCADE;

ALTER TABLE pacientes
    ADD CONSTRAINT fk_pacientes_psicologo_id
    FOREIGN KEY (psicologo_id)
    REFERENCES usuarios(id)
    ON DELETE RESTRICT;

-- ----------------------------------------------------------------------------
-- FOREIGN KEYS DE: contactos_emergencia
-- ----------------------------------------------------------------------------
ALTER TABLE contactos_emergencia
    ADD CONSTRAINT fk_contactos_emergencia_paciente_id
    FOREIGN KEY (paciente_id)
    REFERENCES pacientes(id)
    ON DELETE CASCADE;

-- ----------------------------------------------------------------------------
-- FOREIGN KEYS DE: paciente_etiquetas
-- ----------------------------------------------------------------------------
ALTER TABLE paciente_etiquetas
    ADD CONSTRAINT fk_paciente_etiquetas_paciente_id
    FOREIGN KEY (paciente_id)
    REFERENCES pacientes(id)
    ON DELETE CASCADE;

ALTER TABLE paciente_etiquetas
    ADD CONSTRAINT fk_paciente_etiquetas_etiqueta_id
    FOREIGN KEY (etiqueta_id)
    REFERENCES etiquetas(id)
    ON DELETE CASCADE;

-- ----------------------------------------------------------------------------
-- FOREIGN KEYS DE: paciente_diagnosticos
-- ----------------------------------------------------------------------------
ALTER TABLE paciente_diagnosticos
    ADD CONSTRAINT fk_paciente_diagnosticos_paciente_id
    FOREIGN KEY (paciente_id)
    REFERENCES pacientes(id)
    ON DELETE CASCADE;

ALTER TABLE paciente_diagnosticos
    ADD CONSTRAINT fk_paciente_diagnosticos_diagnostico_id
    FOREIGN KEY (diagnostico_id)
    REFERENCES diagnosticos(id)
    ON DELETE CASCADE;

-- ----------------------------------------------------------------------------
-- FOREIGN KEYS DE: tokens_mensajes_paciente
-- ----------------------------------------------------------------------------
ALTER TABLE tokens_mensajes_paciente
    ADD CONSTRAINT fk_tokens_mensajes_paciente_paciente_id
    FOREIGN KEY (paciente_id)
    REFERENCES pacientes(id)
    ON DELETE CASCADE;

-- ----------------------------------------------------------------------------
-- FOREIGN KEYS DE: sesiones
-- ----------------------------------------------------------------------------
ALTER TABLE sesiones
    ADD CONSTRAINT fk_sesiones_paciente_id
    FOREIGN KEY (paciente_id)
    REFERENCES pacientes(id)
    ON DELETE CASCADE;

ALTER TABLE sesiones
    ADD CONSTRAINT fk_sesiones_psicologo_id
    FOREIGN KEY (psicologo_id)
    REFERENCES usuarios(id)
    ON DELETE RESTRICT;

-- ----------------------------------------------------------------------------
-- FOREIGN KEYS DE: servicios_psicologo
-- ----------------------------------------------------------------------------
ALTER TABLE servicios_psicologo
    ADD CONSTRAINT fk_servicios_psicologo_psicologo_id
    FOREIGN KEY (psicologo_id)
    REFERENCES usuarios(id)
    ON DELETE CASCADE;

ALTER TABLE servicios_psicologo
    ADD CONSTRAINT fk_servicios_psicologo_tipo_servicio_id
    FOREIGN KEY (tipo_servicio_id)
    REFERENCES tipos_servicio(id)
    ON DELETE RESTRICT;

-- ----------------------------------------------------------------------------
-- FOREIGN KEYS DE: horarios_disponibles
-- ----------------------------------------------------------------------------
ALTER TABLE horarios_disponibles
    ADD CONSTRAINT fk_horarios_disponibles_psicologo_id
    FOREIGN KEY (psicologo_id)
    REFERENCES usuarios(id)
    ON DELETE CASCADE;

-- ----------------------------------------------------------------------------
-- FOREIGN KEYS DE: sesion_objetivos
-- ----------------------------------------------------------------------------
ALTER TABLE sesion_objetivos
    ADD CONSTRAINT fk_sesion_objetivos_sesion_id
    FOREIGN KEY (sesion_id)
    REFERENCES sesiones(id)
    ON DELETE CASCADE;

ALTER TABLE sesion_objetivos
    ADD CONSTRAINT fk_sesion_objetivos_objetivo_id
    FOREIGN KEY (objetivo_id)
    REFERENCES objetivos_terapeuticos(id)
    ON DELETE RESTRICT;

-- ----------------------------------------------------------------------------
-- FOREIGN KEYS DE: sesion_tecnicas
-- ----------------------------------------------------------------------------
ALTER TABLE sesion_tecnicas
    ADD CONSTRAINT fk_sesion_tecnicas_sesion_id
    FOREIGN KEY (sesion_id)
    REFERENCES sesiones(id)
    ON DELETE CASCADE;

ALTER TABLE sesion_tecnicas
    ADD CONSTRAINT fk_sesion_tecnicas_tecnica_id
    FOREIGN KEY (tecnica_id)
    REFERENCES tecnicas_terapeuticas(id)
    ON DELETE RESTRICT;

-- ----------------------------------------------------------------------------
-- FOREIGN KEYS DE: evaluaciones_sesion
-- ----------------------------------------------------------------------------
ALTER TABLE evaluaciones_sesion
    ADD CONSTRAINT fk_evaluaciones_sesion_sesion_id
    FOREIGN KEY (sesion_id)
    REFERENCES sesiones(id)
    ON DELETE CASCADE;

-- ----------------------------------------------------------------------------
-- FOREIGN KEYS DE: tareas
-- ----------------------------------------------------------------------------
ALTER TABLE tareas
    ADD CONSTRAINT fk_tareas_paciente_id
    FOREIGN KEY (paciente_id)
    REFERENCES pacientes(id)
    ON DELETE CASCADE;

ALTER TABLE tareas
    ADD CONSTRAINT fk_tareas_psicologo_id
    FOREIGN KEY (psicologo_id)
    REFERENCES usuarios(id)
    ON DELETE RESTRICT;

ALTER TABLE tareas
    ADD CONSTRAINT fk_tareas_sesion_id
    FOREIGN KEY (sesion_id)
    REFERENCES sesiones(id)
    ON DELETE SET NULL;

-- ----------------------------------------------------------------------------
-- FOREIGN KEYS DE: respuestas_tareas
-- ----------------------------------------------------------------------------
ALTER TABLE respuestas_tareas
    ADD CONSTRAINT fk_respuestas_tareas_tarea_id
    FOREIGN KEY (tarea_id)
    REFERENCES tareas(id)
    ON DELETE CASCADE;

ALTER TABLE respuestas_tareas
    ADD CONSTRAINT fk_respuestas_tareas_paciente_id
    FOREIGN KEY (paciente_id)
    REFERENCES pacientes(id)
    ON DELETE CASCADE;

-- ----------------------------------------------------------------------------
-- FOREIGN KEYS DE: archivos
-- ----------------------------------------------------------------------------
ALTER TABLE archivos
    ADD CONSTRAINT fk_archivos_subido_por
    FOREIGN KEY (subido_por)
    REFERENCES usuarios(id)
    ON DELETE SET NULL;

-- ----------------------------------------------------------------------------
-- FOREIGN KEYS DE: reportes_progreso
-- ----------------------------------------------------------------------------
ALTER TABLE reportes_progreso
    ADD CONSTRAINT fk_reportes_progreso_paciente_id
    FOREIGN KEY (paciente_id)
    REFERENCES pacientes(id)
    ON DELETE CASCADE;

ALTER TABLE reportes_progreso
    ADD CONSTRAINT fk_reportes_progreso_psicologo_id
    FOREIGN KEY (psicologo_id)
    REFERENCES usuarios(id)
    ON DELETE RESTRICT;

ALTER TABLE reportes_progreso
    ADD CONSTRAINT fk_reportes_progreso_sesion_id
    FOREIGN KEY (sesion_id)
    REFERENCES sesiones(id)
    ON DELETE SET NULL;

-- ----------------------------------------------------------------------------
-- FOREIGN KEYS DE: mensajes_chat
-- ----------------------------------------------------------------------------
ALTER TABLE mensajes_chat
    ADD CONSTRAINT fk_mensajes_chat_remitente_id
    FOREIGN KEY (remitente_id)
    REFERENCES usuarios(id)
    ON DELETE CASCADE;

ALTER TABLE mensajes_chat
    ADD CONSTRAINT fk_mensajes_chat_destinatario_id
    FOREIGN KEY (destinatario_id)
    REFERENCES usuarios(id)
    ON DELETE CASCADE;

-- ----------------------------------------------------------------------------
-- FOREIGN KEYS DE: configuraciones_recordatorio
-- ----------------------------------------------------------------------------
ALTER TABLE configuraciones_recordatorio
    ADD CONSTRAINT fk_configuraciones_recordatorio_usuario_id
    FOREIGN KEY (usuario_id)
    REFERENCES usuarios(id)
    ON DELETE CASCADE;

-- ----------------------------------------------------------------------------
-- FOREIGN KEYS DE: logs_auditoria
-- ----------------------------------------------------------------------------
ALTER TABLE logs_auditoria
    ADD CONSTRAINT fk_logs_auditoria_usuario_id
    FOREIGN KEY (usuario_id)
    REFERENCES usuarios(id)
    ON DELETE SET NULL;

-- ============================================================================
-- PASO 5: CREAR ÍNDICES PARA OPTIMIZACIÓN
-- ============================================================================

-- Índices de usuarios
CREATE INDEX idx_usuarios_rol_id ON usuarios(rol_id);
CREATE INDEX idx_usuarios_email ON usuarios(email);
CREATE INDEX idx_usuarios_activo ON usuarios(activo);

-- Índices de pacientes
CREATE INDEX idx_pacientes_usuario_id ON pacientes(usuario_id);
CREATE INDEX idx_pacientes_psicologo_id ON pacientes(psicologo_id);
CREATE INDEX idx_pacientes_numero_ficha ON pacientes(numero_ficha);
CREATE INDEX idx_pacientes_estado ON pacientes(estado);

-- Índices de contactos_emergencia
CREATE INDEX idx_contactos_emergencia_paciente_id ON contactos_emergencia(paciente_id);

-- Índices de etiquetas y diagnósticos
CREATE INDEX idx_etiquetas_nombre ON etiquetas(nombre);
CREATE INDEX idx_diagnosticos_codigo ON diagnosticos(codigo);
CREATE INDEX idx_diagnosticos_nombre ON diagnosticos(nombre);

-- Índices de sesiones
CREATE INDEX idx_sesiones_paciente_id ON sesiones(paciente_id);
CREATE INDEX idx_sesiones_psicologo_id ON sesiones(psicologo_id);
CREATE INDEX idx_sesiones_fecha_programada ON sesiones(fecha_programada);
CREATE INDEX idx_sesiones_estado ON sesiones(estado);

-- Índices de objetivos y técnicas
CREATE INDEX idx_objetivos_terapeuticos_categoria ON objetivos_terapeuticos(categoria);
CREATE INDEX idx_objetivos_terapeuticos_activo ON objetivos_terapeuticos(activo);
CREATE INDEX idx_tecnicas_terapeuticas_categoria ON tecnicas_terapeuticas(categoria);
CREATE INDEX idx_tecnicas_terapeuticas_activo ON tecnicas_terapeuticas(activo);

-- Índices de sesion_objetivos y sesion_tecnicas
CREATE INDEX idx_sesion_objetivos_sesion_id ON sesion_objetivos(sesion_id);
CREATE INDEX idx_sesion_objetivos_objetivo_id ON sesion_objetivos(objetivo_id);
CREATE INDEX idx_sesion_tecnicas_sesion_id ON sesion_tecnicas(sesion_id);
CREATE INDEX idx_sesion_tecnicas_tecnica_id ON sesion_tecnicas(tecnica_id);

-- Índices de evaluaciones_sesion
CREATE INDEX idx_evaluaciones_sesion_sesion_id ON evaluaciones_sesion(sesion_id);

-- Índices de tareas y respuestas
CREATE INDEX idx_tareas_paciente_id ON tareas(paciente_id);
CREATE INDEX idx_tareas_psicologo_id ON tareas(psicologo_id);
CREATE INDEX idx_tareas_sesion_id ON tareas(sesion_id);
CREATE INDEX idx_tareas_estado ON tareas(estado);
CREATE INDEX idx_tareas_fecha_vencimiento ON tareas(fecha_vencimiento);
CREATE INDEX idx_respuestas_tareas_tarea_id ON respuestas_tareas(tarea_id);
CREATE INDEX idx_respuestas_tareas_paciente_id ON respuestas_tareas(paciente_id);

-- Índices de reportes
CREATE INDEX idx_reportes_progreso_paciente_id ON reportes_progreso(paciente_id);
CREATE INDEX idx_reportes_progreso_psicologo_id ON reportes_progreso(psicologo_id);
CREATE INDEX idx_reportes_progreso_sesion_id ON reportes_progreso(sesion_id);

-- Índices de servicios y disponibilidad
CREATE INDEX idx_tipos_servicio_codigo ON tipos_servicio(codigo);
CREATE INDEX idx_tipos_servicio_categoria ON tipos_servicio(categoria);
CREATE INDEX idx_servicios_psicologo_psicologo_id ON servicios_psicologo(psicologo_id);
CREATE INDEX idx_servicios_psicologo_tipo_servicio_id ON servicios_psicologo(tipo_servicio_id);
CREATE INDEX idx_horarios_disponibles_psicologo_id ON horarios_disponibles(psicologo_id);
CREATE INDEX idx_horarios_disponibles_fecha ON horarios_disponibles(fecha);
CREATE INDEX idx_horarios_disponibles_activo ON horarios_disponibles(activo);

-- Índices de archivos
CREATE INDEX idx_archivos_entidad ON archivos(entidad_tipo, entidad_id);
CREATE INDEX idx_archivos_subido_por ON archivos(subido_por);
CREATE INDEX idx_archivos_created_at ON archivos(created_at);

-- Índices de mensajes
CREATE INDEX idx_mensajes_chat_remitente_id ON mensajes_chat(remitente_id);
CREATE INDEX idx_mensajes_chat_destinatario_id ON mensajes_chat(destinatario_id);
CREATE INDEX idx_mensajes_chat_participantes ON mensajes_chat(remitente_id, destinatario_id);
CREATE INDEX idx_mensajes_chat_created_at ON mensajes_chat(created_at);
CREATE INDEX idx_mensajes_chat_leido ON mensajes_chat(leido);

-- Índices de tokens_mensajes_paciente
CREATE INDEX idx_tokens_mensajes_paciente_id ON tokens_mensajes_paciente(paciente_id);
CREATE INDEX idx_tokens_mensajes_activo ON tokens_mensajes_paciente(activo);

-- Índices de configuraciones
CREATE INDEX idx_configuraciones_recordatorio_usuario_id ON configuraciones_recordatorio(usuario_id);
CREATE INDEX idx_configuraciones_sistema_clave ON configuraciones_sistema(clave);
CREATE INDEX idx_configuraciones_sistema_categoria ON configuraciones_sistema(categoria);

-- Índices de logs_auditoria
CREATE INDEX idx_logs_auditoria_usuario_id ON logs_auditoria(usuario_id);
CREATE INDEX idx_logs_auditoria_tabla_afectada ON logs_auditoria(tabla_afectada);
CREATE INDEX idx_logs_auditoria_created_at ON logs_auditoria(created_at);

-- ============================================================================
-- PASO 6: INSERTAR DATOS INICIALES
-- ============================================================================

-- Insertar roles predefinidos
INSERT INTO roles (nombre, descripcion, permisos, activo) VALUES
('admin', 'Administrador del sistema', '["all"]', true),
('psicologo', 'Psicólogo/Terapeuta', '["patients", "sessions", "tasks", "reports"]', true),
('recepcionista', 'Recepcionista', '["appointments", "patients_view"]', true),
('paciente', 'Paciente', '["view_own_data", "chat", "tasks"]', true);

-- Insertar tipos de servicio predefinidos
INSERT INTO tipos_servicio (id, codigo, nombre, descripcion, duracion_estandar_minutos, categoria) VALUES
(gen_random_uuid(), 'EVAL_INICIAL', 'Evaluación Inicial', 'Primera sesión de evaluación del paciente', 60, 'evaluacion'),
(gen_random_uuid(), 'TERAPIA_IND', 'Terapia Individual', 'Sesión de terapia individual estándar', 45, 'terapia'),
(gen_random_uuid(), 'TERAPIA_PAREJA', 'Terapia de Pareja', 'Sesión de terapia de pareja', 60, 'terapia'),
(gen_random_uuid(), 'TERAPIA_FAM', 'Terapia Familiar', 'Sesión de terapia familiar', 90, 'terapia'),
(gen_random_uuid(), 'CONSULTA', 'Consulta General', 'Consulta breve', 30, 'consulta');

-- Insertar objetivos terapéuticos predefinidos
INSERT INTO objetivos_terapeuticos (id, nombre, descripcion, categoria) VALUES
(gen_random_uuid(), 'Reducir ansiedad', 'Trabajar técnicas para disminuir niveles de ansiedad', 'emocional'),
(gen_random_uuid(), 'Mejorar autoestima', 'Fortalecer la percepción positiva de sí mismo', 'cognitivo'),
(gen_random_uuid(), 'Manejo de ira', 'Desarrollar estrategias de control emocional', 'emocional'),
(gen_random_uuid(), 'Habilidades sociales', 'Mejorar comunicación y relaciones interpersonales', 'social'),
(gen_random_uuid(), 'Reestructuración cognitiva', 'Modificar pensamientos distorsionados', 'cognitivo'),
(gen_random_uuid(), 'Control de impulsos', 'Desarrollar autocontrol y reflexión antes de actuar', 'conductual'),
(gen_random_uuid(), 'Resolución de conflictos', 'Mejorar habilidades para resolver conflictos interpersonales', 'social'),
(gen_random_uuid(), 'Manejo del estrés', 'Técnicas de afrontamiento del estrés', 'emocional');

-- Insertar técnicas terapéuticas predefinidas
INSERT INTO tecnicas_terapeuticas (id, nombre, descripcion, categoria) VALUES
(gen_random_uuid(), 'Exposición gradual', 'Técnica para enfrentar miedos de forma progresiva', 'cognitivo-conductual'),
(gen_random_uuid(), 'Reestructuración cognitiva', 'Identificar y modificar pensamientos irracionales', 'cognitivo-conductual'),
(gen_random_uuid(), 'Mindfulness', 'Técnicas de atención plena', 'humanista'),
(gen_random_uuid(), 'Role-playing', 'Simulación de situaciones para practicar habilidades', 'sistemica'),
(gen_random_uuid(), 'Técnica de la silla vacía', 'Trabajo con conflictos internos', 'humanista'),
(gen_random_uuid(), 'Relajación progresiva', 'Técnica de relajación muscular', 'cognitivo-conductual'),
(gen_random_uuid(), 'Registro de pensamientos', 'Documentar y analizar patrones de pensamiento', 'cognitivo-conductual'),
(gen_random_uuid(), 'Genograma familiar', 'Mapeo de relaciones familiares', 'sistemica');

-- ============================================================================
-- PASO 7: VERIFICACIÓN FINAL
-- ============================================================================

-- Verificar tablas creadas
SELECT 
    'TABLAS CREADAS' as tipo,
    COUNT(*) as total
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE';

-- Verificar foreign keys creadas
SELECT 
    'FOREIGN KEYS CREADAS' as tipo,
    COUNT(*) as total
FROM information_schema.table_constraints 
WHERE constraint_type = 'FOREIGN KEY'
AND constraint_schema = 'public';

-- Verificar datos iniciales
SELECT 
    'Roles' as tabla, COUNT(*) as registros FROM roles
UNION ALL
SELECT 'Tipos de Servicio', COUNT(*) FROM tipos_servicio
UNION ALL
SELECT 'Objetivos Terapéuticos', COUNT(*) FROM objetivos_terapeuticos
UNION ALL
SELECT 'Técnicas Terapéuticas', COUNT(*) FROM tecnicas_terapeuticas
ORDER BY tabla;

-- Listar todas las tablas con sus foreign keys
SELECT 
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name,
    tc.constraint_name,
    rc.delete_rule
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
JOIN information_schema.referential_constraints AS rc
    ON tc.constraint_name = rc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
AND tc.table_schema = 'public'
ORDER BY tc.table_name, tc.constraint_name;

-- ============================================================================
-- FIN DEL DDL - LISTO PARA ORACLE DATA MODELER
-- ============================================================================

