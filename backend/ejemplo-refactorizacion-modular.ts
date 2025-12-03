/**
 * EJEMPLO DE REFACTORIZACIÓN MODULAR
 * 
 * Este archivo muestra cómo implementar la nueva estructura modular
 * siguiendo buenas prácticas de desarrollo.
 */

// ========================================
// 1. CORE - Modelos Centrales
// ========================================

// core/Usuario.ts
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

// ========================================
// 2. USUARIOS - Dominio de Usuarios
// ========================================

// usuarios/PerfilPsicologo.ts
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

// usuarios/PerfilPaciente.ts
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

// usuarios/ConfiguracionUsuario.ts
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

// ========================================
// 3. PACIENTES - Dominio de Pacientes
// ========================================

// pacientes/Diagnostico.ts
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

// pacientes/Medicacion.ts
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

// pacientes/Alergia.ts
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

// ========================================
// 4. SESIONES - Dominio de Sesiones
// ========================================

// sesiones/Sesion.ts
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

// sesiones/ObjetivoSesion.ts
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

// sesiones/TecnicaUtilizada.ts
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

// ========================================
// 5. TAREAS - Dominio de Tareas
// ========================================

// tareas/Tarea.ts
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

// tareas/ContenidoTarea.ts
export interface ContenidoTareaAttributes {
  id: string;
  tarea_id: string;
  tipo_contenido: 'texto' | 'imagen' | 'video' | 'audio' | 'documento';
  contenido: string;
  orden: number;
  created_at: Date;
  updated_at: Date;
}

// tareas/ConfiguracionTarea.ts
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

// ========================================
// 6. COMUNICACIÓN - Dominio de Comunicación
// ========================================

// comunicacion/Chat.ts
export interface ChatAttributes {
  id: string;
  paciente_id: string;
  psicologo_id: string;
  activo: boolean;
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date;
}

// comunicacion/Mensaje.ts
export interface MensajeAttributes {
  id: string;
  chat_id: string;
  remitente_id: string;
  contenido: string;
  tipo_contenido: 'texto' | 'imagen' | 'archivo' | 'audio';
  leido: boolean;
  fecha_envio: Date;
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date;
}

// ========================================
// 7. DISPONIBILIDAD - Dominio de Disponibilidad
// ========================================

// disponibilidad/DisponibilidadMensual.ts
export interface DisponibilidadMensualAttributes {
  id: string;
  psicologo_id: string;
  mes: number;
  anio: number;
  dias_disponibles: number[]; // [1,2,3,4,5] para lunes a viernes
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date;
}

// disponibilidad/DisponibilidadSemanal.ts
export interface DisponibilidadSemanalAttributes {
  id: string;
  psicologo_id: string;
  dia_semana: number; // 1=lunes, 7=domingo
  hora_inicio: string;
  hora_fin: string;
  activo: boolean;
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date;
}

// ========================================
// 8. SERVICIOS - Dominio de Servicios
// ========================================

// servicios/Servicio.ts
export interface ServicioAttributes {
  id: string;
  tipo_servicio_id: string;
  nombre: string;
  descripcion: string;
  duracion_minutos: number;
  precio_base: number;
  activo: boolean;
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date;
}

// servicios/ServicioPsicologo.ts
export interface ServicioPsicologoAttributes {
  id: string;
  psicologo_id: string;
  servicio_id: string;
  precio_personalizado?: number;
  descripcion_personalizada?: string;
  activo: boolean;
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date;
}

// ========================================
// 9. PAGOS - Dominio de Pagos
// ========================================

// pagos/Pago.ts
export interface PagoAttributes {
  id: string;
  usuario_id: string;
  plan_id?: string;
  tipo_pago_id: string;
  monto: number;
  fecha_pago: Date;
  estado: 'pendiente' | 'completado' | 'fallido' | 'reembolsado';
  referencia_transaccion?: string;
  observaciones?: string;
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date;
}

// pagos/Plan.ts
export interface PlanAttributes {
  id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  duracion_dias: number;
  caracteristicas: string[];
  activo: boolean;
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date;
}

// ========================================
// 10. EVENTOS - Dominio de Eventos
// ========================================

// eventos/Evento.ts
export interface EventoAttributes {
  id: string;
  tipo_evento_id: string;
  usuario_id: string;
  titulo: string;
  descripcion?: string;
  fecha_inicio: Date;
  fecha_fin?: Date;
  ubicacion?: string;
  activo: boolean;
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date;
}

