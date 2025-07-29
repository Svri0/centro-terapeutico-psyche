// Tipos de usuario y roles
export enum UserRole {
  ADMIN = 'admin',
  PSICOLOGO = 'psicologo',
  PACIENTE = 'paciente',
  RECEPCIONISTA = 'recepcionista'
}

export interface User {
  id: string;
  email: string;
  nombre: string;
  apellido: string;
  rol: UserRole;
  activo: boolean;
  fechaCreacion: Date;
  fechaUltimoAcceso?: Date;
}

// Tipos de sesión
export interface Session {
  id: string;
  pacienteId: string;
  psicologoId: string;
  fecha: Date;
  duracion: number; // en minutos
  estado: SessionStatus;
  notas?: string;
  evaluacion?: string;
}

export enum SessionStatus {
  PROGRAMADA = 'programada',
  EN_CURSO = 'en_curso',
  COMPLETADA = 'completada',
  CANCELADA = 'cancelada',
  NO_ASISTIO = 'no_asistio'
}

// Tipos de tareas
export interface Task {
  id: string;
  pacienteId: string;
  psicologoId: string;
  titulo: string;
  descripcion: string;
  fechaAsignacion: Date;
  fechaVencimiento: Date;
  completada: boolean;
  fechaCompletacion?: Date;
  puntos: number;
}

// Tipos de paciente
export interface Patient {
  id: string;
  userId: string;
  fechaNacimiento: Date;
  telefono: string;
  direccion?: string;
  emergenciaContacto?: string;
  emergenciaTelefono?: string;
  diagnostico?: string;
  estrategiasAutorregulacion?: string;
  puntos: number;
}

// Tipos de mensajes
export interface Message {
  id: string;
  remitenteId: string;
  destinatarioId: string;
  asunto: string;
  contenido: string;
  fechaEnvio: Date;
  leido: boolean;
  adjuntos?: string[];
}

// Tipos de notificaciones
export interface Notification {
  id: string;
  usuarioId: string;
  tipo: NotificationType;
  titulo: string;
  mensaje: string;
  leida: boolean;
  fechaCreacion: Date;
  fechaLectura?: Date;
}

export enum NotificationType {
  SESION = 'sesion',
  TAREA = 'tarea',
  MENSAJE = 'mensaje',
  SISTEMA = 'sistema'
}

// Tipos de reportes
export interface Report {
  id: string;
  tipo: ReportType;
  pacienteId?: string;
  psicologoId?: string;
  fechaGeneracion: Date;
  datos: any;
  formato: 'pdf' | 'excel';
}

export enum ReportType {
  PROGRESO_PACIENTE = 'progreso_paciente',
  SESIONES_PSICOLOGO = 'sesiones_psicologo',
  TAREAS_GENERAL = 'tareas_general',
  ESTADISTICAS_CENTRO = 'estadisticas_centro'
}

// Tipos de configuración
export interface SystemConfig {
  id: string;
  clave: string;
  valor: string;
  descripcion?: string;
  activo: boolean;
}

// Tipos de auditoría
export interface AuditLog {
  id: string;
  usuarioId?: string;
  accion: string;
  tabla: string;
  registroId?: string;
  datosAnteriores?: any;
  datosNuevos?: any;
  fecha: Date;
  ip?: string;
  userAgent?: string;
} 