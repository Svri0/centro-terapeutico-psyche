# 📧 Sistema de Emails para Confirmación de Citas - Centro Terapéutico Psyche

## 🎯 Funcionalidad Implementada

El sistema ahora envía **emails automáticos de confirmación** a los pacientes cuando agendan una cita exitosamente. Esto incluye:

- ✅ **Email automático** al crear una cita
- ✅ **Diseño responsive** para dispositivos móviles
- ✅ **Enlaces directos** para cancelar citas
- ✅ **Información completa** de la sesión
- ✅ **Acceso desde móvil** al perfil del paciente

## 🔧 Componentes Implementados

### 1. **Servicio de Email** (`backend/src/utilidades/email.service.ts`)
- Nueva función: `enviarEmailConfirmacionCita()`
- Email con diseño profesional y responsive
- Incluye todos los detalles de la cita
- Enlaces para cancelar y acceder al sistema

### 2. **Controlador de Citas** (`backend/src/controladores/citas.controlador.ts`)
- Modificado para enviar email automáticamente
- Obtiene información del paciente y psicólogo
- Manejo de errores sin afectar la creación de la cita

### 3. **Componente PerfilPaciente** (`frontend/src/componentes/PerfilPaciente.tsx`)
- Vista completa del perfil del paciente
- Lista de todas sus citas
- Botón para cancelar citas programadas
- Información de contacto y estado de citas

### 4. **Routing** (`frontend/src/App.tsx`)
- Nueva ruta: `/perfil-paciente`
- Protección de rutas por rol
- Navegación entre paneles

## 📧 Estructura del Email

### **Header**
- Logo y nombre del centro
- Mensaje de confirmación
- Icono de verificación

### **Detalles de la Cita**
- 👨‍⚕️ **Psicólogo asignado**
- 📅 **Fecha y hora**
- 🎯 **Tipo de sesión**
- 💻 **Modalidad** (presencial/virtual)

### **Próximos Pasos**
- Preparación para la sesión
- Llegada anticipada
- Documentación requerida
- Instrucciones específicas para sesiones virtuales

### **Sección de Cancelación**
- ⚠️ **"¿No solicitaste esta cita?"**
- 🚫 **Botón "Cancelar Cita"**
- Enlace directo al perfil del paciente

### **Acceso Móvil**
- 📱 **"Acceso desde tu Dispositivo"**
- 🔐 **Botón "Acceder al Sistema"**
- Compatible con smartphones y tablets

## 🚀 Flujo de Usuario

### **1. Paciente Agenda Cita**
```
Paciente → Calendario → Selecciona horario → Confirma cita
```

### **2. Sistema Procesa**
```
Backend → Crea cita → Obtiene datos → Envía email → Confirma creación
```

### **3. Paciente Recibe Email**
```
Email → Detalles de cita → Enlaces de acción → Acceso móvil
```

### **4. Acceso desde Móvil**
```
Email → Botón "Cancelar Cita" → /perfil-paciente → Lista de citas → Cancelar
```

## 📱 Experiencia Móvil

### **Email Responsive**
- ✅ Se adapta a pantallas pequeñas
- ✅ Botones táctiles optimizados
- ✅ Enlaces directos funcionales

### **Perfil del Paciente**
- ✅ Vista optimizada para móvil
- ✅ Botones de cancelación claros
- ✅ Información organizada por secciones

## 🧪 Pruebas

### **Script de Prueba**
```bash
cd backend
node scripts/test-email-cita.js
```

### **Verificación Manual**
1. Crear una cita desde el frontend
2. Verificar que llega el email
3. Probar enlaces desde móvil
4. Verificar cancelación de citas

## ⚙️ Configuración Requerida

### **Variables de Entorno**
```env
EMAIL_USER=tu_email@gmail.com
EMAIL_PASSWORD=tu_password_de_aplicacion
FRONTEND_URL=http://localhost:3000
```

### **Dependencias**
- ✅ `nodemailer` (ya instalado)
- ✅ `react-router-dom` (ya instalado)
- ✅ Configuración de Gmail con verificación en dos pasos

## 🔒 Seguridad

### **Validaciones**
- ✅ Solo pacientes pueden cancelar sus propias citas
- ✅ Verificación de rol en el backend
- ✅ Protección de rutas en el frontend

### **Manejo de Errores**
- ✅ Fallback si falla el email
- ✅ Logs de auditoría
- ✅ No interrumpe la creación de citas

## 📋 Casos de Uso

### **Escenario 1: Cita Normal**
1. Paciente agenda cita
2. Recibe email de confirmación
3. Puede ver detalles en su perfil
4. Opción de cancelar si es necesario

### **Escenario 2: Cita No Solicitada**
1. Paciente recibe email inesperado
2. Ve botón "¿No solicitaste esta cita?"
3. Accede a su perfil
4. Cancela la cita no solicitada

### **Escenario 3: Acceso Móvil**
1. Paciente recibe email en su celular
2. Toca "Cancelar Cita" desde el email
3. Es redirigido a su perfil
4. Gestiona sus citas desde el móvil

## 🎨 Personalización

### **Colores del Email**
- **Header**: Verde (#10b981) - Confirmación
- **Advertencia**: Amarillo (#f59e0b) - Cancelación
- **Acceso**: Azul (#3b82f6) - Enlaces

### **Contenido Personalizable**
- Nombre del centro
- Información de contacto
- Instrucciones específicas
- Políticas de cancelación

## 🚀 Próximos Pasos

### **Mejoras Futuras**
- [ ] **Recordatorios automáticos** 24h antes
- [ ] **Notificaciones push** en móvil
- [ ] **SMS de confirmación** como respaldo
- [ ] **Plantillas personalizables** por psicólogo
- [ ] **Historial de emails** enviados

### **Integraciones**
- [ ] **WhatsApp Business API** para confirmaciones
- [ ] **Calendario de Google** para sincronización
- [ ] **Outlook/Exchange** para empresas
- [ ] **Webhooks** para sistemas externos

## 📞 Soporte

### **Problemas Comunes**
1. **Email no llega**: Verificar configuración de Gmail
2. **Enlaces rotos**: Verificar FRONTEND_URL
3. **Error de autenticación**: Verificar contraseña de aplicación

### **Contacto**
- 📧 **Email**: info@psyche.cl
- 📱 **Teléfono**: +56 9 1234 5678
- 🧠 **Centro Terapéutico Psyche**

---

**¡El sistema está listo para usar!** 🎉

Los pacientes ahora recibirán emails profesionales de confirmación y podrán gestionar sus citas desde cualquier dispositivo, incluyendo la opción de cancelar citas no solicitadas directamente desde el email.
