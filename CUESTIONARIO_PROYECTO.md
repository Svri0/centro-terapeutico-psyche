# 📋 Cuestionario del Proyecto - Centro Terapéutico Psyche

Este documento contiene preguntas frecuentes que pueden hacerte sobre el proyecto, organizadas por categorías técnicas y funcionales.

---

## 🏗️ 1. ARQUITECTURA Y PATRONES DE DISEÑO

### 1.1 Patrón MVC (Modelo-Vista-Controlador)

**P: ¿Cómo está implementado el patrón MVC en este proyecto?**

**R:** El proyecto sigue el patrón MVC de la siguiente manera:

- **Modelos (M)**: Ubicados en `backend/src/modelos/`, representan las entidades de la base de datos usando Sequelize ORM. Ejemplos: `Usuario.ts`, `Paciente.ts`, `Sesion.ts`, `Tarea.ts`.

- **Vistas (V)**: En el frontend, ubicadas en `frontend/src/paginas/` y `frontend/src/componentes/`. Son componentes React que renderizan la interfaz de usuario.

- **Controladores (C)**: Ubicados en `backend/src/controladores/`, manejan la lógica de negocio y procesan las peticiones HTTP. Ejemplos: `autenticacion.controlador.ts`, `pacientes.controlador.ts`, `sesiones.controlador.ts`.

**P: ¿Cómo se comunican las capas del MVC?**

**R:** 
- Las **Rutas** (`backend/src/rutas/`) reciben las peticiones HTTP y las delegan a los **Controladores**.
- Los **Controladores** utilizan los **Modelos** para interactuar con la base de datos.
- Los **Modelos** encapsulan la lógica de acceso a datos y relaciones.
- El **Frontend** (Vista) consume la API REST mediante servicios (`frontend/src/servicios/`).

**P: ¿Qué ventajas tiene usar MVC en este proyecto?**

**R:**
- **Separación de responsabilidades**: Cada capa tiene una función específica.
- **Mantenibilidad**: Cambios en una capa no afectan directamente a las otras.
- **Escalabilidad**: Fácil agregar nuevas funcionalidades sin modificar código existente.
- **Testabilidad**: Cada componente puede probarse de forma independiente.

---

### 1.2 Arquitectura del Sistema

**P: ¿Cuál es la arquitectura general del sistema?**

**R:** El sistema sigue una arquitectura de **aplicación web full-stack** con separación clara entre frontend y backend:

```
Frontend (React + TypeScript) → API REST → Backend (Node.js + Express) → Base de Datos (PostgreSQL)
```

**P: ¿Por qué se eligió esta arquitectura?**

**R:**
- **Separación de concerns**: Frontend y backend pueden desarrollarse y desplegarse independientemente.
- **Escalabilidad**: Cada servicio puede escalarse según demanda.
- **Tecnologías especializadas**: React para UI interactiva, Node.js para APIs eficientes.
- **Mantenibilidad**: Código organizado y fácil de entender.

---

## 🛠️ 2. TECNOLOGÍAS Y STACK TECNOLÓGICO

### 2.1 Backend

**P: ¿Qué tecnologías se usan en el backend y por qué?**

**R:**
- **Node.js + TypeScript**: TypeScript proporciona tipado estático, reduciendo errores en tiempo de ejecución.
- **Express.js**: Framework minimalista y flexible para APIs REST.
- **Sequelize ORM**: Abstracción de base de datos, facilita migraciones y consultas.
- **PostgreSQL**: Base de datos relacional robusta y confiable.
- **JWT (JSON Web Tokens)**: Autenticación stateless y segura.
- **Socket.IO**: Comunicación en tiempo real para el chat.

**P: ¿Por qué TypeScript en lugar de JavaScript?**

**R:**
- **Type Safety**: Detecta errores en tiempo de compilación.
- **Mejor IntelliSense**: Autocompletado y sugerencias en el IDE.
- **Refactoring seguro**: Cambios masivos con mayor confianza.
- **Documentación implícita**: Los tipos sirven como documentación.

