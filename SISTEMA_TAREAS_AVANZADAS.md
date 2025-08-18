# Sistema de Tareas Avanzadas - Centro Terapéutico Psyche

## 📋 Descripción General

El sistema de tareas avanzadas permite a los psicólogos crear y asignar diferentes tipos de tareas interactivas a sus pacientes, incluyendo formularios dinámicos, tests psicológicos, herramientas de dibujo y más.

## 🎯 Tipos de Tareas Disponibles

### 1. Texto Abierto
- **Descripción**: El paciente escribe libremente su respuesta
- **Características**: Campo de texto expandible con validaciones de longitud
- **Configuración**: Longitud mínima y máxima de respuesta

### 2. Opción Múltiple
- **Descripción**: Preguntas con opciones predefinidas
- **Características**: Selección única o múltiple según configuración
- **Configuración**: Número mínimo y máximo de opciones seleccionables

### 3. Test Psicológico
- **Descripción**: Tests estructurados con preguntas específicas
- **Características**: Preguntas predefinidas o creadas por el psicólogo
- **Configuración**: Puntuación automática y análisis de respuestas

### 4. Test con Imágenes
- **Descripción**: Tests que incluyen imágenes para análisis
- **Características**: Visualización de imágenes + preguntas asociadas
- **Configuración**: Múltiples imágenes y preguntas por imagen

### 5. Tarea de Dibujo
- **Descripción**: El paciente dibuja como parte de su respuesta
- **Características**: Herramienta de dibujo integrada con soporte táctil
- **Configuración**: Herramientas disponibles, tamaño de canvas

### 6. Tipos Tradicionales
- **Ejercicio**: Actividades físicas o mentales
- **Lectura**: Material de lectura asignado
- **Reflexión**: Tareas de introspección
- **Práctica**: Ejercicios prácticos
- **Evaluación**: Tests de evaluación

## 🏗️ Arquitectura del Sistema

### Backend

#### Modelos de Base de Datos

**Tabla `tareas`**:
```sql
- id (UUID, PK)
- paciente_id (UUID, FK)
- psicologo_id (UUID, FK)
- titulo (VARCHAR)
- descripcion (TEXT)
- instrucciones (TEXT)
- tipo_tarea (ENUM) - Nuevos tipos agregados
- prioridad (ENUM)
- fecha_asignacion (DATE)
- fecha_vencimiento (DATE)
- estado (ENUM)
- puntos_asignados (INTEGER)
- contenido_tarea (JSONB) - NUEVO
- configuracion_tarea (JSONB) - NUEVO
- es_borrador (BOOLEAN) - NUEVO
- fecha_publicacion (DATE) - NUEVO
```

**Tabla `respuestas_tareas`** (NUEVA):
```sql
- id (UUID, PK)
- tarea_id (UUID, FK)
- paciente_id (UUID, FK)
- contenido_respuesta (TEXT)
- archivo_respuesta (TEXT) - Para base64 de dibujos
- fecha_envio (DATE)
- evaluacion_psicologo (JSONB)
```

#### Controladores

**`tareas.controlador.ts`**:
- `crearTareaAvanzada()`: Crear tareas con nuevos tipos
- `guardarRespuesta()`: Guardar respuestas de pacientes
- `obtenerRespuestas()`: Obtener respuestas de una tarea
- `evaluarRespuesta()`: Evaluar respuestas de pacientes

#### Rutas API

```typescript
// Crear tarea avanzada
POST /api/v1/tareas/avanzada

// Guardar respuesta de paciente
POST /api/v1/tareas/:tarea_id/respuestas

// Obtener respuestas
GET /api/v1/tareas/:tarea_id/respuestas

// Evaluar respuesta
PUT /api/v1/tareas/respuestas/:respuesta_id/evaluar
```

### Frontend

#### Componentes Principales

**`FormularioTareaAvanzada.tsx`**:
- Formulario dinámico que se adapta según el tipo de tarea
- Validaciones específicas por tipo
- Configuración de opciones avanzadas

