// Utilidades para manejo de estados de citas
export const ESTADOS_CITAS = {
  programada: 'Programada',
  confirmada: 'Confirmada',
  en_progreso: 'En Sesión',
  completada: 'Completada',
  cancelada: 'Cancelada',
  no_show: 'No Asistió'
} as const;

export const COLORES_ESTADOS = {
  programada: 'bg-blue-100 text-blue-800 border border-black',
  confirmada: 'bg-green-100 text-green-800 border border-black',
  en_progreso: 'bg-purple-100 text-purple-800 border border-black',
  completada: 'bg-gray-100 text-gray-800 border border-black',
  cancelada: 'bg-red-100 text-red-800 border border-black',
  no_show: 'bg-orange-100 text-orange-800 border border-black'
} as const;

export const COLORES_ESTADOS_CALENDARIO = {
  programada: 'bg-blue-500',
  confirmada: 'bg-green-500',
  en_progreso: 'bg-purple-500',
  completada: 'bg-gray-500',
  cancelada: 'bg-red-500',
  no_show: 'bg-orange-500'
} as const;

export const ICONOS_ESTADOS = {
  completada: '✓',
  cancelada: '✗',
  no_show: '✗',
  programada: '○',
  confirmada: '○',
  en_progreso: '○'
} as const;

export const obtenerEstadoTexto = (estado: string): string => {
  return ESTADOS_CITAS[estado as keyof typeof ESTADOS_CITAS] || estado;
};

export const obtenerEstadoColor = (estado: string): string => {
  return COLORES_ESTADOS[estado as keyof typeof COLORES_ESTADOS] || 'bg-gray-100 text-gray-800';
};

export const obtenerEstadoColorCalendario = (estado: string): string => {
  return COLORES_ESTADOS_CALENDARIO[estado as keyof typeof COLORES_ESTADOS_CALENDARIO] || 'bg-gray-500';
};

export const obtenerEstadoIcono = (estado: string): string => {
  return ICONOS_ESTADOS[estado as keyof typeof ICONOS_ESTADOS] || '○';
};

export const obtenerEstadosDisponibles = (estadoActual: string): string[] => {
  switch (estadoActual) {
    case 'programada':
      return ['confirmada', 'cancelada'];
    case 'confirmada':
      return ['en_progreso', 'cancelada'];
    case 'en_progreso':
      return ['completada', 'no_show'];
    default:
      return [];
  }
};

export const obtenerTextoAccion = (estado: string): string => {
  switch (estado) {
    case 'confirmada':
      return 'Confirmar';
    case 'en_progreso':
      return 'Iniciar';
    case 'completada':
      return 'Completar';
    case 'cancelada':
      return 'Cancelar';
    case 'no_show':
      return 'No Asistió';
    default:
      return estado;
  }
};

// Colores para modalidades
export const COLORES_MODALIDADES = {
  presencial: 'bg-blue-100 text-blue-800 border border-black',
  online: 'bg-green-100 text-green-800 border border-black'
} as const;

export const obtenerModalidadColor = (modalidad: string): string => {
  return COLORES_MODALIDADES[modalidad as keyof typeof COLORES_MODALIDADES] || 'bg-gray-100 text-gray-800 border border-black';
}; 