#!/usr/bin/env node

/**
 * Script para generar diagrama de relaciones de la base de datos
 * Basado en los modelos de Sequelize del Centro Terapéutico Psyche
 */

const fs = require('fs');
const path = require('path');

// Función para generar diagrama en formato Mermaid
function generarDiagramaMermaid() {
  const diagrama = `
erDiagram
    ROLES {
        int id PK
        string nombre
        string descripcion
        boolean activo
        timestamp created_at
        timestamp updated_at
    }
    
    USUARIOS {
        uuid id PK
        string email UK
        string password_hash
        string nombres
        string apellidos
        string telefono
        date fecha_nacimiento
        enum genero
        string avatar_url
        string especialidad
        string descripcion
        string codigo_sbs
        int rol_id FK
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
    
    PACIENTES {
        uuid id PK
        uuid usuario_id FK
        uuid psicologo_id FK
        string nombres
        string apellidos
        string email
        string telefono
        date fecha_nacimiento
        enum genero
        string numero_ficha UK
        string rut UK
        text direccion
        string contacto_emergencia_nombre
        string contacto_emergencia_telefono
        string contacto_emergencia_relacion
        jsonb diagnosticos
        jsonb etiquetas
        jsonb estrategias_autorregulacion
        int puntos_acumulados
        enum estado
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
    
    SESIONES {
        uuid id PK
        uuid paciente_id FK
        uuid psicologo_id FK
        date fecha_sesion
        time hora_inicio
        time hora_fin
        enum tipo_sesion
        enum estado
        text notas_psicologo
        text objetivos_sesion
        text tareas_asignadas
        text observaciones
        decimal costo_sesion
        boolean pagada
        timestamp created_at
        timestamp updated_at
        timestamp deleted_at
    }
    
    TAREAS {
        uuid id PK
        uuid paciente_id FK
        uuid psicologo_id FK
        uuid sesion_id FK
        string titulo
        text descripcion
        enum tipo_tarea
        enum estado
        date fecha_vencimiento
        date fecha_completada
        text instrucciones
        jsonb recursos_adicionales
        int puntos_recompensa
        timestamp created_at
        timestamp updated_at
        timestamp deleted_at
    }
    
    RESPUESTAS_TAREAS {
        uuid id PK
        uuid tarea_id FK
        uuid paciente_id FK
        text respuesta_texto
        jsonb respuesta_archivos
        jsonb respuesta_multimedia
        enum estado
        text comentarios_psicologo
        int puntos_obtenidos
        timestamp fecha_respuesta
        timestamp created_at
        timestamp updated_at
        timestamp deleted_at
    }
    
    SERVICIOS_PSICOLOGO {
        uuid id PK
        uuid psicologo_id FK
        string nombre_servicio
        text descripcion
        decimal precio
        int duracion_minutos
        enum tipo_servicio
        boolean activo
        timestamp created_at
        timestamp updated_at
        timestamp deleted_at
    }
    
    DISPONIBILIDAD_MENSUAL {
        uuid id PK
        uuid psicologo_id FK
        int año
        int mes
        jsonb disponibilidad_dias
        jsonb horarios_disponibles
        text observaciones
        boolean activo
        timestamp created_at
        timestamp updated_at
        timestamp deleted_at
    }
    
    LOGS_AUDITORIA {
        uuid id PK
        uuid usuario_id FK
        string accion
        string tabla_afectada
        uuid registro_id
        jsonb datos_anteriores
        jsonb datos_nuevos
        string ip_address
        string user_agent
        timestamp created_at
    }
    
    CHAT {
        uuid id PK
        uuid paciente_id FK
        uuid psicologo_id FK
        text mensaje
        enum tipo_mensaje
        boolean leido
        timestamp fecha_envio
        timestamp created_at
        timestamp updated_at
        timestamp deleted_at
    }
    
    MENSAJES {
        uuid id PK
        uuid chat_id FK
        uuid remitente_id FK
        text contenido
        enum tipo_contenido
        jsonb archivos_adjuntos
        boolean leido
        timestamp fecha_envio
        timestamp created_at
        timestamp updated_at
        timestamp deleted_at
    }
    
    CITAS {
        uuid id PK
        uuid paciente_id FK
        uuid psicologo_id FK
        date fecha_cita
        time hora_inicio
        time hora_fin
        enum estado
        text motivo
        text observaciones
        decimal costo
        boolean confirmada
        timestamp created_at
        timestamp updated_at
        timestamp deleted_at
    }
    
    DISPONIBILIDAD_PSICOLOGOS {
        uuid id PK
        uuid psicologo_id FK
        int dia_semana
        time hora_inicio
        time hora_fin
        boolean activo
        timestamp created_at
        timestamp updated_at
        timestamp deleted_at
    }
    
    DISPONIBILIDAD_SEMANAL {
        uuid id PK
        uuid psicologo_id FK
        int semana
        int año
        jsonb horarios_disponibles
        text observaciones
        boolean activo
        timestamp created_at
        timestamp updated_at
        timestamp deleted_at
    }

    %% Relaciones
    ROLES ||--o{ USUARIOS : "tiene"
    USUARIOS ||--o{ PACIENTES : "es_usuario"
    USUARIOS ||--o{ PACIENTES : "asigna_psicologo"
    USUARIOS ||--o{ SESIONES : "realiza"
    USUARIOS ||--o{ TAREAS : "asigna"
    USUARIOS ||--o{ SERVICIOS_PSICOLOGO : "ofrece"
    USUARIOS ||--o{ DISPONIBILIDAD_MENSUAL : "tiene"
    USUARIOS ||--o{ LOGS_AUDITORIA : "genera"
    USUARIOS ||--o{ CHAT : "participa"
    USUARIOS ||--o{ MENSAJES : "envia"
    USUARIOS ||--o{ CITAS : "tiene"
    USUARIOS ||--o{ DISPONIBILIDAD_PSICOLOGOS : "tiene"
    USUARIOS ||--o{ DISPONIBILIDAD_SEMANAL : "tiene"
    
    PACIENTES ||--o{ SESIONES : "tiene"
    PACIENTES ||--o{ TAREAS : "recibe"
    PACIENTES ||--o{ RESPUESTAS_TAREAS : "responde"
    PACIENTES ||--o{ CHAT : "participa"
    PACIENTES ||--o{ CITAS : "tiene"
    
    SESIONES ||--o{ TAREAS : "genera"
    
    TAREAS ||--o{ RESPUESTAS_TAREAS : "tiene"
    
    CHAT ||--o{ MENSAJES : "contiene"
`;

  return diagrama;
}

