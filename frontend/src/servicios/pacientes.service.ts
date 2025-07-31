import api from './api';

export interface Paciente {
  id: string;
  nombres: string;
  apellidos: string;
  email: string;
  telefono?: string;
  fecha_nacimiento?: string;
  genero?: string;
  activo: boolean;
  created_at: string;
  updated_at: string;
}

export interface CrearPacienteData {
  nombres: string;
  apellidos: string;
  email: string;
  password: string;
  telefono?: string;
  fecha_nacimiento?: string;
  genero?: string;
}

export interface ActualizarPacienteData {
  nombres?: string;
  apellidos?: string;
  email?: string;
  telefono?: string;
  fecha_nacimiento?: string;
  genero?: string;
  activo?: boolean;
}

class PacientesService {
  async obtenerPacientes(): Promise<Paciente[]> {
    try {
      const response = await api.get('/pacientes');
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.mensaje || 'Error al obtener pacientes');
    }
  }

  async obtenerPacientePorId(id: string): Promise<Paciente> {
    try {
      const response = await api.get(`/pacientes/${id}`);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.mensaje || 'Error al obtener paciente');
    }
  }

  async crearPaciente(data: CrearPacienteData): Promise<Paciente> {
    try {
      const response = await api.post('/pacientes', data);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.mensaje || 'Error al crear paciente');
    }
  }

  async actualizarPaciente(id: string, data: ActualizarPacienteData): Promise<Paciente> {
    try {
      const response = await api.put(`/pacientes/${id}`, data);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.mensaje || 'Error al actualizar paciente');
    }
  }

  async eliminarPaciente(id: string): Promise<void> {
    try {
      await api.delete(`/pacientes/${id}`);
    } catch (error: any) {
      throw new Error(error.response?.data?.mensaje || 'Error al eliminar paciente');
    }
  }

  async activarPaciente(id: string): Promise<Paciente> {
    try {
      const response = await api.patch(`/pacientes/${id}/activar`);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.mensaje || 'Error al activar paciente');
    }
  }

  async desactivarPaciente(id: string): Promise<Paciente> {
    try {
      const response = await api.patch(`/pacientes/${id}/desactivar`);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.mensaje || 'Error al desactivar paciente');
    }
  }
}

export const pacientesService = new PacientesService(); 