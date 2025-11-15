# 🚀 INSTRUCCIONES PARA EJECUTAR LA MIGRACIÓN
## Centro Terapéutico Psyche - Guía Rápida

---

## ⚠️ IMPORTANTE: LEE ESTO PRIMERO

Esta migración es **IRREVERSIBLE** sin un backup. Sigue estos pasos **EXACTAMENTE** en orden.

---

## PASO 1: BACKUP (OBLIGATORIO) ⚡

```bash
# 1. Hacer backup de la base de datos
pg_dump -U postgres -d psyche_db > backup_pre_migracion_$(date +%Y%m%d_%H%M%S).sql

# 2. Verificar que el backup se creó
ls -lh backup_pre_migracion_*.sql

# 3. Verificar que el backup es válido (opcional pero recomendado)
head -n 20 backup_pre_migracion_*.sql
```

**✅ No continues sin un backup válido**

---

## PASO 2: DETENER EL SERVIDOR

```bash
# Si el backend está corriendo, detén el servidor
# Presiona Ctrl+C en la terminal donde corre npm run dev
```

---

## PASO 3: EJECUTAR MIGRACIONES

```bash
# Ir al directorio del backend
cd backend

# Ejecutar TODAS las migraciones
npm run db:migrate
```

**Tiempo estimado:** 2-5 minutos

**Salida esperada:**
```
== 20251115000001-create-tipos-servicio: migrating =======
== 20251115000001-create-tipos-servicio: migrated (0.234s)

== 20251115000002-create-objetivos-terapeuticos: migrating =======
== 20251115000002-create-objetivos-terapeuticos: migrated (0.187s)

... (continúa para todas las migraciones)

== 20251115000013-drop-obsolete-tables: migrating =======
== 20251115000013-drop-obsolete-tables: migrated (0.045s)
```

---

## PASO 4: VERIFICAR QUE TODO FUNCIONÓ

```bash
# Conectar a la base de datos
psql -U postgres -d psyche_db
```

Luego ejecuta estos comandos SQL:

```sql
-- 1. Verificar nuevas tablas
\dt tipos_servicio
\dt objetivos_terapeuticos
\dt tecnicas_terapeuticas
\dt sesion_objetivos
\dt sesion_tecnicas
\dt evaluaciones_sesion
\dt archivos
\dt horarios_disponibles

-- 2. Verificar que tienen datos iniciales
SELECT COUNT(*) as tipos_servicio FROM tipos_servicio;
SELECT COUNT(*) as objetivos FROM objetivos_terapeuticos;
SELECT COUNT(*) as tecnicas FROM tecnicas_terapeuticas;

-- 3. Verificar que pacientes NO tiene campos redundantes
\d pacientes

-- DEBE mostrar:
-- - numero_ficha
-- - rut
-- - direccion
-- - estrategias_autorregulacion
-- - etc.
-- 
-- NO DEBE mostrar:
-- - nombres ❌
-- - apellidos ❌
-- - email ❌
-- - telefono ❌
-- - fecha_nacimiento ❌
-- - genero ❌

-- 4. Probar JOIN de pacientes con usuarios
SELECT 
  p.id,
  p.numero_ficha,
  u.nombres,
  u.apellidos,
  u.email
FROM pacientes p
INNER JOIN usuarios u ON p.usuario_id = u.id
LIMIT 3;

-- 5. Salir de psql
\q
```

---

## PASO 5: INICIAR EL SERVIDOR

```bash
# Iniciar el backend
cd backend
npm run dev
```

**Salida esperada:**
```
🚀 Servidor iniciado en puerto 3002
✅ Base de datos conectada
```

**❌ Si ves errores:**
- Revisa el log completo
- Busca errores relacionados con modelos o tablas
- Ver sección "TROUBLESHOOTING" abajo

---

## PASO 6: PROBAR ENDPOINTS CRÍTICOS

### A) Probar Login

```bash
curl -X POST http://localhost:3002/api/autenticacion/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "tu_email@ejemplo.com",
    "password": "tu_password"
  }'
```

