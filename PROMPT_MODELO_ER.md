# PROMPT PARA GENERAR MODELO ENTIDAD-RELACIÓN PROFESIONAL

## CONTEXTO DEL PROYECTO
Genera un modelo entidad-relación profesional y bien estructurado para un **Centro Terapéutico Psyche**, un sistema de gestión terapéutica que maneja pacientes, psicólogos, sesiones, tareas y citas. El sistema debe seguir las mejores prácticas de diseño de bases de datos y presentación visual.

## REQUERIMIENTOS DEL DIAGRAMA
- **Formato**: Diagrama ER profesional con notación estándar
- **Estilo**: Limpio, organizado, sin cruces de líneas innecesarios
- **Colores**: Usar colores diferenciados por módulos funcionales
- **Agrupación**: Organizar entidades por módulos lógicos
- **Relaciones**: Mostrar cardinalidades y tipos de relación claramente
- **Documentación**: Incluir descripciones de entidades y relaciones

## ENTIDADES DEL SISTEMA

### 1. ROLES
**Propósito**: Definir tipos de usuario del sistema
**Campos**:
- id (INTEGER, PK, AUTO_INCREMENT)
- nombre (VARCHAR(50), UNIQUE, NOT NULL)
- descripcion (TEXT, NULLABLE)
- permisos (JSONB, NOT NULL, DEFAULT: [])
- activo (BOOLEAN, NOT NULL, DEFAULT: true)
- created_at (TIMESTAMP, NOT NULL)
- updated_at (TIMESTAMP, NOT NULL)
- deleted_at (TIMESTAMP, NULLABLE)

**Valores típicos**: admin, psicologo, recepcionista, paciente

### 2. USUARIOS
**Propósito**: Información base de todos los usuarios del sistema
**Campos**:
- id (UUID, PK)
- email (VARCHAR(255), UNIQUE, NOT NULL)
- password_hash (VARCHAR(255), NOT NULL)
- nombres (VARCHAR(100), NOT NULL)
- apellidos (VARCHAR(100), NOT NULL)
- telefono (VARCHAR(20), NULLABLE)
- fecha_nacimiento (DATE, NULLABLE)
- genero (ENUM: 'masculino', 'femenino', 'otro', 'prefiero_no_decir', NULLABLE)
- avatar_url (VARCHAR(500), NULLABLE)
- especialidad (TEXT, NULLABLE) - Solo para psicólogos
- descripcion (TEXT, NULLABLE) - Solo para psicólogos
- codigo_sbs (VARCHAR(50), NULLABLE) - Solo para psicólogos
- rol_id (INTEGER, FK → ROLES.id, NOT NULL)
- activo (BOOLEAN, NOT NULL, DEFAULT: true)
- email_verificado (BOOLEAN, NOT NULL, DEFAULT: false)
- token_activacion (VARCHAR(255), NULLABLE)
- token_activacion_expira (TIMESTAMP, NULLABLE)
- ultimo_acceso (TIMESTAMP, NULLABLE)
- configuracion (JSONB, NOT NULL, DEFAULT: {})
- created_at (TIMESTAMP, NOT NULL)
- updated_at (TIMESTAMP, NOT NULL)
- deleted_at (TIMESTAMP, NULLABLE)

### 3. PACIENTES
**Propósito**: Información específica de pacientes del centro
**Campos**:
- id (UUID, PK)
- usuario_id (UUID, FK → USUARIOS.id, NOT NULL)
- psicologo_id (UUID, FK → USUARIOS.id, NOT NULL)
- nombres (VARCHAR(100), NULLABLE)
- apellidos (VARCHAR(100), NULLABLE)
- email (VARCHAR(255), NULLABLE)
- telefono (VARCHAR(20), NULLABLE)
- fecha_nacimiento (DATE, NULLABLE)
- genero (ENUM: 'masculino', 'femenino', 'no_binario', 'prefiero_no_decir', NULLABLE)
- numero_ficha (VARCHAR(20), UNIQUE, NOT NULL)
- rut (VARCHAR(12), UNIQUE, NULLABLE)
- direccion (TEXT, NULLABLE)
- contacto_emergencia_nombre (VARCHAR(200), NULLABLE)
- contacto_emergencia_telefono (VARCHAR(20), NULLABLE)
- contacto_emergencia_relacion (VARCHAR(50), NULLABLE)
- diagnosticos (JSONB, NOT NULL, DEFAULT: [])
- etiquetas (JSONB, NOT NULL, DEFAULT: [])
- estrategias_autorregulacion (JSONB, NOT NULL, DEFAULT: [])
- estado (ENUM: 'activo', 'inactivo', 'alta', 'derivado', NOT NULL, DEFAULT: 'activo')
- fecha_ingreso (DATE, NOT NULL, DEFAULT: CURRENT_DATE)
- fecha_alta (DATE, NULLABLE)
- observaciones (TEXT, NULLABLE)
- antecedentes_medicos (JSONB, NOT NULL, DEFAULT: [])
- medicacion_actual (JSONB, NOT NULL, DEFAULT: [])
- alergias (JSONB, NOT NULL, DEFAULT: [])
- condiciones_cronicas (JSONB, NOT NULL, DEFAULT: [])
- historial_psiquiatrico (JSONB, NOT NULL, DEFAULT: [])
- observaciones_medicas (TEXT, NULLABLE)
- created_at (TIMESTAMP, NOT NULL)
- updated_at (TIMESTAMP, NOT NULL)
- deleted_at (TIMESTAMP, NULLABLE)

