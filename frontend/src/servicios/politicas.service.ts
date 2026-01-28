import api from './api';

export interface PoliticaSeccion {
  titulo: string;
  contenido: string;
}

export interface PoliticaContenido {
  secciones: PoliticaSeccion[];
}

export interface Politica {
  id: string;
  tipo: 'seguridad' | 'privacidad';
  titulo: string;
  contenido: PoliticaContenido;
  version: number;
  activo: boolean;
  created_at: string;
  updated_at: string;
}

class PoliticasService {
  /**
   * Obtener todas las políticas activas
   */
  async obtenerPoliticas(tipo?: 'seguridad' | 'privacidad'): Promise<Politica[]> {
    try {
      const params = tipo ? { tipo } : {};
      const response = await api.get('/politicas', { params });
      return response.data.data || [];
    } catch (error: any) {
      console.error('Error al obtener políticas:', error);
      throw new Error(error.response?.data?.mensaje || 'Error al obtener las políticas');
    }
  }

  /**
   * Obtener una política por tipo
   */
  async obtenerPoliticaPorTipo(tipo: 'seguridad' | 'privacidad'): Promise<Politica | null> {
    try {
      const response = await api.get(`/politicas/${tipo}`);
      return response.data.data || null;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      console.error('Error al obtener política:', error);
      throw new Error(error.response?.data?.mensaje || 'Error al obtener la política');
    }
  }

  /**
   * Crear o actualizar una política (solo administradores)
   */
  async crearActualizarPolitica(
    tipo: 'seguridad' | 'privacidad',
    titulo: string,
    contenido: PoliticaContenido,
    version?: number
  ): Promise<Politica> {
    try {
      const response = await api.post('/politicas', {
        tipo,
        titulo,
        contenido,
        version,
      });
      return response.data.data;
    } catch (error: any) {
      console.error('Error al crear/actualizar política:', error);
      throw new Error(error.response?.data?.mensaje || 'Error al crear/actualizar la política');
    }
  }

  /**
   * Obtener historial de versiones de una política (solo administradores)
   */
  async obtenerHistorialPolitica(tipo: 'seguridad' | 'privacidad'): Promise<Politica[]> {
    try {
      const response = await api.get(`/politicas/${tipo}/historial`);
      return response.data.data || [];
    } catch (error: any) {
      console.error('Error al obtener historial de política:', error);
      throw new Error(error.response?.data?.mensaje || 'Error al obtener el historial de políticas');
    }
  }
}

export const politicasService = new PoliticasService();
