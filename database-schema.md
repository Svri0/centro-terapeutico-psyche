# Base de Datos - Centro Terapéutico Psyche

## Diagrama de Base de Datos

```mermaid
erDiagram
    roles {
        int id PK
        string nombre
        text descripcion
        timestamp created_at
        timestamp updated_at
    }

    usuarios {
        uuid id PK
        int rol_id FK
        string nombres
        string apellidos
        string email
        string password_hash
        string telefono
        date fecha_nacimiento
        string genero
        string especialidad
        text descripcion
        string avatar_url
        string codigo_sbs
        boolean activo
        boolean email_verificado
        timestamp ultimo_acceso
        timestamp created_at
        timestamp updated_at
        timestamp deleted_at
    }

    pacientes {
        uuid id PK
        uuid usuario_id FK
        uuid psicologo_id FK
        string estado
        text antecedentes_medicos
        json informacion_adicional
        timestamp created_at
        timestamp updated_at
        timestamp deleted_at
    }

    sesiones {
        uuid id PK
        uuid paciente_id FK
        uuid psicologo_id FK
        date fecha_programada
        time fecha_inicio
        time fecha_fin
        int duracion_minutos
        string estado
        string tipo_sesion
        text observaciones
        text notas_evolucion
        timestamp created_at
        timestamp updated_at
        timestamp deleted_at
    }

    tareas {
        uuid id PK
        uuid paciente_id FK
        uuid psicologo_id FK
        string titulo
        text descripcion
        string tipo
        string estado
        date fecha_vencimiento
        int prioridad
        timestamp created_at
        timestamp updated_at
        timestamp deleted_at
    }

    respuestas_tareas {
        uuid id PK
        uuid tarea_id FK
        uuid paciente_id FK
        text respuesta
        json archivos_adjuntos
        timestamp created_at
        timestamp updated_at
        timestamp deleted_at
    }

    servicios_psicologo {
        uuid id PK
        uuid psicologo_id FK
        uuid tipo_servicio_id FK
        string nombre
        text descripcion
        int duracion
        string categoria
        boolean activo
        timestamp created_at
        timestamp updated_at
        timestamp deleted_at
    }

    disponibilidad_mensual {
        uuid id PK
        uuid psicologo_id FK
        date fecha
        time hora_inicio
        time hora_fin
        boolean disponible
        string motivo_no_disponible
        timestamp created_at
        timestamp updated_at
        timestamp deleted_at
    }

    mensajes_chat {
        uuid id PK
        text contenido
        uuid remitente_id FK
        uuid destinatario_id FK
        string tipo
        boolean leido
        timestamp created_at
        timestamp updated_at
        timestamp deleted_at
    }

    logs_auditoria {
        uuid id PK
        uuid usuario_id FK
        string accion
        string tabla_afectada
        uuid registro_id
        json valores_anteriores
        json valores_nuevos
        json metadatos
        timestamp created_at
    }

    SequelizeMeta {
        string name PK
    }

    roles ||--o{ usuarios : "tiene"
    usuarios ||--o{ pacientes : "registra"
    usuarios ||--o{ pacientes : "atiende"
    usuarios ||--o{ sesiones : "conduce"
    usuarios ||--o{ tareas : "asigna"
    usuarios ||--o{ servicios_psicologo : "ofrece"
    usuarios ||--o{ disponibilidad_mensual : "define"
    usuarios ||--o{ mensajes_chat : "envia"
    usuarios ||--o{ mensajes_chat : "recibe"
    usuarios ||--o{ logs_auditoria : "registra"
    pacientes ||--o{ sesiones : "tiene"
    pacientes ||--o{ tareas : "recibe"
    pacientes ||--o{ respuestas_tareas : "responde"
    tareas ||--o{ respuestas_tareas : "genera"
```

## Resumen de Tablas

| Tabla | Descripción | Registros Estimados |
|-------|-------------|-------------------|
| `roles` | Roles del sistema (admin, psicologo, recepcionista, paciente) | 4 |
| `usuarios` | Usuarios del sistema | ~100-500 |
| `pacientes` | Información específica de pacientes | ~50-200 |
| `sesiones` | Sesiones terapéuticas | ~1000-5000 |
| `tareas` | Tareas asignadas a pacientes | ~500-2000 |
| `respuestas_tareas` | Respuestas de pacientes a tareas | ~200-1000 |
| `servicios_psicologo` | Servicios ofrecidos por psicólogos | ~20-100 |
| `disponibilidad_mensual` | Disponibilidad mensual de psicólogos | ~1000-5000 |
| `mensajes_chat` | Mensajes del chat en tiempo real | ~5000-50000 |
| `logs_auditoria` | Logs de auditoría del sistema | ~10000-100000 |
| `SequelizeMeta` | Metadatos de migraciones | ~20 |

**Total: 11 tablas**