// Función para generar diagrama en formato PlantUML
function generarDiagramaPlantUML() {
  const diagrama = `
@startuml
!define TABLE(name,desc) class name as "desc" << (T,#FFAAAA) >>
!define PK(x) <b><color:red>x</color></b>
!define FK(x) <color:blue>x</color>

package "Centro Terapéutico Psyche" {
  
  TABLE(ROLES, "Roles del Sistema")
  TABLE(USUARIOS, "Usuarios del Sistema")
  TABLE(PACIENTES, "Pacientes")
  TABLE(SESIONES, "Sesiones Terapéuticas")
  TABLE(TAREAS, "Tareas Asignadas")
  TABLE(RESPUESTAS_TAREAS, "Respuestas de Tareas")
  TABLE(SERVICIOS_PSICOLOGO, "Servicios de Psicólogos")
  TABLE(DISPONIBILIDAD_MENSUAL, "Disponibilidad Mensual")
  TABLE(LOGS_AUDITORIA, "Logs de Auditoría")
  TABLE(CHAT, "Chats")
  TABLE(MENSAJES, "Mensajes")
  TABLE(CITAS, "Citas")
  TABLE(DISPONIBILIDAD_PSICOLOGOS, "Disponibilidad Psicólogos")
  TABLE(DISPONIBILIDAD_SEMANAL, "Disponibilidad Semanal")
  
  %% Relaciones principales
  ROLES ||--o{ USUARIOS : "FK: rol_id"
  USUARIOS ||--o{ PACIENTES : "FK: usuario_id"
  USUARIOS ||--o{ PACIENTES : "FK: psicologo_id"
  USUARIOS ||--o{ SESIONES : "FK: psicologo_id"
  USUARIOS ||--o{ TAREAS : "FK: psicologo_id"
  USUARIOS ||--o{ SERVICIOS_PSICOLOGO : "FK: psicologo_id"
  USUARIOS ||--o{ DISPONIBILIDAD_MENSUAL : "FK: psicologo_id"
  USUARIOS ||--o{ LOGS_AUDITORIA : "FK: usuario_id"
  USUARIOS ||--o{ CHAT : "FK: psicologo_id"
  USUARIOS ||--o{ MENSAJES : "FK: remitente_id"
  USUARIOS ||--o{ CITAS : "FK: psicologo_id"
  USUARIOS ||--o{ DISPONIBILIDAD_PSICOLOGOS : "FK: psicologo_id"
  USUARIOS ||--o{ DISPONIBILIDAD_SEMANAL : "FK: psicologo_id"
  
  PACIENTES ||--o{ SESIONES : "FK: paciente_id"
  PACIENTES ||--o{ TAREAS : "FK: paciente_id"
  PACIENTES ||--o{ RESPUESTAS_TAREAS : "FK: paciente_id"
  PACIENTES ||--o{ CHAT : "FK: paciente_id"
  PACIENTES ||--o{ CITAS : "FK: paciente_id"
  
  SESIONES ||--o{ TAREAS : "FK: sesion_id"
  TAREAS ||--o{ RESPUESTAS_TAREAS : "FK: tarea_id"
  CHAT ||--o{ MENSAJES : "FK: chat_id"
}

@enduml
`;

  return diagrama;
}

