
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
```bash
node generar-diagrama-relaciones.js
```
