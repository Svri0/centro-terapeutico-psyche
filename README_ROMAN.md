# 🏥 Centro Terapéutico Psyche - README PERSONALIZADO PARA ROMÁN

## 👨‍💻 **Configuración Personalizada**

### 🪟 **Windows (Tu PC Principal)**
- **Usuario PostgreSQL**: `postgres`
- **Base de datos**: `psyche_db`
- **Contraseña**: Tu contraseña personal

### 🐧 **Linux (Tu Laptop)**
- **Usuario PostgreSQL**: `psyche_user`
- **Base de datos**: `psyche_db`
- **Contraseña**: La misma que en Windows

## 🚀 **Instalación Rápida**

### **Paso 1: Clonar y Dependencias**
```bash
git clone <tu-repositorio>
cd centro-terapeutico-psyche
npm install
cd backend && npm install
cd ../frontend && npm install
```

### **Paso 2: Configuración Automática**
```bash
cd backend
node scripts/setup-roman.js
```
*Este script detecta automáticamente tu sistema operativo y configura todo*

### **Paso 3: Base de Datos**
```bash
npm run db:migrate
npm run db:seed
```

### **Paso 4: Crear Admin**
```bash
node scripts/crear-admin.js
```
*Crea automáticamente un admin con:*
*- Email: admin@admin.cl*
*- Contraseña: admin123*

### **Paso 5: Ejecutar**
```bash
npm run dev
```

## 🔧 **Scripts Especiales para Ti**

- `node scripts/setup-roman.js` - **CONFIGURACIÓN AUTOMÁTICA** (detecta OS)
- `node scripts/setup-rapido.js` - Configuración rápida estándar
- `node scripts/crear-admin.js` - Crear usuario administrador
- `node scripts/verificar-usuarios-admin.js` - Diagnosticar problemas
- `node scripts/verificar-admin-rapido.js` - Verificar admin estándar

## 📧 **Configuración del Equipo (Automática)**
- ✅ Email: `dentrodepsyche@gmail.com`
- ✅ Contraseña de aplicación: ya configurada
- ✅ JWT Secret: ya configurado
- ✅ Puerto: 3002

## 🗄️ **Base de Datos (Detectada Automáticamente)**
- **Windows**: Usuario `postgres`
- **Linux**: Usuario `psyche_user`
- **Contraseña**: La misma en ambos sistemas

## 🚨 **Solución de Problemas**

### **Si no puedes entrar como admin:**
```bash
node scripts/verificar-usuarios-admin.js
```

### **Si hay problemas de conexión:**
```bash
# Verificar que PostgreSQL esté corriendo
# Windows: Servicios > PostgreSQL
# Linux: sudo systemctl status postgresql
```

### **Si hay problemas de email:**
```bash
node scripts/test-email-real.js
```

## 🔄 **Cambios Entre Sistemas**

Cuando cambies de Windows a Linux (o viceversa):
1. Ejecuta `node scripts/setup-roman.js` en el nuevo sistema
2. El script detectará automáticamente tu OS
3. Configurará el usuario correcto de PostgreSQL
4. Todo lo demás se mantiene igual

## 📱 **Comandos Rápidos**

```bash
# Configuración automática (RECOMENDADO)
node scripts/setup-roman.js

# Si quieres configurar manualmente
node scripts/setup-rapido.js

# Verificar estado
node scripts/verificar-usuarios-admin.js

# Crear admin
node scripts/crear-admin.js
```

## 🎯 **Ventajas de tu Configuración**

- ✅ **Automática**: Detecta tu sistema operativo
- ✅ **Consistente**: Misma contraseña en ambos sistemas
- ✅ **Rápida**: Solo 1 comando para configurar todo
- ✅ **Equipo**: Usa la configuración compartida del equipo

---

**¡Con este setup, puedes cambiar entre Windows y Linux sin problemas!** 🚀