### 4. SESIONES
**Propósito**: Registro de sesiones terapéuticas realizadas
**Campos**:
- id (UUID, PK)
- paciente_id (UUID, FK → PACIENTES.id, NOT NULL)
- psicologo_id (UUID, FK → USUARIOS.id, NOT NULL)
- fecha_programada (TIMESTAMP, NOT NULL)
- fecha_inicio (TIMESTAMP, NULLABLE)
- fecha_fin (TIMESTAMP, NULLABLE)
- duracion_minutos (INTEGER, NULLABLE)
- tipo_sesion (ENUM: 'presencial', 'virtual', 'telefonica', NOT NULL, DEFAULT: 'presencial')
- estado (ENUM: 'programada', 'confirmada', 'en_curso', 'completada', 'cancelada', 'no_asistio', NOT NULL, DEFAULT: 'programada')
- notas_evolucion (TEXT, NULLABLE)
- objetivos_sesion (JSONB, NOT NULL, DEFAULT: [])
- tecnicas_utilizadas (JSONB, NOT NULL, DEFAULT: [])
- evaluacion_paciente (JSONB, NULLABLE)
- observaciones (TEXT, NULLABLE)
- resumen_sesion (TEXT, NULLABLE)
- objetivos_alcanzados (JSONB, NOT NULL, DEFAULT: [])
- tareas_asignadas (JSONB, NOT NULL, DEFAULT: [])
- progreso_paciente (ENUM: 'excelente', 'bueno', 'regular', 'necesita_mejora', NULLABLE)
- derivacion_recomendada (JSONB, NOT NULL, DEFAULT: {})
- archivos_sesion (JSONB, NOT NULL, DEFAULT: [])
- archivos_adjuntos (JSONB, NOT NULL, DEFAULT: [])
- created_at (TIMESTAMP, NOT NULL)
- updated_at (TIMESTAMP, NOT NULL)
- deleted_at (TIMESTAMP, NULLABLE)

### 5. TAREAS
**Propósito**: Tareas asignadas a pacientes por psicólogos
**Campos**:
- id (UUID, PK)
- paciente_id (UUID, FK → PACIENTES.id, NOT NULL)
- psicologo_id (UUID, FK → USUARIOS.id, NOT NULL)
- sesion_id (UUID, FK → SESIONES.id, NULLABLE)
- titulo (VARCHAR(200), NOT NULL)
- descripcion (TEXT, NOT NULL)
- instrucciones (TEXT, NULLABLE)
- tipo_tarea (ENUM: 'texto_abierto', 'opcion_multiple', 'test_psicologico', 'test_imagenes', 'tarea_dibujo', 'ejercicio', 'lectura', 'reflexion', 'practica', 'evaluacion', NOT NULL, DEFAULT: 'texto_abierto')
- tipo_tarea_avanzado (VARCHAR, NULLABLE)
- prioridad (ENUM: 'baja', 'media', 'alta', 'urgente', NOT NULL, DEFAULT: 'media')
- fecha_asignacion (TIMESTAMP, NOT NULL, DEFAULT: CURRENT_TIMESTAMP)
- fecha_vencimiento (TIMESTAMP, NULLABLE)
- fecha_completada (TIMESTAMP, NULLABLE)
- estado (ENUM: 'pendiente', 'en_progreso', 'completada', 'vencida', 'cancelada', NOT NULL, DEFAULT: 'pendiente')
- archivos_adjuntos (JSONB, NOT NULL, DEFAULT: [])
- respuesta_paciente (TEXT, NULLABLE)
- archivos_respuesta (JSONB, NOT NULL, DEFAULT: [])
- evaluacion_psicologo (JSONB, NULLABLE)
- contenido_tarea (JSONB, NULLABLE)
- configuracion_tarea (JSONB, NULLABLE)
- es_borrador (BOOLEAN, NOT NULL, DEFAULT: false)
- fecha_publicacion (TIMESTAMP, NULLABLE)
- created_at (TIMESTAMP, NOT NULL)
- updated_at (TIMESTAMP, NOT NULL)
- deleted_at (TIMESTAMP, NULLABLE)

