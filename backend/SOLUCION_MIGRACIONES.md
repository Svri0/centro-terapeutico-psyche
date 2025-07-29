# Solución de Problemas de Migraciones

## Error: "llave duplicada viola restricción de unicidad «roles_pkey»"

Este error ocurre cuando intentas ejecutar los seeders pero los roles ya existen en la base de datos.

## Soluciones

### Opción 1: Usar el script de configuración automática (Recomendado)

```bash
# Desde el directorio backend/
npm run setup:admin
```

Este script:
- ✅ Verifica dependencias
- ✅ Crea archivo .env si no existe
- ✅ Ejecuta migraciones de forma segura
- ✅ Ejecuta seeders sin errores de duplicación
- ✅ Crea usuario administrador inicial
- ✅ Muestra información de configuración

### Opción 2: Ejecutar comandos manualmente

```bash
# 1. Verificar estado de migraciones
npm run db:check

# 2. Ejecutar migraciones (si es necesario)
npm run db:migrate

# 3. Ejecutar seeders (ahora maneja duplicaciones)
npm run db:seed
```

### Opción 3: Resetear base de datos (¡CUIDADO!)

```bash
# ⚠️  ESTO BORRARÁ TODOS LOS DATOS
npm run db:reset
```

## Verificación

Después de ejecutar cualquiera de las opciones, verifica que todo funcione:

```bash
# 1. Iniciar servidor
npm run dev

# 2. Verificar salud del servidor
curl http://localhost:3002/salud

# 3. Verificar que el usuario administrador existe
# (Consulta la base de datos o usa el endpoint de autenticación)
```

## Usuario Administrador por Defecto

Si el seeder se ejecutó correctamente, tendrás un usuario administrador:

- **Email**: `admin@terapia.cl`
- **Contraseña**: `Admin123!`

## Troubleshooting

### Error: "No se encontró el rol de administrador"

```bash
# Verificar que los roles existen
psql -U postgres -d psyche_db -c "SELECT * FROM roles;"
```

### Error: "No se puede conectar a la base de datos"

```bash
# 1. Verificar que PostgreSQL esté ejecutándose
# 2. Verificar credenciales en .env
# 3. Crear base de datos si no existe
npm run db:create
```

### Error: "JWT_SECRET no está definido"

```bash
# Agregar JWT_SECRET al archivo .env
echo "JWT_SECRET=tu_secreto_super_seguro_y_largo" >> .env
```

## Comandos Útiles

```bash
# Ver estado de migraciones
npm run db:check

# Ver logs del servidor
npm run dev

# Verificar salud del servidor
npm run health

# Matar procesos en puertos ocupados
npm run kill-ports
```

## Estructura de Base de Datos Esperada

Después de una configuración exitosa, deberías tener:

### Tabla `roles`
- id: 1, nombre: 'administrador'
- id: 2, nombre: 'psicologo'
- id: 3, nombre: 'paciente'
- id: 4, nombre: 'recepcionista'

### Tabla `usuarios`
- Al menos un usuario con rol_id: 1 (administrador)

## Próximos Pasos

1. ✅ Configurar base de datos
2. ✅ Crear usuario administrador
3. 🔄 Iniciar servidor: `npm run dev`
4. 🔄 Probar API: `curl http://localhost:3002/salud`
5. 🔄 Crear psicólogos usando la API de administrador

## Soporte

Si sigues teniendo problemas:

1. Verifica que PostgreSQL esté ejecutándose
2. Verifica las credenciales en `.env`
3. Revisa los logs del servidor
4. Consulta la documentación en `docs/API_ADMIN.md` 