**`ResponderTarea.tsx`**:
- Interfaz para que los pacientes respondan tareas
- Renderizado dinámico según tipo de tarea
- Integración con herramienta de dibujo

**`HerramientaDibujo.tsx`**:
- Canvas HTML5 para dibujos
- Soporte para mouse y eventos táctiles
- Herramientas: lápiz, borrador, colores, deshacer/rehacer

**`RevisarRespuestas.tsx`**:
- Interfaz para psicólogos revisar respuestas
- Visualización de dibujos/imágenes
- Sistema de evaluación y retroalimentación

#### Servicios

**`tareas.service.ts`**:
- Métodos para crear tareas avanzadas
- Gestión de respuestas
- Evaluación de respuestas

#### Tipos TypeScript

**`types/tareas.ts`**:
- Interfaces completas para todos los tipos de tareas
- Tipos para respuestas y evaluaciones
- Configuraciones específicas por tipo

## 🚀 Flujo de Uso

### Para Psicólogos

1. **Crear Tarea**:
   - Acceder a "Gestión de Tareas"
   - Hacer clic en "Nueva Tarea Avanzada"
   - Seleccionar tipo de tarea
   - Completar formulario dinámico
   - Configurar opciones específicas
   - Guardar como borrador o publicar

2. **Revisar Respuestas**:
   - Ver lista de tareas
   - Hacer clic en "Ver Respuestas"
   - Revisar contenido de respuestas
   - Evaluar y dar retroalimentación

### Para Pacientes

1. **Ver Tareas**:
   - Acceder a "Mis Tareas"
   - Ver tareas asignadas con etiquetas de tipo
   - Leer instrucciones específicas

2. **Responder Tareas**:
   - Hacer clic en "Responder"
   - Completar formulario según tipo
   - Para dibujos: usar herramienta integrada
   - Enviar respuesta

## 🔧 Configuración y Personalización

### Configuración de Tipos de Tarea

Cada tipo de tarea tiene configuraciones específicas:

**Texto Abierto**:
```json
{
  "longitud_minima": 100,
  "longitud_maxima": 1000,
  "permitir_formato_rico": false
}
```

**Opción Múltiple**:
```json
{
  "seleccion_multiple": true,
  "opciones_minimas": 1,
  "opciones_maximas": 3,
  "mostrar_resultados": false
}
```

**Tarea de Dibujo**:
```json
{
  "herramientas_disponibles": ["lapiz", "borrador", "colores"],
  "tamanio_canvas": { "ancho": 800, "alto": 600 },
  "permitir_guardar_borrador": true,
  "tiempo_limite": null
}
```

### Herramienta de Dibujo

**Características**:
- Canvas HTML5 responsive
- Soporte para mouse y eventos táctiles
- Herramientas: lápiz, borrador, selector de color
- Historial de acciones (deshacer/rehacer)
- Guardado automático en base64

**Configuración**:
```typescript
interface ConfiguracionDibujo {
  tamanio_canvas: { ancho: number; alto: number };
  herramientas_disponibles: string[];
  colores_disponibles: string[];
  grosor_pincel: number;
}
```

## 📊 Almacenamiento de Datos

### Estructura JSONB

**`contenido_tarea`**:
```json
{
  "pregunta": "¿Cómo te sientes hoy?",
  "opciones": [
    { "id": 1, "texto": "Feliz" },
    { "id": 2, "texto": "Triste" }
  ],
  "imagenes": ["base64_image_1", "base64_image_2"]
}
```

**`configuracion_tarea`**:
```json
{
  "seleccion_multiple": true,
  "opciones_minimas": 1,
  "opciones_maximas": 3,
  "tiempo_limite": 3600,
  "permitir_guardar_borrador": true
}
```

**`evaluacion_psicologo`**:
```json
{
  "comentario": "Excelente reflexión",
  "fecha_evaluacion": "2024-08-13T16:00:00Z",
  "calificacion": "satisfactoria",
  "puntuacion": 8
}
```

