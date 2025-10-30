import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002/api/v1';

// Interfaz para la información del paciente
export interface InfoPaciente {
  id: string;
  numero_ficha: string;
  rut: string;
  direccion: string;
  contacto_emergencia_nombre: string;
  contacto_emergencia_telefono: string;
  contacto_emergencia_relacion: string;
  observaciones: string;
  fecha_ingreso: string;
  nombres: string;
  apellidos: string;
  email: string;
  telefono: string;
  fecha_nacimiento: string;
}

// Interfaz para el historial de sesiones
export interface HistorialSesion {
  id: string;
  fecha_sesion: string;
  duracion_minutos: number;
  resumen_sesion: string;
  notas_psicologo: string;
  estado: string;
  created_at: string;
}

// Interfaz para el estado de la sesión
export interface EstadoSesion {
  sesionId: string;
  estado: string;
  fechaInicio: string;
  duracionMinutos: number;
  tiempoTranscurrido: number;
  resumenSesion?: string;
  notasPsicologo?: string;
}

// Interfaz para iniciar sesión
export interface IniciarSesionResponse {
  sesionId: string;
  fechaInicio: string;
  duracionMinutos: number;
  tiempoTranscurrido?: number;
  esReanudacion: boolean;
}

// Interfaz para finalizar sesión
export interface FinalizarSesionRequest {
  resumenSesion: string;
  notasPsicologo: string;
}

export interface FinalizarSesionResponse {
  sesionId: string;
  duracionReal: number;
  fechaFin: string;
}

class SesionesTerapeuticasService {
  private getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  }

  // Obtener información del paciente para la sesión
  async obtenerInfoPaciente(pacienteId: string): Promise<InfoPaciente> {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/sesiones-terapeuticas/pacientes/${pacienteId}/info`,
        { headers: this.getAuthHeaders() }
      );
      return response.data.data;
    } catch (error: any) {
      console.error('Error al obtener información del paciente:', error);
      throw new Error(error.response?.data?.mensaje || 'Error al obtener información del paciente');
    }
  }

  // Obtener historial de sesiones del paciente
  async obtenerHistorialSesiones(pacienteId: string): Promise<HistorialSesion[]> {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/sesiones-terapeuticas/pacientes/${pacienteId}/historial`,
        { headers: this.getAuthHeaders() }
      );
      return response.data.data;
    } catch (error: any) {
      console.error('Error al obtener historial de sesiones:', error);
      throw new Error(error.response?.data?.mensaje || 'Error al obtener historial de sesiones');
    }
  }

  // Iniciar sesión terapéutica
  async iniciarSesion(citaId: string): Promise<IniciarSesionResponse> {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/sesiones-terapeuticas/citas/${citaId}/iniciar`,
        {},
        { headers: this.getAuthHeaders() }
      );
      return response.data.data;
    } catch (error: any) {
      console.error('Error al iniciar sesión:', error);
      throw new Error(error.response?.data?.mensaje || 'Error al iniciar sesión');
    }
  }

  // Finalizar sesión terapéutica
  async finalizarSesion(sesionId: string, datos: FinalizarSesionRequest): Promise<FinalizarSesionResponse> {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/sesiones-terapeuticas/sesiones/${sesionId}/finalizar`,
        datos,
        { headers: this.getAuthHeaders() }
      );
      return response.data.data;
    } catch (error: any) {
      console.error('Error al finalizar sesión:', error);
      throw new Error(error.response?.data?.mensaje || 'Error al finalizar sesión');
    }
  }

  // Obtener estado de sesión activa
  async obtenerEstadoSesion(citaId: string): Promise<EstadoSesion> {
    try {
      console.log('🔍 Obteniendo estado de sesión para cita:', citaId);
      const response = await axios.get(
        `${API_BASE_URL}/sesiones-terapeuticas/citas/${citaId}/estado`,
        { headers: this.getAuthHeaders() }
      );
      console.log('✅ Estado de sesión obtenido:', response.data.data);
      return response.data.data;
    } catch (error: any) {
      console.error('❌ Error al obtener estado de sesión:', error);
      if (error.response?.status === 404) {
        // No hay sesión activa, esto es normal
        throw new Error('No hay sesión activa para esta cita');
      }
      throw new Error(error.response?.data?.mensaje || 'Error al obtener estado de sesión');
    }
  }
}

export const sesionesTerapeuticasService = new SesionesTerapeuticasService();
