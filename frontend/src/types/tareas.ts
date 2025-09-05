// Tipos para el sistema de tareas avanzado

export type TipoTarea = 
  | 'texto_abierto'
  | 'opcion_multiple'
  | 'test_psicologico'
  | 'test_imagenes'
  | 'tarea_dibujo'
  | 'ejercicio'
  | 'lectura'
  | 'reflexion'
  | 'practica'
  | 'evaluacion';

export type PrioridadTarea = 'baja' | 'media' | 'alta' | 'urgente';
export type EstadoTarea = 'pendiente' | 'en_progreso' | 'completada' | 'vencida' | 'cancelada';

// Contenido específico según el tipo de tarea
export interface ContenidoTarea {
  // Para opción múltiple
  preguntas?: PreguntaOpcionMultiple[];
  
  // Para test psicológico
  preguntasTest?: PreguntaTest[];
  
  // Para test con imágenes
  imagenes?: ImagenTest[];
  
  // Para tarea de dibujo
  instruccionesDibujo?: string;
  
  // Para texto abierto
  preguntaTexto?: string;
}

// Pregunta de opción múltiple
export interface PreguntaOpcionMultiple {
  id: string;
  pregunta: string;
  opciones: OpcionRespuesta[];
  seleccionMultiple: boolean;
  requerida: boolean;
}

// Opción de respuesta
export interface OpcionRespuesta {
  id: string;
  texto: string;
  correcta?: boolean;
}

// Pregunta de test psicológico
export interface PreguntaTest {
  id: string;
  pregunta: string;
  tipo: 'escala' | 'texto' | 'opcion_unica';
  opciones?: OpcionRespuesta[];
  escala?: {
    min: number;
    max: number;
    etiquetaMin: string;
    etiquetaMax: string;
  };
  requerida: boolean;
}

// Imagen para test visual
export interface ImagenTest {
  id: string;
  url: string;
  descripcion: string;
  pregunta: string;
  tipoRespuesta: 'texto' | 'opcion_unica' | 'opcion_multiple';
  opciones?: OpcionRespuesta[];
}

// Configuración de la tarea
export interface ConfiguracionTarea {
  tiempoLimite?: number; // en minutos
  intentosPermitidos?: number;
  mostrarResultados?: boolean;
  retroalimentacionInmediata?: boolean;
  aleatorizarPreguntas?: boolean;
}

// Tarea completa
export interface Tarea {
  id: string;
  paciente_id: string;
  psicologo_id: string;
  sesion_id?: string;
  titulo: string;
  descripcion: string;
  instrucciones?: string;
  tipo_tarea: TipoTarea;
  tipo_tarea_avanzado?: string;
  prioridad: PrioridadTarea;
  fecha_asignacion: string;
  fecha_vencimiento?: string;
  fecha_completada?: string;
  estado: EstadoTarea;
  puntos_asignados: number;
  archivos_adjuntos: any[];
  respuesta_paciente?: string;
  archivos_respuesta: any[];
  evaluacion_psicologo?: any;
  contenido_tarea?: ContenidoTarea;
  configuracion_tarea?: ConfiguracionTarea;
  es_borrador: boolean;
  fecha_publicacion?: string;
  created_at: string;
  updated_at: string;
  
  // Datos relacionados
  paciente_nombres?: string;
  paciente_apellidos?: string;
  paciente_email?: string;
  psicologo_nombres?: string;
  psicologo_apellidos?: string;
  psicologo_email?: string;
}

// Respuesta de tarea
export interface RespuestaTarea {
  id: string;
  tarea_id: string;
  paciente_id: string;
  contenido_respuesta?: string;
  archivo_respuesta?: string; // Base64 de dibujos/imágenes
  fecha_envio: string;
  evaluacion_psicologo?: EvaluacionPsicologo;
  created_at: string;
  updated_at: string;
  
  // Datos relacionados
  paciente?: {
    nombres: string;
    apellidos: string;
    email: string;
  };
}

// Evaluación del psicólogo
export interface EvaluacionPsicologo {
  puntuacion?: number;
  comentarios?: string;
  retroalimentacion?: string;
  fecha_evaluacion: string;
}

// Datos para crear una nueva tarea
export interface CrearTareaData {
  paciente_id: string;
  titulo: string;
  descripcion: string;
  instrucciones?: string;
  tipo_tarea: TipoTarea;
  tipo_tarea_avanzado?: string;
  prioridad?: PrioridadTarea;
  fecha_vencimiento?: string;
  puntos_asignados?: number;
  archivos_adjuntos?: any[];
  contenido_tarea?: ContenidoTarea;
  configuracion_tarea?: ConfiguracionTarea;
  es_borrador?: boolean;
  fecha_publicacion?: string;
}

// Datos para actualizar una tarea
export interface ActualizarTareaData {
  titulo?: string;
  descripcion?: string;
  instrucciones?: string;
  tipo_tarea?: TipoTarea;
  tipo_tarea_avanzado?: string;
  prioridad?: PrioridadTarea;
  fecha_vencimiento?: string;
  estado?: EstadoTarea;
  puntos_asignados?: number;
  archivos_adjuntos?: any[];
  contenido_tarea?: ContenidoTarea;
  configuracion_tarea?: ConfiguracionTarea;
  es_borrador?: boolean;
  fecha_publicacion?: string;
}

// Datos para guardar una respuesta
export interface GuardarRespuestaData {
  contenido_respuesta?: string;
  archivo_respuesta?: string;
}

// Datos para evaluar una respuesta
export interface EvaluarRespuestaData {
  evaluacion_psicologo: EvaluacionPsicologo;
}

// Filtros para listar tareas
export interface FiltrosTareas {
  paciente_id?: string;
  estado?: EstadoTarea;
  tipo_tarea?: TipoTarea;
  es_borrador?: boolean;
}

// Respuesta de la API
export interface ApiResponse<T> {
  success: boolean;
  mensaje: string;
  data?: T;
  codigo?: string;
  timestamp?: string;
}


