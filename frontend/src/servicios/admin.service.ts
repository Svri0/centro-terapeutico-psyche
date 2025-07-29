import axios from 'axios';

export interface Psicologo {
  id: string;
  nombres: string;
  apellidos: string;
  email: string;
  telefono?: string;
  fecha_nacimiento?: string;
  genero?: string;
  activo: boolean;
  email_verificado: boolean;
  ultimo_acceso?: string;
  created_at: string;
  rol_nombre: string;
}

export interface CrearPsicologoData {
  nombres: string;
  apellidos: string;
  email: string;
  password: string;
  telefono?: string;
  fecha_nacimiento?: string;
  genero?: string;
}

export interface ActualizarPsicologoData {
  nombres?: string;
  apellidos?: string;
  email?: string;
  telefono?: string;
  fecha_nacimiento?: string;
  genero?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  mensaje: string;
  codigo: string;
  timestamp: string;
}

class AdminService {
  async obtenerPsicologos(): Promise<Psicologo[]> {
    try {
      const response = await axios.get<ApiResponse<Psicologo[]>>('/admin/psicologos');
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.mensaje || 'Error al obtener psicólogos');
    }
  }

  async obtenerPsicologoPorId(id: string): Promise<Psicologo> {
    try {
      const response = await axios.get<ApiResponse<Psicologo>>(`/admin/psicologos/${id}`);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.mensaje || 'Error al obtener psicólogo');
    }
  }

  async crearPsicologo(data: CrearPsicologoData): Promise<{ usuario: any; token_activacion: string }> {
    try {
      const response = await axios.post<ApiResponse<{ usuario: any; token_activacion: string }>>('/admin/psicologos', data);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.mensaje || 'Error al crear psicólogo');
    }
  }

  async actualizarPsicologo(id: string, data: ActualizarPsicologoData): Promise<{ id: string; campos_actualizados: number }> {
    try {
      const response = await axios.put<ApiResponse<{ id: string; campos_actualizados: number }>>(`/admin/psicologos/${id}`, data);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.mensaje || 'Error al actualizar psicólogo');
    }
  }

  async desactivarPsicologo(id: string): Promise<{ id: string; nombres: string; apellidos: string; estado: string }> {
    try {
      const response = await axios.patch<ApiResponse<{ id: string; nombres: string; apellidos: string; estado: string }>>(`/admin/psicologos/${id}/desactivar`);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.mensaje || 'Error al desactivar psicólogo');
    }
  }

  async reactivarPsicologo(id: string): Promise<{ id: string; nombres: string; apellidos: string; estado: string }> {
    try {
      const response = await axios.patch<ApiResponse<{ id: string; nombres: string; apellidos: string; estado: string }>>(`/admin/psicologos/${id}/reactivar`);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.mensaje || 'Error al reactivar psicólogo');
    }
  }
}

export const adminService = new AdminService(); 