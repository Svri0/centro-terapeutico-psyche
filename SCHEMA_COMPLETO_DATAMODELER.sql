-- ============================================
-- CENTRO TERAPÉUTICO PSYCHE - SCHEMA COMPLETO
-- Base de Datos Normalizada a 3FN
-- Fecha: 15 de noviembre de 2025
-- Versión: 2.0 (Reestructuración completa)
-- ============================================

-- Eliminar tablas existentes (para re-crear desde cero)
DROP TABLE IF EXISTS archivos CASCADE;
DROP TABLE IF EXISTS evaluaciones_sesion CASCADE;
DROP TABLE IF EXISTS sesion_tecnicas CASCADE;
DROP TABLE IF EXISTS sesion_objetivos CASCADE;
DROP TABLE IF EXISTS tecnicas_terapeuticas CASCADE;
DROP TABLE IF EXISTS objetivos_terapeuticos CASCADE;
DROP TABLE IF EXISTS respuestas_tareas CASCADE;
DROP TABLE IF EXISTS tareas CASCADE;
DROP TABLE IF EXISTS reportes_progreso CASCADE;
DROP TABLE IF EXISTS logs_auditoria CASCADE;
DROP TABLE IF EXISTS mensajes_chat CASCADE;
DROP TABLE IF EXISTS tokens_mensajes_paciente CASCADE;
DROP TABLE IF EXISTS configuraciones_recordatorio CASCADE;
DROP TABLE IF EXISTS configuraciones_sistema CASCADE;
DROP TABLE IF EXISTS horarios_disponibles CASCADE;
DROP TABLE IF EXISTS servicios_psicologo CASCADE;
DROP TABLE IF EXISTS tipos_servicio CASCADE;
DROP TABLE IF EXISTS sesiones CASCADE;
DROP TABLE IF EXISTS paciente_diagnosticos CASCADE;
DROP TABLE IF EXISTS diagnosticos CASCADE;
DROP TABLE IF EXISTS paciente_etiquetas CASCADE;
DROP TABLE IF EXISTS etiquetas CASCADE;
DROP TABLE IF EXISTS contactos_emergencia CASCADE;
DROP TABLE IF EXISTS pacientes CASCADE;
DROP TABLE IF EXISTS usuarios CASCADE;
DROP TABLE IF EXISTS roles CASCADE;

-- Eliminar tipos ENUM existentes
DROP TYPE IF EXISTS enum_roles_nombre CASCADE;
DROP TYPE IF EXISTS enum_usuarios_genero CASCADE;
DROP TYPE IF EXISTS enum_pacientes_genero CASCADE;
DROP TYPE IF EXISTS enum_pacientes_estado CASCADE;
DROP TYPE IF EXISTS enum_sesiones_tipo_sesion CASCADE;
DROP TYPE IF EXISTS enum_sesiones_estado CASCADE;
DROP TYPE IF EXISTS enum_sesiones_progreso_paciente CASCADE;
DROP TYPE IF EXISTS enum_tareas_tipo_tarea CASCADE;
DROP TYPE IF EXISTS enum_tareas_prioridad CASCADE;
DROP TYPE IF EXISTS enum_tareas_estado CASCADE;
DROP TYPE IF EXISTS enum_mensajes_chat_tipo CASCADE;
DROP TYPE IF EXISTS enum_tokens_mensajes_paciente_periodo_reset CASCADE;
DROP TYPE IF EXISTS enum_configuraciones_recordatorio_tipo_evento CASCADE;
DROP TYPE IF EXISTS enum_configuraciones_recordatorio_canal_notificacion CASCADE;
DROP TYPE IF EXISTS enum_configuraciones_sistema_tipo CASCADE;
DROP TYPE IF EXISTS enum_configuraciones_sistema_categoria CASCADE;
DROP TYPE IF EXISTS enum_reportes_progreso_progreso_general CASCADE;
DROP TYPE IF EXISTS enum_reportes_progreso_estado CASCADE;
DROP TYPE IF EXISTS enum_horarios_disponibles_tipo_disponibilidad CASCADE;
DROP TYPE IF EXISTS enum_tipos_servicio_categoria CASCADE;
DROP TYPE IF EXISTS enum_objetivos_terapeuticos_categoria CASCADE;
DROP TYPE IF EXISTS enum_tecnicas_terapeuticas_categoria CASCADE;
DROP TYPE IF EXISTS enum_archivos_entidad_tipo CASCADE;