---

### 2.2 Frontend

**P: ¿Qué tecnologías se usan en el frontend y por qué?**

**R:**
- **React 18**: Biblioteca moderna para interfaces de usuario interactivas.
- **TypeScript**: Consistencia con el backend y type safety.
- **Vite**: Build tool rápido con Hot Module Replacement (HMR).
- **Tailwind CSS**: Framework CSS utility-first para diseño rápido y consistente.
- **React Router**: Navegación del lado del cliente (SPA).
- **Axios**: Cliente HTTP para consumir la API.
- **Zustand**: Gestión de estado ligera y simple.

**P: ¿Por qué Vite en lugar de Create React App?**

**R:**
- **Velocidad**: Compilación y recarga mucho más rápidas.
- **Mejor DX (Developer Experience)**: Configuración más simple.
- **Optimización**: Mejor tree-shaking y code splitting.
- **Ecosistema moderno**: Soporte nativo para TypeScript y ES modules.

---

### 2.3 Base de Datos

**P: ¿Por qué PostgreSQL y no MySQL o MongoDB?**

**R:**
- **ACID Compliance**: Garantiza integridad de datos transaccionales.
- **Relaciones complejas**: Soporte robusto para relaciones entre tablas.
- **JSON Support**: Permite almacenar datos semi-estructurados cuando es necesario.
- **Escalabilidad**: Maneja grandes volúmenes de datos eficientemente.
- **Open Source**: Gratuito y con gran comunidad.

**P: ¿Qué es Sequelize y por qué se usa?**

**R:** Sequelize es un ORM (Object-Relational Mapping) que:
- **Abstrae SQL**: Permite trabajar con objetos JavaScript en lugar de SQL directo.
- **Migraciones**: Control de versiones del esquema de base de datos.
- **Relaciones**: Define y maneja relaciones entre modelos fácilmente.
- **Validaciones**: Validación de datos a nivel de modelo.
- **Transacciones**: Soporte para operaciones transaccionales.

---

## 🔐 3. AUTENTICACIÓN Y SEGURIDAD

### 3.1 Autenticación

**P: ¿Cómo funciona el sistema de autenticación?**

**R:** El sistema usa **JWT (JSON Web Tokens)**:

1. **Login**: El usuario envía credenciales (`email` y `password`).
2. **Validación**: El backend verifica las credenciales contra la base de datos.
3. **Generación de Token**: Si son válidas, se genera un JWT con información del usuario.
4. **Almacenamiento**: El token se almacena en el cliente (localStorage o cookies).
5. **Verificación**: Cada petición protegida incluye el token en el header `Authorization`.
6. **Middleware**: El middleware `auth.middleware.ts` verifica y valida el token.

**P: ¿Dónde se almacenan los tokens JWT?**

**R:** Los tokens se almacenan en el **localStorage** del navegador. Alternativamente, podrían usarse cookies httpOnly para mayor seguridad.

**P: ¿Cómo se protegen las rutas en el backend?**

**R:** Se usa middleware de autenticación (`backend/src/middleware/auth.middleware.ts`) que:
- Extrae el token del header `Authorization`.
- Verifica la validez del token.
- Decodifica la información del usuario.
- Agrega el usuario al objeto `request` para uso en controladores.

---

### 3.2 Seguridad

**P: ¿Qué medidas de seguridad implementa el proyecto?**

**R:**
- **JWT Tokens**: Autenticación stateless y segura.
- **Bcrypt**: Hash de contraseñas (nunca se almacenan en texto plano).
- **Helmet**: Headers de seguridad HTTP.
- **CORS**: Configuración restrictiva de orígenes permitidos.
- **Validación de datos**: Middleware de validación con Joi.
- **Rate Limiting**: Protección contra ataques de fuerza bruta (implementable).
- **Sanitización**: Limpieza de inputs del usuario.
- **Soft Deletes**: No se eliminan datos permanentemente, se marcan como eliminados.

