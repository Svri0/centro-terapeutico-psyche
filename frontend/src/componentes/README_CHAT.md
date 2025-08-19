# 🗨️ Sistema de Chat - Centro Terapéutico Psyche

## 📋 Descripción

Sistema de comunicación en tiempo real entre psicólogos y pacientes, inspirado en la interfaz de Instagram pero adaptado al contexto de salud mental. Incluye pestañas múltiples, búsqueda inteligente, indicadores de estado y diseño completamente responsive.

## ✨ Características Principales

### 🎯 **Funcionalidades Core**
- **Chat en tiempo real** entre psicólogos y pacientes
- **Pestañas múltiples** para gestionar varias conversaciones
- **Búsqueda inteligente** de conversaciones y usuarios
- **Indicadores de estado** (online/offline, mensajes no leídos)
- **Diseño responsive** para desktop, tablet y móvil
- **Sistema de roles** diferenciado por tipo de usuario

### 🎨 **Interfaz de Usuario**
- **Panel izquierdo**: Lista de chats con avatares y previews
- **Panel derecho**: Chat activo con historial de mensajes
- **Header del chat**: Información del usuario y controles
- **Input de mensaje**: Con botones para emojis, archivos y audio
- **Indicadores visuales**: Estados online, mensajes no leídos, timestamps

### 🔧 **Características Técnicas**
- **TypeScript** con tipos completos y interfaces
- **React Hooks** para manejo de estado
- **Tailwind CSS** para estilos consistentes
- **Heroicons** para iconografía
- **Servicio API** completo con manejo de errores
- **Arquitectura modular** y reutilizable

## 🚀 Instalación y Uso

### 1. **Importar el Componente**

```tsx
import ChatSistema from './componentes/ChatSistema';
```

### 2. **Uso Básico**

```tsx
<ChatSistema 
  tipoUsuario="psicologo" 
  usuarioId="user-123" 
/>
```

### 3. **Props Disponibles**

| Prop | Tipo | Descripción | Requerido |
|------|------|-------------|-----------|
| `tipoUsuario` | `'psicologo' \| 'paciente'` | Tipo de usuario que usa el chat | ✅ |
| `usuarioId` | `string` | ID único del usuario | ✅ |

### 4. **Ejemplo Completo**

```tsx
import React, { useState } from 'react';
import ChatSistema from './componentes/ChatSistema';

const App: React.FC = () => {
  const [tipoUsuario, setTipoUsuario] = useState<'psicologo' | 'paciente'>('psicologo');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header de tu aplicación */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900">
            Centro Terapéutico Psyche
          </h1>
        </div>
      </header>

      {/* Sistema de Chat */}
      <ChatSistema 
        tipoUsuario={tipoUsuario} 
        usuarioId="usuario-actual" 
      />
    </div>
  );
};

export default App;
```

## 🎨 Personalización

### **Colores y Estilos**

El componente usa las clases de Tailwind CSS definidas en tu configuración:

```js
// tailwind.config.js
colors: {
  primary: {
    50: '#fefcf9',
    100: '#fdf8f2',
    500: '#f2a85c',  // Color principal
    600: '#e8943a',
  }
}
```

### **Temas Personalizados**

Puedes modificar los colores editando las clases en el componente:

```tsx
// Cambiar color de mensajes del usuario
className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
  mensaje.remitente === tipoUsuario
    ? 'bg-blue-500 text-white'  // Cambiar a azul
    : 'bg-white text-gray-900 border border-gray-200'
}`}
```

## 📱 Responsive Design

### **Breakpoints**
- **Mobile (< 768px)**: Chat ocupa toda la pantalla
- **Tablet (≥ 768px)**: Panel izquierdo + chat lado a lado
- **Desktop (≥ 1024px)**: Layout completo con navegación

### **Navegación Móvil**
- Botón de retorno en chats activos
- Panel de chats se oculta automáticamente
- Transiciones suaves entre estados

## 🔌 Integración con Backend

### **Endpoints Requeridos**

El servicio de chat espera estos endpoints en tu API:

```typescript
// GET /api/chat - Lista de chats
// GET /api/chat/:id/mensajes - Mensajes de un chat
// POST /api/chat/:id/mensajes - Enviar mensaje
// PUT /api/chat/:id/mensajes/leer - Marcar como leído
// POST /api/chat - Crear nuevo chat
// GET /api/usuarios/buscar - Buscar usuarios
```

### **Variables de Entorno**

```env
VITE_API_URL=http://localhost:3001
```

## 🧪 Testing

### **Componente de Ejemplo**

Usa `EjemploChat.tsx` para probar el sistema:

```tsx
import EjemploChat from './componentes/EjemploChat';

// En tu App.tsx
<EjemploChat />
```

### **Casos de Prueba**

1. **Cambiar tipo de usuario** (psicólogo ↔ paciente)
2. **Seleccionar diferentes chats**
3. **Enviar mensajes**
4. **Probar búsqueda**
5. **Verificar responsive design**

## 🚧 Funcionalidades Futuras

### **Próximas Implementaciones**
- [ ] **WebSockets** para chat en tiempo real
- [ ] **Notificaciones push** del navegador
- [ ] **Subida de archivos** con drag & drop
- [ ] **Emojis y reacciones** a mensajes
- [ ] **Chats grupales** para terapias
- [ ] **Historial de mensajes** con paginación
- [ ] **Búsqueda avanzada** en mensajes
- [ ] **Exportación** de conversaciones

### **Mejoras de UX**
- [ ] **Indicadores de escritura** (typing indicators)
- [ ] **Mensajes de estado** (enviado, entregado, leído)
- [ ] **Modo oscuro** automático
- [ ] **Accesibilidad** mejorada (ARIA labels)
- [ ] **Atajos de teclado** para navegación

## 🐛 Solución de Problemas

### **Errores Comunes**

1. **Chat no se muestra**
   - Verificar que `tipoUsuario` sea válido
   - Comprobar que `usuarioId` esté definido

2. **Estilos no se aplican**
   - Verificar que Tailwind CSS esté configurado
   - Comprobar que las clases estén incluidas en el build

3. **API no responde**
   - Verificar `VITE_API_URL` en variables de entorno
   - Comprobar que el backend esté funcionando

### **Debug**

```tsx
// Agregar logs para debugging
console.log('Tipo usuario:', tipoUsuario);
console.log('Chats:', chats);
console.log('Chat activo:', chatActivo);
```

## 📚 Recursos Adicionales

### **Documentación**
- [Tailwind CSS](https://tailwindcss.com/docs)
- [React Hooks](https://reactjs.org/docs/hooks-intro.html)
- [TypeScript](https://www.typescriptlang.org/docs/)

### **Componentes Relacionados**
- `Notificacion.tsx` - Sistema de notificaciones
- `AvatarSelector.tsx` - Selector de avatares
- `ImageUpload.tsx` - Subida de imágenes

---

## 🤝 Contribución

Para contribuir al sistema de chat:

1. **Fork** el repositorio
2. **Crea** una rama para tu feature
3. **Implementa** las mejoras
4. **Testea** en diferentes dispositivos
5. **Envía** un pull request

---

**Desarrollado con ❤️ para el Centro Terapéutico Psyche**