**✅ Debe devolver:** Token JWT

### B) Probar Listar Pacientes

```bash
# Usar el token del paso anterior
curl -X GET http://localhost:3002/api/pacientes \
  -H "Authorization: Bearer TU_TOKEN_AQUI"
```

**✅ Debe devolver:** Lista de pacientes con datos de usuario

### C) Probar Listar Sesiones

```bash
curl -X GET http://localhost:3002/api/sesiones/psicologo \
  -H "Authorization: Bearer TU_TOKEN_AQUI"
```

**✅ Debe devolver:** Lista de sesiones

---

## 🎉 SI TODO FUNCIONA

✅ La migración fue exitosa  
✅ El sistema está funcionando correctamente  
✅ Puedes continuar usando el sistema normalmente

**Siguiente paso:** Probar todas las funcionalidades en el frontend

---

## ❌ TROUBLESHOOTING

### Error: "columna nombres no existe"

**Problema:** El código aún usa campos antiguos de pacientes

**Solución:**
```bash
# Asegúrate de que los modelos estén actualizados
ls backend/src/modelos/Paciente.ts
# No debe existir: Paciente_v2.ts

# Reinicia el servidor
```

### Error: "tabla disponibilidad_mensual no existe"

**Problema:** El código usa el nombre antiguo de la tabla

**Solución:**
```bash
# Buscar referencias al nombre antiguo
grep -r "DisponibilidadMensual" backend/src/
grep -r "disponibilidad_mensual" backend/src/

# Deben apuntar a HorarioDisponible y horarios_disponibles
```

### Error: "Cannot find module './modelos/DisponibilidadMensual'"

**Problema:** Imports antiguos

**Solución:**
```bash
# Verificar que el archivo fue eliminado
ls backend/src/modelos/DisponibilidadMensual.ts
# No debe existir

# Verificar que index.ts importa HorarioDisponible
grep "HorarioDisponible" backend/src/modelos/index.ts
```

### Error: Servidor no inicia

**Solución:**
```bash
# 1. Limpiar node_modules
cd backend
rm -rf node_modules
npm install

# 2. Recompilar TypeScript
npm run build

# 3. Reiniciar
npm run dev
```

---

## 🔄 ROLLBACK (Si algo sale muy mal)

### Opción 1: Restaurar desde Backup

```bash
# Detener el servidor
# Presiona Ctrl+C

# Conectar a PostgreSQL
psql -U postgres

# Eliminar la base de datos actual
DROP DATABASE psyche_db;
CREATE DATABASE psyche_db;
\q

# Restaurar desde backup
psql -U postgres -d psyche_db < backup_pre_migracion_YYYYMMDD_HHMMSS.sql

# Reiniciar servidor
cd backend
npm run dev
```

### Opción 2: Revertir Migraciones

```bash
# Revertir todas las migraciones (CUIDADO)
cd backend
npm run db:migrate:undo:all

# O revertir una por una
npm run db:migrate:undo
npm run db:migrate:undo
# ... etc
```

---

## 📊 CHECKLIST DE VERIFICACIÓN

Marca ✅ cuando completes cada paso:

- [ ] 1. Backup creado y verificado
- [ ] 2. Servidor detenido
- [ ] 3. Migraciones ejecutadas sin errores
- [ ] 4. Nuevas tablas creadas
- [ ] 5. Campos redundantes eliminados
- [ ] 6. JOIN de pacientes funciona
- [ ] 7. Servidor inicia sin errores
- [ ] 8. Login funciona
- [ ] 9. Listar pacientes funciona
- [ ] 10. Listar sesiones funciona

---

## 🎯 RESUMEN

1. ✅ **Backup** (OBLIGATORIO)
2. ✅ Detener servidor
3. ✅ `npm run db:migrate`
4. ✅ Verificar en psql
5. ✅ Iniciar servidor
6. ✅ Probar endpoints
7. ✅ Listo!

**Tiempo total:** 10-15 minutos

---

**Preparado por:** Cursor AI Assistant  
**Fecha:** 15 de noviembre de 2025  
**Versión:** 1.0