// ========================================
// 11. AUDITORÍA - Dominio de Auditoría
// ========================================

// auditoria/LogAuditoria.ts
export interface LogAuditoriaAttributes {
  id: string;
  usuario_id?: string;
  accion: string;
  entidad: string;
  entidad_id: string;
  cambios: any;
  fecha_hora: Date;
  ip_address?: string;
  user_agent?: string;
  created_at: Date;
}

// ========================================
// 12. EXPORTACIONES PRINCIPALES
// ========================================

// index.ts - Exportaciones principales
export * from './core';
export * from './usuarios';
export * from './pacientes';
export * from './sesiones';
export * from './tareas';
export * from './comunicacion';
export * from './disponibilidad';
export * from './servicios';
export * from './pagos';
export * from './eventos';
export * from './auditoria';

// ========================================
// 13. EJEMPLO DE USO
// ========================================

/**
 * Ejemplo de cómo usar la nueva estructura modular
 */
export class EjemploUso {
  
  // Crear un psicólogo con su perfil
  async crearPsicologo(datos: {
    usuario: UsuarioAttributes;
    perfil: PerfilPsicologoAttributes;
  }) {
    // 1. Crear usuario básico
    const usuario = await Usuario.create(datos.usuario);
    
    // 2. Crear perfil específico de psicólogo
    const perfil = await PerfilPsicologo.create({
      ...datos.perfil,
      usuario_id: usuario.id
    });
    
    return { usuario, perfil };
  }
  
  // Crear un paciente con sus datos médicos
  async crearPaciente(datos: {
    usuario: UsuarioAttributes;
    perfil: PerfilPacienteAttributes;
    diagnosticos: DiagnosticoAttributes[];
    medicacion: MedicacionAttributes[];
  }) {
    // 1. Crear usuario básico
    const usuario = await Usuario.create(datos.usuario);
    
    // 2. Crear perfil específico de paciente
    const perfil = await PerfilPaciente.create({
      ...datos.perfil,
      usuario_id: usuario.id
    });
    
    // 3. Crear diagnósticos
    const diagnosticos = await Diagnostico.bulkCreate(
      datos.diagnosticos.map(d => ({
        ...d,
        paciente_id: perfil.id
      }))
    );
    
    // 4. Crear medicación
    const medicacion = await Medicacion.bulkCreate(
      datos.medicacion.map(m => ({
        ...m,
        paciente_id: perfil.id
      }))
    );
    
    return { usuario, perfil, diagnosticos, medicacion };
  }
  
  // Crear una sesión con objetivos y técnicas
  async crearSesion(datos: {
    sesion: SesionAttributes;
    objetivos: ObjetivoSesionAttributes[];
    tecnicas: TecnicaUtilizadaAttributes[];
  }) {
    // 1. Crear sesión básica
    const sesion = await Sesion.create(datos.sesion);
    
    // 2. Crear objetivos
    const objetivos = await ObjetivoSesion.bulkCreate(
      datos.objetivos.map(o => ({
        ...o,
        sesion_id: sesion.id
      }))
    );
    
    // 3. Crear técnicas utilizadas
    const tecnicas = await TecnicaUtilizada.bulkCreate(
      datos.tecnicas.map(t => ({
        ...t,
        sesion_id: sesion.id
      }))
    );
    
    return { sesion, objetivos, tecnicas };
  }
}

// ========================================
// 14. BENEFICIOS DE LA NUEVA ESTRUCTURA
// ========================================

/**
 * BENEFICIOS:
 * 
 * 1. MODULARIDAD:
 *    - Un archivo por responsabilidad
 *    - Separación clara de dominios
 *    - Fácil mantenimiento
 * 
 * 2. NOMBRES SIGNIFICATIVOS:
 *    - Carpetas y archivos claramente identificables
 *    - Nombres descriptivos en español
 *    - Convenciones consistentes
 * 
 * 3. SIN CICLOS DE DEPENDENCIAS:
 *    - Dependencias unidireccionales
 *    - Separación clara de responsabilidades
 *    - Fácil testing
 * 
 * 4. DOCUMENTACIÓN:
 *    - README en cada dominio
 *    - Comentarios en código
 *    - Diagramas de relaciones
 * 
 * 5. CONSISTENCIA:
 *    - Estilo uniforme
 *    - Estructura predecible
 *    - Convenciones claras
 * 
 * 6. SEPARACIÓN LÓGICA:
 *    - Datos bien estructurados
 *    - Lógica separada por dominio
 *    - Presentación independiente
 */








