# 🚀 Setup para Colaborador - Branch mig_login

## 📋 **Pasos para configurar el proyecto:**

### **1. Clonar/Actualizar la branch**
```bash
git checkout mig_login
git pull origin mig_login
```

### **2. Configurar variables de entorno**
Crear archivo `.env` en la raíz del proyecto:

```env
# Configuración del entorno
NODE_ENV=development

# Configuración de la base de datos PostgreSQL (TUS CREDENCIALES LOCALES)
# ⚠️ IMPORTANTE: Debes configurar tu propia contraseña de PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=TU_CONTRASEÑA_PERSONAL_DE_POSTGRESQL
DB_NAME=psyche_db

# Configuración del servidor
PORT=3001
JWT_SECRET=tu_jwt_secret_super_seguro_aqui_cambiar_en_produccion
JWT_EXPIRES_IN=24h

# Configuración de email (opcional para pruebas)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=tu_email@gmail.com
EMAIL_PASS=tu_password_de_aplicacion
FRONTEND_URL=http://localhost:3000

# Configuración de subdominios
SUBDOMAIN_PSYCHOLOGIST=psicologo
SUBDOMAIN_PATIENT=paciente
SUBDOMAIN_ADMIN=admin
```

### **3. Instalar dependencias**
```bash
npm install
```

### **4. Ejecutar migraciones**
```bash
npm run migrate
```

### **5. Ejecutar seeders (opcional)**
```bash
npm run seed
```

### **6. Iniciar el proyecto**
```bash
# Terminal 1 - Backend
npm run dev

# Terminal 2 - Frontend
cd ../frontend
npm run dev
```

## 🔑 **Credenciales de prueba:**

### **Administrador:**
- Email: `admin@terapia.cl`
- Contraseña: `Admin123!` (con mayúscula y signo de exclamación)

### **Psicólogo (crear desde panel admin):**
- Usar el panel de administrador para crear psicólogos
- URL: `http://localhost:3000/admin`

## 🌐 **URLs importantes:**
- **Frontend:** `http://localhost:3000` (o el puerto que use)
- **Backend:** `http://localhost:3001` (o el puerto que use)
- **Panel Admin:** `http://localhost:3000/admin`
- **Panel Psicólogo:** `http://localhost:3000/psicologo`

## ⚠️ **Notas importantes:**
- Cada desarrollador debe tener su propia base de datos PostgreSQL
- **OBLIGATORIO:** Configurar `DB_PASSWORD` en tu archivo `.env` con tu contraseña de PostgreSQL
- Los puertos pueden variar según tu configuración local
- El archivo `.env` NO se sube al repositorio por seguridad
- Si hay problemas con puertos, el backend buscará automáticamente uno disponible

## 🆘 **Si hay problemas:**
1. Verificar que PostgreSQL esté ejecutándose
2. Verificar credenciales en `.env`
3. Ejecutar `npm run migrate:reset` para resetear la base de datos
4. Revisar logs del backend para errores específicos 