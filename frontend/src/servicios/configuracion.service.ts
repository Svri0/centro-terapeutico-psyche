import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002';

export type TipoConfiguracion = 'boolean' | 'number' | 'string' | 'json';
export type CategoriaConfiguracion = 'chat' | 'mensajes' | 'general' | 'backup';

export interface ConfiguracionSistema {
  id: string;
  clave: string;
  valor: string;
  descripcion?: string;
  tipo: TipoConfiguracion;
  categoria: CategoriaConfiguracion;
  activo: boolean;
  created_at: string;
  updated_at: string;
}

class ConfiguracionService {
  private getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  }

  async listar(categoria?: string): Promise<ConfiguracionSistema[]> {
    const response = await axios.get(`${API_BASE_URL}/api/v1/configuracion`, {
      headers: this.getAuthHeaders(),
      params: categoria ? { categoria } : undefined
    });
    return response.data.data;
  }

  async obtener(clave: string): Promise<ConfiguracionSistema> {
    const response = await axios.get(`${API_BASE_URL}/api/v1/configuracion/${encodeURIComponent(clave)}`, {
      headers: this.getAuthHeaders()
    });
    return response.data.data;
  }

  async actualizar(clave: string, payload: Partial<Pick<ConfiguracionSistema, 'valor' | 'descripcion' | 'activo'>>): Promise<ConfiguracionSistema> {
    const response = await axios.put(`${API_BASE_URL}/api/v1/configuracion/${encodeURIComponent(clave)}`, payload, {
      headers: this.getAuthHeaders()
    });
    return response.data.data;
  }

  async crear(data: { clave: string; valor: string | number | boolean | object; descripcion?: string; tipo: TipoConfiguracion; categoria: CategoriaConfiguracion; activo?: boolean; }): Promise<ConfiguracionSistema> {
    const response = await axios.post(`${API_BASE_URL}/api/v1/configuracion`, data, {
      headers: this.getAuthHeaders()
    });
    return response.data.data;
  }
}

export const configuracionService = new ConfiguracionService();