// Función para generar diagrama en formato Graphviz
function generarDiagramaGraphviz() {
  const diagrama = `
digraph G {
  rankdir=TB;
  node [shape=record, style=filled, fillcolor=lightblue];
  
  // Definir tablas
  ROLES [label="{ROLES|id (PK)|nombre|descripcion|activo|created_at|updated_at}"];
  USUARIOS [label="{USUARIOS|id (PK)|email (UK)|password_hash|nombres|apellidos|telefono|fecha_nacimiento|genero|avatar_url|especialidad|descripcion|codigo_sbs|rol_id (FK)|activo|email_verificado|token_activacion|token_activacion_expira|ultimo_acceso|configuracion|created_at|updated_at|deleted_at}"];
  PACIENTES [label="{PACIENTES|id (PK)|usuario_id (FK)|psicologo_id (FK)|nombres|apellidos|email|telefono|fecha_nacimiento|genero|numero_ficha (UK)|rut (UK)|direccion|contacto_emergencia_nombre|contacto_emergencia_telefono|contacto_emergencia_relacion|diagnosticos|etiquetas|estrategias_autorregulacion|puntos_acumulados|estado|fecha_ingreso|fecha_alta|observaciones|antecedentes_medicos|medicacion_actual|alergias|condiciones_cronicas|historial_psiquiatrico|observaciones_medicas|created_at|updated_at|deleted_at}"];
  SESIONES [label="{SESIONES|id (PK)|paciente_id (FK)|psicologo_id (FK)|fecha_sesion|hora_inicio|hora_fin|tipo_sesion|estado|notas_psicologo|objetivos_sesion|tareas_asignadas|observaciones|costo_sesion|pagada|created_at|updated_at|deleted_at}"];
  TAREAS [label="{TAREAS|id (PK)|paciente_id (FK)|psicologo_id (FK)|sesion_id (FK)|titulo|descripcion|tipo_tarea|estado|fecha_vencimiento|fecha_completada|instrucciones|recursos_adicionales|puntos_recompensa|created_at|updated_at|deleted_at}"];
  RESPUESTAS_TAREAS [label="{RESPUESTAS_TAREAS|id (PK)|tarea_id (FK)|paciente_id (FK)|respuesta_texto|respuesta_archivos|respuesta_multimedia|estado|comentarios_psicologo|puntos_obtenidos|fecha_respuesta|created_at|updated_at|deleted_at}"];
  SERVICIOS_PSICOLOGO [label="{SERVICIOS_PSICOLOGO|id (PK)|psicologo_id (FK)|nombre_servicio|descripcion|precio|duracion_minutos|tipo_servicio|activo|created_at|updated_at|deleted_at}"];
  DISPONIBILIDAD_MENSUAL [label="{DISPONIBILIDAD_MENSUAL|id (PK)|psicologo_id (FK)|año|mes|disponibilidad_dias|horarios_disponibles|observaciones|activo|created_at|updated_at|deleted_at}"];
  LOGS_AUDITORIA [label="{LOGS_AUDITORIA|id (PK)|usuario_id (FK)|accion|tabla_afectada|registro_id|datos_anteriores|datos_nuevos|ip_address|user_agent|created_at}"];
  CHAT [label="{CHAT|id (PK)|paciente_id (FK)|psicologo_id (FK)|mensaje|tipo_mensaje|leido|fecha_envio|created_at|updated_at|deleted_at}"];
  MENSAJES [label="{MENSAJES|id (PK)|chat_id (FK)|remitente_id (FK)|contenido|tipo_contenido|archivos_adjuntos|leido|fecha_envio|created_at|updated_at|deleted_at}"];
  CITAS [label="{CITAS|id (PK)|paciente_id (FK)|psicologo_id (FK)|fecha_cita|hora_inicio|hora_fin|estado|motivo|observaciones|costo|confirmada|created_at|updated_at|deleted_at}"];
  DISPONIBILIDAD_PSICOLOGOS [label="{DISPONIBILIDAD_PSICOLOGOS|id (PK)|psicologo_id (FK)|dia_semana|hora_inicio|hora_fin|activo|created_at|updated_at|deleted_at}"];
  DISPONIBILIDAD_SEMANAL [label="{DISPONIBILIDAD_SEMANAL|id (PK)|psicologo_id (FK)|semana|año|horarios_disponibles|observaciones|activo|created_at|updated_at|deleted_at}"];
  
  // Relaciones
  ROLES -> USUARIOS [label="1:N"];
  USUARIOS -> PACIENTES [label="1:1 (usuario)"];
  USUARIOS -> PACIENTES [label="1:N (psicologo)"];
  USUARIOS -> SESIONES [label="1:N"];
  USUARIOS -> TAREAS [label="1:N"];
  USUARIOS -> SERVICIOS_PSICOLOGO [label="1:N"];
  USUARIOS -> DISPONIBILIDAD_MENSUAL [label="1:N"];
  USUARIOS -> LOGS_AUDITORIA [label="1:N"];
  USUARIOS -> CHAT [label="1:N"];
  USUARIOS -> MENSAJES [label="1:N"];
  USUARIOS -> CITAS [label="1:N"];
  USUARIOS -> DISPONIBILIDAD_PSICOLOGOS [label="1:N"];
  USUARIOS -> DISPONIBILIDAD_SEMANAL [label="1:N"];
  
  PACIENTES -> SESIONES [label="1:N"];
  PACIENTES -> TAREAS [label="1:N"];
  PACIENTES -> RESPUESTAS_TAREAS [label="1:N"];
  PACIENTES -> CHAT [label="1:N"];
  PACIENTES -> CITAS [label="1:N"];
  
  SESIONES -> TAREAS [label="1:N"];
  TAREAS -> RESPUESTAS_TAREAS [label="1:N"];
  CHAT -> MENSAJES [label="1:N"];
}
`;

  return diagrama;
}

