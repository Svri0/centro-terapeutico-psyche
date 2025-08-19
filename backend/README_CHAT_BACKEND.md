# 🗨️ **SISTEMA DE CHAT - BACKEND**

## 🚀 **Descripción**
Sistema de chat completo para el Centro Terapéutico Psyche que permite la comunicación entre psicólogos y pacientes en tiempo real.

## 🏗️ **Arquitectura**

### **Modelos:**
- **`Chat`**: Maneja las conversaciones entre usuarios
- **`MensajeChat`**: Almacena los mensajes individuales
- **`Usuario`**: Usuarios del sistema (psicólogos y pacientes)

### **Controladores:**
- **`ChatController`**: Lógica de negocio para todas las operaciones del chat

### **Rutas:**
- **`/api/v1/chat/*`**: Endpoints para el sistema de chat

## 📋 **Endpoints Disponibles**

### **1. Obtener Chats del Usuario**
```
GET /api/v1/chat/chats/:tipo_usuario/:usuario_id
```
**Parámetros:**
- `tipo_usuario`: 'psicologo' o 'paciente'
- `usuario_id`: ID del usuario autenticado

**Respuesta:**
```json
{
  "chats": [
    {
      "id": "uuid",
      "nombre": "Nombre del otro usuario",
      "avatar": "url_avatar",
      "ultimoMensaje": "Último mensaje enviado",
      "timestamp": "2024-12-01T10:00:00Z",
      "noLeidos": 2,
      "online": false,
      "tipo": "individual",
      "participantes": ["uuid1", "uuid2"],
      "ultimaActividad": "2024-12-01T10:00:00Z"
    }
  ],
  "total": 1
}
```

### **2. Obtener Mensajes de un Chat**
```
GET /api/v1/chat/mensajes/:chat_id?pagina=1&limite=50
```
**Parámetros:**
- `chat_id`: ID del chat
- `pagina`: Número de página (opcional, default: 1)
- `limite`: Mensajes por página (opcional, default: 50)

**Respuesta:**
```json
{
  "mensajes": [
    {
      "id": "uuid",
      "contenido": "Contenido del mensaje",
      "remitente": "psicologo",
      "timestamp": "2024-12-01T10:00:00Z",
      "tipo": "texto",
      "leido": false,
      "metadata": null
    }
  ],
  "total": 1,
  "pagina": 1,
  "limite": 50
}
```

### **3. Enviar Mensaje**
```
POST /api/v1/chat/mensajes/:chat_id
```
**Body:**
```json
{
  "contenido": "Mensaje a enviar",
  "tipo": "texto",
  "remitente_id": "uuid_usuario"
}
```

### **4. Marcar Mensajes como Leídos**
```
PUT /api/v1/chat/mensajes/:chat_id/leer
```
**Body:**
```json
{
  "usuario_id": "uuid_usuario",
  "tipo_usuario": "psicologo"
}
```

### **5. Crear Nuevo Chat**
```
POST /api/v1/chat/chats
```
**Body:**
```json
{
  "psicologo_id": "uuid_psicologo",
  "paciente_id": "uuid_paciente",
  "tipo": "individual"
}
```

### **6. Buscar Usuarios**
```
GET /api/v1/chat/usuarios/buscar?q=nombre&tipo_usuario=psicologo&usuario_actual_id=uuid
```
**Parámetros:**
- `q`: Término de búsqueda
- `tipo_usuario`: Tipo del usuario que busca
- `usuario_actual_id`: ID del usuario que realiza la búsqueda

## 🗄️ **Base de Datos**

