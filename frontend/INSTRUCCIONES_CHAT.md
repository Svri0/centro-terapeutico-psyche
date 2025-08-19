# 🗨️ **INSTRUCCIONES PARA PROBAR EL CHAT**

## 🚀 **¿Cómo ver el chat funcionando?**

### **Opción 1: Integrado en tu aplicación (RECOMENDADO)**
1. **Inicia tu aplicación** con `npm run dev`
2. **Haz login** como psicólogo o paciente
3. **Ve a la pestaña "Chat"** en la navegación
4. **¡Listo!** Ya puedes ver el chat funcionando

### **Opción 2: Componente independiente**
1. **Importa TestChat** en tu App.tsx temporalmente:
```tsx
import TestChat from './componentes/TestChat';

// Cambia temporalmente tu App.tsx para mostrar solo el chat:
function App() {
  return <TestChat />;
}
```

## 🎯 **Qué puedes probar:**

### **✅ Funcionalidades básicas:**
- **Cambiar tipo de usuario** (psicólogo ↔ paciente)
- **Ver lista de chats** con avatares y previews
- **Seleccionar diferentes chats** 
- **Enviar mensajes** de prueba
- **Ver indicadores** de estado (online/offline)
- **Contador de mensajes** no leídos

### **✅ Características avanzadas:**
- **Búsqueda** de conversaciones
- **Diseño responsive** (prueba en móvil)
- **Timestamps** de mensajes
- **Estados de chat** (en línea/desconectado)
- **Navegación móvil** con botones de retorno

### **✅ Estilo y UX:**
- **Colores consistentes** con tu app (primary-500)
- **Transiciones suaves** entre estados
- **Hover effects** en elementos interactivos
- **Iconografía** con Heroicons
- **Layout profesional** tipo Instagram

## 🔧 **Si algo no funciona:**

### **1. Chat no se muestra:**
- Verifica que `ChatSistema` esté importado
- Comprueba que `tipoUsuario` sea válido
- Asegúrate de que `usuarioId` esté definido

### **2. Estilos no se aplican:**
- Verifica que Tailwind CSS esté funcionando
- Comprueba que las clases estén en el build

### **3. Errores en consola:**
- Revisa que todos los imports estén correctos
- Verifica que no haya conflictos de nombres

## 📱 **Para probar responsive:**
1. **Abre DevTools** (F12)
2. **Cambia a vista móvil** (Toggle device toolbar)
3. **Prueba diferentes tamaños** de pantalla
4. **Verifica la navegación** en móvil

## 🎨 **Personalización rápida:**

### **Cambiar colores:**
```tsx
// En ChatSistema.tsx, cambia:
className="bg-primary-500" 
// Por:
className="bg-blue-500" // o el color que prefieras
```

### **Cambiar avatares:**
```tsx
// En el useEffect, cambia las URLs de Unsplash por:
avatar: 'https://tu-url-de-avatar.com/imagen.jpg'
```

## 🚀 **Próximos pasos:**
1. **Conecta con tu backend** (ya tienes el servicio listo)
2. **Implementa WebSockets** para chat en tiempo real
3. **Agrega notificaciones** push
4. **Subida de archivos** e imágenes
5. **Emojis y reacciones**

---

## 💡 **Consejo:**
**Empieza probando la Opción 1** (integrado en tu app) porque es más realista y te permite ver cómo se integra con el resto de tu sistema.

**¡El chat está listo para usar!** 🎉
