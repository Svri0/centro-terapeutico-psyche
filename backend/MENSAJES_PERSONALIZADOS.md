# 📱 Sistema de Mensajes Personalizados

## Centro Terapéutico Psyche - Backend

---

## 🎯 **¿Qué problema resolvemos?**

**ANTES**: Las respuestas del servidor eran genéricas y poco informativas

```json
{ "error": "Error interno del servidor" }
```

**AHORA**: Mensajes personalizados, códigos únicos y información detallada

```json
{
  "success": true,
  "mensaje": "¡Paciente registrado exitosamente! Ya puede acceder al sistema",
  "data": { "paciente": {...} },
  "codigo": "PAC_004",
  "timestamp": "2025-07-29T02:55:21.856Z"
}
```

---

## 🌐 **Endpoints Disponibles**

### **1. 🎨 Dashboard Bonito (Para Humanos)**

```
GET http://localhost:3002/dashboard
```

**✅ Perfecto para:**

- Ver estado del servidor de forma visual
- Monitorear memoria y tiempo activo
- Lista de endpoints disponibles
- **Se ve hermoso** en el navegador

### **2. 📊 Salud del Sistema (Para APIs)**

```
GET http://localhost:3002/salud
```

**✅ Perfecto para:**

- Monitoreo automático de sistemas
- APIs que consumen datos JSON
- Herramientas como Postman
- **Formato JSON estándar**

### **3. 📄 Información General**

```
GET http://localhost:3002/
```

**✅ Respuesta JSON con:**

- Información de la aplicación
- Lista de endpoints disponibles
- Datos técnicos del sistema

---

## 🎨 **Comparación Visual**

### **Dashboard (/dashboard) - Para Humanos 👨‍💻**

```html
🏥 Centro Terapéutico Psyche Sistema de Gestión Terapéutica v1.0.0 ✅ Puerto 3002 funcionando
correctamente 🚀 Puerto Activo: 3002 ⏰ Tiempo Activo: 0d 2h 15m 💾 Memoria Usada: 181 MB 📊 Memoria
Total: 211 MB
```

### **API (/salud) - Para Sistemas 🤖**

```json
{
  "success": true,
  "mensaje": "✅ Puerto 3002 funcionando correctamente",
  "data": {
    "estado": "OK",
    "timestamp": "2025-07-29T02:55:21.855Z",
    "servicio": "centro-terapeutico-psyche-backend",
    "version": "1.0.0",
    "puerto": 3002,
    "uptime": 5.7108616,
    "memoria": {
      "usada": "181 MB",
      "total": "211 MB"
    }
  },
  "timestamp": "2025-07-29T02:55:21.856Z",
  "codigo": "SYS_001"
}
```

---

## 📋 **Categorías de Mensajes**

### **🔐 Autenticación (AUTH_xxx)**

```typescript
MENSAJES_AUTH = {
  LOGIN_EXITOSO: '¡Bienvenido! Has iniciado sesión correctamente',
  LOGIN_FALLIDO: 'Credenciales incorrectas. Por favor verifica tu email y contraseña',
  REGISTRO_EXITOSO: '¡Cuenta creada exitosamente! Ya puedes iniciar sesión',
  TOKEN_EXPIRADO: 'Tu sesión ha expirado. Por favor inicia sesión nuevamente'
};
```

### **👥 Pacientes (PAC_xxx)**

```typescript
MENSAJES_PACIENTES = {
  PACIENTE_CREADO: '¡Paciente registrado exitosamente! Ya puede acceder al sistema',
  PACIENTE_ACTUALIZADO: 'Información del paciente actualizada correctamente',
  ASIGNACION_EXITOSA: 'Paciente asignado al psicólogo exitosamente'
};
```

### **📝 Tareas (TAR_xxx)**

```typescript
MENSAJES_TAREAS = {
  TAREA_CREADA: '¡Tarea asignada exitosamente! El paciente ha sido notificado',
  TAREA_COMPLETADA: '¡Felicidades! Has completado la tarea exitosamente',
  PUNTOS_OTORGADOS: '¡Excelente trabajo! Has ganado puntos por completar la tarea'
};
```

### **🎮 Gamificación (GAM_xxx)**

```typescript
MENSAJES_GAMIFICACION = {
  PUNTOS_OTORGADOS: '¡Has ganado {puntos} puntos!',
  NIVEL_ALCANZADO: '¡Felicidades! Has alcanzado el nivel {nivel}',
  LOGRO_DESBLOQUEADO: '🏆 ¡Nuevo logro desbloqueado: {logro}!'
};
```

---

## 🛠️ **Cómo Usar en el Código**

### **Respuesta Exitosa Simple**

