import api from './api';

// Tipos para artículos
export interface Articulo {
  id: string;
  titulo: string;
  slug: string;
  resumen: string;
  contenido: string;
  imagen_url: string;
  categoria: string;
  autor_id?: string;
  autor?: {
    id: string;
    nombres: string;
    apellidos: string;
  };
  tiempo_lectura: number;
  publicado: boolean;
  fecha_publicacion?: string;
  vistas: number;
  etiquetas: string[];
  created_at: string;
  updated_at: string;
}

export interface CrearArticulo {
  titulo: string;
  resumen: string;
  contenido: string;
  imagen_url: string;
  categoria: string;
  tiempo_lectura?: number;
  publicado?: boolean;
  etiquetas?: string[];
}

export interface ActualizarArticulo {
  titulo?: string;
  resumen?: string;
  contenido?: string;
  imagen_url?: string;
  categoria?: string;
  tiempo_lectura?: number;
  publicado?: boolean;
  etiquetas?: string[];
}

export interface ArticulosResponse {
  articulos: Articulo[];
  total: number;
  limit: number;
  offset: number;
}

class ArticulosService {
  // Obtener artículos publicados (público, no requiere autenticación)
  async obtenerArticulosPublicados(categoria?: string, limit: number = 10, offset: number = 0): Promise<ArticulosResponse> {
    const params = new URLSearchParams();
    if (categoria) params.append('categoria', categoria);
    params.append('limit', limit.toString());
    params.append('offset', offset.toString());

    const response = await api.get(`/articulos/publicos?${params.toString()}`);
    return response.data.data;
  }

  // Obtener un artículo por slug (público)
  async obtenerArticuloPorSlug(slug: string): Promise<Articulo> {
    const response = await api.get(`/articulos/publicos/${slug}`);
    return response.data.data;
  }

  // Obtener todos los artículos (requiere autenticación)
  async obtenerTodos(categoria?: string, publicado?: boolean, limit: number = 50, offset: number = 0): Promise<ArticulosResponse> {
    const params = new URLSearchParams();
    if (categoria) params.append('categoria', categoria);
    if (publicado !== undefined) params.append('publicado', publicado.toString());
    params.append('limit', limit.toString());
    params.append('offset', offset.toString());

    const response = await api.get(`/articulos?${params.toString()}`);
    return response.data.data;
  }

  // Obtener un artículo por ID (requiere autenticación)
  async obtenerPorId(id: string): Promise<Articulo> {
    const response = await api.get(`/articulos/${id}`);
    return response.data.data;
  }

  // Crear un artículo (requiere autenticación)
  async crear(articulo: CrearArticulo): Promise<Articulo> {
    const response = await api.post('/articulos', articulo);
    return response.data.data;
  }

  // Actualizar un artículo (requiere autenticación)
  async actualizar(id: string, articulo: ActualizarArticulo): Promise<Articulo> {
    const response = await api.put(`/articulos/${id}`, articulo);
    return response.data.data;
  }

  // Eliminar un artículo (requiere autenticación)
  async eliminar(id: string): Promise<void> {
    await api.delete(`/articulos/${id}`);
  }
}

export const articulosService = new ArticulosService();
export default articulosService;

