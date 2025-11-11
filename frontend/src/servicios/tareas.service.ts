import api from './api';

// Tipos simples para evitar problemas de importación
interface TareaSimple {
  id: string;
  paciente_id: string;
  psicologo_id: string;
  titulo: string;
  descripcion: string;
  instrucciones?: string;
  tipo_tarea: string;
  prioridad: string;
  fecha_asignacion: string;
  fecha_vencimiento?: string;
  estado: string;
  puntos_asignados: number;
  archivos_adjuntos: any[];
  contenido_tarea?: any;
  configuracion_tarea?: any;
  es_borrador: boolean;
  fecha_publicacion?: string;
  created_at: string;
  updated_at: string;
}

interface CrearTareaSimple {
  paciente_id: string;
  titulo: string;
  descripcion: string;
  instrucciones?: string;
  tipo_tarea: string;
  prioridad?: string;
  fecha_vencimiento?: string;
  puntos_asignados?: number;
  archivos_adjuntos?: any[];
  contenido_tarea?: any;
  configuracion_tarea?: any;
  es_borrador?: boolean;
  fecha_publicacion?: string;
}

interface RespuestaTareaSimple {
  id: string;
  tarea_id: string;
  paciente_id: string;
  contenido_respuesta?: string;
  archivo_respuesta?: string;
  fecha_envio: string;
  created_at: string;
  updated_at: string;
}

interface GuardarRespuestaSimple {
  contenido_respuesta?: string;
  archivo_respuesta?: string;
}

interface FiltrosTareasSimple {
  paciente_id?: string;
  estado?: string;
  tipo_tarea?: string;
  es_borrador?: boolean;
}

class TareasService {
  // Obtener todas las tareas del psicólogo
  async obtenerTareas(filtros?: FiltrosTareasSimple): Promise<TareaSimple[]> {
    try {
      const params = new URLSearchParams();
      if (filtros?.paciente_id) params.append('paciente_id', filtros.paciente_id);
      if (filtros?.estado) params.append('estado', filtros.estado);
      if (filtros?.tipo_tarea) params.append('tipo_tarea', filtros.tipo_tarea);

      const response = await api.get(`/tareas?${params.toString()}`);
      console.log('Respuesta del backend para tareas:', response.data);
      
      // Manejar diferentes estructuras de respuesta
      if (response.data.data && Array.isArray(response.data.data.tareas)) {
        return response.data.data.tareas;
      } else if (Array.isArray(response.data.data)) {
        return response.data.data;
      } else {
        return [];
      }
    } catch (error: any) {
      console.error('Error al obtener tareas:', error);
      throw new Error(error.response?.data?.mensaje || 'Error al obtener tareas');
    }
  }