**P: ¿Cómo se manejan los errores de seguridad?**

**R:** 
- Errores de autenticación retornan código 401 (Unauthorized).
- Errores de autorización retornan código 403 (Forbidden).
- Los mensajes de error no exponen información sensible.
- Se registran intentos fallidos en logs de auditoría.

---

## 🗄️ 4. BASE DE DATOS Y MODELOS

### 4.1 Modelo de Datos

**P: ¿Cuáles son las principales entidades del sistema?**

**R:**
- **Roles**: Define los roles del sistema (admin, psicólogo, paciente, recepcionista).
- **Usuarios**: Información de todos los usuarios del sistema.
- **Pacientes**: Información específica de pacientes y su relación con psicólogos.
- **Sesiones**: Sesiones terapéuticas programadas y realizadas.
- **Tareas**: Tareas asignadas a pacientes con sistema de gamificación.
- **RespuestasTareas**: Respuestas de pacientes a las tareas.
- **ServiciosPsicologo**: Servicios ofrecidos por cada psicólogo.
- **DisponibilidadMensual**: Horarios disponibles de psicólogos.
- **MensajesChat**: Mensajes del sistema de chat en tiempo real.
- **LogsAuditoria**: Registro de todas las acciones del sistema.

**P: ¿Cómo se relacionan las entidades principales?**

**R:**
- **Usuario** tiene un **Rol** (1:N).
- **Usuario** (psicólogo) tiene muchos **Pacientes** (1:N).
- **Paciente** tiene muchas **Sesiones** (1:N).
- **Paciente** tiene muchas **Tareas** (1:N).
- **Sesion** tiene muchas **Tareas** (1:N).
- **Usuario** tiene muchos **ServiciosPsicologo** (1:N).
- **Usuario** tiene muchos **MensajesChat** como remitente y destinatario (1:N).

---

### 4.2 Migraciones

**P: ¿Qué son las migraciones y cómo funcionan?**

**R:** Las migraciones son archivos que definen cambios en el esquema de la base de datos de forma versionada:

- **Ubicación**: `backend/src/migrations/`
- **Formato**: Archivos JavaScript con timestamp en el nombre.
- **Ejecución**: `npm run db:migrate` aplica migraciones pendientes.
- **Reversión**: `npm run db:migrate:undo` revierte la última migración.

**P: ¿Por qué usar migraciones en lugar de modificar la BD directamente?**

**R:**
- **Versionado**: Historial de cambios en el esquema.
- **Colaboración**: Todos los desarrolladores tienen el mismo esquema.
- **Rollback**: Posibilidad de revertir cambios si hay errores.
- **Automatización**: Aplicación automática en diferentes entornos.

---

## 🌐 5. API RESTFUL

### 5.1 Estructura de la API

**P: ¿Cómo está estructurada la API REST?**

**R:** La API sigue convenciones REST:

- **Base URL**: `http://localhost:3002/api/v1`
- **Endpoints organizados por recurso**:
  - `/api/v1/auth` - Autenticación
  - `/api/v1/usuarios` - Gestión de usuarios
  - `/api/v1/pacientes` - Gestión de pacientes
  - `/api/v1/sesiones` - Gestión de sesiones
  - `/api/v1/tareas` - Gestión de tareas
  - `/api/v1/chat` - Sistema de chat
  - `/api/v1/admin` - Funciones de administración

**P: ¿Qué métodos HTTP se utilizan?**

**R:**
- **GET**: Obtener recursos (listar, consultar).
- **POST**: Crear nuevos recursos.
- **PUT/PATCH**: Actualizar recursos existentes.
- **DELETE**: Eliminar recursos (soft delete).

---

### 5.2 Manejo de Respuestas

**P: ¿Cómo se estructuran las respuestas de la API?**

**R:** Todas las respuestas siguen un formato estándar:

```json
{
  "success": true,
  "mensaje": "Operación exitosa",
  "data": { ... },
  "codigo": "SYS_001",
  "timestamp": "2025-01-15T10:30:00.000Z"
}
```

**P: ¿Cómo se manejan los errores?**

**R:** Los errores también siguen un formato estándar:

```json
{
  "success": false,
  "mensaje": "Descripción del error",
  "error": "Detalle técnico",
  "codigo": "ERR_001",
  "timestamp": "2025-01-15T10:30:00.000Z"
}
```

---

## ⚛️ 6. FRONTEND Y REACT

### 6.1 Componentes

**P: ¿Cómo está organizada la estructura de componentes?**

**R:**
- **Páginas** (`frontend/src/paginas/`): Componentes de nivel superior que representan rutas completas.
- **Componentes** (`frontend/src/componentes/`): Componentes reutilizables.
- **Servicios** (`frontend/src/servicios/`): Lógica de comunicación con la API.
- **Hooks** (`frontend/src/hooks/`): Hooks personalizados de React.

**P: ¿Qué patrones de React se utilizan?**

**R:**
- **Functional Components**: Todos los componentes son funciones.
- **Hooks**: `useState`, `useEffect`, `useContext`, hooks personalizados.
- **Component Composition**: Componentes pequeños y reutilizables.
- **Custom Hooks**: Lógica reutilizable extraída a hooks.

---

### 6.2 Estado y Gestión de Datos

**P: ¿Cómo se maneja el estado en la aplicación?**

**R:**
- **Estado Local**: `useState` para estado de componentes individuales.
- **Estado Global**: Zustand para estado compartido entre componentes.
- **Estado del Servidor**: React Query para cachear y sincronizar datos de la API.
- **Context API**: Para temas, autenticación, etc.

**P: ¿Por qué Zustand en lugar de Redux?**

**R:**
- **Simplicidad**: Menos boilerplate que Redux.
- **Tamaño**: Librería más ligera.
- **TypeScript**: Mejor soporte nativo.
- **Suficiente**: Para las necesidades del proyecto, Redux sería excesivo.

---

## 🔄 7. FUNCIONALIDADES DEL SISTEMA

### 7.1 Roles y Permisos

**P: ¿Qué roles tiene el sistema y qué puede hacer cada uno?**

**R:**
- **Administrador**: 
  - Gestión completa de usuarios (crear, editar, eliminar).
  - Dashboard con estadísticas generales.
  - Acceso a logs de auditoría.
  - Configuración del sistema.

- **Psicólogo**:
  - Gestión de sus pacientes asignados.
  - Creación y gestión de sesiones.
  - Asignación de tareas a pacientes.
  - Visualización de reportes de progreso.
  - Chat con pacientes.

- **Paciente**:
  - Visualización de sus sesiones.
  - Completar tareas asignadas.
  - Chat con su psicólogo.
  - Ver su progreso.

- **Recepcionista**:
  - Gestión de citas.
  - Registro de pacientes.
  - Visualización de disponibilidad de psicólogos.

---

### 7.2 Sistema de Chat

**P: ¿Cómo funciona el sistema de chat?**

**R:**
- **Tecnología**: Socket.IO para comunicación en tiempo real.
- **Arquitectura**: WebSocket bidireccional entre cliente y servidor.
- **Almacenamiento**: Mensajes guardados en base de datos (`mensajes_chat`).
- **Funcionalidades**: 
  - Chat entre psicólogo y paciente.
  - Notificaciones en tiempo real.
  - Historial de mensajes.
  - Estados de lectura.

---

### 7.3 Sistema de Tareas y Gamificación

**P: ¿Cómo funciona el sistema de tareas?**

**R:**
- **Asignación**: Los psicólogos asignan tareas a pacientes.
- **Tipos**: Diferentes tipos de tareas (escritura, dibujo, cuestionario, etc.).
- **Respuestas**: Los pacientes responden con texto, imágenes o archivos.
- **Gamificación**: Sistema de puntos y logros (implementable).
- **Recordatorios**: Notificaciones automáticas de tareas pendientes.

