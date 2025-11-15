# GUÍA DE MIGRACIÓN COMPLETA
## Reestructuración de Base de Datos - Centro Terapéutico Psyche

**Fecha:** 15 de noviembre de 2025  
**Versión:** 2.0

---

## IMPORTANTE: ANTES DE EJECUTAR

⚠️ **BACKUP OBLIGATORIO** ⚠️

```bash
# 1. Hacer backup completo de la base de datos
pg_dump -U postgres -d psyche_db > backup_pre_migracion_$(date +%Y%m%d_%H%M%S).sql

# 2. Verificar que el backup se creó correctamente
ls -lh backup_pre_migracion_*.sql

# 3. Probar el backup en una base de datos de prueba (opcional pero recomendado)
createdb psyche_test
psql -U postgres -d psyche_test < backup_pre_migracion_*.sql
```

---

## ORDEN DE EJECUCIÓN

Las migraciones DEBEN ejecutarse en el orden exacto especificado:

### Fase 1: Crear nuevas tablas (sin dependencias)
```bash
# 1. Tipos de servicio
npm run db:migrate -- --name 20251115000001-create-tipos-servicio

# 2. Objetivos terapéuticos
npm run db:migrate -- --name 20251115000002-create-objetivos-terapeuticos

# 3. Técnicas terapéuticas
npm run db:migrate -- --name 20251115000003-create-tecnicas-terapeuticas
```

### Fase 2: Crear tablas pivote y relacionadas
```bash
# 4. Sesión-Objetivos (N:M)
npm run db:migrate -- --name 20251115000004-create-sesion-objetivos

# 5. Sesión-Técnicas (N:M)
npm run db:migrate -- --name 20251115000005-create-sesion-tecnicas

# 6. Evaluaciones de sesión (1:1)
npm run db:migrate -- --name 20251115000006-create-evaluaciones-sesion

# 7. Archivos centralizados
npm run db:migrate -- --name 20251115000007-create-archivos
```

### Fase 3: Modificar tablas existentes (CRÍTICO)
```bash
# 8. Eliminar campos redundantes de pacientes
npm run db:migrate -- --name 20251115000008-remove-redundant-fields-pacientes

# 9. Normalizar servicios_psicologo
npm run db:migrate -- --name 20251115000009-normalize-servicios-psicologo

# 10. Renombrar disponibilidad_mensual
npm run db:migrate -- --name 20251115000010-rename-disponibilidad-mensual

# 11. Eliminar campos JSONB de sesiones
npm run db:migrate -- --name 20251115000011-remove-jsonb-fields-sesiones

# 12. Eliminar campos de respuesta de tareas
npm run db:migrate -- --name 20251115000012-remove-response-fields-tareas
```

---

## ALTERNATIVA: Ejecutar todas las migraciones juntas

```bash
# Ejecutar TODAS las migraciones en orden
npm run db:migrate
```

---

## VERIFICACIONES POST-MIGRACIÓN

### 1. Verificar integridad de datos

```sql
-- Verificar que no hay pacientes sin usuario
SELECT COUNT(*) FROM pacientes WHERE usuario_id IS NULL;

-- Verificar que no hay referencias rotas en servicios_psicologo
SELECT COUNT(*) FROM servicios_psicologo sp
LEFT JOIN tipos_servicio ts ON sp.tipo_servicio_id = ts.id
WHERE ts.id IS NULL;

-- Verificar que la tabla fue renombrada
SELECT COUNT(*) FROM horarios_disponibles;

-- Verificar que existen las nuevas tablas
SELECT COUNT(*) FROM tipos_servicio;
SELECT COUNT(*) FROM objetivos_terapeuticos;
SELECT COUNT(*) FROM tecnicas_terapeuticas;
SELECT COUNT(*) FROM sesion_objetivos;
SELECT COUNT(*) FROM sesion_tecnicas;
SELECT COUNT(*) FROM evaluaciones_sesion;
SELECT COUNT(*) FROM archivos;
```

### 2. Verificar que las columnas fueron eliminadas

```sql
-- Pacientes NO debe tener estos campos:
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'pacientes' 
AND column_name IN ('nombres', 'apellidos', 'email', 'telefono', 'fecha_nacimiento', 'genero');
-- Debe devolver 0 resultados

-- Sesiones NO debe tener estos campos:
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'sesiones' 
AND column_name IN ('objetivos_sesion', 'tecnicas_utilizadas', 'evaluacion_paciente', 'archivos_sesion');
-- Debe devolver 0 resultados

-- Tareas NO debe tener estos campos:
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'tareas' 
AND column_name IN ('respuesta_paciente', 'archivos_respuesta', 'fecha_completada');
-- Debe devolver 0 resultados
```

### 3. Verificar JOIN de pacientes con usuarios

```sql
-- Este query debe funcionar correctamente:
SELECT 
  p.id,
  p.numero_ficha,
  p.rut,
  u.nombres,
  u.apellidos,
  u.email,
  u.telefono,
  u.fecha_nacimiento,
  u.genero
FROM pacientes p
INNER JOIN usuarios u ON p.usuario_id = u.id
LIMIT 10;
```

---

## ROLLBACK (si algo sale mal)

Si necesitas revertir las migraciones:

```bash
# Revertir la última migración
npm run db:migrate:undo

# Revertir TODAS las migraciones (CUIDADO)
npm run db:migrate:undo:all

# Restaurar desde backup
psql -U postgres -d psyche_db < backup_pre_migracion_YYYYMMDD_HHMMSS.sql
```

---

## SIGUIENTES PASOS DESPUÉS DE LA MIGRACIÓN

### 1. Actualizar modelos en el código
```bash
# Renombrar archivos _v2 a archivos principales
mv backend/src/modelos/Paciente_v2.ts backend/src/modelos/Paciente.ts
mv backend/src/modelos/Sesion_v2.ts backend/src/modelos/Sesion.ts
mv backend/src/modelos/Tarea_v2.ts backend/src/modelos/Tarea.ts
mv backend/src/modelos/ServicioPsicologo_v2.ts backend/src/modelos/ServicioPsicologo.ts
mv backend/src/modelos/index_v2.ts backend/src/modelos/index.ts
```

### 2. Actualizar controladores
- Adaptar queries de pacientes (agregar JOINs)
- Actualizar creación/actualización de sesiones (usar tablas pivote)
- Actualizar sistema de tareas (usar respuestas_tareas)

### 3. Actualizar frontend
- Adaptar interfaces TypeScript
- Actualizar componentes que muestran datos de pacientes
- Actualizar componentes de sesiones

### 4. Testing exhaustivo
- Probar login
- Probar gestión de pacientes
- Probar agendamiento de sesiones
- Probar sistema de tareas
- Probar chat
- Probar reportes

---

## MÉTRICAS DE ÉXITO

✅ Todas las migraciones ejecutadas sin errores  
✅ No hay referencias rotas en FKs  
✅ Queries de ejemplo funcionan correctamente  
✅ Sistema funciona sin pérdida de funcionalidades  
✅ Performance mejorada en queries complejos  

---

## SOPORTE

Si encuentras problemas durante la migración:

1. **NO continúes** con las siguientes migraciones
2. Revisa los logs de error
3. Restaura desde el backup si es necesario
4. Documenta el error específico
5. Contacta al equipo de desarrollo

---

**Autor:** Cursor AI Assistant  
**Fecha de creación:** 15 de noviembre de 2025

