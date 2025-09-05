import { api } from './api';

export interface Mensaje {
  id: string;
  contenido: string;
  emisor_id: string;
  receptor_id: string;
  emisor_nombre: string;
  emisor_rol: string;
  timestamp: string;
  leido: boolean;
}

export interface Conversacion {
  id: string;
  participante_id: string;
  participante_nombre: string;
  participante_rol: string;
  ultimo_mensaje?: string;
  timestamp_ultimo?: string;
  no_leidos: number;
}

export interface NuevoMensaje {
  contenido: string;
  receptor_id: string;
}

export interface NuevaConversacion {
  participante_id: string;
  participante_nombre: string;
  participante_rol: string;
}

class ChatService {
  // Obtener todas las conversaciones del usuario actual
  async obtenerConversaciones(filtroRol: string = 'todos') {
    const params = filtroRol !== 'todos' ? `?rol=${filtroRol}` : '';
    return api.get(`/chat/conversaciones${params}`);
  }

  // Obtener mensajes de una conversación específica
  async obtenerMensajes(conversacionId: string) {
    return api.get(`/chat/conversaciones/${conversacionId}/mensajes`);
  }

  // Enviar un nuevo mensaje
  async enviarMensaje(mensaje: NuevoMensaje) {
    return api.post('/chat/mensajes', mensaje);
  }

  // Iniciar una nueva conversación
  async iniciarConversacion(conversacion: NuevaConversacion) {
    return api.post('/chat/conversaciones', conversacion);
  }

  // Marcar mensajes como leídos
  async marcarComoLeidos(conversacionId: string) {
    return api.put(`/chat/conversaciones/${conversacionId}/leer`);
  }

  // Obtener estadísticas del chat
  async obtenerEstadisticas() {
    return api.get('/chat/estadisticas');
  }

  // Obtener información del psicólogo asignado para pacientes
  async obtenerPsicologoAsignado() {
    return api.get('/chat/psicologo-asignado');
  }

  // Buscar usuarios para iniciar conversación
  async buscarUsuarios(query: string, rol?: string) {
    const params = new URLSearchParams({ q: query });
    if (rol) params.append('rol', rol);
    return api.get(`/chat/usuarios/buscar?${params}`);
  }

  // Obtener conversaciones no leídas
  async obtenerNoLeidas() {
    return api.get('/chat/conversaciones/no-leidas');
  }

  // Eliminar conversación
  async eliminarConversacion(conversacionId: string) {
    return api.delete(`/chat/conversaciones/${conversacionId}`);
  }

  // Archivar conversación
  async archivarConversacion(conversacionId: string) {
    return api.put(`/chat/conversaciones/${conversacionId}/archivar`);
  }
}

export const chatService = new ChatService();
