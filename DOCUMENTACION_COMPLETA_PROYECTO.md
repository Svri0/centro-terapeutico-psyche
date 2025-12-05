# 📚 DOCUMENTACIÓN COMPLETA - CENTRO TERAPÉUTICO PSYCHE

> **Documento de Referencia Completo para Defensa y Estudio del Proyecto**  
> **Versión:** 1.0  
> **Fecha:** Enero 2025  
> **Proyecto:** Sistema Integral de Gestión para Centro Terapéutico

---

## 📑 ÍNDICE

1. [Descripción General del Proyecto](#1-descripción-general-del-proyecto)
2. [Arquitectura y Stack Tecnológico](#2-arquitectura-y-stack-tecnológico)
3. [Roles y Permisos del Sistema](#3-roles-y-permisos-del-sistema)
4. [Funcionalidades por Módulo](#4-funcionalidades-por-módulo)
5. [Estructura de Base de Datos](#5-estructura-de-base-de-datos)
6. [APIs y Endpoints](#6-apis-y-endpoints)
7. [Flujos Principales del Sistema](#7-flujos-principales-del-sistema)
8. [Configuración e Instalación](#8-configuración-e-instalación)
9. [Credenciales de Prueba](#9-credenciales-de-prueba)
10. [Características Técnicas Avanzadas](#10-características-técnicas-avanzadas)
11. [Seguridad y Autenticación](#11-seguridad-y-autenticación)
12. [Sistemas Especializados](#12-sistemas-especializados)

---

## 1. DESCRIPCIÓN GENERAL DEL PROYECTO

### 1.1 Propósito
**Centro Terapéutico Psyche** es un sistema integral de gestión diseñado para centros de salud mental que permite la administración completa de pacientes, psicólogos, sesiones terapéuticas, citas, tareas, reportes y comunicación en tiempo real.

### 1.2 Objetivos del Sistema
- ✅ Gestión completa de usuarios (Administradores, Psicólogos, Recepcionistas, Pacientes)
- ✅ Sistema de citas y agendamiento
- ✅ Registro y seguimiento de sesiones terapéuticas
- ✅ Sistema de tareas avanzadas con gamificación
- ✅ Reportes de progreso y adherencia terapéutica
- ✅ Comunicación en tiempo real (Chat WebSocket)
- ✅ Gestión de disponibilidad y servicios
- ✅ Sistema de pagos y facturación
- ✅ Auditoría completa de acciones
- ✅ Dashboard con estadísticas y métricas

### 1.3 Tipo de Proyecto
- **Tipo:** Aplicación Web Full-Stack
- **Arquitectura:** Monorepo con Workspaces
- **Patrón:** RESTful API + WebSocket para tiempo real
- **Base de Datos:** PostgreSQL (Tercera Forma Normal)
- **Estado:** Producción/Desarrollo Activo

---

## 2. ARQUITECTURA Y STACK TECNOLÓGICO

### 2.1 Stack Tecnológico Completo

#### **Backend**
- **Runtime:** Node.js 18+
- **Framework:** Express.js 4.18
- **Lenguaje:** TypeScript 5.3
- **ORM:** Sequelize 6.35
- **Base de Datos:** PostgreSQL 12+
- **Autenticación:** JWT (jsonwebtoken)
- **WebSocket:** Socket.IO 4.8
- **Validación:** Joi 17.11
- **Email:** Nodemailer 6.9
- **Archivos:** Multer 1.4
- **PDF:** PDFKit 0.17 + Puppeteer 24.26
- **Seguridad:** Helmet 7.1, CORS 2.8
- **Logging:** Morgan 1.10

#### **Frontend**
- **Framework:** React 18.2
- **Lenguaje:** TypeScript 5.3
- **Build Tool:** Vite 5.0
- **Routing:** React Router DOM 6.20
- **Estilos:** Tailwind CSS 3.3
- **HTTP Client:** Axios 1.6
- **Estado:** Zustand 4.4
- **Formularios:** React Hook Form 7.48
- **Gráficos:** Recharts 3.5
- **Notificaciones:** React Hot Toast 2.4
- **Fechas:** Date-fns 2.30, React DatePicker 4.25
- **PDF:** jsPDF 3.0
- **Animaciones:** Framer Motion 10.16
- **UI Components:** Headless UI 1.7, Heroicons 2.0
- **WebSocket Client:** Socket.IO Client 4.8

#### **Infraestructura**
- **Monorepo:** NPM Workspaces
- **Contenedores:** Docker + Docker Compose
- **Control de Versiones:** Git
- **CI/CD:** Husky (pre-commit, pre-push hooks)
- **Linting:** ESLint + Prettier

### 2.2 Arquitectura del Sistema

```
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND (React)                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐            │
│  │  Admin   │  │Psicólogo │  │ Paciente │            │
│  │  Panel   │  │  Panel   │  │  Panel   │            │
│  └──────────┘  └──────────┘  └──────────┘            │
│       │              │              │                  │
│       └──────────────┼──────────────┘                  │
│                      │                                 │
│              ┌───────▼────────┐                       │
│              │  React Router  │                       │
│              │  + Services   │                       │
│              └───────┬────────┘                       │
└──────────────────────┼─────────────────────────────────┘
                       │
         ┌─────────────┼─────────────┐
         │             │             │
    ┌────▼────┐   ┌───▼────┐   ┌───▼────┐
    │  REST   │   │ WebSocket│   │  Files │
    │   API   │   │  Socket  │   │ Upload │
    └────┬────┘   └───┬────┘   └───┬────┘
         │            │             │
┌─────────▼───────────▼─────────────▼─────────────┐
│            BACKEND (Express + TypeScript)        │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐     │
│  │Controlad │  │Middleware │  │ Servicios│     │
│  │   ores   │  │  (Auth)   │  │ (Email,  │     │
│  │          │  │           │  │  PDF)    │     │
│  └────┬─────┘  └─────┬─────┘  └─────┬────┘     │
│       │              │              │          │
│       └──────────────┼──────────────┘          │
│                      │                          │
│              ┌───────▼────────┐                 │
│              │   Sequelize    │                 │
│              │      ORM       │                 │
│              └───────┬────────┘                 │
└──────────────────────┼──────────────────────────┘
                       │
              ┌────────▼────────┐
              │   PostgreSQL    │
              │   Database      │
              └─────────────────┘
```

### 2.3 Estructura del Monorepo

```
centro-terapeutico-psyche/
├── backend/              # Backend API (Node.js + Express + TypeScript)
│   ├── src/
│   │   ├── configuracion/    # Configuración de BD
│   │   ├── controladores/    # Lógica de negocio
│   │   ├── middleware/       # Auth, validación, upload
│   │   ├── modelos/         # Modelos Sequelize
│   │   ├── rutas/           # Definición de rutas
│   │   ├── servicios/       # Servicios (email, PDF, chat)
│   │   ├── utilidades/      # Helpers y utilidades
│   │   └── servidor.ts      # Punto de entrada
│   ├── migrations/          # Migraciones de BD
│   ├── seeders/            # Datos iniciales
│   └── scripts/            # Scripts de utilidad
│
├── frontend/              # Frontend (React + TypeScript + Vite)
│   ├── src/
│   │   ├── componentes/    # Componentes React
│   │   ├── paginas/        # Páginas principales
│   │   ├── servicios/      # Servicios API
│   │   ├── utilidades/     # Helpers
│   │   ├── hooks/         # Custom hooks
│   │   └── types/         # Tipos TypeScript
│   └── public/            # Assets estáticos
│
├── shared/               # Código compartido
│   └── src/
│       └── types/       # Tipos compartidos
│
├── ml-service/          # Servicio ML (futuro)
│
└── scripts/            # Scripts globales
    └── limpiar-y-poblar.js  # Script de población de BD
```

---

## 3. ROLES Y PERMISOS DEL SISTEMA

### 3.1 Roles Disponibles

El sistema tiene **4 roles principales**:

#### **1. Administrador (ID: 1)**
- **Descripción:** Control total del sistema
- **Permisos:**
  - ✅ Gestión completa de usuarios (crear, editar, eliminar, desactivar)
  - ✅ Gestión de psicólogos, recepcionistas y pacientes
  - ✅ Acceso a dashboard con estadísticas generales
  - ✅ Sistema de auditoría completo
  - ✅ Configuración del sistema
  - ✅ Gestión de reportes y exportaciones
  - ✅ Chat con trabajadores (psicólogos + recepcionistas)

#### **2. Psicólogo (ID: 2)**
- **Descripción:** Profesional que atiende pacientes
- **Permisos:**
  - ✅ Gestión de pacientes asignados
  - ✅ Crear y gestionar sesiones terapéuticas
  - ✅ Asignar y revisar tareas a pacientes
  - ✅ Crear reportes de progreso
  - ✅ Gestionar disponibilidad semanal y mensual
  - ✅ Configurar servicios ofrecidos
  - ✅ Dashboard personalizado con estadísticas
  - ✅ Chat con pacientes asignados y personal
  - ✅ Gestión de citas
  - ✅ Ficha clínica de pacientes

#### **3. Recepcionista (ID: 3)**
- **Descripción:** Personal de recepción y administración
- **Permisos:**
  - ✅ Gestión de pacientes (crear, editar, ver)
  - ✅ Gestión de citas (crear, modificar, cancelar)
  - ✅ Gestión de pagos
  - ✅ Visualización de disponibilidad de psicólogos
  - ✅ Reportes de recepción
  - ✅ Chat con personal y admin

#### **4. Paciente (ID: 4)**
- **Descripción:** Usuario que recibe terapia
- **Permisos:**
  - ✅ Ver su perfil y ficha clínica
  - ✅ Ver sus citas programadas
  - ✅ Ver y completar tareas asignadas
  - ✅ Ver reportes de progreso
  - ✅ Chat con su psicólogo asignado
  - ✅ Agendar citas (según disponibilidad)
  - ✅ Ver feed de contenido

### 3.2 Sistema de Permisos

Los permisos se almacenan en formato JSON en la tabla `roles`:

```json
{
  "usuarios": ["crear", "leer", "actualizar", "eliminar"],
  "pacientes": ["crear", "leer", "actualizar", "eliminar"],
  "sesiones": ["crear", "leer", "actualizar", "eliminar"],
  "tareas": ["crear", "leer", "actualizar", "eliminar"],
  "reportes": ["crear", "leer", "actualizar", "eliminar"],
  "configuracion": ["leer", "actualizar"],
  "auditoria": ["leer"],
  "dashboard": ["leer"]
}
```

---

## 4. FUNCIONALIDADES POR MÓDULO

### 4.1 Módulo de Autenticación

#### **Funcionalidades:**
- ✅ Login con email y contraseña
- ✅ Registro de nuevos usuarios (según rol)
- ✅ Recuperación de contraseña
- ✅ Verificación de email
- ✅ JWT tokens con expiración
- ✅ Refresh tokens
- ✅ Timeout de sesión automático
- ✅ Middleware de autenticación en todas las rutas protegidas

#### **Endpoints:**
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/registro` - Registrar usuario
- `POST /api/auth/recuperar-password` - Solicitar recuperación
- `POST /api/auth/reset-password` - Restablecer contraseña
- `POST /api/auth/verificar-email` - Verificar email
- `GET /api/auth/perfil` - Obtener perfil del usuario autenticado
- `PUT /api/auth/perfil` - Actualizar perfil
- `PUT /api/auth/cambiar-password` - Cambiar contraseña

### 4.2 Módulo de Administración

#### **Funcionalidades:**
- ✅ Dashboard con estadísticas generales
  - Total de usuarios por rol
  - Sesiones del mes
  - Citas programadas
  - Ingresos del mes
  - Gráficos de tendencias
- ✅ Gestión de Psicólogos
  - Crear, editar, eliminar, desactivar
  - Subir avatar
  - Ver detalles completos
  - Asignar pacientes
- ✅ Gestión de Recepcionistas
  - CRUD completo
  - Gestión de permisos
- ✅ Gestión de Pacientes
  - CRUD completo
  - Asignación de psicólogo
  - Ver historial completo
- ✅ Sistema de Auditoría
  - Logs de todas las acciones
  - Filtros por usuario, acción, fecha
  - Exportación de logs
- ✅ Estadísticas Generales
  - Reportes consolidados
  - Exportación a PDF/Excel

### 4.3 Módulo del Psicólogo

#### **Dashboard Personalizado:**
- ✅ Estadísticas de sesiones
  - Sesiones completadas este mes
  - Tasa de asistencia
  - Sesiones canceladas
  - Próximas sesiones
- ✅ Estadísticas de pacientes
  - Total de pacientes activos
  - Pacientes nuevos este mes
  - Pacientes con tareas pendientes
- ✅ Gráficos de progreso
  - Evolución mensual
  - Comparativa de pacientes
  - Adherencia terapéutica

#### **Gestión de Pacientes:**
- ✅ Ver lista de pacientes asignados
- ✅ Ver perfil completo del paciente
- ✅ Ficha clínica
- ✅ Historial de sesiones
- ✅ Asignar tareas
- ✅ Ver respuestas de tareas

#### **Sesiones Terapéuticas:**
- ✅ Crear nueva sesión
- ✅ Registrar notas de evolución
- ✅ Marcar objetivos cumplidos
- ✅ Registrar técnicas utilizadas
- ✅ Finalizar sesión
- ✅ Ver historial de sesiones
- ✅ Filtrar por paciente, fecha, estado

#### **Sistema de Tareas:**
- ✅ Crear tareas avanzadas:
  - Texto abierto
  - Opción múltiple
  - Test psicológico
  - Test con imágenes
  - Tarea de dibujo
  - Tipos tradicionales (ejercicio, lectura, reflexión, práctica, evaluación)
- ✅ Asignar tareas a pacientes
- ✅ Revisar respuestas
- ✅ Calificar tareas
- ✅ Ver estadísticas de cumplimiento

#### **Reportes de Progreso:**
- ✅ Crear reportes de progreso por paciente
- ✅ Definir períodos de evaluación
- ✅ Registrar objetivos cumplidos/pendientes
- ✅ Áreas trabajadas
- ✅ Conductas observadas
- ✅ Logros importantes
- ✅ Desafíos identificados
- ✅ Sugerencias terapéuticas
- ✅ Exportar reportes a PDF

#### **Reporte de Adherencia Terapeutica:**
- ✅ Análisis de asistencia a sesiones
- ✅ Cumplimiento de tareas
- ✅ Participación en actividades
- ✅ Gráficos de adherencia
- ✅ Comparativa entre pacientes
- ✅ Identificación de pacientes en riesgo

#### **Disponibilidad:**
- ✅ Configurar disponibilidad semanal
  - Días de la semana
  - Horarios por día
  - Validación de 40 horas máximo
- ✅ Configurar disponibilidad mensual
  - Calendario mensual
  - Días específicos disponibles
  - Feriados y vacaciones
- ✅ Ver disponibilidad de otros psicólogos

#### **Servicios:**
- ✅ Configurar servicios ofrecidos
- ✅ Tipos predefinidos:
  - Consulta Individual
  - Terapia de Parejas
  - Terapia Familiar
  - Terapia Grupal
  - Evaluación Psicológica
  - Intervención en Crisis
- ✅ Definir duración y precio
- ✅ Activar/desactivar servicios

#### **Agenda:**
- ✅ Vista de calendario mensual
- ✅ Vista de lista de citas
- ✅ Ver detalles de citas
- ✅ Reagendar citas
- ✅ Cancelar citas
- ✅ Generar agenda en PDF

#### **Chat:**
- ✅ Chat en tiempo real con pacientes
- ✅ Chat con personal (psicólogos, recepcionistas)
- ✅ Contador de mensajes no leídos
- ✅ Historial de conversaciones
- ✅ Notificaciones de nuevos mensajes

### 4.4 Módulo del Recepcionista

#### **Funcionalidades:**
- ✅ Dashboard de recepción
  - Citas del día
  - Pagos pendientes
  - Pacientes nuevos
- ✅ Gestión de Pacientes
  - Crear nuevos pacientes
  - Editar información
  - Ver historial
  - Asignar psicólogo
- ✅ Gestión de Citas
  - Crear citas
  - Modificar citas
  - Cancelar citas
  - Reagendar citas
  - Ver disponibilidad de psicólogos
- ✅ Gestión de Pagos
  - Registrar pagos
  - Ver historial de pagos
  - Generar recibos
  - Reportes de ingresos
- ✅ Reportes
  - Citas por período
  - Ingresos por período
  - Pacientes nuevos

### 4.5 Módulo del Paciente

#### **Funcionalidades:**
- ✅ Dashboard personal
  - Próximas citas
  - Tareas pendientes
  - Progreso del tratamiento
- ✅ Perfil
  - Ver información personal
  - Actualizar datos
  - Cambiar contraseña
- ✅ Mis Citas
  - Ver citas programadas
  - Ver historial de citas
  - Agendar nueva cita
  - Cancelar citas
  - Ver disponibilidad del psicólogo
- ✅ Mis Tareas
  - Ver tareas asignadas
  - Completar tareas
  - Ver retroalimentación
  - Historial de tareas
- ✅ Reportes de Progreso
  - Ver reportes generados por psicólogo
  - Descargar reportes
- ✅ Chat
  - Chat con psicólogo asignado
  - Notificaciones de mensajes
- ✅ Feed
  - Contenido educativo
  - Artículos
  - Recursos

### 4.6 Módulo de Citas

#### **Funcionalidades:**
- ✅ Crear citas
  - Seleccionar psicólogo
  - Seleccionar fecha y hora
  - Validar disponibilidad
  - Seleccionar tipo de servicio
- ✅ Gestionar citas
  - Modificar fecha/hora
  - Cancelar citas
  - Confirmar asistencia
- ✅ Estados de citas:
  - `programada` - Cita creada, pendiente de confirmación
  - `confirmada` - Paciente confirmó asistencia
  - `en_progreso` - Sesión en curso
  - `completada` - Sesión finalizada
  - `cancelada` - Cita cancelada
  - `no_show` - Paciente no asistió
- ✅ Notificaciones por email
  - Confirmación de cita
  - Recordatorio 24h antes
  - Recordatorio 1h antes
  - Cancelación

### 4.7 Módulo de Sesiones Terapéuticas

#### **Funcionalidades:**
- ✅ Crear sesión desde cita
- ✅ Registrar información de sesión:
  - Fecha y hora
  - Duración
  - Tipo de sesión (presencial, virtual, telefónica)
  - Objetivos de la sesión
  - Técnicas utilizadas
  - Notas de evolución
  - Estado (completada, cancelada, no_asistio)
- ✅ Finalizar sesión
- ✅ Asignar tareas desde sesión
- ✅ Ver historial de sesiones
- ✅ Filtrar y buscar sesiones

### 4.8 Módulo de Tareas Avanzadas

#### **Tipos de Tareas:**

1. **Texto Abierto**
   - Campo de texto libre
   - Validación de longitud mínima/máxima

2. **Opción Múltiple**
   - Preguntas con opciones predefinidas
   - Selección única o múltiple
   - Validación de opciones mínimas/máximas

3. **Test Psicológico**
   - Preguntas estructuradas
   - Puntuación automática
   - Análisis de respuestas

4. **Test con Imágenes**
   - Imágenes asociadas a preguntas
   - Múltiples imágenes por test
   - Análisis visual

5. **Tarea de Dibujo**
   - Herramienta de dibujo integrada
   - Soporte táctil
   - Guardado de dibujos

6. **Tipos Tradicionales**
   - Ejercicio
   - Lectura
   - Reflexión
   - Práctica
   - Evaluación

#### **Funcionalidades:**
- ✅ Crear tareas con formularios dinámicos
- ✅ Asignar a pacientes específicos
- ✅ Fecha límite
- ✅ Prioridad
- ✅ Revisar respuestas
- ✅ Calificar y dar retroalimentación
- ✅ Estadísticas de cumplimiento

### 4.9 Módulo de Reportes

#### **Reportes de Progreso:**
- ✅ Crear reportes por período
- ✅ Registrar:
  - Resumen de evolución
  - Objetivos cumplidos/pendientes
  - Áreas trabajadas
  - Conductas observadas
  - Logros importantes
  - Desafíos identificados
  - Sugerencias terapéuticas
  - Progreso general (excelente, muy bueno, bueno, regular, necesita atención)
- ✅ Exportar a PDF
- ✅ Historial de reportes

#### **Reporte de Adherencia Terapeutica:**
- ✅ Análisis de asistencia
- ✅ Cumplimiento de tareas
- ✅ Participación
- ✅ Gráficos comparativos
- ✅ Identificación de riesgo

### 4.10 Módulo de Chat (Tiempo Real)

#### **Funcionalidades:**
- ✅ Chat en tiempo real con WebSocket
- ✅ Mensajes persistentes en BD
- ✅ Contador de mensajes no leídos
- ✅ Notificaciones en tiempo real
- ✅ Reconexión automática
- ✅ Historial de conversaciones
- ✅ Autenticación WebSocket con JWT

#### **Permisos de Chat:**
- **Psicólogo:** Chatea con pacientes asignados + personal
- **Paciente:** Chatea solo con su psicólogo asignado
- **Admin:** Chatea con trabajadores (psicólogos + recepcionistas)
- **Recepcionista:** Chatea con personal + admin

### 4.11 Módulo de Pagos

#### **Funcionalidades:**
- ✅ Registrar pagos de citas
- ✅ Métodos de pago:
  - Efectivo
  - Transferencia
  - Tarjeta
  - Cheque
- ✅ Generar recibos
- ✅ Historial de pagos
- ✅ Reportes de ingresos
- ✅ Pagos pendientes

---

## 5. ESTRUCTURA DE BASE DE DATOS

### 5.1 Tablas Principales

#### **ROLES**
```sql
- id (INT, PK)
- nombre (VARCHAR, UNIQUE) - 'administrador', 'psicologo', 'recepcionista', 'paciente'
- descripcion (TEXT)
- permisos (JSONB) - Permisos en formato JSON
- activo (BOOLEAN)
- created_at, updated_at, deleted_at (TIMESTAMP)
```

#### **USUARIOS**
```sql
- id (UUID, PK)
- email (VARCHAR, UNIQUE)
- password_hash (VARCHAR)
- nombres (VARCHAR)
- apellidos (VARCHAR)
- telefono (VARCHAR)
- fecha_nacimiento (DATE)
- genero (ENUM: 'masculino', 'femenino', 'otro')
- avatar_url (VARCHAR)
- especialidad (VARCHAR) - Para psicólogos
- descripcion (TEXT) - Para psicólogos
- codigo_sbs (VARCHAR) - Código colegiado para psicólogos
- rol_id (INT, FK → ROLES)
- activo (BOOLEAN)
- email_verificado (BOOLEAN)
- token_activacion (VARCHAR)
- token_activacion_expira (TIMESTAMP)
- ultimo_acceso (TIMESTAMP)
- configuracion (JSONB)
- created_at, updated_at, deleted_at (TIMESTAMP)
```

#### **PACIENTES**
```sql
- id (UUID, PK)
- usuario_id (UUID, FK → USUARIOS)
- psicologo_id (UUID, FK → USUARIOS)
- numero_ficha (VARCHAR, UNIQUE)
- rut (VARCHAR, UNIQUE)
- fecha_ingreso (DATE)
- estado (ENUM: 'activo', 'inactivo', 'alta')
- observaciones (TEXT)
- created_at, updated_at, deleted_at (TIMESTAMP)
```

#### **CITAS**
```sql
- id (UUID, PK)
- paciente_id (UUID, FK → PACIENTES)
- psicologo_id (UUID, FK → USUARIOS)
- fecha (DATE)
- hora_inicio (TIME)
- hora_fin (TIME)
- duracion_minutos (INT)
- tipo_servicio (VARCHAR)
- estado (ENUM: 'programada', 'confirmada', 'en_progreso', 'completada', 'cancelada', 'no_show')
- notas_paciente (TEXT)
- notas_psicologo (TEXT)
- motivo_cancelacion (TEXT)
- created_at, updated_at, deleted_at (TIMESTAMP)
```

#### **SESIONES**
```sql
- id (UUID, PK)
- paciente_id (UUID, FK → PACIENTES)
- psicologo_id (UUID, FK → USUARIOS)
- cita_id (UUID, FK → CITAS, NULLABLE)
- fecha (DATE)
- hora_inicio (TIME)
- hora_fin (TIME)
- duracion_minutos (INT)
- tipo_sesion (ENUM: 'presencial', 'virtual', 'telefonica')
- estado (ENUM: 'programada', 'completada', 'cancelada', 'no_asistio')
- objetivos_sesion (JSONB) - Array de objetivos
- tecnicas_utilizadas (JSONB) - Array de técnicas
- notas_evolucion (TEXT)
- created_at, updated_at, deleted_at (TIMESTAMP)
```

#### **TAREAS**
```sql
- id (UUID, PK)
- paciente_id (UUID, FK → PACIENTES)
- psicologo_id (UUID, FK → USUARIOS)
- sesion_id (UUID, FK → SESIONES, NULLABLE)
- titulo (VARCHAR)
- descripcion (TEXT)
- instrucciones (TEXT)
- tipo_tarea (ENUM: 'texto_abierto', 'opcion_multiple', 'test_psicologico', 'test_imagenes', 'dibujo', 'ejercicio', 'lectura', 'reflexion', 'practica', 'evaluacion')
- configuracion (JSONB) - Configuración específica del tipo
- fecha_asignacion (DATE)
- fecha_limite (DATE)
- prioridad (ENUM: 'baja', 'media', 'alta')
- estado (ENUM: 'pendiente', 'en_progreso', 'completada', 'vencida', 'cancelada')
- created_at, updated_at, deleted_at (TIMESTAMP)
```

#### **RESPUESTAS_TAREAS**
```sql
- id (UUID, PK)
- tarea_id (UUID, FK → TAREAS)
- paciente_id (UUID, FK → PACIENTES)
- respuesta (JSONB) - Respuesta según tipo de tarea
- calificacion (INT) - 0-100
- retroalimentacion (TEXT)
- fecha_respuesta (TIMESTAMP)
- created_at, updated_at
```

#### **REPORTES_PROGRESO**
```sql
- id (UUID, PK)
- paciente_id (UUID, FK → PACIENTES)
- psicologo_id (UUID, FK → USUARIOS)
- sesion_id (UUID, FK → SESIONES, NULLABLE)
- fecha_reporte (DATE)
- periodo_inicio (DATE)
- periodo_fin (DATE)
- resumen_evolucion (TEXT)
- objetivos_cumplidos (JSONB)
- objetivos_pendientes (JSONB)
- areas_trabajadas (JSONB)
- conductas_observadas (JSONB)
- logros_importantes (JSONB)
- desafios_identificados (JSONB)
- sugerencias_terapeuticas (TEXT)
- progreso_general (ENUM: 'excelente', 'muy_bueno', 'bueno', 'regular', 'necesita_atencion')
- metrica_satisfaccion (INT)
- observaciones_adicionales (TEXT)
- documento_adjunto (VARCHAR)
- estado (ENUM: 'borrador', 'completado', 'archivado')
- created_at, updated_at, deleted_at (TIMESTAMP)
```

#### **CHAT**
```sql
- id (UUID, PK)
- remitente_id (UUID, FK → USUARIOS)
- destinatario_id (UUID, FK → USUARIOS)
- mensaje (TEXT)
- leido (BOOLEAN)
- fecha_leido (TIMESTAMP)
- created_at, updated_at
```

#### **PAGOS**
```sql
- id (UUID, PK)
- cita_id (UUID, FK → CITAS)
- paciente_id (UUID, FK → PACIENTES)
- psicologo_id (UUID, FK → USUARIOS)
- monto (DECIMAL)
- metodo_pago (ENUM: 'efectivo', 'transferencia', 'tarjeta', 'cheque')
- estado (ENUM: 'pendiente', 'completado', 'cancelado')
- numero_recibo (VARCHAR)
- fecha_pago (DATE)
- notas (TEXT)
- created_at, updated_at, deleted_at (TIMESTAMP)
```

#### **DISPONIBILIDAD_PSICOLOGOS**
```sql
- id (UUID, PK)
- psicologo_id (UUID, FK → USUARIOS)
- dia_semana (INT) - 1=Lunes, 7=Domingo
- hora_inicio (TIME)
- hora_fin (TIME)
- activo (BOOLEAN)
- created_at, updated_at
```

#### **DISPONIBILIDAD_MENSUAL**
```sql
- id (UUID, PK)
- psicologo_id (UUID, FK → USUARIOS)
- fecha (DATE)
- hora_inicio (TIME)
- hora_fin (TIME)
- disponible (BOOLEAN)
- created_at, updated_at
```

#### **SERVICIOS_PSICOLOGO**
```sql
- id (UUID, PK)
- psicologo_id (UUID, FK → USUARIOS)
- tipo_servicio (VARCHAR)
- duracion_minutos (INT)
- precio (DECIMAL)
- descripcion (TEXT)
- activo (BOOLEAN)
- created_at, updated_at, deleted_at (TIMESTAMP)
```

#### **LOGS_AUDITORIA**
```sql
- id (UUID, PK)
- usuario_id (UUID, FK → USUARIOS)
- accion (VARCHAR)
- entidad (VARCHAR)
- entidad_id (UUID)
- metadatos (JSONB)
- ip_address (VARCHAR)
- user_agent (VARCHAR)
- created_at (TIMESTAMP)
```

### 5.2 Relaciones Principales

```
ROLES (1) ──< (N) USUARIOS
USUARIOS (1) ──< (1) PACIENTES
USUARIOS (1) ──< (N) PACIENTES (psicologo_id)
PACIENTES (1) ──< (N) CITAS
USUARIOS (1) ──< (N) CITAS (psicologo_id)
CITAS (1) ──< (0..1) SESIONES
PACIENTES (1) ──< (N) SESIONES
USUARIOS (1) ──< (N) SESIONES (psicologo_id)
SESIONES (1) ──< (0..N) TAREAS
PACIENTES (1) ──< (N) TAREAS
USUARIOS (1) ──< (N) TAREAS (psicologo_id)
TAREAS (1) ──< (0..N) RESPUESTAS_TAREAS
PACIENTES (1) ──< (N) RESPUESTAS_TAREAS
PACIENTES (1) ──< (N) REPORTES_PROGRESO
USUARIOS (1) ──< (N) REPORTES_PROGRESO (psicologo_id)
USUARIOS (1) ──< (N) CHAT (remitente_id)
USUARIOS (1) ──< (N) CHAT (destinatario_id)
CITAS (1) ──< (0..N) PAGOS
USUARIOS (1) ──< (N) DISPONIBILIDAD_PSICOLOGOS
USUARIOS (1) ──< (N) DISPONIBILIDAD_MENSUAL
USUARIOS (1) ──< (N) SERVICIOS_PSICOLOGO
USUARIOS (1) ──< (N) LOGS_AUDITORIA
```

### 5.3 Índices y Optimizaciones

- ✅ Índices en claves foráneas
- ✅ Índices en campos de búsqueda frecuente (email, rut, numero_ficha)
- ✅ Índices en fechas para consultas temporales
- ✅ Constraints de integridad referencial
- ✅ Soft deletes para datos importantes
- ✅ Campos JSONB para datos flexibles

---

## 6. APIs Y ENDPOINTS

### 6.1 Autenticación (`/api/auth`)

```
POST   /api/auth/login                    # Iniciar sesión
POST   /api/auth/registro                 # Registrar usuario
POST   /api/auth/recuperar-password        # Solicitar recuperación
POST   /api/auth/reset-password           # Restablecer contraseña
POST   /api/auth/verificar-email          # Verificar email
GET    /api/auth/perfil                   # Obtener perfil
PUT    /api/auth/perfil                   # Actualizar perfil
PUT    /api/auth/cambiar-password         # Cambiar contraseña
```

### 6.2 Administración (`/api/admin`)

```
# Psicólogos
GET    /api/admin/psicologos              # Listar psicólogos
GET    /api/admin/psicologos/:id          # Obtener psicólogo
POST   /api/admin/psicologos              # Crear psicólogo
PUT    /api/admin/psicologos/:id          # Actualizar psicólogo
DELETE /api/admin/psicologos/:id          # Eliminar psicólogo
PUT    /api/admin/psicologos/:id/activar  # Activar/desactivar

# Recepcionistas
GET    /api/admin/recepcionistas          # Listar recepcionistas
POST   /api/admin/recepcionistas          # Crear recepcionista
PUT    /api/admin/recepcionistas/:id      # Actualizar recepcionista
DELETE /api/admin/recepcionistas/:id      # Eliminar recepcionista

# Pacientes
GET    /api/admin/pacientes               # Listar pacientes
GET    /api/admin/pacientes/:id           # Obtener paciente
POST   /api/admin/pacientes               # Crear paciente
PUT    /api/admin/pacientes/:id          # Actualizar paciente
DELETE /api/admin/pacientes/:id          # Eliminar paciente

# Dashboard
GET    /api/admin/dashboard               # Estadísticas generales
GET    /api/admin/estadisticas            # Estadísticas detalladas

# Auditoría
GET    /api/admin/auditoria               # Listar logs
GET    /api/admin/auditoria/:id           # Obtener log específico
```

### 6.3 Psicólogo (`/api/psicologo`)

```
# Dashboard
GET    /api/psicologo/dashboard          # Dashboard personalizado
GET    /api/psicologo/estadisticas       # Estadísticas del psicólogo

# Pacientes
GET    /api/psicologo/pacientes          # Listar pacientes asignados
GET    /api/psicologo/pacientes/:id      # Obtener paciente

# Sesiones
GET    /api/psicologo/sesiones          # Listar sesiones
GET    /api/psicologo/sesiones/:id      # Obtener sesión
POST   /api/psicologo/sesiones          # Crear sesión
PUT    /api/psicologo/sesiones/:id      # Actualizar sesión
POST   /api/psicologo/sesiones/:id/finalizar  # Finalizar sesión

# Tareas
GET    /api/psicologo/tareas             # Listar tareas
GET    /api/psicologo/tareas/:id         # Obtener tarea
POST   /api/psicologo/tareas             # Crear tarea
PUT    /api/psicologo/tareas/:id         # Actualizar tarea
DELETE /api/psicologo/tareas/:id        # Eliminar tarea
GET    /api/psicologo/tareas/:id/respuestas  # Ver respuestas

# Reportes
GET    /api/psicologo/reportes           # Listar reportes
GET    /api/psicologo/reportes/:id      # Obtener reporte
POST   /api/psicologo/reportes          # Crear reporte
PUT    /api/psicologo/reportes/:id      # Actualizar reporte
GET    /api/psicologo/reportes/adherencia  # Reporte de adherencia

# Disponibilidad
GET    /api/psicologo/disponibilidad     # Obtener disponibilidad
POST   /api/psicologo/disponibilidad    # Crear disponibilidad
PUT    /api/psicologo/disponibilidad/:id # Actualizar disponibilidad
GET    /api/psicologo/disponibilidad/mensual  # Disponibilidad mensual

# Servicios
GET    /api/psicologo/servicios         # Listar servicios
POST   /api/psicologo/servicios         # Crear servicio
PUT    /api/psicologo/servicios/:id    # Actualizar servicio
DELETE /api/psicologo/servicios/:id    # Eliminar servicio
```

### 6.4 Recepcionista (`/api/recepcionista`)

```
# Pacientes
GET    /api/recepcionista/pacientes     # Listar pacientes
GET    /api/recepcionista/pacientes/:id # Obtener paciente
POST   /api/recepcionista/pacientes    # Crear paciente
PUT    /api/recepcionista/pacientes/:id # Actualizar paciente

# Citas
GET    /api/recepcionista/citas         # Listar citas
GET    /api/recepcionista/citas/:id     # Obtener cita
POST   /api/recepcionista/citas        # Crear cita
PUT    /api/recepcionista/citas/:id    # Actualizar cita
DELETE /api/recepcionista/citas/:id    # Cancelar cita

# Pagos
GET    /api/recepcionista/pagos        # Listar pagos
POST   /api/recepcionista/pagos        # Registrar pago
GET    /api/recepcionista/pagos/:id    # Obtener pago

# Psicólogos
GET    /api/recepcionista/psicologos   # Listar psicólogos disponibles
```

### 6.5 Citas (`/api/citas`)

```
GET    /api/citas                       # Listar citas (según rol)
GET    /api/citas/:id                   # Obtener cita
POST   /api/citas                       # Crear cita
PUT    /api/citas/:id                   # Actualizar cita
DELETE /api/citas/:id                  # Cancelar cita
PUT    /api/citas/:id/confirmar         # Confirmar cita
PUT    /api/citas/:id/reagendar         # Reagendar cita
```

### 6.6 Sesiones (`/api/sesiones`)

```
GET    /api/sesiones                    # Listar sesiones
GET    /api/sesiones/:id                # Obtener sesión
POST   /api/sesiones                    # Crear sesión
PUT    /api/sesiones/:id                # Actualizar sesión
POST   /api/sesiones/:id/finalizar      # Finalizar sesión
```

### 6.7 Tareas (`/api/tareas`)

```
GET    /api/tareas                      # Listar tareas
GET    /api/tareas/:id                  # Obtener tarea
POST   /api/tareas                      # Crear tarea
PUT    /api/tareas/:id                  # Actualizar tarea
DELETE /api/tareas/:id                 # Eliminar tarea
GET    /api/tareas/:id/respuestas       # Ver respuestas
POST   /api/tareas/:id/respuestas       # Revisar respuesta
```

### 6.8 Reportes (`/api/reportes`)

```
GET    /api/reportes                    # Listar reportes
GET    /api/reportes/:id                # Obtener reporte
POST   /api/reportes                    # Crear reporte
PUT    /api/reportes/:id                # Actualizar reporte
DELETE /api/reportes/:id               # Eliminar reporte
GET    /api/reportes/adherencia         # Reporte de adherencia
GET    /api/reportes/:id/exportar       # Exportar reporte
```

### 6.9 Chat (`/api/chat`)

```
GET    /api/chat/contactos              # Obtener contactos
GET    /api/chat/mensajes/:contactoId   # Obtener mensajes
POST   /api/chat/mensajes               # Enviar mensaje
PUT    /api/chat/mensajes/:id/leer      # Marcar como leído
GET    /api/chat/no-leidos              # Contador de no leídos
```

**WebSocket:**
```
Socket.IO en: /socket.io
Eventos:
  - 'connect' - Conexión establecida
  - 'mensaje' - Enviar mensaje
  - 'mensaje_recibido' - Mensaje recibido
  - 'mensaje_leido' - Mensaje marcado como leído
  - 'nuevo_mensaje' - Notificación de nuevo mensaje
```

### 6.10 Health Check

```
GET    /api/salud                        # Health check del servidor
```

---

## 7. FLUJOS PRINCIPALES DEL SISTEMA

### 7.1 Flujo de Autenticación

```
1. Usuario ingresa email y contraseña
2. Backend valida credenciales
3. Backend genera JWT token
4. Frontend almacena token en localStorage
5. Frontend incluye token en headers de requests
6. Middleware valida token en cada request
7. Si token expira, redirige a login
```

### 7.2 Flujo de Creación de Cita

```
1. Recepcionista/Paciente selecciona psicólogo
2. Sistema muestra disponibilidad del psicólogo
3. Usuario selecciona fecha y hora disponible
4. Sistema valida disponibilidad
5. Usuario confirma tipo de servicio
6. Sistema crea cita con estado "programada"
7. Sistema envía email de confirmación
8. Sistema envía recordatorio 24h antes
9. Sistema envía recordatorio 1h antes
```

### 7.3 Flujo de Sesión Terapéutica

```
1. Psicólogo inicia sesión desde cita
2. Sistema crea registro de sesión
3. Psicólogo registra información durante sesión:
   - Objetivos
   - Técnicas utilizadas
   - Notas de evolución
4. Psicólogo puede asignar tareas desde sesión
5. Psicólogo finaliza sesión
6. Sistema actualiza estado de cita a "completada"
7. Sistema genera registro de sesión completada
```

### 7.4 Flujo de Tareas

```
1. Psicólogo crea tarea (selecciona tipo)
2. Psicólogo configura tarea según tipo
3. Psicólogo asigna a paciente con fecha límite
4. Sistema notifica al paciente
5. Paciente completa tarea
6. Sistema guarda respuesta
7. Psicólogo revisa respuesta
8. Psicólogo califica y da retroalimentación
9. Sistema actualiza estadísticas
```

### 7.5 Flujo de Chat

```
1. Usuario abre chat
2. Frontend se conecta a WebSocket
3. Frontend autentica con JWT
4. Backend valida permisos de chat
5. Usuario envía mensaje
6. WebSocket transmite mensaje en tiempo real
7. Backend guarda mensaje en BD
8. Destinatario recibe notificación
9. Destinatario marca como leído
10. Sistema actualiza contador de no leídos
```

### 7.6 Flujo de Reporte de Progreso

```
1. Psicólogo crea reporte de progreso
2. Psicólogo selecciona paciente y período
3. Psicólogo completa información:
   - Resumen de evolución
   - Objetivos cumplidos/pendientes
   - Áreas trabajadas
   - Logros y desafíos
4. Psicólogo guarda reporte
5. Sistema genera reporte en formato PDF
6. Paciente puede ver reporte en su panel
7. Paciente puede descargar PDF
```

---

## 8. CONFIGURACIÓN E INSTALACIÓN

### 8.1 Requisitos Previos

- **Node.js:** 18.0.0 o superior
- **npm:** 9.0.0 o superior
- **PostgreSQL:** 12.0 o superior
- **Git:** Para clonar el repositorio

### 8.2 Instalación Paso a Paso

#### **1. Clonar Repositorio**
```bash
git clone <repository-url>
cd centro-terapeutico-psyche
```

#### **2. Instalar Dependencias**
```bash
# Instalar dependencias del monorepo
npm install

# Instalar dependencias de cada workspace
npm install --workspaces
```

#### **3. Configurar Base de Datos**

Crear base de datos PostgreSQL:
```sql
CREATE DATABASE psyche_db;
```

#### **4. Configurar Variables de Entorno**

**Backend (`backend/.env`):**
```env
# Base de Datos
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=tu_contraseña
DB_NAME=psyche_db

# Servidor
PORT=3002
NODE_ENV=development

# JWT
JWT_SECRET=tu_secret_jwt_muy_seguro
JWT_EXPIRES_IN=24h

# Email (Gmail)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=tu_email@gmail.com
EMAIL_PASS=tu_contraseña_de_aplicacion
EMAIL_FROM=tu_email@gmail.com

# Uploads
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=5242880
```

**Frontend (`frontend/.env`):**
```env
VITE_API_URL=http://localhost:3002/api
```

#### **5. Ejecutar Migraciones**
```bash
cd backend
npm run db:migrate
```

#### **6. Poblar Base de Datos**
```bash
# Desde la raíz del proyecto
node scripts/limpiar-y-poblar.js
```

#### **7. Iniciar Servidores**

**Desarrollo (ambos servidores):**
```bash
# Desde la raíz
npm run dev
```

**Solo Backend:**
```bash
npm run dev:backend
# O desde backend/
npm run dev
```

**Solo Frontend:**
```bash
npm run dev:frontend
# O desde frontend/
npm run dev
```

### 8.3 Puertos del Sistema

- **Frontend:** http://localhost:3000
- **Backend:** http://localhost:3002 (⚠️ OBLIGATORIO)
- **PostgreSQL:** localhost:5432

### 8.4 Scripts Útiles

```bash
# Desarrollo
npm run dev                    # Iniciar frontend + backend
npm run dev:backend           # Solo backend
npm run dev:frontend          # Solo frontend

# Base de Datos
npm run db:migrate            # Ejecutar migraciones
npm run db:seed               # Ejecutar seeders
npm run db:reset             # Resetear BD (migrate + seed)

# Build
npm run build                 # Build de producción
npm run build:backend         # Build solo backend
npm run build:frontend        # Build solo frontend

# Testing
npm run test                  # Ejecutar tests
npm run lint                  # Linting
npm run type-check           # Verificar tipos TypeScript
```

---

## 9. CREDENCIALES DE PRUEBA

### 9.1 Administrador

```
Email: admin@admin.cl
Contraseña: admin123
Rol: Administrador
```

### 9.2 Psicólogos (9 total)

**Todos los psicólogos usan la misma contraseña:** `Psyche2024!`

1. **María José González Rodríguez**
   - Email: `mariajose.gonzalez@psyche.cl`
   - Especialidad: Psicología Clínica

2. **Carlos Eduardo Muñoz Sepúlveda**
   - Email: `carlos.munoz@psyche.cl`
   - Especialidad: Psicología Clínica

3. **Andrea Francisca Soto Valenzuela**
   - Email: `andrea.soto@psyche.cl`
   - Especialidad: Psicología Clínica

4. **Patricia Alejandra Ramírez Torres**
   - Email: `patricia.ramirez@psyche.cl`
   - Especialidad: Psicología Infantil

5. **Roberto Andrés Hernández Silva**
   - Email: `roberto.hernandez@psyche.cl`
   - Especialidad: Terapia de Parejas y Familia

6. **Daniela Constanza Fuentes Morales**
   - Email: `daniela.fuentes@psyche.cl`
   - Especialidad: Neuropsicología

7. **Felipe Ignacio Castillo Vargas**
   - Email: `felipe.castillo@psyche.cl`
   - Especialidad: Psicología Organizacional

8. **Valentina Isabel Cortés Pinto**
   - Email: `valentina.cortes@psyche.cl`
   - Especialidad: Trastornos de Ansiedad y Depresión

9. (Psicólogo existente previo)

### 9.3 Recepcionistas (6 total)

1. **Carolina Flores Jiménez**
   - Email: `carolina.flores@psyche.cl`
   - Contraseña: `carolina123`

2. **Sebastián Morales Díaz**
   - Email: `sebastian.morales@psyche.cl`
   - Contraseña: `sebastian123`

3. **Javiera Núñez Rojas**
   - Email: `javiera.nunez@psyche.cl`
   - Contraseña: `javiera123`

4. **Diego Pérez Contreras**
   - Email: `diego.perez@psyche.cl`
   - Contraseña: `diego123`

5. **Camila Reyes Bustamante**
   - Email: `camila.reyes@psyche.cl`
   - Contraseña: `camila123`

6. (Recepcionista existente previo)

### 9.4 Pacientes (50 total)

**Formato de contraseña:** `[primer_nombre]123`

**Ejemplos:**
1. **Luis Alberto Gutiérrez Sánchez**
   - Email: `luis.gutierrez@email.cl`
   - Contraseña: `luis123`

2. **Sofía Fernanda Lagos Ortiz**
   - Email: `sofia.lagos@email.cl`
   - Contraseña: `sofia123`

3. **Javier Antonio Riquelme Castro**
   - Email: `javier.riquelme@email.cl`
   - Contraseña: `javier123`

**Para obtener el email de cualquier paciente:**
- Formato: `[primer_nombre].[primer_apellido]@email.cl`
- Contraseña: `[primer_nombre]123`

---

## 10. CARACTERÍSTICAS TÉCNICAS AVANZADAS

### 10.1 Seguridad

- ✅ **JWT Tokens:** Autenticación stateless
- ✅ **Bcrypt:** Hash de contraseñas (12 rounds)
- ✅ **Helmet:** Headers de seguridad HTTP
- ✅ **CORS:** Configuración restrictiva
- ✅ **Validación:** Joi para validación de datos
- ✅ **Sanitización:** Limpieza de inputs
- ✅ **Rate Limiting:** (Futuro)
- ✅ **HTTPS:** En producción
- ✅ **Soft Deletes:** No eliminación física de datos importantes
- ✅ **Auditoría:** Logs de todas las acciones críticas

### 10.2 Performance

- ✅ **Índices de BD:** Optimización de consultas
- ✅ **Lazy Loading:** Carga diferida de componentes
- ✅ **Code Splitting:** División de código en chunks
- ✅ **Caching:** (Futuro con Redis)
- ✅ **Compresión:** Gzip en Express
- ✅ **Paginación:** En listados grandes
- ✅ **Debounce:** En búsquedas

### 10.3 Escalabilidad

- ✅ **Monorepo:** Gestión centralizada
- ✅ **Workspaces:** Dependencias compartidas
- ✅ **Microservicios Ready:** Estructura preparada
- ✅ **Docker:** Contenedores listos
- ✅ **Stateless API:** Fácil escalado horizontal
- ✅ **WebSocket:** Comunicación en tiempo real escalable

### 10.4 Mantenibilidad

- ✅ **TypeScript:** Tipado estático
- ✅ **ESLint + Prettier:** Código consistente
- ✅ **Husky:** Pre-commit hooks
- ✅ **Migraciones:** Control de versiones de BD
- ✅ **Logging:** Sistema de logs estructurado
- ✅ **Error Handling:** Manejo centralizado de errores
- ✅ **Documentación:** Comentarios y documentación

### 10.5 UX/UI

- ✅ **Responsive Design:** Mobile-first
- ✅ **Tailwind CSS:** Estilos consistentes
- ✅ **Animaciones:** Framer Motion
- ✅ **Notificaciones:** React Hot Toast
- ✅ **Loading States:** Indicadores de carga
- ✅ **Error States:** Mensajes de error claros
- ✅ **Formularios:** Validación en tiempo real
- ✅ **Accesibilidad:** (En progreso)

---

## 11. SEGURIDAD Y AUTENTICACIÓN

### 11.1 Sistema de Autenticación

#### **JWT (JSON Web Tokens)**
- **Algoritmo:** HS256
- **Expiración:** 24 horas
- **Refresh Tokens:** (Futuro)
- **Almacenamiento:** localStorage (Frontend)

#### **Middleware de Autenticación**
```typescript
// Verificar token
verificarToken(req, res, next)

// Verificar rol específico
verificarRol(['admin', 'psicologo'])

// Verificar admin
verificarAdmin(req, res, next)

// Verificar psicólogo
verificarPsicologo(req, res, next)

// Verificar recepcionista
verificarRecepcionista(req, res, next)

// Timeout de sesión
verificarTimeoutSesion(req, res, next)
```

### 11.2 Validación de Datos

- **Backend:** Joi schemas
- **Frontend:** React Hook Form + validación personalizada
- **Sanitización:** Limpieza de HTML, SQL injection prevention

### 11.3 Permisos y Autorización

- **Basado en Roles:** RBAC (Role-Based Access Control)
- **Permisos Granulares:** JSON en tabla roles
- **Middleware de Verificación:** En cada ruta protegida

---

## 12. SISTEMAS ESPECIALIZADOS

### 12.1 Sistema de Chat (WebSocket)

**Tecnología:** Socket.IO

**Características:**
- ✅ Comunicación bidireccional en tiempo real
- ✅ Autenticación WebSocket con JWT
- ✅ Reconexión automática
- ✅ Mensajes persistentes en BD
- ✅ Contador de no leídos
- ✅ Notificaciones push

**Arquitectura:**
```
Frontend (Socket.IO Client) ←→ Backend (Socket.IO Server) ←→ PostgreSQL
```

### 12.2 Sistema de Tareas Avanzadas

**Tipos de Tareas:**
1. Texto Abierto
2. Opción Múltiple
3. Test Psicológico
4. Test con Imágenes
5. Tarea de Dibujo
6. Tipos Tradicionales

**Configuración JSON:**
```json
{
  "tipo": "opcion_multiple",
  "opciones": ["Opción 1", "Opción 2", "Opción 3"],
  "seleccion_multiple": false,
  "opciones_minimas": 1,
  "opciones_maximas": 1
}
```

### 12.3 Sistema de Reportes

**Tipos de Reportes:**
- Reportes de Progreso
- Reporte de Adherencia Terapéutica
- Reportes de Sesiones
- Reportes Financieros

**Exportación:**
- PDF (PDFKit + Puppeteer)
- Excel (Futuro)
- JSON (Futuro)

### 12.4 Sistema de Emails

**Tecnología:** Nodemailer + Gmail SMTP

**Tipos de Emails:**
- ✅ Bienvenida
- ✅ Confirmación de cita
- ✅ Recordatorio de cita (24h, 1h)
- ✅ Cancelación de cita
- ✅ Recuperación de contraseña
- ✅ Verificación de email

### 12.5 Sistema de Auditoría

**Registro de Acciones:**
- Creación, actualización, eliminación
- Login/Logout
- Acciones críticas
- Cambios de permisos

**Información Registrada:**
- Usuario
- Acción
- Entidad afectada
- Metadatos (JSON)
- IP Address
- User Agent
- Timestamp

---

## 📝 NOTAS FINALES

### Estado del Proyecto
- ✅ **Backend:** 95% completado
- ✅ **Frontend:** 90% completado
- ✅ **Base de Datos:** 100% completado
- ✅ **Autenticación:** 100% completado
- ✅ **Chat:** 100% completado
- ✅ **Tareas:** 100% completado
- ✅ **Reportes:** 100% completado
- ✅ **Citas:** 100% completado
- ✅ **Sesiones:** 100% completado

### Próximas Mejoras
- [ ] Tests automatizados
- [ ] CI/CD Pipeline
- [ ] Redis para caching
- [ ] Mejoras de performance
- [ ] PWA (Progressive Web App)
- [ ] Modo oscuro
- [ ] Internacionalización (i18n)

---

## 📞 CONTACTO Y SOPORTE

Para preguntas sobre el proyecto, consultar esta documentación o revisar el código fuente.

**Versión del Documento:** 1.0  
**Última Actualización:** Enero 2025

---

*Este documento es una referencia completa del proyecto Centro Terapéutico Psyche. Mantener actualizado con cada cambio significativo.*