---

## 📁 8. ESTRUCTURA DEL PROYECTO

### 8.1 Organización de Carpetas

**P: ¿Cómo está organizada la estructura del proyecto?**

**R:**
```
centro-terapeutico-psyche/
├── backend/
│   ├── src/
│   │   ├── configuracion/    # Configuración de BD, etc.
│   │   ├── controladores/    # Lógica de negocio
│   │   ├── middleware/        # Middlewares (auth, validación)
│   │   ├── modelos/          # Modelos de Sequelize
│   │   ├── rutas/            # Definición de rutas
│   │   ├── servicios/        # Servicios de negocio
│   │   ├── utilidades/        # Funciones auxiliares
│   │   └── servidor.ts       # Punto de entrada
│   ├── migrations/           # Migraciones de BD
│   └── seeders/             # Datos iniciales
├── frontend/
│   ├── src/
│   │   ├── componentes/      # Componentes React
│   │   ├── paginas/          # Páginas principales
│   │   ├── servicios/        # Servicios de API
│   │   ├── hooks/            # Hooks personalizados
│   │   └── utilidades/       # Utilidades
└── docs/                    # Documentación
```

---

### 8.2 Convenciones de Código

**P: ¿Qué convenciones de código se siguen?**

**R:**
- **Nomenclatura**:
  - Archivos: `kebab-case` (ej: `autenticacion.controlador.ts`)
  - Clases: `PascalCase` (ej: `Usuario`, `Paciente`)
  - Variables/Funciones: `camelCase` (ej: `obtenerUsuario`)
  - Constantes: `UPPER_SNAKE_CASE` (ej: `JWT_SECRET`)

- **TypeScript**: Tipado estricto, interfaces para tipos complejos.
- **ESLint + Prettier**: Formateo automático y reglas de código.
- **Comentarios**: Documentación JSDoc para funciones complejas.

---

## 🚀 9. DESPLIEGUE Y DEVOPS

### 9.1 Configuración

**P: ¿Cómo se configuran las variables de entorno?**

**R:** Se usa el archivo `.env` con variables como:
- `PORT`: Puerto del servidor (3002)
- `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`: Configuración de PostgreSQL
- `JWT_SECRET`: Secreto para firmar tokens JWT
- `EMAIL_HOST`, `EMAIL_USER`, `EMAIL_PASS`: Configuración de email

**P: ¿Por qué usar variables de entorno?**

**R:**
- **Seguridad**: No exponer credenciales en el código.
- **Flexibilidad**: Diferentes configuraciones por entorno (dev, prod).
- **Portabilidad**: Fácil cambio entre entornos.

---

### 9.2 Docker

**P: ¿Se usa Docker en el proyecto?**

**R:** Sí, hay configuración Docker:
- `Dockerfile` en backend y frontend.
- `docker-compose.yml` para orquestar servicios.
- Facilita despliegue y desarrollo consistente.

---

## 🧪 10. TESTING Y CALIDAD

### 10.1 Testing

**P: ¿Qué estrategias de testing se implementan?**

**R:**
- **Unit Tests**: Pruebas de funciones individuales.
- **Integration Tests**: Pruebas de integración entre componentes.
- **E2E Tests**: Pruebas end-to-end (implementable).

**P: ¿Qué herramientas de testing se usan?**

**R:**
- **Jest**: Framework de testing para JavaScript/TypeScript.
- **Vitest**: Alternativa rápida para frontend.
- **Testing Library**: Para testing de componentes React.

---

## 📊 11. RENDIMIENTO Y OPTIMIZACIÓN

### 11.1 Optimizaciones

**P: ¿Qué optimizaciones se implementan?**

**R:**
- **Lazy Loading**: Carga diferida de componentes y rutas.
- **Code Splitting**: División del código en chunks.
- **Caching**: Cacheo de respuestas de API con React Query.
- **Compression**: Compresión de respuestas HTTP (gzip).
- **Índices de BD**: Índices en campos frecuentemente consultados.

