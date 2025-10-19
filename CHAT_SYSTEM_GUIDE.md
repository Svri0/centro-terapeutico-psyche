# 🚨 GUÍA CRÍTICA DEL SISTEMA DE CHAT

> **⚠️ ADVERTENCIA**: Este sistema es FRÁGIL. Cualquier modificación incorrecta puede romper TODO el chat. Lee esta guía COMPLETA antes de tocar cualquier cosa.

## 📋 ÍNDICE
- [¿Qué hace el chat?](#-qué-hace-el-chat)
- [Arquitectura del Sistema](#-arquitectura-del-sistema)
- [🚨 LO QUE NUNCA DEBES TOCAR](#-lo-que-nunca-debes-tocar)
- [Errores Críticos que Rompieron Todo](#-errores-críticos-que-rompieron-todo)
- [Guía de Modificaciones Seguras](#-guía-de-modificaciones-seguras)
- [Checklist de Emergencia](#-checklist-de-emergencia)

---

## 🎯 ¿QUÉ HACE EL CHAT?

### **Funcionalidades Principales:**
- **Chat en tiempo real** entre psicólogos y sus pacientes registrados
- **Chat administrativo** entre admin y trabajadores (psicólogos + recepcionistas)
- **Mensajes persistentes** que se guardan en base de datos
- **Contador de mensajes no leídos** que se resetea automáticamente
- **Autenticación WebSocket** con tokens JWT
- **Reconexión automática** cuando se pierde la conexión

### **Roles y Permisos:**
- **Psicólogo**: Solo puede chatear con sus pacientes registrados + personal
- **Paciente**: Solo puede chatear con su psicólogo asignado
- **Admin**: Solo puede chatear con trabajadores (psicólogos + recepcionistas)
- **Recepcionista**: Solo puede chatear con personal + admin

---

## 🏗️ ARQUITECTURA DEL SISTEMA

### **Frontend (React + TypeScript + Vite)**
```
frontend/src/
├── componentes/
│   ├── ChatPsicologo.tsx     # Chat para psicólogos
│   └── ChatAdmin.tsx         # Chat para administradores
├── servicios/
│   └── chat.service.ts       # API REST para datos iniciales
└── paginas/
    ├── PanelPsicologo.tsx    # Integra ChatPsicologo
    └── PanelAdmin.tsx        # Integra ChatAdmin
```

### **Backend (Node.js + Express + Socket.IO)**
```
backend/src/
├── servicios/
│   └── chat-websocket.service.ts  # Servidor WebSocket (TIEMPO REAL)
├── controladores/
│   └── chat.controlador.ts        # API REST para datos iniciales
├── modelos/
│   └── MensajeChat.ts             # Modelo de base de datos
├── rutas/
│   └── chat.rutas.ts              # Rutas API
└── migrations/
    ├── 20241220000001-create-mensajes-chat.js
    └── 20241220000002-add-admin-to-mensajes-chat-enum.js
```

### **Base de Datos (PostgreSQL)**
```sql
-- Tabla principal de mensajes
CREATE TABLE mensajes_chat (
    id UUID PRIMARY KEY,
    contenido TEXT NOT NULL,
    remitente_id UUID NOT NULL REFERENCES usuarios(id),
    destinatario_id UUID NOT NULL REFERENCES usuarios(id),
    tipo ENUM('psicologo', 'paciente', 'admin') NOT NULL,
    leido BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    deleted_at TIMESTAMP NULL
);
```

---

## 🚨 LO QUE NUNCA DEBES TOCAR

### **1. AUTENTICACIÓN WEBSOCKET** ⚠️ CRÍTICO
```typescript
// ❌ NUNCA CAMBIES ESTO:
socket.userRole = rolMap[decoded.rol_id]; // ← CLAVE DEL SISTEMA

// El token JWT contiene rol_id (número), NO rol (string)
// Si cambias esto, TODO se rompe con "Parámetros inválidos"
```

### **2. MAPEO DE ROLES** ⚠️ CRÍTICO
```typescript
// ❌ NUNCA CAMBIES ESTOS NÚMEROS:
const rolMap = {
  1: 'admin',        // ← Si cambias esto, admin no funciona
  2: 'psicologo',    // ← Si cambias esto, psicólogos no funcionan
  3: 'recepcionista', // ← Si cambias esto, recepcionistas no funcionan
  4: 'paciente'      // ← Si cambias esto, pacientes no funcionan
};
```

### **3. ENUM DE BASE DE DATOS** ⚠️ CRÍTICO
```sql
-- ❌ NUNCA CAMBIES EL ENUM SIN MIGRACIÓN:
ALTER TYPE "enum_mensajes_chat_tipo" ADD VALUE 'nuevo_tipo';
-- Si cambias esto sin migración, TODO se rompe
```

### **4. VARIABLES DE ENTORNO** ⚠️ CRÍTICO
```typescript
// ❌ NUNCA USES process.env en frontend (Vite):
const API_URL = process.env.REACT_APP_API_URL; // ← ROMPE TODO

// ✅ SIEMPRE USA import.meta.env:
const API_URL = import.meta.env.VITE_API_URL;
```

### **5. EVENTOS WEBSOCKET** ⚠️ CRÍTICO
```typescript
// ❌ NUNCA CAMBIES ESTOS NOMBRES DE EVENTOS:
socket.emit('authenticate', { token });
socket.emit('cargar_mensajes', data);
socket.emit('enviar_mensaje', data);
socket.emit('marcar_como_leidos', data);

// Si cambias estos nombres, frontend y backend se desincronizan
```

---

## 🔥 ERRORES CRÍTICOS QUE ROMPIERON TODO

### **Error #1: "Parámetros inválidos" - 3 HORAS PERDIDAS** ⏰
```typescript
// ❌ PROBLEMA:
socket.userRole = decoded.rol; // undefined porque el campo no existe

// ✅ SOLUCIÓN:
socket.userRole = rolMap[decoded.rol_id]; // Mapear rol_id a string
```

**¿Por qué pasó?** El token JWT contiene `rol_id` (número), pero el código intentaba leer `decoded.rol` (que no existe).

### **Error #2: "process is not defined" - 1 HORA PERDIDA** ⏰
```typescript
// ❌ PROBLEMA:
const API_URL = process.env.REACT_APP_API_URL; // Vite no tiene process.env

// ✅ SOLUCIÓN:
const API_URL = import.meta.env.VITE_API_URL;
```

**¿Por qué pasó?** Vite (el bundler) no expone `process.env` como Create React App.

### **Error #3: Enum de base de datos - 2 HORAS PERDIDAS** ⏰
```sql
-- ❌ PROBLEMA:
INSERT INTO mensajes_chat (tipo) VALUES ('admin'); -- Error: enum no tiene 'admin'

-- ✅ SOLUCIÓN:
-- Crear migración para agregar 'admin' al enum
ALTER TYPE "enum_mensajes_chat_tipo" ADD VALUE 'admin';
```

**¿Por qué pasó?** El enum de la base de datos no incluía el tipo 'admin' que necesitábamos.

### **Error #4: Mensajes no persisten - 2 HORAS PERDIDAS** ⏰
```typescript
// ❌ PROBLEMA:
// Los mensajes se enviaban pero desaparecían al recargar

// ✅ SOLUCIÓN:
useEffect(() => {
  if (trabajadorSeleccionado && socket) {
    setMensajes([]); // ← LIMPIAR ANTES DE CARGAR
    socket.emit('cargar_mensajes', { trabajador_id: trabajadorSeleccionado.id, admin_id: adminId });
  }
}, [trabajadorSeleccionado, socket, adminId]);
```

**¿Por qué pasó?** Los mensajes no se limpiaban antes de cargar nuevos, causando datos inconsistentes.

---

## 🛠️ GUÍA DE MODIFICACIONES SEGURAS

### **1. Agregar Nuevo Tipo de Mensaje**
```bash
# Paso 1: Crear migración
npm run db:migrate:create add-nuevo-tipo-to-mensajes-chat

# Paso 2: En la migración:
ALTER TYPE "enum_mensajes_chat_tipo" ADD VALUE 'nuevo_tipo';

# Paso 3: Actualizar modelo
# En MensajeChat.ts:
tipo: {
  type: DataTypes.ENUM('psicologo', 'paciente', 'admin', 'nuevo_tipo'),
  allowNull: false,
}

# Paso 4: Actualizar interfaces TypeScript
# En chat.service.ts:
export interface MensajeChat {
  tipo: 'psicologo' | 'paciente' | 'admin' | 'nuevo_tipo';
}

# Paso 5: Actualizar lógica WebSocket
# En chat-websocket.service.ts:
tipo: 'psicologo' | 'paciente' | 'admin' | 'nuevo_tipo';
```

### **2. Agregar Nuevo Rol**
```typescript
// Paso 1: Actualizar mapeo de roles
const rolMap = {
  1: 'admin',
  2: 'psicologo', 
  3: 'recepcionista',
  4: 'paciente',
  5: 'nuevo_rol' // ← Agregar aquí
};

// Paso 2: Actualizar lógica de autorización
if (socket.userRole === 'nuevo_rol' && data.nuevo_rol_id) {
  // Lógica para nuevo rol
}
```

### **3. Agregar Nueva Funcionalidad**
```typescript
// Ejemplo: Archivos adjuntos
// Paso 1: Extender modelo de base de datos
// Paso 2: Crear migración
// Paso 3: Actualizar interfaces
// Paso 4: Modificar lógica de envío
// Paso 5: Actualizar UI para mostrar archivos
```

### **4. Modificar Estructura de Mensajes**
```typescript
// ⚠️ PELIGROSO: Cambiar estructura puede romper mensajes existentes
// Siempre crear migración para cambios de esquema
// Siempre hacer backup de la base de datos antes
// Siempre probar en entorno de desarrollo primero
```

---

## 🚨 CHECKLIST DE EMERGENCIA

### **Cuando el Chat NO Funciona:**

#### **1. Verificar Autenticación WebSocket**
```bash
# En consola del backend, buscar:
🔍 Token decodificado: {id: "...", rol_id: 1, ...}
🔍 Rol asignado al socket: admin
✅ Usuario autenticado: Admin (admin)
```

#### **2. Verificar Eventos WebSocket**
```bash
# En consola del backend, buscar:
🔍 EVENTO cargar_mensajes recibido: {...}
🔍 Usuario autenticado: [ID]
🔍 Rol del usuario: [rol]
```

#### **3. Verificar Base de Datos**
```sql
-- Verificar que el enum tenga todos los valores:
SELECT unnest(enum_range(NULL::enum_mensajes_chat_tipo));

-- Debe mostrar: psicologo, paciente, admin
```

#### **4. Verificar Variables de Entorno**
```typescript
// En frontend, verificar:
console.log('API URL:', import.meta.env.VITE_API_URL);
// Debe mostrar: http://localhost:3002
```

#### **5. Verificar Conexión WebSocket**
```typescript
// En consola del frontend, buscar:
Conectado al chat como administrador
✅ Autenticación exitosa: {success: true, userId: "..."}
```

### **Comandos de Emergencia:**
```bash
# Reiniciar backend
cd backend && npm run dev

# Verificar migraciones
npm run db:migrate:status

# Ejecutar migraciones pendientes
npm run db:migrate

# Limpiar caché de frontend
cd frontend && npm run dev -- --force
```

---

## 📝 NOTAS PARA MODIFICACIONES FUTURAS

### **Funcionalidades Pendientes:**
- [ ] **Archivos adjuntos** en mensajes
- [ ] **Mensajes temporales** (que se autodestruyen)
- [ ] **Reacciones** a mensajes (👍, ❤️, 😂)
- [ ] **Notificaciones push** cuando el usuario está offline
- [ ] **Indicador de escritura** ("Usuario está escribiendo...")
- [ ] **Mensajes de voz** (grabación de audio)
- [ ] **Llamadas de voz/video** integradas
- [ ] **Chat grupal** para equipos de trabajo
- [ ] **Mensajes programados** (enviar en fecha futura)
- [ ] **Búsqueda de mensajes** con filtros avanzados

### **Mejoras de Rendimiento:**
- [ ] **Paginación** de mensajes (cargar por lotes)
- [ ] **Compresión** de mensajes largos
- [ ] **Cache** de mensajes frecuentes
- [ ] **Lazy loading** de imágenes y archivos
- [ ] **Optimización** de consultas SQL

### **Mejoras de Seguridad:**
- [ ] **Encriptación** de mensajes sensibles
- [ ] **Auditoría** de mensajes (quién lee qué)
- [ ] **Retención** automática de mensajes antiguos
- [ ] **Filtros** de contenido inapropiado
- [ ] **Verificación** de identidad adicional

### **Mejoras de UX:**
- [ ] **Temas** personalizables (claro/oscuro)
- [ ] **Emojis** personalizados del centro
- [ ] **Plantillas** de mensajes frecuentes
- [ ] **Atajos** de teclado para acciones rápidas
- [ ] **Modo offline** con sincronización automática

---

## ⚠️ RECORDATORIOS CRÍTICOS

1. **SIEMPRE** hacer backup de la base de datos antes de cambios
2. **NUNCA** modificar el mapeo de roles sin actualizar toda la lógica
3. **SIEMPRE** probar en desarrollo antes de producción
4. **NUNCA** cambiar nombres de eventos WebSocket sin actualizar ambos lados
5. **SIEMPRE** verificar que las migraciones se ejecuten correctamente
6. **NUNCA** usar `process.env` en frontend con Vite
7. **SIEMPRE** mantener logs detallados para debugging
8. **NUNCA** modificar la autenticación WebSocket sin entender completamente el flujo

---

## 🆘 CONTACTO DE EMERGENCIA

Si el chat se rompe y no sabes qué hacer:

1. **NO TOQUES NADA MÁS**
2. **REVISA ESTA GUÍA COMPLETA**
3. **BUSCA EN LOS LOGS** los errores específicos
4. **HAZ BACKUP** de la base de datos
5. **REVIERTE** los cambios si es posible
6. **PIDE AYUDA** con logs específicos del error

---

**Última actualización**: 27 de Septiembre, 2025  
**Versión del sistema**: 1.0.0  
**Tiempo total de desarrollo**: 8+ horas (incluyendo debugging)  
**Errores críticos resueltos**: 4  
**Horas perdidas en debugging**: 8+ horas  

> **💡 LECCIÓN APRENDIDA**: El chat es un sistema complejo con muchas dependencias. Cualquier cambio pequeño puede tener efectos en cascada. Siempre prueba exhaustivamente antes de considerar que algo "funciona".
