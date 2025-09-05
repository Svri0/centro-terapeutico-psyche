# 🔧 Solución de Problemas de Configuración - Centro Terapéutico Psyche

## 📋 Problemas Identificados y Solucionados

### 1. ✅ CONFIGURACIÓN DE PUERTOS CORREGIDA
- **Problema**: Frontend configurado para puerto 3007, backend corre en 3002
- **Solución**: Cambiado en `frontend/src/servicios/api.ts`
- **Antes**: `http://localhost:3007/api/v1`
- **Después**: `http://localhost:3002/api/v1`

### 2. ✅ CREDENCIALES ACTUALIZADAS
- **Problema**: Credenciales no coincidían entre frontend y backend
- **Solución**: Actualizado en `frontend/src/paginas/Login.tsx`
- **Credenciales correctas**: `admin@admin.cl` / `admin123`

### 3. ✅ SCRIPT DE CREACIÓN DE ADMIN
- **Archivo creado**: `backend/scripts/crear-admin-correcto.js`
- **Funcionalidad**: Crea o actualiza usuario admin con credenciales correctas

## 🚀 Pasos para Arreglar el Proyecto

### Paso 1: Crear Usuario Admin Correcto
```bash
cd backend
node scripts/crear-admin-correcto.js
```

### Paso 2: Verificar Configuración
```bash
cd backend
node scripts/verificar-configuracion.js
```

### Paso 3: Probar Login
```bash
cd backend
node scripts/test-login-admin-correcto.js
```

### Paso 4: Iniciar Servicios

#### Backend (Puerto 3002)
```bash
cd backend
npm run dev
# o
npm start
```

#### Frontend (Puerto 3000)
```bash
cd frontend
npm run dev
```

## 📊 Configuración Final

| Servicio | Puerto | URL | Estado |
|----------|--------|-----|--------|
| Frontend | 3000 | http://localhost:3000 | ✅ Configurado |
| Backend | 3002 | http://localhost:3002 | ✅ Configurado |
| Base de Datos | 5432 | PostgreSQL | ✅ Configurado |

## 🔐 Credenciales de Acceso

### Usuario Administrador
- **Email**: `admin@admin.cl`
- **Contraseña**: `admin123`
- **Rol**: Administrador
- **Acceso**: Panel de administración

### Usuario Psicólogo (Opcional)
- **Email**: `laura.fernandez@psyche.cl`
- **Contraseña**: `psicologo123`
- **Rol**: Psicólogo
- **Acceso**: Panel de psicólogo

## 🧪 Scripts de Verificación Disponibles

### 1. `crear-admin-correcto.js`
- Crea o actualiza el usuario admin con las credenciales correctas
- Usa bcrypt para el hash de la contraseña
- Verifica que el rol de administrador exista

### 2. `verificar-configuracion.js`
- Verifica conexión a la base de datos
- Comprueba que el usuario admin existe
- Verifica que backend y frontend estén funcionando
- Muestra resumen de la configuración

### 3. `test-login-admin-correcto.js`
- Prueba el login con las credenciales correctas
- Verifica que la autenticación JWT funciona
- Prueba acceso a endpoints protegidos

## 🔍 Verificación Manual

### 1. Verificar Backend
```bash
curl http://localhost:3002/salud
```
**Respuesta esperada**: JSON con estado "OK" y puerto 3002

### 2. Verificar Frontend
```bash
curl http://localhost:3000
```
**Respuesta esperada**: HTML de la aplicación React

### 3. Verificar Login
1. Ir a http://localhost:3000
2. Usar credenciales: `admin@admin.cl` / `admin123`
3. Deberías acceder al panel de administración

## 🛠️ Solución de Problemas Comunes

### Error: "Backend no está funcionando"
```bash
# Verificar que el backend esté corriendo
cd backend
npm run dev
```

### Error: "Usuario no encontrado"
```bash
# Crear usuario admin
cd backend
node scripts/crear-admin-correcto.js
```

### Error: "Base de datos no conecta"
```bash
# Verificar PostgreSQL
# Asegúrate de que PostgreSQL esté corriendo
# Verifica las credenciales en .env
```

### Error: "CORS error"
- El backend ya tiene CORS configurado
- Verifica que el frontend use el puerto correcto (3002)

## 📝 Archivos Modificados

1. **`frontend/src/servicios/api.ts`**
   - Cambiado puerto de 3007 a 3002

2. **`frontend/src/paginas/Login.tsx`**
   - Actualizadas credenciales mostradas en la interfaz

3. **`backend/scripts/crear-admin-correcto.js`** (NUEVO)
   - Script para crear usuario admin correcto

4. **`backend/scripts/verificar-configuracion.js`** (NUEVO)
   - Script de verificación completa

5. **`backend/scripts/test-login-admin-correcto.js`** (NUEVO)
   - Script de prueba de login

## ✅ Checklist de Verificación

- [ ] Backend corriendo en puerto 3002
- [ ] Frontend corriendo en puerto 3000
- [ ] Base de datos PostgreSQL funcionando
- [ ] Usuario admin@admin.cl creado
- [ ] Login funciona con admin@admin.cl / admin123
- [ ] Frontend se conecta correctamente al backend
- [ ] Panel de administración accesible

## 🎉 Resultado Esperado

Después de seguir estos pasos, deberías poder:
1. Acceder al frontend en http://localhost:3000
2. Hacer login con `admin@admin.cl` / `admin123`
3. Acceder al panel de administración
4. Usar todas las funcionalidades del sistema

---

**Nota**: Si encuentras algún problema, ejecuta los scripts de verificación para diagnosticar el issue específico. 