---

## 🔧 12. MANTENIMIENTO Y ESCALABILIDAD

### 12.1 Escalabilidad

**P: ¿Cómo se puede escalar el sistema?**

**R:**
- **Horizontal**: Múltiples instancias del backend con load balancer.
- **Base de Datos**: Replicación y sharding si es necesario.
- **Caching**: Redis para cacheo de datos frecuentes.
- **CDN**: Para servir assets estáticos.

---

### 12.2 Monitoreo

**P: ¿Cómo se monitorea el sistema?**

**R:**
- **Logs**: Sistema de logging estructurado.
- **Health Checks**: Endpoint `/salud` para verificar estado.
- **Auditoría**: Tabla `logs_auditoria` para rastrear acciones.
- **Errores**: Manejo centralizado de errores con códigos.

---

## 📝 13. PREGUNTAS TÉCNICAS ESPECÍFICAS

### 13.1 Sequelize

**P: ¿Cómo se definen las relaciones en Sequelize?**

**R:** Se usan métodos como:
- `hasMany()`: Relación uno a muchos.
- `belongsTo()`: Relación muchos a uno.
- `belongsToMany()`: Relación muchos a muchos.
- `hasOne()`: Relación uno a uno.

Ejemplo:
```typescript
Usuario.hasMany(Paciente, { foreignKey: 'psicologo_id', as: 'pacientes' });
Paciente.belongsTo(Usuario, { foreignKey: 'psicologo_id', as: 'psicologo' });
```

---

### 13.2 Middleware

**P: ¿Qué middlewares se usan y para qué?**

**R:**
- **helmet**: Headers de seguridad HTTP.
- **cors**: Configuración de CORS.
- **morgan**: Logging de peticiones HTTP.
- **compression**: Compresión de respuestas.
- **express.json**: Parsing de JSON.
- **auth.middleware**: Autenticación JWT.
- **validation.middleware**: Validación de datos.

---

### 13.3 WebSockets

**P: ¿Cómo funciona Socket.IO en el proyecto?**

**R:**
- **Servidor**: Configurado en `servidor.ts` con Socket.IO.
- **Cliente**: Conexión desde React usando `socket.io-client`.
- **Eventos**: Eventos personalizados para chat (`mensaje`, `nuevo_mensaje`, etc.).
- **Persistencia**: Mensajes guardados en base de datos.

---

## 🎯 14. PREGUNTAS SOBRE DECISIONES DE DISEÑO

### 14.1 Decisiones Arquitectónicas

**P: ¿Por qué separar frontend y backend en proyectos diferentes?**

**R:**
- **Independencia**: Pueden desarrollarse y desplegarse por separado.
- **Escalabilidad**: Escalar cada servicio según necesidad.
- **Tecnologías**: Usar las mejores herramientas para cada parte.
- **Equipos**: Diferentes equipos pueden trabajar en paralelo.

---

**P: ¿Por qué usar TypeScript en todo el proyecto?**

**R:**
- **Consistencia**: Mismo lenguaje en frontend y backend.
- **Type Safety**: Detección temprana de errores.
- **Refactoring**: Cambios masivos más seguros.
- **Documentación**: Los tipos sirven como documentación.

---

## 📚 15. PREGUNTAS SOBRE FUNCIONALIDADES ESPECÍFICAS

### 15.1 Sistema de Citas

**P: ¿Cómo funciona el sistema de citas/sesiones?**

**R:**
- Los psicólogos definen su disponibilidad mensual.
- Los pacientes o recepcionistas pueden agendar citas.
- Las citas tienen estados: `programada`, `en_curso`, `finalizada`, `cancelada`.
- Se valida que la hora esté dentro de la disponibilidad del psicólogo.

---

### 15.2 Reportes y Analytics

**P: ¿Qué reportes genera el sistema?**