-- Habilitar extensiones
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- MÓDULO: AUTENTICACIÓN Y PERMISOS
-- ============================================

-- Tabla: roles
CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE,
    descripcion TEXT,
    permisos JSONB NOT NULL DEFAULT '[]',
    activo BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

COMMENT ON TABLE roles IS 'Roles del sistema: admin, psicologo, recepcionista, paciente';
COMMENT ON COLUMN roles.permisos IS 'Permisos del rol en formato JSON';

-- Tabla: usuarios
CREATE TABLE usuarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rol_id INTEGER NOT NULL REFERENCES roles(id),
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    nombres VARCHAR(100) NOT NULL,
    apellidos VARCHAR(100) NOT NULL,
    telefono VARCHAR(20),
    fecha_nacimiento DATE,
    genero VARCHAR(30) CHECK (genero IN ('masculino', 'femenino', 'otro', 'prefiero_no_decir')),
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
    deleted_at TIMESTAMP
);

COMMENT ON TABLE usuarios IS 'Usuarios del sistema (todos los roles)';
COMMENT ON COLUMN usuarios.especialidad IS 'Solo para psicólogos';
COMMENT ON COLUMN usuarios.codigo_sbs IS 'Código SBS - Solo para psicólogos';
COMMENT ON COLUMN usuarios.configuracion IS 'Configuraciones personalizadas del usuario';

-- ============================================
-- MÓDULO: PACIENTES Y FICHA CLÍNICA
-- ============================================

-- Tabla: pacientes (SIN campos redundantes)
CREATE TABLE pacientes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID NOT NULL UNIQUE REFERENCES usuarios(id),
    psicologo_id UUID NOT NULL REFERENCES usuarios(id),
    numero_ficha VARCHAR(20) NOT NULL UNIQUE,
    rut VARCHAR(12) UNIQUE,
    direccion TEXT,
    estrategias_autorregulacion JSONB NOT NULL DEFAULT '[]',
    puntos_acumulados INTEGER NOT NULL DEFAULT 0,
    estado VARCHAR(20) NOT NULL DEFAULT 'activo' CHECK (estado IN ('activo', 'inactivo', 'alta', 'derivado')),
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
    deleted_at TIMESTAMP
);

COMMENT ON TABLE pacientes IS 'Ficha clínica de pacientes (datos personales en tabla usuarios)';
COMMENT ON COLUMN pacientes.usuario_id IS 'Usuario asociado (1:1) - nombres, apellidos, email, etc. vienen de usuarios';
COMMENT ON COLUMN pacientes.psicologo_id IS 'Psicólogo asignado';
COMMENT ON COLUMN pacientes.numero_ficha IS 'Número de ficha único por psicólogo (ej: PSI-001-0001)';

