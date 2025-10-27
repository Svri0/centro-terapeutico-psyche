# 📊 Guía de Uso: Reportes de Progreso (HU-045)

## ¿Cómo acceder a la funcionalidad?

### 1. Acceder como Psicólogo
1. Inicia sesión en el sistema con tus credenciales de psicólogo
2. Una vez en tu panel principal, verás el menú con varias pestañas
3. Busca la pestaña **"📊 Reportes"** en el menú superior
4. Haz clic en ella para acceder al módulo de Reportes de Progreso

### 2. Ubicación del Menú
La pestaña de Reportes se encuentra entre:
- **Tareas** ← → **📊 Reportes** ← → **Chat**

## Funcionalidades Disponibles

### ✅ Backend Completamente Funcional

El backend ya está 100% operativo con las siguientes capacidades:

#### Endpoints API Disponibles:
- `GET /api/v1/reportes` - Ver todos tus reportes
- `GET /api/v1/reportes/:id` - Ver un reporte específico
- `POST /api/v1/reportes` - Crear un nuevo reporte
- `PUT /api/v1/reportes/:id` - Actualizar un reporte
- `DELETE /api/v1/reportes/:id` - Eliminar un reporte
- `GET /api/v1/reportes/paciente/:paciente_id` - Ver reportes de un paciente
- `GET /api/v1/reportes/:id/exportar` - Exportar reporte

### 🚧 Frontend - Actualmente en Desarrollo

Actualmente el frontend tiene un componente básico que muestra un mensaje indicando que está en desarrollo.

## Próximos Pasos para el Usuario

### Para Ejecutar la Migración de Base de Datos:

```bash
# 1. Ir a la carpeta backend
cd backend

# 2. Ejecutar la migración
npm run migrate
```

### Para Probar la API directamente:

Puedes usar herramientas como Postman o curl para probar los endpoints:

```bash
# Ejemplo: Obtener todos los reportes
curl -X GET http://localhost:3002/api/v1/reportes \
  -H "Authorization: Bearer TU_TOKEN_AQUI"

# Ejemplo: Crear un reporte
curl -X POST http://localhost:3002/api/v1/reportes \
  -H "Authorization: Bearer TU_TOKEN_AQUI" \
  -H "Content-Type: application/json" \
  -d '{
    "paciente_id": "UUID_DEL_PACIENTE",
    "periodo_inicio": "2024-01-01",
    "periodo_fin": "2024-01-31",
    "resumen_evolucion": "El paciente ha mostrado mejoras significativas...",
    "progreso_general": "bueno"
  }'
```

## Qué Falta Implementar en el Frontend

Para que la funcionalidad esté completamente usable desde la interfaz, falta:

1. **Tabla de Reportes**
   - Listar todos los reportes con filtros
   - Mostrar información clave (paciente, período, progreso, estado)
   - Opciones de ordenamiento

2. **Formulario de Creación/Edición**
   - Selección de paciente
   - Definición de período
   - Resumen de evolución (texto largo)
   - Campos de objetivos cumplidos/pendientes
   - Áreas trabajadas
   - Conductas observadas
   - Logros importantes
   - Desafíos identificados
   - Sugerencias terapéuticas
   - Métrica de satisfacción (0-10)
   - Estado del reporte

3. **Vista Detallada**
   - Mostrar todos los campos del reporte
   - Formato legible y profesional
   - Opción de exportar a PDF

4. **Filtros y Búsqueda**
   - Por paciente
   - Por estado (borrador, completado, archivado)
   - Por progreso (excelente, muy bueno, bueno, regular, necesita atención)
   - Por rango de fechas

## Estado Actual vs Estado Deseado

### ✅ Lo que YA funciona:
- Backend completo con CRUD
- Base de datos lista (solo falta ejecutar migración)
- API documentada y funcional
- Autenticación y permisos configurados
- Componente básico en frontend
- Integración en el menú del panel

### 🚧 Lo que falta (Frontend):
- Interfaz completa de gestión de reportes
- Formularios interactivos
- Exportación a PDF desde la UI
- Gráficos de progreso histórico

## Beneficios de la Funcionalidad

Una vez completada, permitirá a los psicólogos:

1. **Seguimiento Estandarizado**: Registrar de forma consistente el progreso de cada paciente
2. **Documentación Profesional**: Crear reportes completos y estructurados
3. **Análisis Histórico**: Comparar la evolución entre períodos
4. **Generación de Informes**: Exportar reportes cuando sea necesario
5. **Comunicación**: Compartir avances con otros profesionales si es necesario

## Notas Técnicas

- **Base de Datos**: PostgreSQL con soporte para JSONB
- **Autenticación**: JWT tokens requeridos
- **Permisos**: Solo psicólogos y administradores pueden crear/editar reportes
- **Soft Delete**: Los reportes se eliminan de forma lógica (no físicamente)

 testimony
