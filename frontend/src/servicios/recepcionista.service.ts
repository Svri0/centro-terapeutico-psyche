import api from './api';

export interface Paciente {
  id: string;
  nombres: string;
  apellidos: string;
  email: string;
  telefono: string;
  fecha_nacimiento: string;
  genero: string;
  rut: string;
  direccion: string;
  contacto_emergencia: string;
  telefono_emergencia: string;
  observaciones: string;
  psicologo_id: string;
  numero_ficha: string;
  activo: boolean;
  created_at: string;
  updated_at: string;
}

export interface CrearPacienteData {
  nombres: string;
  apellidos: string;
  email: string;
  telefono: string;
  fecha_nacimiento: string;
  genero: string;
  rut: string;
  direccion: string;
  contacto_emergencia: string;
  telefono_emergencia: string;
  observaciones: string;
}

export interface PacienteCreado {
  paciente: Paciente;
  usuario: {
    id: string;
    email: string;
    password: string;
  };
}

class RecepcionistaService {
  async obtenerPacientes(): Promise<Paciente[]> {
    try {
      const response = await api.get('/admin/pacientes');
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.mensaje || 'Error al obtener pacientes');
    }
  }

  async crearPaciente(data: CrearPacienteData): Promise<PacienteCreado> {
    try {
      const response = await api.post('/admin/pacientes', data);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.mensaje || 'Error al crear paciente');
    }
  }
}

export default new RecepcionistaService(); 