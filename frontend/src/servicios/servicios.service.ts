import { api } from './api';

export interface ServicioPsicologo {
  id: number;
  psicologo_id: string;
  tipo_servicio_id: string;
  nombre: string;
  descripcion: string;
  duracion: number;
  categoria: string;
  activo: boolean;
  created_at: string;
  updated_at: string;
}

export interface CrearServicioData {
  tipo_servicio_id: string;
  nombre: string;
  descripcion: string;
  duracion: number;
  categoria: string;
}

export interface ActualizarServicioData {
  nombre?: string;
  descripcion?: string;
  duracion?: number;
  categoria?: string;
  activo?: boolean;
}

export interface ServiciosResponse {
  success: boolean;
  data: ServicioPsicologo[];
  message?: string;
}

export interface ServicioResponse {
  success: boolean;
  data: ServicioPsicologo;
  message?: string;
}

// Obtener todos los servicios del psicólogo autenticado
export const obtenerServicios = async (): Promise<ServiciosResponse> => {
  try {
    const response = await api.get('/servicios');
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Error al obtener servicios');
  }
};

// Crear un nuevo servicio
export const crearServicio = async (servicioData: CrearServicioData): Promise<ServicioResponse> => {
  try {
    const response = await api.post('/servicios', servicioData);
    return response.data;
  } catch (error: any) {
    // Preservar el error original para que el frontend pueda acceder a response.status
    throw error;
  }
};

// Actualizar un servicio
export const actualizarServicio = async (id: number, servicioData: ActualizarServicioData): Promise<ServicioResponse> => {
  try {
    const response = await api.put(`/servicios/${id}`, servicioData);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Error al actualizar servicio');
  }
};

// Eliminar un servicio (soft delete)
export const eliminarServicio = async (id: number): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await api.delete(`/servicios/${id}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Error al eliminar servicio');
  }
};

// Obtener servicios de un psicólogo específico (para pacientes)
export const obtenerServiciosPsicologo = async (psicologoId: string): Promise<ServiciosResponse> => {
  try {
    const response = await api.get(`/servicios/psicologo/${psicologoId}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Error al obtener servicios del psicólogo');
  }
}; 