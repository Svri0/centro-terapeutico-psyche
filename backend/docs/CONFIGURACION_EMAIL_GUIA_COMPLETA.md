# 📧 Guía Completa de Configuración de Email - Centro Terapéutico Psyche

## 🎯 ¿Qué hace el sistema de email?

El sistema envía automáticamente emails de bienvenida a los psicólogos cuando son creados por el administrador. Los emails incluyen:

- ✅ Saludo personalizado con el nombre del psicólogo
- ✅ Credenciales de acceso (email y contraseña temporal)
- ✅ Especialidad registrada (si se especificó)
- ✅ Próximos pasos para configurar la cuenta
- ✅ Funcionalidades disponibles del sistema
- ✅ Enlace directo para acceder al sistema
- ✅ Diseño profesional con colores del centro terapéutico

## ⚙️ Configuración Paso a Paso

### 1. Preparar tu cuenta de Gmail

**IMPORTANTE:** Necesitas una cuenta de Gmail con verificación en dos pasos habilitada.

#### Paso 1: Habilitar verificación en dos pasos
1. Ve a [myaccount.google.com](https://myaccount.google.com/)
2. Haz clic en "Seguridad"
3. Busca "Verificación en dos pasos" y haz clic
4. Sigue los pasos para habilitarla

#### Paso 2: Generar contraseña de aplicación
1. En la misma página de Seguridad
2. Busca "Contraseñas de aplicación"
3. Haz clic en "Generar nueva contraseña"
4. Selecciona "Otra" y escribe "Centro Terapéutico Psyche"
5. Copia la contraseña generada (16 caracteres con espacios)

### 2. Configurar variables de entorno

#### Opción A: Editar archivo .env existente
1. Abre el archivo `.env` en la carpeta `backend/`
2. Agrega estas líneas:

```env
# Configuración de Email (Gmail)
EMAIL_USER=tu_email@gmail.com
EMAIL_PASSWORD=abcd efgh ijkl mnop
FRONTEND_URL=http://localhost:3000
```

#### Opción B: Crear archivo .env nuevo
1. Copia el archivo `env.example` a `.env`
2. Edita las variables de email como se muestra arriba

### 3. Ejemplo de configuración completa

```env
# Configuración de la base de datos
DB_HOST=localhost
DB_PORT=5432
DB_NAME=psyche_db
DB_USER=postgres
DB_PASSWORD=tu_contraseña_postgres

# Configuración del servidor
PORT=3002
NODE_ENV=development
JWT_SECRET=tu_secreto_super_seguro_aqui

# Configuración de Email (Gmail)
EMAIL_USER=admin@psyche.cl
EMAIL_PASSWORD=abcd efgh ijkl mnop
FRONTEND_URL=http://localhost:3000
```

## 🧪 Probar la configuración

### Opción 1: Script de verificación automática
```bash
cd backend
npm run test:email:config
```

### Opción 2: Script de prueba manual
```bash
cd backend
npm run test:email
```

### Opción 3: Crear un psicólogo desde el panel
1. Inicia sesión como administrador
2. Ve a "Gestión de Psicólogos"
3. Haz clic en "+ Nuevo Psicólogo"
4. Completa el formulario
5. El psicólogo recibirá automáticamente un email de bienvenida

## 🔧 Solución de Problemas

### Error: "Authentication failed"
**Causa:** Contraseña de aplicación incorrecta
**Solución:**
1. Verifica que la verificación en dos pasos esté habilitada
2. Genera una nueva contraseña de aplicación
3. Asegúrate de copiar la contraseña completa (16 caracteres)

### Error: "Invalid login"
**Causa:** Email incorrecto o cuenta no configurada
**Solución:**
1. Verifica que EMAIL_USER sea un email válido de Gmail
2. Asegúrate de que la cuenta tenga verificación en dos pasos

### Error: "Connection timeout"
**Causa:** Problemas de red o firewall
**Solución:**
1. Verifica tu conexión a internet
2. Desactiva temporalmente el firewall
3. Intenta desde otra red

### Email no llega
**Causa:** Email en spam o configuración incorrecta
**Solución:**
1. Revisa la carpeta de spam
2. Verifica que el email de destino sea correcto
3. Asegúrate de que FRONTEND_URL esté configurado

## 📧 Personalización del Email

El email de bienvenida se puede personalizar editando el archivo:
`backend/src/utilidades/email.service.ts`

### Estructura del email:
- Header con gradiente y logo
- Saludo personalizado
- Credenciales de acceso
- Próximos pasos
- Funcionalidades disponibles
- Enlace de acceso
- Footer con información de contacto

## 🚀 Uso en Producción

### Configuración recomendada:
```env
EMAIL_USER=admin@tudominio.com
EMAIL_PASSWORD=tu_password_de_aplicacion
FRONTEND_URL=https://tudominio.com
```

### Consideraciones de seguridad:
1. Usa siempre contraseñas de aplicación
2. No compartas las credenciales
3. Cambia la contraseña periódicamente
4. Usa HTTPS en producción

## 📞 Soporte

Si tienes problemas con la configuración:

1. Ejecuta `npm run test:email:config` para diagnóstico
2. Verifica que todas las variables estén configuradas
3. Revisa los logs del servidor
4. Contacta al equipo de desarrollo

---

**¡Listo!** 🎉 Con esta configuración, el sistema enviará automáticamente emails de bienvenida a todos los psicólogos que se creen desde el panel de administración. 