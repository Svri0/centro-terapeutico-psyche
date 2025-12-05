import axios from 'axios';

const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3002/api/v1';

export interface SolicitudConsultaData {
  nombres: string;
  apellidos: string;
  email: string;
  telefono?: string;
  observaciones?: string;
}

export interface SolicitudConsultaResponse {
  id: string;
  nombres: string;
  apellidos: string;
  email: string;
  telefono?: string;
  numero_ficha: string;
  password_temporal: string;
  email_enviado: boolean;
}

class SolicitudesPublicasService {
  // Crear solicitud de consulta desde el homepage (público, no requiere autenticación)
  // Usamos axios directamente sin el interceptor para no enviar el token
  async crearSolicitudConsulta(data: SolicitudConsultaData): Promise<SolicitudConsultaResponse> {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/publico/solicitud-consulta`,
        data,
        {
          headers: {
            'Content-Type': 'application/json',
            // NO incluir Authorization header
          }
        }
      );
      return response.data.data;
    } catch (error: any) {
      console.error('Error al crear solicitud de consulta:', error);
      throw new Error(error.response?.data?.mensaje || 'Error al enviar la solicitud');
    }
  }
}

export const solicitudesPublicasService = new SolicitudesPublicasService();
export default solicitudesPublicasService;

