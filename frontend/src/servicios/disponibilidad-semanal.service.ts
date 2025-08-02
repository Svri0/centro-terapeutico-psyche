import api from './api';

export interface DisponibilidadSemanal {
  id?: string;
  psicologo_id: string;
  semana_inicio: string;
  semana_fin: string;
  lunes_horarios?: any[];
  martes_horarios?: any[];
  miercoles_horarios?: any[];
  jueves_horarios?: any[];
  viernes_horarios?: any[];
  sabado_horarios?: any[];
  domingo_horarios?: any[];
  total_horas_semana?: number;
  feriados?: any[];
  dias_vacaciones?: any[];
  estado?: 'borrador' | 'confirmada' | 'activa';
  created_at?: string;
  updated_at?: string;
}

export interface SemanaInfo {
  inicio: string;
  fin: string;
}

export interface DisponibilidadSemanalResponse {
  disponibilidad: DisponibilidadSemanal;
  semana: SemanaInfo;
}

class DisponibilidadSemanalService {
  async obtenerDisponibilidadSemanal(): Promise<DisponibilidadSemanalResponse> {
    try {
      const response = await api.get('/disponibilidad-semanal');
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.mensaje || 'Error al obtener disponibilidad semanal');
    }
  }

  async actualizarDisponibilidadSemanal(disponibilidad: DisponibilidadSemanal): Promise<any> {
    try {
      const response = await api.put('/disponibilidad-semanal', { disponibilidad });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.mensaje || 'Error al actualizar disponibilidad semanal');
    }
  }

  async verificarDisponibilidadPendiente(): Promise<any> {
    try {
      const response = await api.get('/disponibilidad-semanal/verificar');
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.mensaje || 'Error al verificar disponibilidad');
    }
  }

  async obtenerFeriadosSemana(semanaInicio: string, semanaFin: string): Promise<any[]> {
    try {
      const response = await api.get(`/disponibilidad-semanal/feriados/${semanaInicio}/${semanaFin}`);
      return response.data.data.feriados;
    } catch (error: any) {
      throw new Error(error.response?.data?.mensaje || 'Error al obtener feriados');
    }
  }
}

export const disponibilidadSemanalService = new DisponibilidadSemanalService(); 