**R:**
- **Reportes de Progreso**: Seguimiento del progreso de pacientes.
- **Reportes de Adherencia**: Análisis de asistencia a sesiones.
- **Dashboard de Estadísticas**: Métricas generales del centro.
- **Exportación PDF**: Generación de reportes en PDF.

---

## 🔍 16. PREGUNTAS DE DEBUGGING Y TROUBLESHOOTING

### 16.1 Errores Comunes

**P: ¿Qué hacer si el backend no inicia?**

**R:**
1. Verificar que PostgreSQL esté corriendo.
2. Verificar variables de entorno en `.env`.
3. Verificar que el puerto 3002 no esté ocupado.
4. Revisar logs de errores en la consola.
5. Ejecutar `npm run db:migrate` para asegurar esquema actualizado.

---

**P: ¿Qué hacer si hay errores de CORS?**

**R:**
1. Verificar que el frontend esté en un origen permitido.
2. Revisar configuración de CORS en `servidor.ts`.
3. Verificar headers en las peticiones.
4. Asegurar que las credenciales estén configuradas correctamente.

---

### 16.2 Problemas en Dispositivos Móviles

**P: ¿Por qué la aplicación solo funciona hasta el login en móviles?**

**R:** Este problema se debía al uso de `window.location.href` para redirigir después del login, lo cual causa un hard refresh completo de la página. En dispositivos móviles, esto puede causar problemas porque:

1. **Hard Refresh**: `window.location.href` recarga toda la página, perdiendo el estado de React.
2. **Problemas de Routing**: Puede no funcionar correctamente con React Router en algunos navegadores móviles.
3. **Pérdida de Estado**: El estado de autenticación puede perderse durante el refresh.

**Solución Implementada**: Se cambió a usar `navigate()` de React Router en lugar de `window.location.href`:

```typescript
// ❌ ANTES (problemático en móviles)
window.location.href = '/dashboard';

// ✅ DESPUÉS (funciona correctamente)
import { useNavigate } from 'react-router-dom';
const navigate = useNavigate();
navigate('/dashboard', { replace: true });
```

**P: ¿Existe PWA en la aplicación?**

**R:** **SÍ**, existe **configuración PWA** en el proyecto:

- ✅ **Plugin instalado**: `vite-plugin-pwa` en `package.json`
- ✅ **Configurado en Vite**: `vite.config.ts` tiene configuración de PWA
- ✅ **Manifest básico**: Con nombre, descripción, tema, etc.
- ❌ **Faltan iconos**: Los archivos `pwa-192x192.png` y `pwa-512x512.png` no existen
- ⚠️ **Estado**: PWA está **parcialmente configurado** pero **incompleto**

**P: ¿Qué es PWA y para qué sirve?**

**R:** **PWA (Progressive Web App)** es una tecnología que permite que una aplicación web se comporte como una app nativa:

- **Instalable**: Se puede "instalar" en el dispositivo desde el navegador.
- **Funciona Offline**: Puede funcionar sin conexión usando Service Workers.
- **Notificaciones Push**: Puede enviar notificaciones incluso cuando está cerrada.
- **Mejor Rendimiento**: Cacheo inteligente de recursos.

**IMPORTANTE**: 
- PWA está **configurado pero incompleto** (faltan iconos)
- PWA es una **mejora opcional** y **NO es necesaria** para que la aplicación funcione en móviles
- El problema de navegación en móviles se soluciona usando React Router correctamente, no requiere PWA

**P: ¿La aplicación funciona en móviles sin PWA?**

**R:** Sí, absolutamente. La aplicación es una **Single Page Application (SPA)** responsive que funciona perfectamente en móviles usando solo el navegador. PWA solo agregaría funcionalidades adicionales como:
- Instalación en la pantalla de inicio
- Funcionamiento offline
- Notificaciones push

Pero no es necesario para el funcionamiento básico en móviles.

**P: ¿Qué otros problemas pueden ocurrir en móviles?**

