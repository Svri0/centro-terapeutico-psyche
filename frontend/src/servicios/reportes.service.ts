import { api } from './api';

// Tipos para reportes de progreso
export interface ReporteProgreso {
  id: string;
  paciente_id: string;
  psicologo_id: string;
  sesion_id?: string;
  fecha_reporte: string;
  periodo_inicio: string;
  periodo_fin: string;
  resumen_evolucion: string;
  objetivos_cumplidos: string[];
  objetivos_pendientes: string[];
  areas_trabajadas: string[];
  conductas_observadas: string[];
  logros_importantes: string[];
  desafios_identificados: string[];
  sugerencias_terapeuticas: string;
  progreso_general: 'excelente' | 'muy_bueno' | 'bueno' | 'regular' | 'necesita_atencion';
  metrica_satisfaccion?: number;
  observaciones_adicionales?: string;
  documento_adjunto?: string;
  estado: 'borrador' | 'completado' | 'archivado';
  created_at: string;
  updated_at: string;
  
  // Campos adicionales para mostrar información del paciente
  paciente?: {
    id: string;
    nombres: string;
    apellidos: string;
    numero_ficha: string;
    email?: string;
    telefono?: string;
  };
  
  // Campos adicionales para mostrar información del psicólogo
  psicologo?: {
    id: string;
    nombres: string;
    apellidos: string;
  };
}

export interface CrearReporteData {
  paciente_id: string;
  sesion_id?: string;
  periodo_inicio: string;
  periodo_fin: string;
  resumen_evolucion: string;
  objetivos_cumplidos?: string[];
  objetivos_pendientes?: string[];
  areas_trabajadas?: string[];
  conductas_observadas?: string[];
  logros_importantes?: string[];
  desafios_identificados?: string[];
  sugerencias_terapeuticas?: string;
  progreso_general?: 'excelente' | 'muy_bueno' | 'bueno' | 'regular' | 'necesita_atencion';
  metrica_satisfaccion?: number;
  observaciones_adicionales?: string;
  estado?: 'borrador' | 'completado' | 'archivado';
}

export interface ActualizarReporteData {
  periodo_inicio?: string;
  periodo_fin?: string;
  resumen_evolucion?: string;
  objetivos_cumplidos?: string[];
  objetivos_pendientes?: string[];
  areas_trabajadas?: string[];
  conductas_observadas?: string[];
  logros_importantes?: string[];
  desafios_identificados?: string[];
  sugerencias_terapeuticas?: string;
  progreso_general?: 'excelente' | 'muy_bueno' | 'bueno' | 'regular' | 'necesita_atencion';
  metrica_satisfaccion?: number;
  observaciones_adicionales?: string;
  estado?: 'borrador' | 'completado' | 'archivado';
}

// Servicio de reportes
export const reportesService = {
  // Obtener todos los reportes del psicólogo autenticado
  obtenerTodos: async (filtros?: { paciente_id?: string; estado?: string }) => {
    const params = new URLSearchParams();
    if (filtros?.paciente_id) params.append('paciente_id', filtros.paciente_id);
    if (filtros?.estado) params.append('estado', filtros.estado);
    
    const response = await api.get(`/reportes${params.toString() ? `?${params.toString()}` : ''}`);
    return response.data.data as ReporteProgreso[];
  },

  // Obtener un reporte por ID
  obtenerPorId: async (id: string) => {
    const response = await api.get(`/reportes/${id}`);
    return response.data.data as ReporteProgreso;
  },

  // Crear un nuevo reporte
  crear: async (data: CrearReporteData) => {
    const response = await api.post('/reportes', data);
    return response.data.data as ReporteProgreso;
  },

  // Actualizar un reporte existente
  actualizar: async (id: string, data: ActualizarReporteData) => {
    const response = await api.put(`/reportes/${id}`, data);
    return response.data.data as ReporteProgreso;
  },

  // Eliminar un reporte
  eliminar: async (id: string) => {
    await api.delete(`/reportes/${id}`);
  },

  // Exportar un reporte
  exportar: async (id: string, formato: 'json' = 'json') => {
    const response = await api.get(`/reportes/${id}/exportar?formato=${formato}`);
    return response.data.data as ReporteProgreso;
  },

  // Obtener reportes por paciente
  obtenerPorPaciente: async (paciente_id: string) => {
    const response = await api.get(`/reportes/paciente/${paciente_id}`);
    return response.data.data as ReporteProgreso[];
  },
};

