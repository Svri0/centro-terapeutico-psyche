import api from './api';

export interface Horario {
  hora: string;
  lunes: string;
  martes: string;
  miercoles: string;
  jueves: string;
  viernes: string;
  sabado: string;
  domingo: string;
}

export interface HorarioCompleto {
  especialidad: string;
  horario: Horario[];
  tipo: 'ejemplo' | 'real';
}

class HorariosService {
  async obtenerEspecialidades(): Promise<string[]> {
    try {
      const response = await api.get('/admin/horarios/especialidades');
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.mensaje || 'Error al obtener especialidades');
    }
  }

  async obtenerHorariosPorEspecialidad(especialidad: string): Promise<HorarioCompleto> {
    try {
      const response = await api.get(`/admin/horarios/especialidad/${encodeURIComponent(especialidad)}`);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.mensaje || 'Error al obtener horarios');
    }
  }

  async obtenerTodosLosHorarios(): Promise<HorarioCompleto[]> {
    try {
      const response = await api.get('/admin/horarios/todos');
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.mensaje || 'Error al obtener todos los horarios');
    }
  }
}

export default new HorariosService(); 