-- Tabla: contactos_emergencia
CREATE TABLE contactos_emergencia (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    paciente_id UUID NOT NULL REFERENCES pacientes(id) ON DELETE CASCADE,
    nombre VARCHAR(200) NOT NULL,
    telefono VARCHAR(20),
    relacion VARCHAR(50),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

COMMENT ON TABLE contactos_emergencia IS 'Contactos de emergencia de pacientes (1:N)';

-- Tabla: etiquetas
CREATE TABLE etiquetas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre VARCHAR(100) NOT NULL UNIQUE,
    color VARCHAR(20),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

COMMENT ON TABLE etiquetas IS 'Etiquetas para categorizar pacientes';

-- Tabla: diagnosticos
CREATE TABLE diagnosticos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    codigo VARCHAR(50),
    nombre VARCHAR(200) NOT NULL,
    descripcion TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

COMMENT ON TABLE diagnosticos IS 'Catálogo de diagnósticos (CIE-10, DSM-5)';
COMMENT ON COLUMN diagnosticos.codigo IS 'Código CIE-10 o DSM-5';

-- Tabla: paciente_etiquetas (N:M)
CREATE TABLE paciente_etiquetas (
    paciente_id UUID NOT NULL REFERENCES pacientes(id) ON DELETE CASCADE,
    etiqueta_id UUID NOT NULL REFERENCES etiquetas(id) ON DELETE CASCADE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (paciente_id, etiqueta_id)
);

COMMENT ON TABLE paciente_etiquetas IS 'Relación N:M entre pacientes y etiquetas';

-- Tabla: paciente_diagnosticos (N:M)
CREATE TABLE paciente_diagnosticos (
    paciente_id UUID NOT NULL REFERENCES pacientes(id) ON DELETE CASCADE,
    diagnostico_id UUID NOT NULL REFERENCES diagnosticos(id) ON DELETE CASCADE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (paciente_id, diagnostico_id)
);

COMMENT ON TABLE paciente_diagnosticos IS 'Relación N:M entre pacientes y diagnósticos';

-- Tabla: tokens_mensajes_paciente
CREATE TABLE tokens_mensajes_paciente (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    paciente_id UUID NOT NULL UNIQUE REFERENCES pacientes(id),
    tokens_disponibles INTEGER NOT NULL DEFAULT 0,
    tokens_usados INTEGER NOT NULL DEFAULT 0,
    fecha_ultimo_reset TIMESTAMP,
    periodo_reset VARCHAR(20) NOT NULL DEFAULT 'ilimitado' CHECK (periodo_reset IN ('diario', 'semanal', 'mensual', 'ilimitado')),
    activo BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

COMMENT ON TABLE tokens_mensajes_paciente IS 'Control de tokens de mensajes por paciente (1:1)';

-- ============================================
-- MÓDULO: SESIONES TERAPÉUTICAS (NORMALIZADO)
-- ============================================

-- Tabla: sesiones (SIMPLIFICADA)
CREATE TABLE sesiones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    paciente_id UUID NOT NULL REFERENCES pacientes(id),
    psicologo_id UUID NOT NULL REFERENCES usuarios(id),
    fecha_programada TIMESTAMP NOT NULL,
    fecha_inicio TIMESTAMP,
    fecha_fin TIMESTAMP,
    duracion_minutos INTEGER,
    tipo_sesion VARCHAR(20) NOT NULL DEFAULT 'presencial' CHECK (tipo_sesion IN ('presencial', 'virtual', 'telefonica')),
    estado VARCHAR(20) NOT NULL DEFAULT 'programada' CHECK (estado IN ('programada', 'confirmada', 'en_curso', 'completada', 'cancelada', 'no_asistio')),
    notas_evolucion TEXT,
    observaciones TEXT,
    resumen_sesion TEXT,
    progreso_paciente VARCHAR(20) CHECK (progreso_paciente IN ('excelente', 'bueno', 'regular', 'necesita_mejora')),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

COMMENT ON TABLE sesiones IS 'Sesiones terapéuticas (campos JSONB normalizados a tablas relacionadas)';
COMMENT ON COLUMN sesiones.notas_evolucion IS 'Notas de evolución del paciente';
COMMENT ON COLUMN sesiones.progreso_paciente IS 'Evaluación general de progreso';

-- Tabla: objetivos_terapeuticos
CREATE TABLE objetivos_terapeuticos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre VARCHAR(200) NOT NULL UNIQUE,
    descripcion TEXT,
    categoria VARCHAR(50) NOT NULL CHECK (categoria IN ('emocional', 'cognitivo', 'conductual', 'social')),
    activo BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

COMMENT ON TABLE objetivos_terapeuticos IS 'Catálogo de objetivos terapéuticos';

-- Tabla: tecnicas_terapeuticas
CREATE TABLE tecnicas_terapeuticas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre VARCHAR(200) NOT NULL UNIQUE,
    descripcion TEXT,
    categoria VARCHAR(50) NOT NULL CHECK (categoria IN ('cognitivo-conductual', 'humanista', 'psicodinamica', 'sistemica')),
    activo BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

COMMENT ON TABLE tecnicas_terapeuticas IS 'Catálogo de técnicas terapéuticas';

-- Tabla: sesion_objetivos (N:M)
CREATE TABLE sesion_objetivos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sesion_id UUID NOT NULL REFERENCES sesiones(id) ON DELETE CASCADE,
    objetivo_id UUID NOT NULL REFERENCES objetivos_terapeuticos(id),
    alcanzado BOOLEAN NOT NULL DEFAULT false,
    notas TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (sesion_id, objetivo_id)
);

COMMENT ON TABLE sesion_objetivos IS 'Relación N:M entre sesiones y objetivos terapéuticos';
COMMENT ON COLUMN sesion_objetivos.alcanzado IS 'Si el objetivo fue alcanzado en la sesión';

-- Tabla: sesion_tecnicas (N:M)
CREATE TABLE sesion_tecnicas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sesion_id UUID NOT NULL REFERENCES sesiones(id) ON DELETE CASCADE,
    tecnica_id UUID NOT NULL REFERENCES tecnicas_terapeuticas(id),
    notas_aplicacion TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (sesion_id, tecnica_id)
);

