export interface TipoServicio {
  id: string;
  nombre: string;
  descripcion: string;
  duracion: number;
  categoria: string;
}

export const TIPOS_SERVICIOS: TipoServicio[] = [
  // Psicología General
  {
    id: 'consulta-general',
    nombre: 'Consulta Psicología General',
    descripcion: 'Sesiones de psicología para adultos (mayor a 15 años)',
    duracion: 60,
    categoria: 'Psicología General'
  },
  {
    id: 'terapia-individual',
    nombre: 'Terapia Individual',
    descripcion: 'Sesiones personalizadas de terapia psicológica',
    duracion: 60,
    categoria: 'Psicología General'
  },
  {
    id: 'evaluacion-psicologica',
    nombre: 'Evaluación Psicológica',
    descripcion: 'Evaluación completa del estado psicológico del paciente',
    duracion: 90,
    categoria: 'Psicología General'
  },

  // Terapia de Parejas
  {
    id: 'terapia-parejas',
    nombre: 'Terapia de Parejas',
    descripcion: 'Sesiones especializadas para parejas',
    duracion: 90,
    categoria: 'Terapia de Parejas'
  },
  {
    id: 'mediacion-familiar',
    nombre: 'Mediación Familiar',
    descripcion: 'Intervención para resolver conflictos familiares',
    duracion: 90,
    categoria: 'Terapia de Parejas'
  },

  // Psicología Infantil
  {
    id: 'terapia-infantil',
    nombre: 'Terapia Infantil',
    descripcion: 'Sesiones especializadas para niños (3-12 años)',
    duracion: 45,
    categoria: 'Psicología Infantil'
  },
  {
    id: 'terapia-adolescentes',
    nombre: 'Terapia para Adolescentes',
    descripcion: 'Sesiones especializadas para adolescentes (13-17 años)',
    duracion: 60,
    categoria: 'Psicología Infantil'
  },

  // Especialidades
  {
    id: 'terapia-ansiedad',
    nombre: 'Terapia para Ansiedad',
    descripcion: 'Tratamiento especializado para trastornos de ansiedad',
    duracion: 60,
    categoria: 'Especialidades'
  },
  {
    id: 'terapia-depresion',
    nombre: 'Terapia para Depresión',
    descripcion: 'Tratamiento especializado para trastornos depresivos',
    duracion: 60,
    categoria: 'Especialidades'
  },
  {
    id: 'terapia-estres',
    nombre: 'Terapia para Manejo del Estrés',
    descripcion: 'Técnicas y estrategias para el manejo del estrés',
    duracion: 60,
    categoria: 'Especialidades'
  },

  // Evaluaciones Especializadas
  {
    id: 'evaluacion-tdah',
    nombre: 'Evaluación TDAH',
    descripcion: 'Evaluación especializada para trastorno por déficit de atención',
    duracion: 120,
    categoria: 'Evaluaciones Especializadas'
  },
  {
    id: 'evaluacion-autismo',
    nombre: 'Evaluación TEA',
    descripcion: 'Evaluación para trastornos del espectro autista',
    duracion: 120,
    categoria: 'Evaluaciones Especializadas'
  }
];

export const obtenerCategorias = (): string[] => {
  const categorias = TIPOS_SERVICIOS.map(servicio => servicio.categoria);
  return [...new Set(categorias)];
};

export const obtenerServiciosPorCategoria = (categoria: string): TipoServicio[] => {
  return TIPOS_SERVICIOS.filter(servicio => servicio.categoria === categoria);
}; 