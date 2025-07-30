# 🔍 Debug Login - Problemas de Autenticación

## 📋 **Pasos para diagnosticar el problema:**

### **1. Verificar que el backend esté funcionando**
```bash
# En la terminal del backend
curl http://localhost:3001/salud
# Debe devolver: {"success":true,"mensaje":"✅ Puerto 3001 funcionando correctamente",...}
```

### **2. Verificar la base de datos**
```bash
# En la terminal del backend
npm run migrate:status
# Debe mostrar todas las migraciones como "up"
```

### **3. Verificar que las tablas existan**
```bash
# Conectar a PostgreSQL y verificar:
psql -U postgres -d psyche_db
\dt
# Debe mostrar las tablas: usuarios, roles, pacientes, etc.
```

### **4. Verificar que existan usuarios de prueba**
```bash
# En PostgreSQL:
SELECT id, nombres, apellidos, email, rol_id, activo FROM usuarios;
# Debe mostrar al menos el admin: admin@terapia.cl
```

### **5. Verificar el archivo .env**
```bash
# Asegúrate de que tu .env tenga:
DB_PASSWORD=TU_CONTRASEÑA_REAL_DE_POSTGRESQL
JWT_SECRET=tu_jwt_secret_super_seguro_aqui_cambiar_en_produccion
```

### **6. Verificar los puertos**
```bash
# Verificar qué puertos están en uso:
netstat -ano | findstr :300
# El backend debe estar en 3001 o 3002
# El frontend debe estar en 3000 o 3007
```

### **7. Verificar la consola del navegador**
- Abrir F12 → Console
- Intentar hacer login
- Ver qué errores aparecen

### **8. Verificar la consola del backend**
- Mirar los logs cuando intenta hacer login
- Ver si hay errores de conexión a la BD

## 🚨 **Errores comunes y soluciones:**

### **Error: "Error de autenticación"**
- **Causa:** Credenciales incorrectas o usuario no existe
- **Solución:** Verificar que el usuario admin exista en la BD

### **Error: "Error en el login"**
- **Causa:** Problema de conexión con el backend
- **Solución:** Verificar que el backend esté ejecutándose

### **Error: "Conexión rechazada"**
- **Causa:** Puerto incorrecto o backend no ejecutándose
- **Solución:** Verificar puertos y que el backend esté activo

### **Error: "Base de datos no encontrada"**
- **Causa:** Base de datos no existe o credenciales incorrectas
- **Solución:** Ejecutar migraciones y verificar .env

## 🔧 **Comandos de reseteo si todo falla:**

```bash
# 1. Resetear la base de datos
npm run migrate:reset

# 2. Ejecutar migraciones
npm run migrate

# 3. Ejecutar seeders (crear admin)
npm run seed

# 4. Reiniciar el backend
npm run dev
```

## 📞 **Información para reportar el problema:**

**Tu compañero debe decirte:**
1. ¿Qué error exacto aparece?
2. ¿En qué paso del login falla?
3. ¿Qué puertos está usando?
4. ¿Qué aparece en la consola del navegador?
5. ¿Qué aparece en la consola del backend? 