# 🏗️ Refactorización del Modelo de Datos - Enfoque Modular

## 🎯 **Objetivo**
Reorganizar el modelo de datos siguiendo principios de **modularidad**, **separación de responsabilidades** y **buenas prácticas** para mejorar la mantenibilidad y legibilidad.

---

## 📋 **Problemas Actuales Identificados**

### **1. Tabla USUARIOS Sobrecargada**
```sql
-- ❌ PROBLEMA: Tabla con múltiples responsabilidades
USUARIOS {
  -- Datos básicos de usuario
  id, email, password_hash, nombres, apellidos
  
  -- Datos específicos de psicólogo
  especialidad, descripcion, codigo_sbs
  
  -- Configuración flexible
  configuracion (JSONB)
}
```

### **2. Campos JSONB Masivos**
```sql
-- ❌ PROBLEMA: Datos no estructurados en tablas principales
PACIENTES {
  diagnosticos: JSONB          -- Debería ser tabla separada
  etiquetas: JSONB             -- Debería ser tabla separada
  estrategias_autorregulacion: JSONB  -- Debería ser tabla separada
  historial_medico: JSONB      -- Debería ser tabla separada
  medicacion_actual: JSONB     -- Debería ser tabla separada
  alergias: JSONB              -- Debería ser tabla separada
  antecedentes_familiares: JSONB -- Debería ser tabla separada
}
```

### **3. Falta de Agrupación Lógica**
- Tablas relacionadas dispersas
- No hay separación por dominio de negocio
- Dificulta el mantenimiento

---

## 🏗️ **Nueva Estructura Modular**

### **📁 Organización por Dominios**

```
backend/src/modelos/
├── core/                    # Modelos centrales
│   ├── Usuario.ts
│   ├── Rol.ts
│   └── index.ts
├── usuarios/                # Dominio de usuarios
│   ├── PerfilPsicologo.ts
│   ├── PerfilPaciente.ts
│   ├── PerfilRecepcionista.ts
│   ├── ConfiguracionUsuario.ts
│   └── index.ts
├── pacientes/               # Dominio de pacientes
│   ├── Paciente.ts
│   ├── Diagnostico.ts
│   ├── Medicacion.ts
│   ├── Alergia.ts
│   ├── AntecedenteMedico.ts
│   ├── EstrategiaAutorregulacion.ts
│   ├── EtiquetaPaciente.ts
│   └── index.ts
├── sesiones/                # Dominio de sesiones
│   ├── Sesion.ts
│   ├── ObjetivoSesion.ts
│   ├── TecnicaUtilizada.ts
│   ├── ArchivoSesion.ts
│   └── index.ts
├── tareas/                  # Dominio de tareas
│   ├── Tarea.ts
│   ├── TipoTarea.ts
│   ├── ContenidoTarea.ts
│   ├── ConfiguracionTarea.ts
│   ├── RespuestaTarea.ts
│   ├── ArchivoTarea.ts
│   └── index.ts
├── comunicacion/            # Dominio de comunicación
│   ├── Chat.ts
│   ├── Mensaje.ts
│   ├── Notificacion.ts
│   ├── TipoNotificacion.ts
│   └── index.ts
├── disponibilidad/          # Dominio de disponibilidad
│   ├── DisponibilidadMensual.ts
│   ├── DisponibilidadSemanal.ts
│   └── index.ts
├── servicios/               # Dominio de servicios
│   ├── Servicio.ts
│   ├── TipoServicio.ts
│   ├── ServicioPsicologo.ts
│   └── index.ts
├── pagos/                   # Dominio de pagos
│   ├── Pago.ts
│   ├── TipoPago.ts
│   ├── Plan.ts
│   └── index.ts
├── eventos/                 # Dominio de eventos
│   ├── Evento.ts
│   ├── TipoEvento.ts
│   └── index.ts
├── auditoria/               # Dominio de auditoría
│   ├── LogAuditoria.ts
│   └── index.ts
└── index.ts                 # Exportaciones principales
```

---

## 🔧 **Refactorización por Dominios**

### **1. Core (Modelos Centrales)**

#### **Usuario.ts** - Solo datos básicos
```typescript
// ✅ SOLUCIÓN: Usuario solo con datos básicos
export interface UsuarioAttributes {
  id: string;
  email: string;
  password_hash: string;
  nombres: string;
  apellidos: string;
  telefono?: string;
  fecha_nacimiento?: Date;
  genero?: 'masculino' | 'femenino' | 'otro' | 'prefiero_no_decir';
  avatar_url?: string;
  rol_id: number;
  activo: boolean;
  email_verificado: boolean;
  token_activacion?: string;
  token_activacion_expira?: Date;
  ultimo_acceso?: Date;
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date;
}
```

