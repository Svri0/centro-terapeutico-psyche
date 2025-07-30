import axios from 'axios';

const API_BASE_URL = 'http://localhost:3002/api/v1';

export interface Paciente {
  id: string;
  numero_ficha: string;
  rut?: string;
  estado: string;
  fecha_ingreso: string;
  puntos_acumulados: number;
  nombres: string;
  apellidos: string;
  email: string;
  telefono?: string;
  fecha_nacimiento?: string;
  genero?: string;
  activo: boolean;
  email_verificado: boolean;
  ultimo_acceso?: string;
}

export interface DatosPaciente {
  nombres: string;
  apellidos: string;
  email: string;
  telefono?: string;
  fecha_nacimiento?: string;
  genero?: string;
  rut?: string;
  direccion?: string;
  contacto_emergencia_nombre?: string;
  contacto_emergencia_telefono?: string;
  contacto_emergencia_relacion?: string;
  diagnosticos?: string[];
  etiquetas?: string[];
  estrategias_autorregulacion?: string[];
  observaciones?: string;
}

export interface ApiResponse<T> {
  exito: boolean;
  mensaje: string;
  data: T;
  codigo: string;
}

class PacientesService {
  private getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  }

  async obtenerPacientes(): Promise<Paciente[]> {
    try {
      const response = await axios.get<ApiResponse<Paciente[]>>(
        `${API_BASE_URL}/pacientes`,
        { headers: this.getAuthHeaders() }
      );
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.mensaje || 'Error al obtener pacientes');
    }
  }

  async obtenerPaciente(id: string): Promise<Paciente> {
    try {
      const response = await axios.get<ApiResponse<Paciente>>(
        `${API_BASE_URL}/pacientes/${id}`,
        { headers: this.getAuthHeaders() }
      );
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.mensaje || 'Error al obtener paciente');
    }
  }

  async crearPaciente(datos: DatosPaciente): Promise<any> {
    try {
      console.log('🔍 PacientesService - Intentando crear paciente');
      console.log('🔗 URL:', `${API_BASE_URL}/pacientes`);
      console.log('📋 Datos:', datos);
      console.log('🔑 Headers:', this.getAuthHeaders());
      
      const response = await axios.post<ApiResponse<any>>(
        `${API_BASE_URL}/pacientes`,
        datos,
        { headers: this.getAuthHeaders() }
      );
      
      console.log('✅ PacientesService - Respuesta exitosa:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ PacientesService - Error:', error);
      console.error('❌ PacientesService - Error response:', error.response);
      throw new Error(error.response?.data?.mensaje || 'Error al crear paciente');
    }
  }

  async verificarTokenRegistro(token: string): Promise<any> {
    try {
      const response = await axios.get<ApiResponse<any>>(
        `${API_BASE_URL}/pacientes/verificar-token/${token}`
      );
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.mensaje || 'Error al verificar token');
    }
  }

  async completarRegistroPaciente(datos: any): Promise<any> {
    try {
      const response = await axios.post<ApiResponse<any>>(
        `${API_BASE_URL}/pacientes/completar-registro`,
        datos
      );
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.mensaje || 'Error al completar registro');
    }
  }
}

export const pacientesService = new PacientesService(); 