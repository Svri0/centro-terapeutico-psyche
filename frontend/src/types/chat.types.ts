export interface Mensaje {
  id: string;
  contenido: string;
  remitente: 'psicologo' | 'paciente';
  timestamp: Date;
  tipo: 'texto' | 'imagen' | 'audio' | 'documento';
  leido: boolean;
  metadata?: {
    nombreArchivo?: string;
    tamaño?: number;
    tipoMime?: string;
    url?: string;
  };
}

export interface Chat {
  id: string;
  nombre: string;
  avatar: string;
  ultimoMensaje: string;
  timestamp: Date;
  noLeidos: number;
  online: boolean;
  tipo: 'individual' | 'grupo';
  participantes: string[];
  ultimaActividad: Date;
}

export interface UsuarioChat {
  id: string;
  nombre: string;
  avatar: string;
  rol: 'psicologo' | 'paciente' | 'admin';
  online: boolean;
  ultimaActividad: Date;
  estado: 'disponible' | 'ocupado' | 'ausente' | 'no_molestar';
}

export interface ChatGrupo {
  id: string;
  nombre: string;
  avatar: string;
  descripcion?: string;
  participantes: UsuarioChat[];
  administradores: string[];
  fechaCreacion: Date;
  ultimaActividad: Date;
  configuracion: {
    soloAdminsPuedenEnviar: boolean;
    notificaciones: boolean;
    archivosPermitidos: string[];
  };
}

export interface NotificacionChat {
  id: string;
  tipo: 'mensaje' | 'mencion' | 'reaccion' | 'archivo';
  chatId: string;
  mensajeId?: string;
  remitente: UsuarioChat;
  contenido: string;
  timestamp: Date;
  leida: boolean;
  accion?: {
    tipo: 'abrir_chat' | 'responder' | 'marcar_leido';
    datos?: any;
  };
}

export interface ReaccionMensaje {
  id: string;
  mensajeId: string;
  usuarioId: string;
  emoji: string;
  timestamp: Date;
}

export interface ArchivoChat {
  id: string;
  nombre: string;
  tipo: string;
  tamaño: number;
  url: string;
  subidoPor: string;
  timestamp: Date;
  chatId: string;
  mensajeId?: string;
}

export interface ConfiguracionChat {
  notificaciones: {
    sonido: boolean;
    push: boolean;
    email: boolean;
    horario: {
      inicio: string; // HH:mm
      fin: string; // HH:mm
      zonaHoraria: string;
    };
  };
  privacidad: {
    mostrarEstado: boolean;
    mostrarUltimaActividad: boolean;
    permitirMensajesPrivados: boolean;
  };
  apariencia: {
    tema: 'claro' | 'oscuro' | 'auto';
    tamanoFuente: 'pequeno' | 'normal' | 'grande';
    compacto: boolean;
  };
  accesibilidad: {
    altoContraste: boolean;
    reducirAnimaciones: boolean;
    subtitulos: boolean;
  };
}

export interface EstadisticasChat {
  totalMensajes: number;
  mensajesHoy: number;
  chatsActivos: number;
  tiempoPromedioRespuesta: number; // en minutos
  archivosCompartidos: number;
  usuariosActivos: number;
  topEmojis: Array<{ emoji: string; cantidad: number }>;
  actividadPorHora: Array<{ hora: number; mensajes: number }>;
}

export interface FiltroChat {
  texto?: string;
  fechaDesde?: Date;
  fechaHasta?: Date;
  tipoMensaje?: Mensaje['tipo'];
  soloNoLeidos?: boolean;
  usuario?: string;
  chat?: string;
}

export interface OrdenamientoChat {
  campo: 'timestamp' | 'nombre' | 'ultimaActividad' | 'noLeidos';
  direccion: 'asc' | 'desc';
}

export interface PaginacionChat {
  pagina: number;
  elementosPorPagina: number;
  total: number;
}

export interface ResultadoBusquedaChat {
  mensajes: Mensaje[];
  chats: Chat[];
  usuarios: UsuarioChat[];
  total: number;
  paginacion: PaginacionChat;
}