```typescript
import { ManejadorRespuestas } from '../utilidades/respuestas';
import { MENSAJES_PACIENTES } from '../utilidades/mensajes';

export const crearPaciente = async (req: Request, res: Response) => {
  // ... lógica ...

  return ManejadorRespuestas.creado(
    res,
    MENSAJES_PACIENTES.PACIENTE_CREADO,
    nuevoPaciente,
    'PAC_004'
  );
};
```

### **Mensaje con Variables Dinámicas**

```typescript
import { formatearMensaje, MENSAJES_GAMIFICACION } from '../utilidades/mensajes';

const mensaje = formatearMensaje(MENSAJES_GAMIFICACION.PUNTOS_OTORGADOS, { puntos: 50 });
// Resultado: "¡Has ganado 50 puntos!"
```

### **Manejo de Errores**

```typescript
// Error de validación
return ManejadorRespuestas.errorValidacion(
  res,
  'Email y contraseña son requeridos',
  { camposRequeridos: ['email', 'password'] },
  'AUTH_001'
);

// Error no encontrado
return ManejadorRespuestas.noEncontrado(res, 'El paciente solicitado no fue encontrado', 'PAC_404');
```

---

## 🚀 **Códigos de Respuesta HTTP**

| **Método**                              | **Código** | **Uso**            | **Ejemplo**          |
| --------------------------------------- | ---------- | ------------------ | -------------------- |
| `ManejadorRespuestas.exito()`           | 200        | Operación exitosa  | GET pacientes        |
| `ManejadorRespuestas.creado()`          | 201        | Recurso creado     | POST paciente nuevo  |
| `ManejadorRespuestas.errorValidacion()` | 400        | Datos inválidos    | Email faltante       |
| `ManejadorRespuestas.noAutorizado()`    | 401        | Sin autenticación  | Token expirado       |
| `ManejadorRespuestas.prohibido()`       | 403        | Sin permisos       | Rol insuficiente     |
| `ManejadorRespuestas.noEncontrado()`    | 404        | Recurso no existe  | Paciente inexistente |
| `ManejadorRespuestas.conflicto()`       | 409        | Conflicto de datos | Email duplicado      |
| `ManejadorRespuestas.errorInterno()`    | 500        | Error del servidor | BD no disponible     |

---

## 📊 **Estructura de Respuesta Estándar**

```typescript
interface RespuestaAPI {
  success: boolean; // true/false
  mensaje: string; // Mensaje legible para humanos
  data?: any; // Datos del resultado (opcional)
  error?: string; // Mensaje de error (si success=false)
  codigo?: string; // Código único para debugging
  timestamp?: string; // Marca temporal ISO
}
```

### **Ejemplo de Respuesta Exitosa**

```json
{
  "success": true,
  "mensaje": "Lista de pacientes obtenida exitosamente",
  "data": {
    "pacientes": [...],
    "total": 25,
    "activos": 18
  },
  "codigo": "PAC_001",
  "timestamp": "2025-07-29T02:55:21.856Z"
}
```

### **Ejemplo de Respuesta de Error**

```json
{
  "success": false,
  "mensaje": "Email y contraseña son requeridos",
  "error": "Email y contraseña son requeridos",
  "data": {
    "camposRequeridos": ["email", "password"]
  },
  "codigo": "AUTH_001",
  "timestamp": "2025-07-29T02:55:21.856Z"
}
```

---

## 🎯 **Beneficios del Sistema**

### **✅ Para Desarrolladores**

- **Códigos únicos** para debugging rápido
- **Mensajes consistentes** en toda la aplicación
- **Fácil mantenimiento** de textos
- **TypeScript** con autocompletado

### **✅ Para Usuarios**

- **Mensajes claros** y amigables
- **Información específica** sobre errores
- **Feedback positivo** en operaciones exitosas
- **Gamificación** motivacional

### **✅ Para Sistemas**

- **Formato JSON estándar** para APIs
- **Timestamps** para auditoría
- **Códigos de error** categorizados
- **Estructura predecible**

---

## 💡 **Ejemplos de Uso Práctico**

### **Dashboard de Monitoreo**

```bash
# Ver estado visual en navegador
http://localhost:3002/dashboard
```

### **Monitoreo Automático**

```bash
# Para scripts de monitoreo
curl http://localhost:3002/salud | jq '.data.estado'
```

### **Debugging**

```bash
# Ver mensaje de error específico
curl -X POST http://localhost:3002/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{}' | jq '.codigo'
# Resultado: "AUTH_001"
```

---

## 🎉 **¡Todo Listo!**

**🎨 Dashboard bonito**: `http://localhost:3002/dashboard`  
**📊 API de salud**: `http://localhost:3002/salud`  
**📄 Info general**: `http://localhost:3002/`

**¡Ahora tienes lo mejor de ambos mundos!** 🚀
