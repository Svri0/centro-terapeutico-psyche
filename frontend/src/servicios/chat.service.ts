import { Mensaje, Chat, UsuarioChat, FiltroChat, OrdenamientoChat, PaginacionChat } from '../types/chat.types';

class ChatService {
  private baseUrl: string;
  private token: string | null;

  constructor() {
    this.baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
    this.token = localStorage.getItem('token');
  }

  private getHeaders(): HeadersInit {
    return {
      'Content-Type': 'application/json',
      ...(this.token && { Authorization: `Bearer ${this.token}` }),
    };
  }

  // Obtener lista de chats del usuario
  async obtenerChats(
    filtros?: FiltroChat,
    ordenamiento?: OrdenamientoChat,
    paginacion?: PaginacionChat
  ): Promise<{ chats: Chat[]; total: number }> {
    try {
      const params = new URLSearchParams();
      
      if (filtros?.texto) params.append('texto', filtros.texto);
      if (filtros?.soloNoLeidos) params.append('soloNoLeidos', 'true');
      if (ordenamiento?.campo) params.append('ordenarPor', ordenamiento.campo);
      if (ordenamiento?.direccion) params.append('direccion', ordenamiento.direccion);
      if (paginacion?.pagina) params.append('pagina', paginacion.pagina.toString());
      if (paginacion?.elementosPorPagina) params.append('limite', paginacion.elementosPorPagina.toString());

      const response = await fetch(`${this.baseUrl}/api/chat?${params}`, {
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Error al obtener chats: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error en obtenerChats:', error);
      throw error;
    }
  }

  // Obtener mensajes de un chat específico
  async obtenerMensajes(
    chatId: string,
    pagina: number = 1,
    limite: number = 50
  ): Promise<{ mensajes: Mensaje[]; total: number }> {
    try {
      const response = await fetch(
        `${this.baseUrl}/api/chat/${chatId}/mensajes?pagina=${pagina}&limite=${limite}`,
        {
          headers: this.getHeaders(),
        }
      );

      if (!response.ok) {
        throw new Error(`Error al obtener mensajes: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error en obtenerMensajes:', error);
      throw error;
    }
  }

  // Enviar un mensaje
  async enviarMensaje(chatId: string, contenido: string, tipo: Mensaje['tipo'] = 'texto'): Promise<Mensaje> {
    try {
      const response = await fetch(`${this.baseUrl}/api/chat/${chatId}/mensajes`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          contenido,
          tipo,
          timestamp: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error(`Error al enviar mensaje: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error en enviarMensaje:', error);
      throw error;
    }
  }

  // Marcar mensajes como leídos
  async marcarMensajesLeidos(chatId: string, mensajeIds: string[]): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/api/chat/${chatId}/mensajes/leer`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify({ mensajeIds }),
      });

      if (!response.ok) {
        throw new Error(`Error al marcar mensajes como leídos: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error en marcarMensajesLeidos:', error);
      throw error;
    }
  }

  // Crear un nuevo chat individual
  async crearChatIndividual(usuarioId: string): Promise<Chat> {
    try {
      const response = await fetch(`${this.baseUrl}/api/chat`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          tipo: 'individual',
          participantes: [usuarioId],
        }),
      });

      if (!response.ok) {
        throw new Error(`Error al crear chat: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error en crearChatIndividual:', error);
      throw error;
    }
  }

  // Buscar usuarios para iniciar chat
  async buscarUsuarios(query: string): Promise<UsuarioChat[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/usuarios/buscar?q=${encodeURIComponent(query)}`, {
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Error al buscar usuarios: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error en buscarUsuarios:', error);
      throw error;
    }
  }

  // Obtener información de un usuario específico
  async obtenerUsuario(usuarioId: string): Promise<UsuarioChat> {
    try {
      const response = await fetch(`${this.baseUrl}/api/usuarios/${usuarioId}`, {
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Error al obtener usuario: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error en obtenerUsuario:', error);
      throw error;
    }
  }

  // Subir archivo al chat
  async subirArchivo(chatId: string, archivo: File): Promise<{ url: string; nombre: string; tipo: string }> {
    try {
      const formData = new FormData();
      formData.append('archivo', archivo);

      const response = await fetch(`${this.baseUrl}/api/chat/${chatId}/archivos`, {
        method: 'POST',
        headers: {
          ...(this.token && { Authorization: `Bearer ${this.token}` }),
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Error al subir archivo: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error en subirArchivo:', error);
      throw error;
    }
  }

  // Obtener estadísticas del chat
  async obtenerEstadisticas(chatId?: string): Promise<any> {
    try {
      const url = chatId 
        ? `${this.baseUrl}/api/chat/${chatId}/estadisticas`
        : `${this.baseUrl}/api/chat/estadisticas`;

      const response = await fetch(url, {
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Error al obtener estadísticas: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error en obtenerEstadisticas:', error);
      throw error;
    }
  }

  // Eliminar mensaje
  async eliminarMensaje(chatId: string, mensajeId: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/api/chat/${chatId}/mensajes/${mensajeId}`, {
        method: 'DELETE',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Error al eliminar mensaje: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error en eliminarMensaje:', error);
      throw error;
    }
  }

  // Editar mensaje
  async editarMensaje(chatId: string, mensajeId: string, nuevoContenido: string): Promise<Mensaje> {
    try {
      const response = await fetch(`${this.baseUrl}/api/chat/${chatId}/mensajes/${mensajeId}`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify({
          contenido: nuevoContenido,
          editado: true,
          editadoEn: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error(`Error al editar mensaje: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error en editarMensaje:', error);
      throw error;
    }
  }

  // Obtener notificaciones no leídas
  async obtenerNotificaciones(): Promise<any[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/chat/notificaciones`, {
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Error al obtener notificaciones: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error en obtenerNotificaciones:', error);
      throw error;
    }
  }

  // Marcar notificación como leída
  async marcarNotificacionLeida(notificacionId: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/api/chat/notificaciones/${notificacionId}/leer`, {
        method: 'PUT',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Error al marcar notificación como leída: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error en marcarNotificacionLeida:', error);
      throw error;
    }
  }

  // Actualizar token de autenticación
  actualizarToken(nuevoToken: string): void {
    this.token = nuevoToken;
    localStorage.setItem('token', nuevoToken);
  }

  // Limpiar token
  limpiarToken(): void {
    this.token = null;
    localStorage.removeItem('token');
  }
}

// Instancia singleton del servicio
export const chatService = new ChatService();
export default ChatService;
