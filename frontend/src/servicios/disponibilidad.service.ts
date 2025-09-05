import api from './api';

export interface Disponibilidad {
  id?: string;
  psicologo_id: string;
  dia_semana: number; // 1=Lunes, 2=Martes, ..., 7=Domingo
  hora_inicio: string;
  hora_fin: string;
  activo: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CrearDisponibilidadData {
  psicologo_id: string;
  dia_semana: number;
  hora_inicio: string;
  hora_fin: string;
  activo: boolean;
}

export interface ActualizarDisponibilidadData {
  hora_inicio?: string;
  hora_fin?: string;
  activo?: boolean;
}

class DisponibilidadService {
  // Obtener disponibilidad de un psicólogo
  async obtenerDisponibilidad(psicologoId: string): Promise<Disponibilidad[]> {
    try {
      console.log('🔍 Debug - obtenerDisponibilidad - psicologoId:', psicologoId);
      console.log('🔍 Debug - obtenerDisponibilidad - URL:', `/disponibilidad/psicologo/${psicologoId}`);
      
      const response = await api.get(`/disponibilidad/psicologo/${psicologoId}`);
      console.log('🔍 Debug - obtenerDisponibilidad - response:', response.data);
      
      // Asegurar que siempre devolvemos un array
      const data = response.data.data;
      return Array.isArray(data) ? data : [];
    } catch (error: any) {
      console.error('Error al obtener disponibilidad:', error);
      console.error('🔍 Debug - obtenerDisponibilidad - error response:', error.response);
      throw new Error(error.response?.data?.mensaje || 'Error al obtener la disponibilidad');
    }
  }

  // Crear nueva disponibilidad
  async crearDisponibilidad(data: CrearDisponibilidadData): Promise<Disponibilidad> {
    try {
      const response = await api.post('/disponibilidad', data);
      return response.data.data;
    } catch (error: any) {
      console.error('Error al crear disponibilidad:', error);
      throw new Error(error.response?.data?.mensaje || 'Error al crear la disponibilidad');
    }
  }

  // Actualizar disponibilidad existente
  async actualizarDisponibilidad(id: string, data: ActualizarDisponibilidadData): Promise<Disponibilidad> {
    try {
      const response = await api.put(`/disponibilidad/${id}`, data);
      return response.data.data;
    } catch (error: any) {
      console.error('Error al actualizar disponibilidad:', error);
      throw new Error(error.response?.data?.mensaje || 'Error al actualizar la disponibilidad');
    }
  }

  // Actualizar múltiples disponibilidades (para el psicólogo)
  async actualizarDisponibilidadMultiple(psicologoId: string, disponibilidades: Disponibilidad[]): Promise<Disponibilidad[]> {
    try {
      console.log('🔍 Debug - URL:', `/disponibilidad/psicologo/${psicologoId}`);
      console.log('🔍 Debug - Data:', { disponibilidades });
      
      const response = await api.put(`/disponibilidad/psicologo/${psicologoId}`, {
        disponibilidades
      });
      return response.data.data || [];
    } catch (error: any) {
      console.error('Error al actualizar disponibilidad múltiple:', error);
      console.error('🔍 Debug - Error response:', error.response);
      throw new Error(error.response?.data?.mensaje || 'Error al actualizar la disponibilidad');
    }
  }

  // Obtener disponibilidad para un paciente (días disponibles)
  async obtenerDisponibilidadPaciente(psicologoId: string, fecha?: string): Promise<{
    diasDisponibles: string[];
    horariosPorDia: Record<string, { inicio: string; fin: string }>;
  }> {
    try {
      const params = fecha ? { fecha } : {};
      const response = await api.get(`/disponibilidad/paciente/${psicologoId}`, { params });
      return response.data.data;
    } catch (error: any) {
      console.error('Error al obtener disponibilidad para paciente:', error);
      throw new Error(error.response?.data?.mensaje || 'Error al obtener la disponibilidad');
    }
  }

  // Verificar si un día específico está disponible
  async verificarDisponibilidadDia(psicologoId: string, fecha: string): Promise<{
    disponible: boolean;
    horarios?: { inicio: string; fin: string };
  }> {
    try {
      const response = await api.get(`/disponibilidad/verificar/${psicologoId}`, {
        params: { fecha }
      });
      return response.data.data;
    } catch (error: any) {
      console.error('Error al verificar disponibilidad:', error);
      throw new Error(error.response?.data?.mensaje || 'Error al verificar la disponibilidad');
    }
  }
}

const disponibilidadService = new DisponibilidadService();
export default disponibilidadService; 