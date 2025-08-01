import api from './api';

export interface Psicologo {
  id: string;
  nombres: string;
  apellidos: string;
  email: string;
  telefono?: string;
  fecha_nacimiento?: string;
  genero?: string;
  especialidad?: string;
  descripcion?: string;
  avatar_url?: string;
  activo: boolean;
  email_verificado: boolean;
  ultimo_acceso?: string;
  created_at: string;
  updated_at: string;
}

export interface CrearPsicologoData {
  nombres: string;
  apellidos: string;
  email: string;
  password: string;
  telefono?: string;
  fecha_nacimiento?: string;
  genero?: string;
  especialidad?: string;
  descripcion?: string;
  avatar_url?: string;
}

export interface ActualizarPsicologoData {
  nombres?: string;
  apellidos?: string;
  email?: string;
  telefono?: string;
  fecha_nacimiento?: string;
  genero?: string;
  especialidad?: string;
  descripcion?: string;
  avatar_url?: string;
  activo?: boolean;
}

class AdminService {
  async obtenerPsicologos(): Promise<Psicologo[]> {
    try {
      const response = await api.get('/admin/psicologos');
      return response.data?.data || [];
    } catch (error: any) {
      console.error('Error al obtener psicólogos:', error);
      return [];
    }
  }

  async crearPsicologo(data: CrearPsicologoData, avatar?: File): Promise<Psicologo> {
    try {
      const formData = new FormData();
      
      // Agregar todos los campos de texto
      Object.keys(data).forEach(key => {
        const value = (data as any)[key];
        if (value !== undefined && value !== null && value !== '') {
          formData.append(key, value);
        }
      });
      
      // Agregar el archivo si existe
      if (avatar) {
        formData.append('avatar', avatar);
      }
      
      const response = await api.post('/admin/psicologos', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.mensaje || 'Error al crear psicólogo');
    }
  }

  async actualizarPsicologo(id: string, data: ActualizarPsicologoData, avatar?: File): Promise<Psicologo> {
    try {
      const formData = new FormData();
      
      // Agregar todos los campos de texto
      Object.keys(data).forEach(key => {
        const value = (data as any)[key];
        if (value !== undefined && value !== null && value !== '') {
          formData.append(key, value);
        }
      });
      
      // Agregar el archivo si existe
      if (avatar) {
        formData.append('avatar', avatar);
      }
      
      const response = await api.put(`/admin/psicologos/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.mensaje || 'Error al actualizar psicólogo');
    }
  }

  async eliminarPsicologo(id: string): Promise<void> {
    try {
      await api.delete(`/admin/psicologos/${id}`);
    } catch (error: any) {
      throw new Error(error.response?.data?.mensaje || 'Error al eliminar psicólogo');
    }
  }

  async activarPsicologo(id: string): Promise<Psicologo> {
    try {
      const response = await api.patch(`/admin/psicologos/${id}/reactivar`);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.mensaje || 'Error al activar psicólogo');
    }
  }

  async desactivarPsicologo(id: string): Promise<Psicologo> {
    try {
      const response = await api.patch(`/admin/psicologos/${id}/desactivar`);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.mensaje || 'Error al desactivar psicólogo');
    }
  }

  // Obtener pacientes de un psicólogo
  async obtenerPacientesPsicologo(id: string): Promise<any> {
    try {
      const response = await api.get(`/admin/psicologos/${id}/pacientes`);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.mensaje || 'Error al obtener pacientes del psicólogo');
    }
  }

  // Obtener citas de un psicólogo
  async obtenerCitasPsicologo(id: string): Promise<any> {
    try {
      const response = await api.get(`/admin/psicologos/${id}/citas`);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.mensaje || 'Error al obtener citas del psicólogo');
    }
  }

  // Eliminar cita específica
  async eliminarCita(id: string): Promise<any> {
    try {
      const response = await api.delete(`/admin/citas/${id}`);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.mensaje || 'Error al eliminar cita');
    }
  }

  // Reasignar paciente a otro psicólogo
  async reasignarPaciente(pacienteId: string, nuevoPsicologoId: string): Promise<any> {
    try {
      const response = await api.post('/admin/pacientes/reasignar', {
        pacienteId,
        nuevoPsicologoId
      });
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.mensaje || 'Error al reasignar paciente');
    }
  }

  // Obtener psicólogos disponibles para reasignación
  async obtenerPsicologosDisponibles(excludeId?: string): Promise<any> {
    try {
      const params = excludeId ? { excludeId } : {};
      const response = await api.get('/admin/psicologos/disponibles', { params });
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.mensaje || 'Error al obtener psicólogos disponibles');
    }
  }
}

export const adminService = new AdminService(); 