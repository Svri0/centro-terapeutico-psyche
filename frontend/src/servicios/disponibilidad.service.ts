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

export interface Disponibilidad {
  id: string;
  dia_semana: number;
  hora_inicio: string;
  hora_fin: string;
  activo: boolean;
}

export interface DisponibilidadResponse {
  disponibilidad: Disponibilidad[];
}

class DisponibilidadService {
  // Obtener disponibilidad de un psicólogo
  async obtenerDisponibilidad(psicologoId: string): Promise<Disponibilidad[]> {
    try {
      const response = await api.get(`/disponibilidad/${psicologoId}`);
      return response.data.data.disponibilidad;
    } catch (error: any) {
      console.error('❌ DisponibilidadService - Error:', error);
      console.error('❌ DisponibilidadService - Error response:', error.response);
      throw error;
    }
  }

  // Actualizar disponibilidad (solo psicólogos)
  async actualizarDisponibilidad(disponibilidad: Disponibilidad[]): Promise<any> {
    try {
      const response = await api.put('/disponibilidad', { disponibilidad });
      return response.data.data;
    } catch (error: any) {
      console.error('❌ DisponibilidadService - Error:', error);
      console.error('❌ DisponibilidadService - Error response:', error.response);
      throw error;
    }
  }
}

export const disponibilidadService = new DisponibilidadService(); 