import { api } from './api';

// Tipos para las citas
export interface Cita {
  id: string;
  paciente_id: string;
  psicologo_id: string;
  fecha: string;
  hora_inicio: string;
  hora_fin: string;
  duracion_minutos: number;
  estado: 'programada' | 'confirmada' | 'en_progreso' | 'completada' | 'cancelada' | 'no_show';
  tipo_sesion: 'individual' | 'grupal' | 'familiar' | 'evaluacion' | 'seguimiento';
  modalidad: 'presencial' | 'virtual' | 'telefonica';
  notas_paciente?: string;
  notas_psicologo?: string;
  recordatorio_enviado: boolean;
  created_at: string;
  updated_at: string;
  
  // Campos adicionales para mostrar información del paciente
  paciente_nombres?: string;
  paciente_apellidos?: string;
  paciente_email?: string;
  numero_ficha?: string;
  
  // Campos adicionales para mostrar información del psicólogo
  psicologo_nombres?: string;
  psicologo_apellidos?: string;
  psicologo_email?: string;
}

export interface CrearCitaData {
  paciente_id: string;
  fecha: string;
  hora_inicio: string;
  hora_fin: string;
  duracion_minutos: number;
  tipo_sesion: 'individual' | 'grupal' | 'familiar' | 'evaluacion' | 'seguimiento';
  modalidad: 'presencial' | 'virtual' | 'telefonica';
  notas_paciente?: string;
}

export interface ActualizarCitaData {
  fecha?: string;
  hora_inicio?: string;
  hora_fin?: string;
  duracion_minutos?: number;
  tipo_sesion?: 'individual' | 'grupal' | 'familiar' | 'evaluacion' | 'seguimiento';
  modalidad?: 'presencial' | 'virtual' | 'telefonica';
  notas_paciente?: string;
  notas_psicologo?: string;
}

// Respuestas de la API
interface CitasResponse {
  success: boolean;
  message: string;
  data: Cita[];
}

interface CitaResponse {
  success: boolean;
  message: string;
  data: Cita;
}

// Servicio de citas
class CitasService {
  // Obtener citas del psicólogo autenticado
  async obtenerCitasPsicologo(psicologoId: string): Promise<Cita[]> {
    try {
      const response = await api.get('/sesiones/psicologo');
      return response.data.data || [];
    } catch (error: any) {
      console.error('Error al obtener citas del psicólogo:', error);
      throw new Error(error.response?.data?.message || 'Error al obtener las citas');
    }
  }

  // Obtener citas del paciente autenticado
  async obtenerCitasPaciente(): Promise<any> {
    try {
      console.log('🔍 Servicio - Haciendo petición a /sesiones/paciente');
      const response = await api.get('/sesiones/paciente');
      console.log('🔍 Servicio - Respuesta completa:', response);
      console.log('🔍 Servicio - response.data:', response.data);
      console.log('🔍 Servicio - response.data.data:', response.data.data);
      
      // Devolver la respuesta completa para diagnóstico
      return response;
    } catch (error: any) {
      console.error('❌ Servicio - Error al obtener citas del paciente:', error);
      throw new Error(error.response?.data?.message || 'Error al obtener las citas');
    }
  }

  // Obtener una cita específica
  async obtenerCita(citaId: string): Promise<Cita> {
    try {
      const response = await api.get(`/sesiones/${citaId}`);
      return response.data.data;
    } catch (error: any) {
      console.error('Error al obtener cita:', error);
      throw new Error(error.response?.data?.message || 'Error al obtener la cita');
    }
  }

  // Crear una nueva cita
  async crearCita(citaData: CrearCitaData): Promise<Cita> {
    try {
      console.log('🔍 Enviando datos de cita:', citaData);
      console.log('🔍 URL de la API:', api.defaults.baseURL);
      const response = await api.post('/sesiones', citaData);
      console.log('✅ Respuesta exitosa:', response.data);
      return response.data.data;
    } catch (error: any) {
      console.error('❌ Error al crear cita:', error);
      console.error('❌ Detalles del error:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        url: error.config?.url,
        method: error.config?.method
      });
      throw new Error(error.response?.data?.message || 'Error al crear la cita');
    }
  }

  // Actualizar una cita
  async actualizarCita(citaId: string, citaData: ActualizarCitaData): Promise<Cita> {
    try {
      const response = await api.put(`/sesiones/${citaId}`, citaData);
      return response.data.data;
    } catch (error: any) {
      console.error('Error al actualizar cita:', error);
      throw new Error(error.response?.data?.message || 'Error al actualizar la cita');
    }
  }

  // Actualizar estado de una cita
  async actualizarEstadoCita(citaId: string, nuevoEstado: string): Promise<Cita> {
    try {
      const response = await api.patch(`/sesiones/${citaId}/estado`, { estado: nuevoEstado });
      return response.data.data;
    } catch (error: any) {
      console.error('Error al actualizar estado de cita:', error);
      throw new Error(error.response?.data?.message || 'Error al actualizar el estado de la cita');
    }
  }

  // Cancelar una cita
  async cancelarCita(citaId: string): Promise<void> {
    try {
      await api.delete(`/sesiones/${citaId}`);
    } catch (error: any) {
      console.error('Error al cancelar cita:', error);
      throw new Error(error.response?.data?.message || 'Error al cancelar la cita');
    }
  }

  // Obtener disponibilidad del psicólogo
  async obtenerDisponibilidad(psicologoId: string, fecha: string): Promise<any[]> {
    try {
      const response = await api.get(`/disponibilidad-mensual/psicologos/${psicologoId}/disponibilidad`, {
        params: { fecha }
      });
      return response.data.data || [];
    } catch (error: any) {
      console.error('Error al obtener disponibilidad:', error);
      throw new Error(error.response?.data?.message || 'Error al obtener la disponibilidad');
    }
  }

  // Obtener estadísticas de citas del psicólogo
  async obtenerEstadisticas(psicologoId: string): Promise<any> {
    try {
      const response = await api.get('/sesiones/psicologos/estadisticas-sesiones');
      return response.data.data;
    } catch (error: any) {
      console.error('Error al obtener estadísticas:', error);
      throw new Error(error.response?.data?.message || 'Error al obtener las estadísticas');
    }
  }
}

export const citasService = new CitasService(); 