### 6. RESPUESTAS_TAREAS
**Propósito**: Respuestas de pacientes a las tareas asignadas
**Campos**:
- id (UUID, PK)
- tarea_id (UUID, FK → TAREAS.id, NOT NULL)
- paciente_id (UUID, FK → PACIENTES.id, NOT NULL)
- contenido_respuesta (TEXT, NULLABLE)
- archivo_respuesta (TEXT, NULLABLE) - Base64 de dibujos/imágenes
- fecha_envio (TIMESTAMP, NOT NULL, DEFAULT: CURRENT_TIMESTAMP)
- evaluacion_psicologo (JSONB, NULLABLE)
- created_at (TIMESTAMP, NOT NULL)
- updated_at (TIMESTAMP, NOT NULL)

### 7. SERVICIOS_PSICOLOGO
**Propósito**: Servicios ofrecidos por cada psicólogo
**Campos**:
- id (INTEGER, PK, AUTO_INCREMENT)
- psicologo_id (UUID, FK → USUARIOS.id, NOT NULL)
- tipo_servicio_id (VARCHAR, NOT NULL)
- nombre (VARCHAR, NOT NULL)
- descripcion (TEXT, NOT NULL)
- duracion (INTEGER, NOT NULL) - En minutos
- categoria (VARCHAR, NOT NULL)
- activo (BOOLEAN, NOT NULL, DEFAULT: true)
- created_at (TIMESTAMP, NOT NULL)
- updated_at (TIMESTAMP, NOT NULL)

### 8. DISPONIBILIDAD_MENSUAL
**Propósito**: Horarios específicos de disponibilidad de psicólogos
**Campos**:
- id (INTEGER, PK, AUTO_INCREMENT)
- psicologo_id (UUID, FK → USUARIOS.id, NOT NULL)
- fecha (DATE, NOT NULL) - Fecha específica (YYYY-MM-DD)
- hora_inicio (TIME, NOT NULL)
- hora_fin (TIME, NOT NULL)
- activo (BOOLEAN, NOT NULL, DEFAULT: true)
- tipo_disponibilidad (ENUM: 'individual', 'recurrente', NOT NULL, DEFAULT: 'individual')
- created_at (TIMESTAMP, NOT NULL)
- updated_at (TIMESTAMP, NOT NULL)
- deleted_at (TIMESTAMP, NULLABLE)

### 9. DISPONIBILIDAD_PSICOLOGOS
**Propósito**: Horarios recurrentes por día de semana
**Campos**:
- id (UUID, PK)
- psicologo_id (UUID, FK → USUARIOS.id, NOT NULL)
- dia_semana (INTEGER, NOT NULL) - 0=Domingo, 1=Lunes, ..., 6=Sábado
- hora_inicio (TIME, NOT NULL)
- hora_fin (TIME, NOT NULL)
- activo (BOOLEAN, NOT NULL, DEFAULT: true)
- created_at (TIMESTAMP, NOT NULL)
- updated_at (TIMESTAMP, NOT NULL)

### 10. CITAS
**Propósito**: Citas programadas entre pacientes y psicólogos
**Campos**:
- id (UUID, PK)
- paciente_id (UUID, FK → PACIENTES.id, NOT NULL)
- psicologo_id (UUID, FK → USUARIOS.id, NOT NULL)
- fecha (DATE, NOT NULL)
- hora_inicio (TIME, NOT NULL)
- hora_fin (TIME, NOT NULL)
- duracion_minutos (INTEGER, DEFAULT: 60)
- estado (ENUM: 'programada', 'confirmada', 'en_progreso', 'completada', 'cancelada', 'no_show', DEFAULT: 'programada')
- tipo_sesion (ENUM: 'individual', 'grupal', 'familiar', 'evaluacion', 'seguimiento', DEFAULT: 'individual')
- modalidad (ENUM: 'presencial', 'virtual', 'telefonica', DEFAULT: 'presencial')
- notas_paciente (TEXT, NULLABLE)
- notas_psicologo (TEXT, NULLABLE)
- recordatorio_enviado (BOOLEAN, DEFAULT: false)
- created_at (TIMESTAMP, NOT NULL)
- updated_at (TIMESTAMP, NOT NULL)

### 11. CHAT
**Propósito**: Sistema de mensajería entre usuarios
**Campos**:
- id (UUID, PK)
- emisor_id (UUID, FK → USUARIOS.id, NOT NULL)
- receptor_id (UUID, FK → USUARIOS.id, NOT NULL)
- contenido (TEXT, NOT NULL)
- leido (BOOLEAN, DEFAULT: false, NOT NULL)
- timestamp (TIMESTAMP, DEFAULT: CURRENT_TIMESTAMP, NOT NULL)
- created_at (TIMESTAMP, NOT NULL)
- updated_at (TIMESTAMP, NOT NULL)

