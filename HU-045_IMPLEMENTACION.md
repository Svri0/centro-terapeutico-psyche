# Implementación HU-045: Reportes de Progreso

## Descripción
Como psicólogo debo poder registrar y consultar reportes de progreso por paciente para llevar un seguimiento detallado de su evolución y generar informes cuando sea necesario.

## Estado de Implementación

### Backend ✅

#### 1. Modelo de Datos
- **Archivo**: `backend/src/modelos/ReporteProgreso.ts`
- **Tabla**: `reportes_progreso`
- **Campos principales**:
  - `paciente_id`: ID del paciente
  - `psicologo_id`: ID del psicólogo
  - `periodo_inicio` y `periodo_fin`: Período evaluado
  - `resumen_evolucion`: Resumen detallado
  - `objetivos_cumplidos` y `objetivos_pendientes`: Arrays JSONB
  - `areas_trabajadas`: Áreas trabajadas en el período
  - `conductas_observadas`: Conductas registradas
  - `logros_importantes`: Logros destacables
  - `desafios_identificados`: Desafíos encontrados
  - `progreso_general`: Enum (excelente, muy_bueno, bueno, regular, necesita_atencion)
  - `metrica_satisfaccion`: Puntuación 0-10
  - `estado`: Enum (borrador, completado, archivado)

#### 2. Migración de Base de Datos
- **Archivo**: `backend/src/migrations/20241221000001-create-reportes-progreso.js`
- **Estado**: Creada y lista para ejecutar

#### 3. Controlador
- **Archivo**: `backend/src/controladores/reportes.controlador.ts`
- **Funciones implementadas**:
  - `obtenerTodosReportes()`: Obtener todos los reportes del psicólogo
  - `obtenerReportePorId()`: Obtener un reporte específico
  - `crearReporte()`: Crear un nuevo reporte
  - `actualizarReporte()`: Actualizar un reporte existente
  - `eliminarReporte()`: Eliminar un reporte (soft delete)
  - `exportarReporte()`: Exportar un reporte (JSON por ahora)
  - `obtenerReportesPorPaciente()`: Obtener reportes filtrados por paciente

#### 4. Rutas
- **Archivo**: `backend/src/rutas/reportes.routes.ts`
- **Endpoints**:
  - `GET /api/v1/reportes`: Obtener todos los reportes
  - `GET /api/v1/reportes/paciente/:paciente_id`: Reportes por paciente
  - `GET /api/v1/reportes/:id`: Obtener un reporte
  - `POST /api/v1/reportes`: Crear un reporte
  - `PUT /api/v1/reportes/:id`: Actualizar un reporte
  - `DELETE /api/v1/reportes/:id`: Eliminar un reporte
  - `GET /api/v1/reportes/:id/exportar`: Exportar reporte

### Frontend ✅

#### 1. Servicio
- **Archivo**: `frontend/src/servicios/reportes.service.ts`
- **Interfaces**: 
  - `ReporteProgreso`: Tipo principal del reporte
  - `CrearReporteData`: Datos para crear reporte
  - `ActualizarReporteData`: Datos para actualizar reporte
- **Métodos**:
  - `obtenerTodos()`: Listar reportes
  - `obtenerPorId()`: Obtener reporte específico
  - `crear()`: Crear nuevo reporte
  - `actualizar()`: Actualizar reporte
  - `eliminar()`: Eliminar reporte
  - `exportar()`: Exportar reporte
  - `obtenerPorPaciente()`: Filtrar por paciente

#### 2. Componente
- **Archivo**: `frontend/src/componentes/ReportesProgreso.tsx`
- **Estado**: Componente básico creado (requiere desarrollo completo)

## Próximos Pasos

### Para Completar la Implementación:

1. **Ejecutar la migración**:
   ```bash
   cd backend
   npm run migrate
   ```

2. **Completar el componente frontend**:
   - Implementar tabla de reportes con filtros
   - Crear formulario completo para crear/editar reportes
   - Agregar vista detallada de reporte
   - Implementar exportación a PDF

3. **Integrar en el Panel del Psicólogo**:
   - Agregar la pestaña "Reportes" en el menú
   - Conectar con el servicio de reportes

4. **Funcionalidades adicionales**:
   - Gráficos de progreso histórico
   - Comparativa de períodos
   - Plantillas de reportes
   - Notificaciones automáticas

## Notas Técnicas

- La tabla utiliza soft deletes (campo `deleted_at`)
- Los reportes están vinculados a pacientes, psicólogos y opcionalmente a sesiones
- El campo `areas_trabajadas` permite especificar múltiples áreas trabajadas en el período
- El sistema de métricas permite cuantificar el progreso (0-10)
- Los estados permiten gestionar el ciclo de vida del reporte (borrador → completado → archivado)

