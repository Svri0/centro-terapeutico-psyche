import axios from 'axios';

const API_BASE_URL = 'http://localhost:3002/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar token de autenticación
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface HorarioDisponible {
  hora_inicio: string;
  hora_fin: string;
  disponible: boolean;
}

export interface DisponibilidadResponse {
  fecha: string;
  psicologo_id: string;
  horarios: HorarioDisponible[];
}

export interface Cita {
  id: string;
  fecha: string;
  hora_inicio: string;
  hora_fin: string;
  duracion_minutos: number;
  estado: 'programada' | 'confirmada' | 'en_progreso' | 'completada' | 'cancelada' | 'no_show';
  tipo_sesion: 'individual' | 'grupal' | 'familiar' | 'evaluacion' | 'seguimiento';
  modalidad: 'presencial' | 'virtual' | 'telefonica';
  notas_paciente?: string;
  notas_psicologo?: string;
  created_at: string;
  psicologo_nombres?: string;
  psicologo_apellidos?: string;
  psicologo_email?: string;
  paciente_nombres?: string;
  paciente_apellidos?: string;
  paciente_email?: string;
  numero_ficha?: string;
}

export interface CrearCitaData {
  psicologo_id: string;
  fecha: string;
  hora_inicio: string;
  tipo_sesion?: 'individual' | 'grupal' | 'familiar' | 'evaluacion' | 'seguimiento';
  modalidad?: 'presencial' | 'virtual' | 'telefonica';
  notas_paciente?: string;
}

export interface CitasResponse {
  citas: Cita[];
}

class CitasService {
  // Obtener disponibilidad de un psicólogo para una fecha específica
  async obtenerDisponibilidad(psicologoId: string, fecha: string): Promise<DisponibilidadResponse> {
    try {
      const response = await api.get(`/citas/disponibilidad/${psicologoId}/${fecha}`);
      return response.data.data;
    } catch (error: any) {
      console.error('❌ CitasService - Error:', error);
      console.error('❌ CitasService - Error response:', error.response);
      throw error;
    }
  }

  // Crear una nueva cita
  async crearCita(data: CrearCitaData): Promise<Cita> {
    try {
      const response = await api.post('/citas', data);
      return response.data.data;
    } catch (error: any) {
      console.error('❌ CitasService - Error:', error);
      console.error('❌ CitasService - Error response:', error.response);
      throw error;
    }
  }

  // Obtener citas del paciente
  async obtenerCitasPaciente(): Promise<Cita[]> {
    try {
      const response = await api.get('/citas/paciente');
      return response.data.data.citas;
    } catch (error: any) {
      console.error('❌ CitasService - Error:', error);
      console.error('❌ CitasService - Error response:', error.response);
      throw error;
    }
  }

  // Obtener citas del psicólogo
  async obtenerCitasPsicologo(fecha?: string): Promise<Cita[]> {
    try {
      const params = fecha ? { fecha } : {};
      const response = await api.get('/citas/psicologo', { params });
      return response.data.data.citas;
    } catch (error: any) {
      console.error('❌ CitasService - Error:', error);
      console.error('❌ CitasService - Error response:', error.response);
      throw error;
    }
  }

  // Actualizar estado de una cita (psicólogo)
  async actualizarEstadoCita(citaId: string, estado: string, notas_psicologo?: string): Promise<any> {
    try {
      const data: any = { estado };
      if (notas_psicologo !== undefined) {
        data.notas_psicologo = notas_psicologo;
      }
      
      const response = await api.put(`/citas/${citaId}/estado`, data);
      return response.data.data;
    } catch (error: any) {
      console.error('❌ CitasService - Error:', error);
      console.error('❌ CitasService - Error response:', error.response);
      throw error;
    }
  }

  // Cancelar cita (paciente)
  async cancelarCita(citaId: string): Promise<any> {
    try {
      const response = await api.put(`/citas/${citaId}/cancelar`);
      return response.data.data;
    } catch (error: any) {
      console.error('❌ CitasService - Error:', error);
      console.error('❌ CitasService - Error response:', error.response);
      throw error;
    }
  }
}

export const citasService = new CitasService(); 