### **Tabla: `chats`**
```sql
CREATE TABLE chats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tipo ENUM('individual', 'grupo') NOT NULL DEFAULT 'individual',
  nombre VARCHAR(255),
  descripcion TEXT,
  psicologo_id UUID NOT NULL REFERENCES usuarios(id),
  paciente_id UUID REFERENCES usuarios(id),
  ultimo_mensaje TEXT,
  ultimo_mensaje_timestamp TIMESTAMP,
  ultimo_mensaje_remitente UUID REFERENCES usuarios(id),
  no_leidos_psicologo INTEGER NOT NULL DEFAULT 0,
  no_leidos_paciente INTEGER NOT NULL DEFAULT 0,
  activo BOOLEAN NOT NULL DEFAULT true,
  fecha_creacion TIMESTAMP NOT NULL DEFAULT NOW(),
  fecha_ultima_actividad TIMESTAMP NOT NULL DEFAULT NOW(),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

### **Tabla: `mensajes_chat`**
```sql
CREATE TABLE mensajes_chat (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  chat_id UUID NOT NULL REFERENCES chats(id),
  remitente_id UUID NOT NULL REFERENCES usuarios(id),
  contenido TEXT NOT NULL,
  tipo ENUM('texto', 'imagen', 'audio', 'documento') NOT NULL DEFAULT 'texto',
  leido BOOLEAN NOT NULL DEFAULT false,
  metadata JSON,
  fecha_envio TIMESTAMP NOT NULL DEFAULT NOW(),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

## 🚀 **Instalación y Configuración**

### **1. Ejecutar Migraciones**
```bash
cd backend
npm run migrate
```

### **2. Ejecutar Seeders**
```bash
npm run seed
```

### **3. Verificar Configuración**
```bash
npm run test:chat
```

## 🧪 **Pruebas**

### **Script de Prueba**
```bash
cd backend
node scripts/test-chat.js
```

### **Pruebas Manuales**
1. **Login como psicólogo**
2. **Obtener chats del psicólogo**
3. **Obtener mensajes de un chat**
4. **Enviar un mensaje**
5. **Verificar contadores de no leídos**

## 🔧 **Configuración del Frontend**

### **URLs de la API**
```typescript
// En el frontend, las URLs deben ser:
const API_BASE = '/api/v1/chat';

// Ejemplos:
GET ${API_BASE}/chats/psicologo/${usuarioId}
GET ${API_BASE}/mensajes/${chatId}
POST ${API_BASE}/mensajes/${chatId}
```

### **Headers Requeridos**
```typescript
const headers = {
  'Authorization': `Bearer ${localStorage.getItem('token')}`,
  'Content-Type': 'application/json'
};
```

## 🚨 **Consideraciones de Seguridad**

### **Autenticación**
- Todas las rutas requieren token JWT válido
- Middleware `authMiddleware` aplicado a todas las rutas

### **Validación**
- Verificación de tipos de usuario válidos
- Validación de IDs de usuario
- Sanitización de contenido de mensajes

### **Permisos**
- Los usuarios solo pueden acceder a sus propios chats
- Verificación de roles (psicólogo/paciente)

## 🔮 **Funcionalidades Futuras**

### **WebSockets**
- Chat en tiempo real
- Notificaciones push
- Indicadores de "escribiendo..."

### **Archivos**
- Subida de imágenes
- Documentos PDF
- Audio/video

### **Grupos**
- Chats grupales
- Moderación de grupos
- Roles de grupo

### **Notificaciones**
- Notificaciones push
- Email de mensajes no leídos
- Recordatorios de sesiones

## 📝 **Logs y Monitoreo**

### **Logs del Sistema**
- Todas las operaciones se registran
- Errores capturados y loggeados
- Métricas de uso del chat

### **Métricas Disponibles**
- Mensajes enviados por día
- Usuarios activos en chat
- Tiempo de respuesta promedio

## 🆘 **Solución de Problemas**

### **Error: "Chat no encontrado"**
- Verificar que el chat existe
- Confirmar permisos del usuario
- Revisar IDs en la base de datos

### **Error: "Usuario no autorizado"**
- Verificar token JWT
- Confirmar rol del usuario
- Revisar middleware de autenticación

### **Error: "Base de datos no disponible"**
- Verificar conexión a PostgreSQL
- Revisar configuración de Sequelize
- Confirmar que las tablas existen

---

## 💡 **Consejos de Desarrollo**

1. **Siempre verifica el token** antes de hacer requests
2. **Usa los tipos correctos** de usuario (psicologo/paciente)
3. **Maneja errores** en el frontend apropiadamente
4. **Implementa paginación** para chats con muchos mensajes
5. **Considera implementar WebSockets** para tiempo real

**¡El sistema de chat está listo para usar!** 🎉