#### **Rol.ts** - Sin cambios
```typescript
// ✅ Mantener como está
export interface RolAttributes {
  id: number;
  nombre: string;
  descripcion?: string;
  permisos: any[];
  activo: boolean;
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date;
}
```

### **2. Usuarios (Dominio de Usuarios)**

#### **PerfilPsicologo.ts** - Datos específicos de psicólogo
```typescript
// ✅ SOLUCIÓN: Separar datos específicos de psicólogo
export interface PerfilPsicologoAttributes {
  id: string;
  usuario_id: string;
  especialidad: string;
  descripcion?: string;
  codigo_sbs?: string;
  experiencia_anos?: number;
  universidad?: string;
  certificaciones?: string[];
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date;
}
```

#### **PerfilPaciente.ts** - Datos específicos de paciente
```typescript
// ✅ SOLUCIÓN: Separar datos específicos de paciente
export interface PerfilPacienteAttributes {
  id: string;
  usuario_id: string;
  numero_ficha: string;
  rut?: string;
  direccion?: string;
  contacto_emergencia_nombre?: string;
  contacto_emergencia_telefono?: string;
  contacto_emergencia_relacion?: string;
  estado: 'activo' | 'inactivo' | 'alta' | 'derivado';
  fecha_ingreso: Date;
  fecha_alta?: Date;
  observaciones?: string;
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date;
}
```

#### **ConfiguracionUsuario.ts** - Configuraciones flexibles
```typescript
// ✅ SOLUCIÓN: Configuraciones en tabla separada
export interface ConfiguracionUsuarioAttributes {
  id: string;
  usuario_id: string;
  clave: string;
  valor: string;
  tipo_dato: 'string' | 'number' | 'boolean' | 'json';
  descripcion?: string;
  created_at: Date;
  updated_at: Date;
}
```

### **3. Pacientes (Dominio de Pacientes)**

#### **Diagnostico.ts** - Diagnósticos normalizados
```typescript
// ✅ SOLUCIÓN: Diagnósticos en tabla separada
export interface DiagnosticoAttributes {
  id: string;
  paciente_id: string;
  codigo: string;
  descripcion: string;
  fecha_diagnostico: Date;
  profesional_diagnostico: string;
  observaciones?: string;
  activo: boolean;
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date;
}
```

#### **Medicacion.ts** - Medicación normalizada
```typescript
// ✅ SOLUCIÓN: Medicación en tabla separada
export interface MedicacionAttributes {
  id: string;
  paciente_id: string;
  medicamento: string;
  dosis?: string;
  frecuencia?: string;
  fecha_inicio: Date;
  fecha_fin?: Date;
  prescrito_por?: string;
  observaciones?: string;
  activo: boolean;
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date;
}
```

#### **Alergia.ts** - Alergias normalizadas
```typescript
// ✅ SOLUCIÓN: Alergias en tabla separada
export interface AlergiaAttributes {
  id: string;
  paciente_id: string;
  alergeno: string;
  severidad: 'leve' | 'moderada' | 'severa';
  sintomas?: string;
  fecha_diagnostico: Date;
  observaciones?: string;
  activo: boolean;
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date;
}
```

### **4. Sesiones (Dominio de Sesiones)**

#### **Sesion.ts** - Solo datos básicos de sesión
```typescript
// ✅ SOLUCIÓN: Sesión solo con datos básicos
export interface SesionAttributes {
  id: string;
  paciente_id: string;
  psicologo_id: string;
  fecha_programada: Date;
  fecha_inicio?: Date;
  fecha_fin?: Date;
  duracion_minutos?: number;
  tipo_sesion: 'presencial' | 'virtual' | 'telefonica';
  estado: 'programada' | 'confirmada' | 'en_curso' | 'completada' | 'cancelada' | 'no_asistio';
  notas_evolucion?: string;
  observaciones?: string;
  resumen_sesion?: string;
  progreso_paciente?: 'excelente' | 'bueno' | 'regular' | 'necesita_mejora';
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date;
}
```

#### **ObjetivoSesion.ts** - Objetivos normalizados
```typescript
// ✅ SOLUCIÓN: Objetivos en tabla separada
export interface ObjetivoSesionAttributes {
  id: string;
  sesion_id: string;
  objetivo: string;
  descripcion?: string;
  alcanzado: boolean;
  fecha_alcanzado?: Date;
  observaciones?: string;
  created_at: Date;
  updated_at: Date;
}
```

#### **TecnicaUtilizada.ts** - Técnicas normalizadas
```typescript
// ✅ SOLUCIÓN: Técnicas en tabla separada
export interface TecnicaUtilizadaAttributes {
  id: string;
  sesion_id: string;
  tecnica: string;
  descripcion?: string;
  duracion_minutos?: number;
  efectividad?: number; // 1-5
  observaciones?: string;
  created_at: Date;
  updated_at: Date;
}
```

