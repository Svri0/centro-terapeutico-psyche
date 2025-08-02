import api from './api';

export interface Disponibilidad {
  id: string;
  psicologo_id: string;
  dia_semana: number;
  hora_inicio: string;
  hora_fin: string;
  activo: boolean;
  created_at: string;
  updated_at: string;
}

export interface CrearDisponibilidadData {
  psicologo_id: string;
  dia_semana: number;
  hora_inicio: string;
  hora_fin: string;
}

export interface ActualizarDisponibilidadData {
  dia_semana?: number;
  hora_inicio?: string;
  hora_fin?: string;
  activo?: boolean;
}

class DisponibilidadService {
  async obtenerDisponibilidad(): Promise<Disponibilidad[]> {
    try {
      const response = await api.get('/disponibilidad');
      return response.data.data.disponibilidad;
    } catch (error: any) {
      throw new Error(error.response?.data?.mensaje || 'Error al obtener disponibilidad');
    }
  }

  async crearDisponibilidad(data: CrearDisponibilidadData): Promise<Disponibilidad> {
    try {
      const response = await api.post('/disponibilidad', data);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.mensaje || 'Error al crear disponibilidad');
    }
  }

  async actualizarDisponibilidad(disponibilidad: Disponibilidad[]): Promise<any> {
    try {
      const response = await api.put('/disponibilidad', { disponibilidad });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.mensaje || 'Error al actualizar disponibilidad');
    }
  }

  async eliminarDisponibilidad(id: string): Promise<void> {
    try {
      await api.delete(`/disponibilidad/${id}`);
    } catch (error: any) {
      throw new Error(error.response?.data?.mensaje || 'Error al eliminar disponibilidad');
    }
  }

  async activarDisponibilidad(id: string): Promise<Disponibilidad> {
    try {
      const response = await api.patch(`/disponibilidad/${id}/activar`);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.mensaje || 'Error al activar disponibilidad');
    }
  }

  async desactivarDisponibilidad(id: string): Promise<Disponibilidad> {
    try {
      const response = await api.patch(`/disponibilidad/${id}/desactivar`);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.mensaje || 'Error al desactivar disponibilidad');
    }
  }
}

export const disponibilidadService = new DisponibilidadService(); 