**R:**
1. **URL Base del Backend**: Verificar que `VITE_API_URL` esté configurada correctamente para acceder desde el móvil (usar IP local en desarrollo, no `localhost`).
2. **CORS**: Asegurar que el backend permita el origen del móvil.
3. **Viewport**: Verificar que el `viewport` meta tag esté configurado correctamente.
4. **Touch Events**: Asegurar que los botones y elementos interactivos sean táctiles.

---

## 💡 17. PREGUNTAS SOBRE MEJORES PRÁCTICAS

### 17.1 Código Limpio

**P: ¿Qué principios de código limpio se aplican?**

**R:**
- **DRY (Don't Repeat Yourself)**: Reutilización de código.
- **SOLID**: Principios de diseño orientado a objetos.
- **Single Responsibility**: Cada función/clase tiene una responsabilidad.
- **Nombres descriptivos**: Variables y funciones con nombres claros.
- **Comentarios útiles**: Solo donde es necesario explicar el "por qué".

---

### 17.2 Versionado

**P: ¿Cómo se maneja el control de versiones?**

**R:**
- **Git**: Sistema de control de versiones.
- **Branches**: Desarrollo en ramas separadas.
- **Commits descriptivos**: Mensajes claros de cambios.
- **Tags**: Versiones del proyecto etiquetadas.

---

## 🎓 18. PREGUNTAS ACADÉMICAS

### 18.1 Proyecto de Tesis

**P: ¿Cuál es el objetivo académico del proyecto?**

**R:** Este es un proyecto de tesis de grado desarrollado por un equipo de 4 estudiantes que demuestra:
- Desarrollo full-stack con tecnologías modernas.
- Diseño de base de datos relacional.
- Implementación de patrones de diseño.
- Trabajo colaborativo en equipo.
- Buenas prácticas de desarrollo de software.

---

**P: ¿Qué metodología de desarrollo se utilizó?**

**R:**
- **Metodología Ágil**: Desarrollo iterativo e incremental.
- **Sprints**: Trabajo por sprints con entregables.
- **Scrum**: Reuniones diarias, retrospectivas.
- **Git Flow**: Flujo de trabajo con ramas.

---

## 📞 19. PREGUNTAS DE SOPORTE Y DOCUMENTACIÓN

### 19.1 Documentación

**P: ¿Dónde está la documentación del proyecto?**

**R:**
- **README.md**: Guía principal de instalación y uso.
- **docs/**: Carpeta con documentación detallada.
- **Comentarios en código**: Documentación inline.
- **API Docs**: Documentación de endpoints (si está disponible).

---

## ✅ 20. CHECKLIST DE PREGUNTAS FRECUENTES

Antes de una presentación o defensa, asegúrate de poder responder:

- [ ] ¿Cómo funciona el patrón MVC en el proyecto?
- [ ] ¿Por qué se eligieron estas tecnologías?
- [ ] ¿Cómo funciona la autenticación JWT?
- [ ] ¿Cómo se relacionan las entidades en la base de datos?
- [ ] ¿Qué es Sequelize y cómo se usa?
- [ ] ¿Cómo funciona el sistema de chat en tiempo real?
- [ ] ¿Qué medidas de seguridad se implementan?
- [ ] ¿Cómo se estructura la API REST?
- [ ] ¿Cómo se maneja el estado en React?
- [ ] ¿Qué optimizaciones se implementan?
- [ ] ¿Cómo se puede escalar el sistema?
- [ ] ¿Qué errores comunes pueden ocurrir y cómo solucionarlos?

---

## 📝 NOTAS FINALES

Este cuestionario cubre los aspectos más importantes del proyecto. Para una presentación exitosa:

1. **Practica las respuestas** en voz alta.
2. **Prepara ejemplos** de código para mostrar.
3. **Ten diagramas** de arquitectura y base de datos listos.
4. **Demuestra el sistema** funcionando.
5. **Explica decisiones técnicas** con fundamentos sólidos.

**¡Buena suerte con tu presentación! 🚀**