COMMENT ON TABLE sesion_tecnicas IS 'Relación N:M entre sesiones y técnicas terapéuticas';
COMMENT ON COLUMN sesion_tecnicas.notas_aplicacion IS 'Notas sobre cómo se aplicó la técnica';

-- Tabla: evaluaciones_sesion (1:1)
CREATE TABLE evaluaciones_sesion (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sesion_id UUID NOT NULL UNIQUE REFERENCES sesiones(id) ON DELETE CASCADE,
    animo_paciente INTEGER CHECK (animo_paciente BETWEEN 1 AND 10),
    nivel_ansiedad INTEGER CHECK (nivel_ansiedad BETWEEN 1 AND 10),
    cooperacion INTEGER CHECK (cooperacion BETWEEN 1 AND 10),
    insight INTEGER CHECK (insight BETWEEN 1 AND 10),
    observaciones_evaluacion TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE evaluaciones_sesion IS 'Evaluaciones estructuradas de sesiones (1:1)';
COMMENT ON COLUMN evaluaciones_sesion.animo_paciente IS 'Estado de ánimo del paciente (1-10)';
COMMENT ON COLUMN evaluaciones_sesion.nivel_ansiedad IS 'Nivel de ansiedad observado (1-10)';
COMMENT ON COLUMN evaluaciones_sesion.cooperacion IS 'Nivel de cooperación (1-10)';
COMMENT ON COLUMN evaluaciones_sesion.insight IS 'Nivel de insight/consciencia (1-10)';

-- ============================================
-- MÓDULO: TAREAS Y GAMIFICACIÓN (SEPARADO)
-- ============================================

-- Tabla: tareas (SIN campos de respuesta)
CREATE TABLE tareas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    paciente_id UUID NOT NULL REFERENCES pacientes(id),
    psicologo_id UUID NOT NULL REFERENCES usuarios(id),
    sesion_id UUID REFERENCES sesiones(id),
    titulo VARCHAR(200) NOT NULL,
    descripcion TEXT NOT NULL,
    instrucciones TEXT,
    tipo_tarea VARCHAR(50) NOT NULL DEFAULT 'texto_abierto' CHECK (tipo_tarea IN ('texto_abierto', 'opcion_multiple', 'test_psicologico', 'test_imagenes', 'tarea_dibujo', 'ejercicio', 'lectura', 'reflexion', 'practica', 'evaluacion')),
    prioridad VARCHAR(20) NOT NULL DEFAULT 'media' CHECK (prioridad IN ('baja', 'media', 'alta', 'urgente')),
    fecha_asignacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_vencimiento TIMESTAMP,
    estado VARCHAR(20) NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'en_progreso', 'completada', 'vencida', 'cancelada')),
    puntos_asignados INTEGER NOT NULL DEFAULT 2,
    contenido_tarea JSONB,
    configuracion_tarea JSONB,
    es_borrador BOOLEAN NOT NULL DEFAULT false,
    fecha_publicacion TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

COMMENT ON TABLE tareas IS 'Tareas asignadas a pacientes (respuestas en tabla separada)';
COMMENT ON COLUMN tareas.contenido_tarea IS 'Contenido específico según tipo_tarea (preguntas, opciones, etc.)';
COMMENT ON COLUMN tareas.configuracion_tarea IS 'Configuración (múltiple selección, tiempo límite, etc.)';

-- Tabla: respuestas_tareas (FORTALECIDA)
CREATE TABLE respuestas_tareas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tarea_id UUID NOT NULL REFERENCES tareas(id) ON DELETE CASCADE,
    paciente_id UUID NOT NULL REFERENCES pacientes(id),
    contenido_respuesta TEXT,
    fecha_envio TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    evaluacion_psicologo JSONB,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE respuestas_tareas IS 'Respuestas de pacientes a tareas (1:N permite múltiples intentos)';
