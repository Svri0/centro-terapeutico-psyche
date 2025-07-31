import api from './api';

export interface Cita {
  id: string;
  paciente_id: string;
  psicologo_id: string;
  fecha: string;
  hora: string;
  duracion: number;
  estado: string;
  notas?: string;
  created_at: string;
  updated_at: string;
  paciente?: {
    nombres: string;
    apellidos: string;
    email: string;
  };
  psicologo?: {
    nombres: string;
    apellidos: string;
    email: string;
  };
}

export interface CrearCitaData {
  paciente_id: string;
  psicologo_id: string;
  fecha: string;
  hora: string;
  duracion: number;
  notas?: string;
}

export interface ActualizarCitaData {
  fecha?: string;
  hora?: string;
  duracion?: number;
  estado?: string;
  notas?: string;
}

class CitasService {
  async obtenerCitas(): Promise<Cita[]> {
    try {
      const response = await api.get('/citas');
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.mensaje || 'Error al obtener citas');
    }
  }

  async obtenerCitaPorId(id: string): Promise<Cita> {
    try {
      const response = await api.get(`/citas/${id}`);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.mensaje || 'Error al obtener cita');
    }
  }

  async crearCita(data: CrearCitaData): Promise<Cita> {
    try {
      const response = await api.post('/citas', data);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.mensaje || 'Error al crear cita');
    }
  }

  async actualizarCita(id: string, data: ActualizarCitaData): Promise<Cita> {
    try {
      const response = await api.put(`/citas/${id}`, data);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.mensaje || 'Error al actualizar cita');
    }
  }

  async eliminarCita(id: string): Promise<void> {
    try {
      await api.delete(`/citas/${id}`);
    } catch (error: any) {
      throw new Error(error.response?.data?.mensaje || 'Error al eliminar cita');
    }
  }

  async cancelarCita(id: string): Promise<Cita> {
    try {
      const response = await api.patch(`/citas/${id}/cancelar`);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.mensaje || 'Error al cancelar cita');
    }
  }

  async confirmarCita(id: string): Promise<Cita> {
    try {
      const response = await api.patch(`/citas/${id}/confirmar`);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.mensaje || 'Error al confirmar cita');
    }
  }
}

export const citasService = new CitasService(); 