### 12. LOGS_AUDITORIA
**Propósito**: Registro de auditoría del sistema
**Campos**:
- id (UUID, PK)
- usuario_id (UUID, FK → USUARIOS.id, NULLABLE)
- accion (VARCHAR(100), NOT NULL)
- tabla_afectada (VARCHAR(50), NULLABLE)
- registro_id (VARCHAR(100), NULLABLE)
- valores_anteriores (JSONB, NULLABLE)
- valores_nuevos (JSONB, NULLABLE)
- ip_address (INET, NULLABLE)
- user_agent (TEXT, NULLABLE)
- metadatos (JSONB, NOT NULL, DEFAULT: {})
- created_at (TIMESTAMP, NOT NULL)

## RELACIONES PRINCIPALES

### Módulo 1: Gestión de Usuarios
- ROLES (1) → (N) USUARIOS: Un rol puede tener muchos usuarios

### Módulo 2: Gestión de Pacientes
- USUARIOS (1) → (N) PACIENTES: Un usuario puede ser paciente
- USUARIOS (1) → (N) PACIENTES: Un psicólogo puede atender muchos pacientes

### Módulo 3: Sesiones Terapéuticas
- PACIENTES (1) → (N) SESIONES: Un paciente puede tener muchas sesiones
- USUARIOS (1) → (N) SESIONES: Un psicólogo puede realizar muchas sesiones

### Módulo 4: Sistema de Tareas
- SESIONES (1) → (N) TAREAS: Una sesión puede generar muchas tareas
- PACIENTES (1) → (N) TAREAS: Un paciente puede recibir muchas tareas
- USUARIOS (1) → (N) TAREAS: Un psicólogo puede asignar muchas tareas
- TAREAS (1) → (N) RESPUESTAS_TAREAS: Una tarea puede tener muchas respuestas
- PACIENTES (1) → (N) RESPUESTAS_TAREAS: Un paciente puede responder muchas tareas

### Módulo 5: Servicios y Disponibilidad
- USUARIOS (1) → (N) SERVICIOS_PSICOLOGO: Un psicólogo puede ofrecer muchos servicios
- USUARIOS (1) → (N) DISPONIBILIDAD_MENSUAL: Un psicólogo puede tener múltiples horarios mensuales
- USUARIOS (1) → (N) DISPONIBILIDAD_PSICOLOGOS: Un psicólogo puede tener múltiples horarios semanales

### Módulo 6: Sistema de Citas
- PACIENTES (1) → (N) CITAS: Un paciente puede tener muchas citas
- USUARIOS (1) → (N) CITAS: Un psicólogo puede atender muchas citas

### Módulo 7: Comunicación
- USUARIOS (1) → (N) CHAT: Un usuario puede enviar muchos mensajes
- USUARIOS (1) → (N) CHAT: Un usuario puede recibir muchos mensajes

### Módulo 8: Auditoría
- USUARIOS (1) → (N) LOGS_AUDITORIA: Un usuario puede generar muchos logs

## CARACTERÍSTICAS ESPECIALES

### Campos JSONB
- **permisos** en ROLES: Permisos específicos por rol
- **diagnosticos, etiquetas, estrategias_autorregulacion** en PACIENTES: Información clínica estructurada
- **objetivos_sesion, tecnicas_utilizadas** en SESIONES: Datos de la sesión
- **contenido_tarea, configuracion_tarea** en TAREAS: Configuración específica por tipo de tarea

### Soft Deletes
La mayoría de tablas implementan soft deletes con el campo `deleted_at` para mantener integridad referencial.

### Auditoría
La tabla `LOGS_AUDITORIA` registra todas las acciones importantes del sistema.

## INSTRUCCIONES ESPECÍFICAS PARA EL DIAGRAMA

1. **Organización Visual**: Agrupa las entidades por módulos funcionales usando colores diferentes
2. **Evitar Cruces**: Organiza las entidades para minimizar el cruce de líneas de relación
3. **Jerarquía Visual**: Coloca entidades principales (USUARIOS, PACIENTES) en posiciones centrales
4. **Cardinalidades**: Muestra claramente las cardinalidades (1:1, 1:N, N:M)
5. **Tipos de Relación**: Diferencia visualmente entre relaciones obligatorias y opcionales
6. **Leyenda**: Incluye una leyenda explicando los símbolos y colores utilizados
7. **Título**: "Modelo Entidad-Relación - Centro Terapéutico Psyche"
8. **Nota**: Incluye una nota indicando que el sistema está en Tercera Forma Normal

## FORMATO DE SALIDA ESPERADO
Genera un diagrama ER profesional, limpio y bien organizado que pueda ser usado como documentación técnica del proyecto. El diagrama debe ser fácil de entender tanto para desarrolladores como para stakeholders del negocio.