  // Obtener tarea por ID
  async obtenerTareaPorId(id: string): Promise<TareaSimple> {
    try {
      const response = await api.get(`/tareas/${id}`);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.mensaje || 'Error al obtener tarea');
    }
  }

  // Crear nueva tarea
  async crearTarea(data: CrearTareaSimple): Promise<TareaSimple> {
    try {
      const response = await api.post('/tareas', data);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.mensaje || 'Error al crear tarea');
    }
  }

  // Crear tarea avanzada
  async crearTareaAvanzada(data: CrearTareaSimple): Promise<TareaSimple> {
    try {
      const response = await api.post('/tareas/avanzada', data);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.mensaje || 'Error al crear tarea avanzada');
    }
  }

  // Actualizar tarea (versión simplificada)
  async actualizarTarea(id: string, data: any): Promise<TareaSimple> {
    try {
      const response = await api.put(`/tareas/${id}`, data);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.mensaje || 'Error al actualizar tarea');
    }
  }

  // Eliminar tarea
  async eliminarTarea(id: string): Promise<void> {
    try {
      await api.delete(`/tareas/${id}`);
    } catch (error: any) {
      throw new Error(error.response?.data?.mensaje || 'Error al eliminar tarea');
    }
  }

  // Obtener tareas del paciente (para pacientes)
  async obtenerMisTareas(filtros?: {
    estado?: string;
    tipo_tarea?: string;
  }): Promise<TareaSimple[]> {
    try {
      const params = new URLSearchParams();
      if (filtros?.estado) params.append('estado', filtros.estado);
      if (filtros?.tipo_tarea) params.append('tipo_tarea', filtros.tipo_tarea);

      const response = await api.get(`/tareas/paciente/mis-tareas?${params.toString()}`);
      return response.data.data.tareas || [];
    } catch (error: any) {
      throw new Error(error.response?.data?.mensaje || 'Error al obtener mis tareas');
    }
  }

  // Actualizar tarea del paciente (para pacientes)
  async actualizarMiTarea(id: string, data: any): Promise<TareaSimple> {
    try {
      const response = await api.put(`/tareas/paciente/mis-tareas/${id}`, data);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.mensaje || 'Error al actualizar mi tarea');
    }
  }

  // Marcar tarea como completada
  async completarTarea(id: string, respuesta?: string, archivos?: any[]): Promise<TareaSimple> {
    try {
      const data = {
        estado: 'completada',
        respuesta_paciente: respuesta,
        archivos_respuesta: archivos
      };
      const response = await api.put(`/tareas/${id}`, data);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.mensaje || 'Error al completar tarea');
    }
  }

  // Evaluar tarea (para psicólogos)
  async evaluarTarea(id: string, evaluacion: any): Promise<TareaSimple> {
    try {
      const data = {
        evaluacion_psicologo: evaluacion
      };
      const response = await api.put(`/tareas/${id}`, data);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.mensaje || 'Error al evaluar tarea');
    }
  }

  // Guardar respuesta de tarea (para pacientes)
  async guardarRespuesta(tareaId: string, data: GuardarRespuestaSimple): Promise<RespuestaTareaSimple> {
    try {
      const response = await api.post(`/tareas/${tareaId}/respuestas`, data);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.mensaje || 'Error al guardar respuesta');
    }
  }

  // Obtener respuestas de una tarea (para psicólogos)
  async obtenerRespuestas(tareaId: string): Promise<RespuestaTareaSimple[]> {
    try {
      const response = await api.get(`/tareas/${tareaId}/respuestas`);
      return response.data.data.respuestas || [];
    } catch (error: any) {
      throw new Error(error.response?.data?.mensaje || 'Error al obtener respuestas');
    }
  }

  // Evaluar respuesta de tarea (para psicólogos)
  async evaluarRespuesta(respuestaId: string, data: any): Promise<RespuestaTareaSimple> {
    try {
      const response = await api.put(`/tareas/respuestas/${respuestaId}/evaluar`, data);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.mensaje || 'Error al evaluar respuesta');
    }
  }

  // Obtener estadísticas de tareas
  async obtenerEstadisticas(): Promise<{
    total: number;
    pendientes: number;
    completadas: number;
    vencidas: number;
  }> {
    try {
      const tareas = await this.obtenerTareas();
      
      return {
        total: tareas.length,
        pendientes: tareas.filter(t => t.estado === 'pendiente').length,
        completadas: tareas.filter(t => t.estado === 'completada').length,
        vencidas: tareas.filter(t => t.estado === 'vencida').length,
      };
    } catch (error: any) {
      throw new Error('Error al obtener estadísticas de tareas');
    }
  }

  // Obtener reporte de adherencia terapéutica
  async obtenerReporteAdherencia(filtros?: {
    paciente_id?: string;
    fecha_inicio?: string;
    fecha_fin?: string;
  }): Promise<any> {
    try {
      const params = new URLSearchParams();
      if (filtros?.paciente_id) params.append('paciente_id', filtros.paciente_id);
      if (filtros?.fecha_inicio) params.append('fecha_inicio', filtros.fecha_inicio);
      if (filtros?.fecha_fin) params.append('fecha_fin', filtros.fecha_fin);

      const response = await api.get(`/tareas/reporte-adherencia?${params.toString()}`);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.mensaje || 'Error al obtener reporte de adherencia');
    }
  }
}

export const tareasService = new TareasService();

// Exportar tipos para compatibilidad
export type { TareaSimple as Tarea, CrearTareaSimple as CrearTareaData, RespuestaTareaSimple as RespuestaTarea, GuardarRespuestaSimple as GuardarRespuestaData, FiltrosTareasSimple as FiltrosTareas }; 