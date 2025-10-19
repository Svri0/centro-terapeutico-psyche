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
  codigo_sbs?: string;
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
  codigo_sbs?: string;
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
  codigo_sbs?: string;
  avatar_url?: string;
  activo?: boolean;
}

export interface Recepcionista {
  id: string;
  nombres: string;
  apellidos: string;
  email: string;
  telefono?: string;
  activo: boolean;
  email_verificado: boolean;
  created_at: string;
  updated_at: string;
  avatar_url?: string;
}

export interface CrearRecepcionistaData {
  nombres: string;
  apellidos: string;
  email: string;
  password: string;
  telefono?: string;
  avatar_url?: string;
}

export interface LogAuditoria {
  id: string;
  usuario_id?: string;
  accion: string;
  tabla_afectada?: string;
  registro_id?: string;
  valores_anteriores?: any;
  valores_nuevos?: any;
  ip_address?: string;
  user_agent?: string;
  metadatos: any;
  created_at: string;
}

export interface EstadisticasAuditoria {
  estadisticas_por_accion: Array<{
    accion: string;
    total: number;
  }>;
  estadisticas_diarias: Array<{
    fecha: string;
    total: number;
  }>;
  total_acciones: number;
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

  // Funciones para Recepcionistas
  async obtenerRecepcionistas(): Promise<Recepcionista[]> {
    try {
      const response = await api.get('/admin/recepcionistas');
      return response.data?.data || [];
    } catch (error: any) {
      console.error('Error al obtener recepcionistas:', error);
      return [];
    }
  }

  async crearRecepcionista(data: CrearRecepcionistaData, avatar?: File): Promise<Recepcionista> {
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
      
      const response = await api.post('/admin/recepcionistas', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.mensaje || 'Error al crear recepcionista');
    }
  }

  async actualizarRecepcionista(id: string, data: Partial<CrearRecepcionistaData>, avatar?: File): Promise<Recepcionista> {
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
      
      const response = await api.put(`/admin/recepcionistas/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.mensaje || 'Error al actualizar recepcionista');
    }
  }

  async eliminarRecepcionista(id: string): Promise<void> {
    try {
      await api.delete(`/admin/recepcionistas/${id}`);
    } catch (error: any) {
      throw new Error(error.response?.data?.mensaje || 'Error al eliminar recepcionista');
    }
  }

  async activarRecepcionista(id: string): Promise<Recepcionista> {
    try {
      const response = await api.patch(`/admin/recepcionistas/${id}/reactivar`);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.mensaje || 'Error al activar recepcionista');
    }
  }

  async desactivarRecepcionista(id: string): Promise<Recepcionista> {
    try {
      const response = await api.patch(`/admin/recepcionistas/${id}/desactivar`);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.mensaje || 'Error al desactivar recepcionista');
    }
  }

  // Funciones para Pacientes (para administradores)
  async obtenerTodosPacientes(): Promise<any[]> {
    try {
      const response = await api.get('/admin/pacientes');
      return response.data?.data?.pacientes || [];
    } catch (error: any) {
      console.error('Error al obtener pacientes:', error);
      return [];
    }
  }

  async crearPaciente(data: any): Promise<any> {
    try {
      const response = await api.post('/admin/pacientes', data);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.mensaje || 'Error al crear paciente');
    }
  }

  async actualizarPaciente(id: string, data: any): Promise<any> {
    try {
      const response = await api.put(`/admin/pacientes/${id}`, data);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.mensaje || 'Error al actualizar paciente');
    }
  }

  async eliminarPaciente(id: string): Promise<void> {
    try {
      await api.delete(`/admin/pacientes/${id}`);
    } catch (error: any) {
      throw new Error(error.response?.data?.mensaje || 'Error al eliminar paciente');
    }
  }

  async activarPaciente(id: string): Promise<any> {
    try {
      const response = await api.patch(`/admin/pacientes/${id}/activar`);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.mensaje || 'Error al activar paciente');
    }
  }

  async desactivarPaciente(id: string): Promise<any> {
    try {
      const response = await api.patch(`/admin/pacientes/${id}/desactivar`);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.mensaje || 'Error al desactivar paciente');
    }
  }

  // Funciones para Auditoría
  async obtenerLogsAuditoria(params?: {
    limit?: number;
    offset?: number;
    accion?: string;
    fecha_inicio?: string;
    fecha_fin?: string;
  }): Promise<{ logs: LogAuditoria[]; total: number }> {
    try {
      const response = await api.get('/admin/auditoria/logs', { params });
      return {
        logs: response.data?.data?.logs || [],
        total: response.data?.data?.total || 0
      };
    } catch (error: any) {
      console.error('Error al obtener logs de auditoría:', error);
      return { logs: [], total: 0 };
    }
  }

  async obtenerEstadisticasAuditoria(params?: {
    fecha_inicio?: string;
    fecha_fin?: string;
  }): Promise<EstadisticasAuditoria> {
    try {
      const response = await api.get('/admin/auditoria/estadisticas', { params });
      return response.data?.data || {
        estadisticas_por_accion: [],
        estadisticas_diarias: [],
        total_acciones: 0
      };
    } catch (error: any) {
      console.error('Error al obtener estadísticas de auditoría:', error);
      return {
        estadisticas_por_accion: [],
        estadisticas_diarias: [],
        total_acciones: 0
      };
    }
  }
}

export const adminService = new AdminService(); 