COMMENT ON COLUMN respuestas_tareas.evaluacion_psicologo IS 'Calificación y retroalimentación del psicólogo';

-- ============================================
-- MÓDULO: REPORTES DE PROGRESO
-- ============================================

-- Tabla: reportes_progreso
CREATE TABLE reportes_progreso (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    paciente_id UUID NOT NULL REFERENCES pacientes(id),
    psicologo_id UUID NOT NULL REFERENCES usuarios(id),
    sesion_id UUID REFERENCES sesiones(id),
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
    progreso_general VARCHAR(30) NOT NULL CHECK (progreso_general IN ('excelente', 'muy_bueno', 'bueno', 'regular', 'necesita_atencion')),
    metrica_satisfaccion INTEGER CHECK (metrica_satisfaccion BETWEEN 0 AND 10),
    observaciones_adicionales TEXT,
    documento_adjunto VARCHAR(255),
    estado VARCHAR(20) NOT NULL DEFAULT 'borrador' CHECK (estado IN ('borrador', 'completado', 'archivado')),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

COMMENT ON TABLE reportes_progreso IS 'Reportes de progreso del paciente';

-- ============================================
-- MÓDULO: SERVICIOS Y DISPONIBILIDAD
-- ============================================

-- Tabla: tipos_servicio
CREATE TABLE tipos_servicio (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    codigo VARCHAR(50) NOT NULL UNIQUE,
    nombre VARCHAR(200) NOT NULL,
    descripcion TEXT,
    duracion_estandar_minutos INTEGER NOT NULL,
    categoria VARCHAR(20) NOT NULL CHECK (categoria IN ('evaluacion', 'terapia', 'consulta')),
    activo BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

COMMENT ON TABLE tipos_servicio IS 'Catálogo de tipos de servicio';
COMMENT ON COLUMN tipos_servicio.codigo IS 'Código único (ej: EVAL_INICIAL, TERAPIA_IND)';

-- Tabla: servicios_psicologo (NORMALIZADA)
CREATE TABLE servicios_psicologo (
    id SERIAL PRIMARY KEY,
    psicologo_id UUID NOT NULL REFERENCES usuarios(id),
    tipo_servicio_id UUID NOT NULL REFERENCES tipos_servicio(id),
    nombre VARCHAR(200) NOT NULL,
    descripcion TEXT NOT NULL,
    duracion_minutos INTEGER NOT NULL,
    activo BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (psicologo_id, tipo_servicio_id)
);

COMMENT ON TABLE servicios_psicologo IS 'Servicios ofrecidos por psicólogos (FK real a tipos_servicio)';

-- Tabla: horarios_disponibles (RENOMBRADA)
CREATE TABLE horarios_disponibles (
    id SERIAL PRIMARY KEY,
    psicologo_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    fecha DATE NOT NULL,
    hora_inicio TIME NOT NULL,
    hora_fin TIME NOT NULL,
    activo BOOLEAN NOT NULL DEFAULT true,
    tipo_disponibilidad VARCHAR(20) NOT NULL DEFAULT 'individual' CHECK (tipo_disponibilidad IN ('individual', 'recurrente')),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    UNIQUE (psicologo_id, fecha, hora_inicio)
);

COMMENT ON TABLE horarios_disponibles IS 'Horarios disponibles de psicólogos (antes: disponibilidad_mensual)';
COMMENT ON COLUMN horarios_disponibles.tipo_disponibilidad IS 'individual: fecha específica, recurrente: se repite semanalmente';

-- ============================================
-- MÓDULO: ARCHIVOS CENTRALIZADOS
-- ============================================

-- Tabla: archivos
CREATE TABLE archivos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre_original VARCHAR(255) NOT NULL,
    nombre_almacenado VARCHAR(255) NOT NULL UNIQUE,
    ruta_almacenamiento TEXT NOT NULL,
    tipo_mime VARCHAR(100),
    tamano_bytes BIGINT,
    entidad_tipo VARCHAR(50) NOT NULL CHECK (entidad_tipo IN ('sesion', 'tarea', 'respuesta_tarea', 'reporte', 'paciente')),
    entidad_id UUID NOT NULL,
    subido_por UUID REFERENCES usuarios(id) ON DELETE SET NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

COMMENT ON TABLE archivos IS 'Gestión centralizada de archivos del sistema';
COMMENT ON COLUMN archivos.entidad_tipo IS 'Tipo de entidad: sesion, tarea, respuesta_tarea, reporte, paciente';
COMMENT ON COLUMN archivos.entidad_id IS 'ID de la entidad relacionada';

-- ============================================
-- MÓDULO: COMUNICACIÓN
-- ============================================

-- Tabla: mensajes_chat
CREATE TABLE mensajes_chat (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contenido TEXT NOT NULL,
    remitente_id UUID NOT NULL REFERENCES usuarios(id),
    destinatario_id UUID NOT NULL REFERENCES usuarios(id),
    tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('psicologo', 'paciente', 'admin', 'recepcionista')),
    leido BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

COMMENT ON TABLE mensajes_chat IS 'Mensajes del chat en tiempo real';

-- ============================================
-- MÓDULO: CONFIGURACIÓN Y AUDITORÍA
-- ============================================

-- Tabla: configuraciones_recordatorio
CREATE TABLE configuraciones_recordatorio (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID NOT NULL REFERENCES usuarios(id),
    tipo_evento VARCHAR(50) NOT NULL CHECK (tipo_evento IN ('sesion_programada', 'sesion_confirmada', 'sesion_24h_antes', 'sesion_1h_antes', 'tarea_asignada', 'tarea_vencida', 'tarea_1semana_antes', 'tarea_1dia_antes')),
    canal_notificacion VARCHAR(20) NOT NULL CHECK (canal_notificacion IN ('email', 'whatsapp', 'push', 'sms')),
    activo BOOLEAN NOT NULL DEFAULT true,
    configuracion_personalizada JSONB DEFAULT '{}',
    horario_preferido VARCHAR(5),
    dias_semana INTEGER[] DEFAULT ARRAY[1, 2, 3, 4, 5],
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

COMMENT ON TABLE configuraciones_recordatorio IS 'Configuraciones de recordatorios por usuario';
COMMENT ON COLUMN configuraciones_recordatorio.horario_preferido IS 'Formato HH:MM';
COMMENT ON COLUMN configuraciones_recordatorio.dias_semana IS 'Array de días (0=domingo, 6=sábado)';

-- Tabla: configuraciones_sistema
CREATE TABLE configuraciones_sistema (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clave VARCHAR(100) NOT NULL UNIQUE,
    valor TEXT NOT NULL,
    descripcion TEXT,
    tipo VARCHAR(20) NOT NULL DEFAULT 'string' CHECK (tipo IN ('boolean', 'number', 'string', 'json')),
    categoria VARCHAR(20) NOT NULL DEFAULT 'general' CHECK (categoria IN ('chat', 'mensajes', 'general', 'backup')),
    activo BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

COMMENT ON TABLE configuraciones_sistema IS 'Configuraciones globales del sistema';

-- Tabla: logs_auditoria
CREATE TABLE logs_auditoria (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID REFERENCES usuarios(id),
    accion VARCHAR(100) NOT NULL,
    tabla_afectada VARCHAR(50),
    registro_id VARCHAR(100),
    valores_anteriores JSONB,
    valores_nuevos JSONB,
    ip_address INET,
    user_agent TEXT,
    metadatos JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE logs_auditoria IS 'Logs de auditoría del sistema (sin updated_at)';

-- ============================================
-- ÍNDICES PARA OPTIMIZACIÓN
-- ============================================

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

-- ============================================
-- DATOS INICIALES
-- ============================================

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

-- ============================================
-- FIN DEL SCRIPT
-- ============================================

-- Verificar la creación exitosa
SELECT 
    'Roles' as tabla, COUNT(*) as registros FROM roles
UNION ALL
SELECT 'Tipos de Servicio', COUNT(*) FROM tipos_servicio
UNION ALL
SELECT 'Objetivos Terapéuticos', COUNT(*) FROM objetivos_terapeuticos
UNION ALL
SELECT 'Técnicas Terapéuticas', COUNT(*) FROM tecnicas_terapeuticas;

-- Mostrar todas las tablas creadas
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