### **5. Tareas (Dominio de Tareas)**

#### **Tarea.ts** - Solo datos básicos de tarea
```typescript
// ✅ SOLUCIÓN: Tarea solo con datos básicos
export interface TareaAttributes {
  id: string;
  paciente_id: string;
  psicologo_id: string;
  sesion_id?: string;
  tipo_tarea_id: string;
  titulo: string;
  descripcion: string;
  instrucciones?: string;
  prioridad: 'baja' | 'media' | 'alta' | 'urgente';
  fecha_asignacion: Date;
  fecha_vencimiento?: Date;
  fecha_completada?: Date;
  estado: 'pendiente' | 'en_progreso' | 'completada' | 'vencida' | 'cancelada';
  puntos_asignados: number;
  es_borrador: boolean;
  fecha_publicacion?: Date;
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date;
}
```

#### **ContenidoTarea.ts** - Contenido normalizado
```typescript
// ✅ SOLUCIÓN: Contenido en tabla separada
export interface ContenidoTareaAttributes {
  id: string;
  tarea_id: string;
  tipo_contenido: 'texto' | 'imagen' | 'video' | 'audio' | 'documento';
  contenido: string;
  orden: number;
  created_at: Date;
  updated_at: Date;
}
```

#### **ConfiguracionTarea.ts** - Configuración normalizada
```typescript
// ✅ SOLUCIÓN: Configuración en tabla separada
export interface ConfiguracionTareaAttributes {
  id: string;
  tarea_id: string;
  clave: string;
  valor: string;
  tipo_dato: 'string' | 'number' | 'boolean' | 'json';
  descripcion?: string;
  created_at: Date;
  updated_at: Date;
}
```

---

## 📚 **Documentación por Módulo**

### **README.md para cada dominio**

#### **usuarios/README.md**
```markdown
# Dominio de Usuarios

## Propósito
Gestiona los perfiles específicos de cada tipo de usuario (psicólogo, paciente, recepcionista).

## Modelos
- `PerfilPsicologo`: Datos específicos de psicólogos
- `PerfilPaciente`: Datos específicos de pacientes
- `PerfilRecepcionista`: Datos específicos de recepcionistas
- `ConfiguracionUsuario`: Configuraciones flexibles por usuario

## Relaciones
- Cada perfil pertenece a un Usuario (1:1)
- Las configuraciones pertenecen a un Usuario (1:N)
```

#### **pacientes/README.md**
```markdown
# Dominio de Pacientes

## Propósito
Gestiona toda la información médica y clínica de los pacientes.

## Modelos
- `Paciente`: Datos básicos del paciente
- `Diagnostico`: Diagnósticos médicos
- `Medicacion`: Medicación actual
- `Alergia`: Alergias del paciente
- `AntecedenteMedico`: Antecedentes médicos
- `EstrategiaAutorregulacion`: Estrategias terapéuticas
- `EtiquetaPaciente`: Etiquetas para clasificación

## Relaciones
- Todos los modelos pertenecen a un Paciente (N:1)
```

---

## 🔄 **Plan de Migración**

### **Fase 1: Crear nuevos modelos**
1. Crear estructura de carpetas
2. Implementar nuevos modelos
3. Crear migraciones

### **Fase 2: Migrar datos**
1. Script de migración de datos existentes
2. Validación de integridad
3. Pruebas de funcionalidad

### **Fase 3: Actualizar código**
1. Actualizar controladores
2. Actualizar servicios
3. Actualizar tests

### **Fase 4: Limpieza**
1. Eliminar campos antiguos
2. Eliminar modelos obsoletos
3. Actualizar documentación

---

## ✅ **Beneficios de la Refactorización**

### **Modularidad**
- ✅ Un archivo por responsabilidad
- ✅ Separación clara de dominios
- ✅ Fácil mantenimiento

### **Nombres Significativos**
- ✅ Carpetas y archivos claramente identificables
- ✅ Nombres descriptivos en español
- ✅ Convenciones consistentes

### **Sin Ciclos de Dependencias**
- ✅ Dependencias unidireccionales
- ✅ Separación clara de responsabilidades
- ✅ Fácil testing

### **Documentación**
- ✅ README en cada dominio
- ✅ Comentarios en código
- ✅ Diagramas de relaciones

### **Consistencia**
- ✅ Estilo uniforme
- ✅ Estructura predecible
- ✅ Convenciones claras

### **Separación Lógica**
- ✅ Datos bien estructurados
- ✅ Lógica separada por dominio
- ✅ Presentación independiente








