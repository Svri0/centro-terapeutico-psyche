# 📧 Configuración de Email - Centro Terapéutico Psyche

## 🎯 Funcionalidad

El sistema envía automáticamente emails de bienvenida a los psicólogos cuando son creados por el administrador.

## ⚙️ Configuración

### 1. Configurar Gmail

Para usar Gmail como servidor de email, necesitas:

1. **Habilitar la verificación en dos pasos** en tu cuenta de Gmail
2. **Generar una contraseña de aplicación**:
   - Ve a Configuración de Google Account
   - Seguridad → Verificación en dos pasos
   - Contraseñas de aplicación → Generar nueva contraseña

### 2. Variables de Entorno

Agrega estas variables al archivo `.env`:

```env
# Configuración de Email (Gmail)
EMAIL_USER=tu_email@gmail.com
EMAIL_PASSWORD=tu_password_de_aplicacion
FRONTEND_URL=http://localhost:3000
```

### 3. Ejemplo de Configuración

```env
EMAIL_USER=admin@psyche.cl
EMAIL_PASSWORD=abcd efgh ijkl mnop
FRONTEND_URL=http://localhost:3000
```

## 🧪 Pruebas

### Probar el envío de emails:

```bash
npm run test:email
```

### Crear un psicólogo desde el panel de administración:

1. Inicia sesión como administrador
2. Ve a "Gestión de Psicólogos"
3. Haz clic en "+ Nuevo Psicólogo"
4. Completa el formulario
5. El psicólogo recibirá automáticamente un email de bienvenida

## 📧 Contenido del Email

El email de bienvenida incluye:

- ✅ **Saludo personalizado** con el nombre del psicólogo
- ✅ **Credenciales de acceso** (email y contraseña temporal)
- ✅ **Especialidad registrada** (si se especificó)
- ✅ **Próximos pasos** para configurar su cuenta
- ✅ **Funcionalidades disponibles** del sistema
- ✅ **Enlace directo** para acceder al sistema
- ✅ **Diseño profesional** con colores del centro terapéutico

## 🔧 Solución de Problemas

### Error: "Authentication failed"

- Verifica que la contraseña de aplicación sea correcta
- Asegúrate de que la verificación en dos pasos esté habilitada
- Revisa que el email no tenga espacios extra

### Error: "Connection timeout"

- Verifica tu conexión a internet
- Asegúrate de que Gmail no esté bloqueado por firewall

### Email no se envía

- Revisa los logs del servidor
- Verifica que las variables de entorno estén configuradas
- Ejecuta `npm run test:email` para probar la configuración

## 🎨 Personalización

El email usa un diseño HTML responsivo con:

- **Colores del centro terapéutico** (ámbar/dorado)
- **Gradientes y sombras** para un look profesional
- **Iconos y emojis** para mejor experiencia visual
- **Enlaces directos** al sistema
- **Información estructurada** y fácil de leer

## 📝 Notas Importantes

- Los emails se envían de forma asíncrona para no bloquear la creación del psicólogo
- Si el email falla, el psicólogo se crea igual pero se registra un warning en los logs
- En desarrollo, el token de activación se incluye en la respuesta (no en producción)
- El email incluye un enlace directo al login del sistema 