// Función principal
function main() {
  console.log('🔍 Generando diagramas de relaciones para el Centro Terapéutico Psyche...\n');
  
  // Crear directorio de salida si no existe
  const outputDir = path.join(__dirname, 'diagramas');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  // Generar diagrama Mermaid
  const mermaidDiagram = generarDiagramaMermaid();
  fs.writeFileSync(path.join(outputDir, 'diagrama-relaciones.mmd'), mermaidDiagram);
  console.log('✅ Diagrama Mermaid generado: diagramas/diagrama-relaciones.mmd');
  
  // Generar diagrama PlantUML
  const plantUMLDiagram = generarDiagramaPlantUML();
  fs.writeFileSync(path.join(outputDir, 'diagrama-relaciones.puml'), plantUMLDiagram);
  console.log('✅ Diagrama PlantUML generado: diagramas/diagrama-relaciones.puml');
  
  // Generar diagrama Graphviz
  const graphvizDiagram = generarDiagramaGraphviz();
  fs.writeFileSync(path.join(outputDir, 'diagrama-relaciones.dot'), graphvizDiagram);
  console.log('✅ Diagrama Graphviz generado: diagramas/diagrama-relaciones.dot');
  
  // Generar archivo README con instrucciones
  const readme = `
# Diagramas de Relaciones - Centro Terapéutico Psyche

Este directorio contiene los diagramas de relaciones de la base de datos del Centro Terapéutico Psyche.

## Archivos generados:

### 1. diagrama-relaciones.mmd (Mermaid)
- **Formato**: Mermaid ERD
- **Cómo ver**: 
  - En GitHub: se renderiza automáticamente
  - En VS Code: instala la extensión "Mermaid Preview"
  - Online: https://mermaid.live/

### 2. diagrama-relaciones.puml (PlantUML)
- **Formato**: PlantUML
- **Cómo ver**:
  - En VS Code: instala la extensión "PlantUML"
  - Online: http://www.plantuml.com/plantuml/uml/
  - Con Java: java -jar plantuml.jar diagrama-relaciones.puml

### 3. diagrama-relaciones.dot (Graphviz)
- **Formato**: Graphviz DOT
- **Cómo ver**:
  - Instala Graphviz: https://graphviz.org/download/
  - Ejecuta: dot -Tpng diagrama-relaciones.dot -o diagrama.png
  - Online: https://dreampuf.github.io/GraphvizOnline/

## Estructura de la base de datos:

### Tablas principales:
- **ROLES**: Roles del sistema (Admin, Psicólogo, Paciente, Recepcionista)
- **USUARIOS**: Usuarios del sistema con información personal
- **PACIENTES**: Información específica de pacientes
- **SESIONES**: Sesiones terapéuticas
- **TAREAS**: Tareas asignadas a pacientes
- **RESPUESTAS_TAREAS**: Respuestas de pacientes a tareas

### Tablas de soporte:
- **SERVICIOS_PSICOLOGO**: Servicios ofrecidos por psicólogos
- **DISPONIBILIDAD_***: Disponibilidad de psicólogos
- **CHAT/MENSAJES**: Sistema de mensajería
- **CITAS**: Sistema de citas
- **LOGS_AUDITORIA**: Auditoría del sistema

## Relaciones principales:
1. **ROLES** → **USUARIOS** (1:N)
2. **USUARIOS** → **PACIENTES** (1:1 como usuario, 1:N como psicólogo)
3. **PACIENTES** → **SESIONES** (1:N)
4. **SESIONES** → **TAREAS** (1:N)
5. **TAREAS** → **RESPUESTAS_TAREAS** (1:N)

## Cómo regenerar los diagramas:
\`\`\`bash
node generar-diagrama-relaciones.js
\`\`\`
`;

  fs.writeFileSync(path.join(outputDir, 'README.md'), readme);
  console.log('✅ README generado: diagramas/README.md');
  
  console.log('\n🎉 ¡Diagramas generados exitosamente!');
  console.log('\n📋 Instrucciones para ver los diagramas:');
  console.log('1. Mermaid: Abre diagramas/diagrama-relaciones.mmd en GitHub o VS Code');
  console.log('2. PlantUML: Usa http://www.plantuml.com/plantuml/uml/');
  console.log('3. Graphviz: Instala Graphviz y ejecuta: dot -Tpng diagramas/diagrama-relaciones.dot -o diagrama.png');
  console.log('\n💡 Recomendación: Usa el diagrama Mermaid para una vista rápida en GitHub');
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  main();
}

module.exports = {
  generarDiagramaMermaid,
  generarDiagramaPlantUML,
  generarDiagramaGraphviz
};








