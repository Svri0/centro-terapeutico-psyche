import api from './api';

export interface Paciente {
  id: string;
  nombres: string;
  apellidos: string;
  email: string;
  telefono?: string;
  fecha_nacimiento?: string;
  genero?: string;
  activo: boolean;
  created_at: string;
  updated_at: string;
  numero_ficha?: string;
  rut?: string;
  direccion?: string;
  contacto_emergencia_nombre?: string;
  contacto_emergencia_telefono?: string;
  contacto_emergencia_relacion?: string;
  antecedentes_medicos?: any[];
  medicacion_actual?: any[];
  alergias?: any[];
  condiciones_cronicas?: any[];
  historial_psiquiatrico?: any[];
  observaciones_medicas?: string;
}

export interface CrearPacienteData {
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
  observaciones?: string;
  antecedentes_medicos?: any[];
  medicacion_actual?: any[];
  alergias?: any[];
  condiciones_cronicas?: any[];
  historial_psiquiatrico?: any[];
  observaciones_medicas?: string;
}

export interface ActualizarPacienteData {
  nombres?: string;
  apellidos?: string;
  email?: string;
  telefono?: string;
  fecha_nacimiento?: string;
  genero?: string;
  rut?: string;
  direccion?: string;
  contacto_emergencia_nombre?: string;
  contacto_emergencia_telefono?: string;
  contacto_emergencia_relacion?: string;
  observaciones?: string;
  estado?: string;
  activo?: boolean;
}

export interface PacienteCreado extends Paciente {
  numero_ficha: string;
  password_temporal: string;
}

export interface PsicologoAsignado {
  id: string;
  nombres: string;
  apellidos: string;
  email: string;
  telefono?: string;
  especialidad?: string;
  descripcion?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

class PacientesService {
  async obtenerPacientes(): Promise<Paciente[]> {
    try {
      const response = await api.get('/pacientes');
      console.log('Respuesta del backend para pacientes:', response.data);
      
      // El backend devuelve: { data: { pacientes: [...], total: X, activos: Y } }
      if (response.data.data && response.data.data.pacientes && Array.isArray(response.data.data.pacientes)) {
        return response.data.data.pacientes;
      } else if (response.data.data && Array.isArray(response.data.data)) {
        return response.data.data;
      } else {
        return [];
      }
    } catch (error: any) {
      console.error('Error al obtener pacientes:', error);
      throw new Error(error.response?.data?.mensaje || 'Error al obtener pacientes');
    }
  }

  async buscarPacientes(termino: string): Promise<Paciente[]> {
    try {
      const response = await api.get(`/pacientes/buscar?q=${encodeURIComponent(termino)}`);
      console.log('Respuesta de búsqueda de pacientes:', response.data);
      
      // Manejar diferentes estructuras de respuesta
      if (response.data.data && Array.isArray(response.data.data)) {
        return response.data.data;
      } else if (Array.isArray(response.data.data)) {
        return response.data.data;
      } else {
        return [];
      }
    } catch (error: any) {
      console.error('Error al buscar pacientes:', error);
      throw new Error(error.response?.data?.mensaje || 'Error al buscar pacientes');
    }
  }

  async obtenerPacientePorId(id: string): Promise<Paciente> {
    try {
      const response = await api.get(`/pacientes/${id}`);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.mensaje || 'Error al obtener paciente');
    }
  }

  async crearPaciente(data: CrearPacienteData): Promise<Paciente> {
    try {
      console.log('Datos enviados para crear paciente:', data);
      const response = await api.post('/pacientes', data);
      console.log('Respuesta exitosa al crear paciente:', response.data);
      return response.data.data;
    } catch (error: any) {
      console.error('Error completo al crear paciente:', error);
      console.error('Respuesta del servidor:', error.response?.data);
      
      // Manejar diferentes tipos de errores
      if (error.response?.status === 409) {
        const mensaje = error.response?.data?.mensaje || 'Conflicto: El paciente ya existe';
        throw new Error(mensaje);
      } else if (error.response?.status === 400) {
        const mensaje = error.response?.data?.mensaje || 'Datos inválidos';
        throw new Error(mensaje);
      } else {
        throw new Error(error.response?.data?.mensaje || 'Error al crear paciente');
      }
    }
  }

  async actualizarPaciente(id: string, data: ActualizarPacienteData): Promise<Paciente> {
    try {
      const response = await api.put(`/pacientes/${id}`, data);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.mensaje || 'Error al actualizar paciente');
    }
  }

  async eliminarPaciente(id: string): Promise<void> {
    try {
      await api.delete(`/pacientes/${id}`);
    } catch (error: any) {
      throw new Error(error.response?.data?.mensaje || 'Error al eliminar paciente');
    }
  }

  async activarPaciente(id: string): Promise<Paciente> {
    try {
      const response = await api.patch(`/pacientes/${id}/activar`);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.mensaje || 'Error al activar paciente');
    }
  }

  async desactivarPaciente(id: string): Promise<Paciente> {
    try {
      const response = await api.patch(`/pacientes/${id}/desactivar`);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.mensaje || 'Error al desactivar paciente');
    }
  }

  async obtenerPsicologoAsignado(): Promise<PsicologoAsignado> {
    try {
      const response = await api.get('/pacientes/mi-psicologo/psicologo-asignado');
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.mensaje || 'Error al obtener el psicólogo asignado');
    }
  }
}

export const pacientesService = new PacientesService(); 