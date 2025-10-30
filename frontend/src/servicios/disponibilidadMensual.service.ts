import api from './api';

// Usar el puerto correcto 3006
const API_BASE_URL = 'http://localhost:3002/api/v1';

export interface DisponibilidadMensual {
  id?: number;
  psicologo_id: string;
  fecha: string; // YYYY-MM-DD
  hora_inicio: string;
  hora_fin: string;
  activo: boolean;
  tipo_disponibilidad: 'individual' | 'recurrente';
  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
}

export interface CrearDisponibilidadMensualData {
  psicologo_id: string;
  fecha: string;
  hora_inicio: string;
  hora_fin: string;
  activo: boolean;
  tipo_disponibilidad?: 'individual' | 'recurrente';
}

export interface ActualizarDisponibilidadMensualData {
  hora_inicio?: string;
  hora_fin?: string;
  activo?: boolean;
  tipo_disponibilidad?: 'individual' | 'recurrente';
}

class DisponibilidadMensualService {
  // Obtener disponibilidad mensual de un psicólogo
  async obtenerDisponibilidadMensual(
    psicologoId: string, 
    mes: number, 
    año: number
  ): Promise<DisponibilidadMensual[]> {
    try {
      console.log('🔍 Debug - obtenerDisponibilidadMensual - psicologoId:', psicologoId);
      console.log('🔍 Debug - obtenerDisponibilidadMensual - mes:', mes, 'año:', año);
      
      const response = await api.get(`/disponibilidad-mensual/psicologo/${psicologoId}`, {
        params: { mes, año }
      });
      
      console.log('🔍 Debug - obtenerDisponibilidadMensual - response:', response.data);
      
      const data = response.data.data;
      return Array.isArray(data) ? data : [];
    } catch (error: any) {
      console.error('Error al obtener disponibilidad mensual:', error);
      console.error('🔍 Debug - obtenerDisponibilidadMensual - error response:', error.response);
      throw new Error(error.response?.data?.mensaje || 'Error al obtener la disponibilidad mensual');
    }
  }

  // Crear nueva disponibilidad mensual
  async crearDisponibilidadMensual(data: CrearDisponibilidadMensualData): Promise<DisponibilidadMensual> {
    try {
      const response = await api.post('/disponibilidad-mensual', data);
      return response.data.data;
    } catch (error: any) {
      console.error('Error al crear disponibilidad mensual:', error);
      throw new Error(error.response?.data?.mensaje || 'Error al crear la disponibilidad mensual');
    }
  }

  // Actualizar disponibilidad mensual existente
  async actualizarDisponibilidadMensual(
    id: number, 
    data: ActualizarDisponibilidadMensualData
  ): Promise<DisponibilidadMensual> {
    try {
      const response = await api.put(`/disponibilidad-mensual/${id}`, data);
      return response.data.data;
    } catch (error: any) {
      console.error('Error al actualizar disponibilidad mensual:', error);
      throw new Error(error.response?.data?.mensaje || 'Error al actualizar la disponibilidad mensual');
    }
  }

  // Actualizar múltiples disponibilidades mensuales
  async actualizarDisponibilidadMensualMultiple(
    psicologoId: string, 
    disponibilidades: DisponibilidadMensual[]
  ): Promise<DisponibilidadMensual[]> {
    try {
      console.log('🔍 Debug - actualizarDisponibilidadMensualMultiple - URL:', `/disponibilidad-mensual/psicologo/${psicologoId}`);
      console.log('🔍 Debug - actualizarDisponibilidadMensualMultiple - data:', { disponibilidades });
      
      const response = await api.put(`/disponibilidad-mensual/psicologo/${psicologoId}`, {
        disponibilidades
      });
      return response.data.data || [];
    } catch (error: any) {
      console.error('Error al actualizar disponibilidad mensual múltiple:', error);
      console.error('🔍 Debug - actualizarDisponibilidadMensualMultiple - error response:', error.response);
      throw new Error(error.response?.data?.mensaje || 'Error al actualizar la disponibilidad mensual');
    }
  }

  // Eliminar disponibilidad mensual
  async eliminarDisponibilidadMensual(id: number): Promise<void> {
    try {
      await api.delete(`/disponibilidad-mensual/${id}`);
    } catch (error: any) {
      console.error('Error al eliminar disponibilidad mensual:', error);
      throw new Error(error.response?.data?.mensaje || 'Error al eliminar la disponibilidad mensual');
    }
  }

  // Verificar disponibilidad para una fecha específica
  async verificarDisponibilidadFecha(
    psicologoId: string, 
    fecha: string
  ): Promise<{
    disponible: boolean;
    horarios?: { inicio: string; fin: string };
  }> {
    try {
      const response = await api.get(`/disponibilidad-mensual/verificar/${psicologoId}`, {
        params: { fecha }
      });
      return response.data.data;
    } catch (error: any) {
      console.error('Error al verificar disponibilidad fecha:', error);
      throw new Error(error.response?.data?.mensaje || 'Error al verificar la disponibilidad');
    }
  }

  // Generar disponibilidad recurrente
  async generarDisponibilidadRecurrente(
    psicologoId: string,
    fechaInicio: string,
    fechaFin: string,
    horarios: Record<number, { hora_inicio: string; hora_fin: string; activo: boolean }>
  ): Promise<DisponibilidadMensual[]> {
    try {
      const response = await api.post(`/disponibilidad-mensual/psicologo/${psicologoId}/recurrente`, {
        fechaInicio,
        fechaFin,
        horarios
      });
      return response.data.data || [];
    } catch (error: any) {
      console.error('Error al generar disponibilidad recurrente:', error);
      throw new Error(error.response?.data?.mensaje || 'Error al generar disponibilidad recurrente');
    }
  }

  // Obtener disponibilidad para un paciente (días disponibles en un mes)
  async obtenerDisponibilidadPaciente(
    psicologoId: string, 
    mes: number, 
    año: number
  ): Promise<{
    diasDisponibles: string[];
    horariosPorDia: Record<string, { inicio: string; fin: string }>;
  }> {
    try {
      console.log('🔍 Debug - obtenerDisponibilidadPaciente - Iniciando:', { psicologoId, mes, año });
      
      const disponibilidad = await this.obtenerDisponibilidadMensual(psicologoId, mes, año);
      console.log('🔍 Debug - obtenerDisponibilidadPaciente - Disponibilidad raw:', disponibilidad);
      
      const diasDisponibles = disponibilidad
        .filter(d => d.activo)
        .map(d => d.fecha);
      
      console.log('🔍 Debug - obtenerDisponibilidadPaciente - Días disponibles:', diasDisponibles);
      
      const horariosPorDia = disponibilidad
        .filter(d => d.activo)
        .reduce((acc, d) => {
          acc[d.fecha] = {
            inicio: d.hora_inicio,
            fin: d.hora_fin
          };
          return acc;
        }, {} as Record<string, { inicio: string; fin: string }>);

      console.log('🔍 Debug - obtenerDisponibilidadPaciente - Horarios por día:', horariosPorDia);

      const resultado = {
        diasDisponibles,
        horariosPorDia
      };
      
      console.log('🔍 Debug - obtenerDisponibilidadPaciente - Resultado final:', resultado);
      
      return resultado;
    } catch (error: any) {
      console.error('❌ Error al obtener disponibilidad para paciente:', error);
      throw new Error(error.response?.data?.mensaje || 'Error al obtener la disponibilidad');
    }
  }
}

const disponibilidadMensualService = new DisponibilidadMensualService();
export default disponibilidadMensualService;