## 🧪 Pruebas

### Script de Pruebas

Ejecutar el script de pruebas:
```bash
cd backend
node scripts/test-sistema-tareas.js
```

**Pruebas incluidas**:
- Login como psicólogo
- Creación de tareas avanzadas
- Verificación de tipos de tarea
- Prueba de respuestas
- Validación de API

### Casos de Prueba

1. **Crear tarea de texto abierto**
2. **Crear tarea de opción múltiple**
3. **Crear tarea de dibujo**
4. **Simular respuesta de paciente**
5. **Evaluar respuesta**

## 🔒 Seguridad y Validaciones

### Validaciones de Backend

- Verificación de permisos por rol
- Validación de tipos de tarea
- Verificación de propiedad de tareas
- Sanitización de contenido JSONB

### Validaciones de Frontend

- Validación de formularios en tiempo real
- Verificación de tipos de archivo
- Límites de tamaño para dibujos
- Validación de longitud de texto

## 📱 Responsive Design

### Características

- Diseño adaptativo para móviles y tablets
- Herramienta de dibujo compatible con pantallas táctiles
- Formularios optimizados para diferentes tamaños de pantalla
- Navegación intuitiva en dispositivos móviles

### Breakpoints

```css
/* Mobile */
@media (max-width: 768px) { ... }

/* Tablet */
@media (min-width: 769px) and (max-width: 1024px) { ... }

/* Desktop */
@media (min-width: 1025px) { ... }
```

## 🚀 Despliegue

### Requisitos

- Node.js 18+
- PostgreSQL 13+
- NPM o Yarn

### Pasos de Instalación

1. **Clonar repositorio**
2. **Instalar dependencias**:
   ```bash
   npm install
   cd frontend && npm install
   cd ../backend && npm install
   ```

3. **Configurar base de datos**:
   ```bash
   cd backend
   npm run db:migrate
   npm run db:seed
   ```

4. **Iniciar servicios**:
   ```bash
   # Backend
   cd backend && npm run dev
   
   # Frontend
   cd frontend && npm run dev
   ```

## 🔄 Migraciones

### Migración de Base de Datos

Las migraciones incluyen:
- Creación de tabla `respuestas_tareas`
- Nuevas columnas en tabla `tareas`
- Actualización de tipos ENUM
- Índices para optimización

### Ejecutar Migraciones

```bash
cd backend
npm run db:migrate
```

## 📈 Próximas Mejoras

### Funcionalidades Planificadas

1. **Tests Psicológicos Predefinidos**
   - Biblioteca de tests estándar
   - Puntuación automática
   - Análisis de tendencias

2. **Sistema de Notificaciones**
   - Notificaciones en tiempo real
   - Recordatorios de tareas
   - Alertas de respuestas

3. **Análisis Avanzado**
   - Dashboard de progreso
   - Gráficos de evolución
   - Reportes personalizados

4. **Integración con IA**
   - Análisis automático de respuestas
   - Sugerencias de tareas
   - Detección de patrones

## 🐛 Solución de Problemas

### Problemas Comunes

1. **Error 404 en rutas de tareas**
   - Verificar que las rutas estén registradas en `index.ts`
   - Comprobar middleware de autenticación

2. **Error en migraciones**
   - Ejecutar migraciones en orden
   - Verificar conexión a base de datos

3. **Problemas con herramienta de dibujo**
   - Verificar soporte de canvas en navegador
   - Comprobar eventos táctiles

### Logs y Debugging

```bash
# Backend logs
cd backend && npm run dev

# Frontend logs
cd frontend && npm run dev
```

## 📞 Soporte

Para soporte técnico o reportar bugs:
- Crear issue en el repositorio
- Documentar pasos para reproducir
- Incluir logs de error

---

**Versión**: 1.0.0  
**Última actualización**: Agosto 2024  
**Desarrollado por**: Equipo Psyche
