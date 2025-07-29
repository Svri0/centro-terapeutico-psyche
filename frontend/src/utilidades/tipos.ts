// Tipos de datos para el frontend
export interface Usuario {
  id: string;
  email: string;
  nombre: string;
  apellido: string;
  rol: 'admin' | 'psicologo' | 'paciente' | 'recepcionista';
  activo: boolean;
  fechaCreacion: Date;
}

export interface Paciente {
  id: string;
  usuarioId: string;
  fechaNacimiento: Date;
  telefono: string;
  direccion?: string;
  emergenciaContacto?: string;
  emergenciaTelefono?: string;
  diagnostico?: string;
  estrategiasAutorregulacion?: string;
  puntos: number;
}

export interface Sesion {
  id: string;
  pacienteId: string;
  psicologoId: string;
  fecha: Date;
  duracion: number; // en minutos
  estado: 'programada' | 'en_curso' | 'completada' | 'cancelada' | 'no_asistio';
  notas?: string;
  evaluacion?: string;
}

export interface Tarea {
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

export interface Mensaje {
  id: string;
  remitenteId: string;
  destinatarioId: string;
  asunto: string;
  contenido: string;
  fechaEnvio: Date;
  leido: boolean;
  adjuntos?: string[];
}

export interface Notificacion {
  id: string;
  usuarioId: string;
  tipo: 'sesion' | 'tarea' | 'mensaje' | 'sistema';
  titulo: string;
  mensaje: string;
  leida: boolean;
  fechaCreacion: Date;
  fechaLectura?: Date;
} 