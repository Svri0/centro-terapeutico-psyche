import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002';

export interface MensajeChat {
  id: string;
  contenido: string;
  remitente_id: string;
  destinatario_id: string;
  tipo: 'psicologo' | 'paciente' | 'admin' | 'recepcionista';
  leido: boolean;
  created_at: string;
  updated_at: string;
}

export interface PacienteChat {
  id: string;
  nombres: string;
  apellidos: string;
  avatar_url?: string;
  ultimo_mensaje?: string;
  ultimo_mensaje_timestamp?: string;
  mensajes_no_leidos: number;
}

export interface EstadisticasChat {
  mensajes_enviados: number;
  mensajes_recibidos: number;
  mensajes_no_leidos: number;
  pacientes_activos: number;
  total_mensajes: number;
}

class ChatService {
  private getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  }

  // Obtener pacientes del psicólogo para el chat
  async obtenerPacientes(): Promise<PacienteChat[]> {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/v1/chat/pacientes`, {
        headers: this.getAuthHeaders()
      });
      return response.data.data;
    } catch (error) {
      console.error('Error al obtener pacientes del chat:', error);
      throw error;
    }
  }

  // Obtener personal (otros psicólogos y administrador) para el chat
  async obtenerPersonal(): Promise<PacienteChat[]> {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/v1/chat/personal`, {
        headers: this.getAuthHeaders()
      });
      return response.data.data;
    } catch (error) {
      console.error('Error al obtener personal del chat:', error);
      throw error;
    }
  }

  // Obtener personal (administradores y psicólogos) para el chat del recepcionista
  async obtenerPersonalRecepcionista(): Promise<PacienteChat[]> {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/v1/chat/personal-recepcionista`, {
        headers: this.getAuthHeaders()
      });
      return response.data.data;
    } catch (error) {
      console.error('Error al obtener personal para recepcionista:', error);
      throw error;
    }
  }

  // Obtener psicólogo asignado para el paciente
  async obtenerPsicologoAsignado(): Promise<PacienteChat> {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/v1/chat/psicologo-asignado`, {
        headers: this.getAuthHeaders()
      });
      return response.data.data;
    } catch (error) {
      console.error('Error al obtener psicólogo asignado:', error);
      throw error;
    }
  }

  // Obtener mensajes entre psicólogo y paciente
  async obtenerMensajes(pacienteId: string): Promise<MensajeChat[]> {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/v1/chat/mensajes/${pacienteId}`, {
        headers: this.getAuthHeaders()
      });
      return response.data.data;
    } catch (error) {
      console.error('Error al obtener mensajes:', error);
      throw error;
    }
  }

  // Enviar mensaje
  async enviarMensaje(pacienteId: string, contenido: string): Promise<MensajeChat> {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/v1/chat/enviar`, {
        pacienteId,
        contenido
      }, {
        headers: this.getAuthHeaders()
      });
      return response.data.data;
    } catch (error) {
      console.error('Error al enviar mensaje:', error);
      throw error;
    }
  }

  // Marcar mensajes como leídos
  async marcarComoLeidos(pacienteId: string): Promise<void> {
    try {
      await axios.put(`${API_BASE_URL}/api/v1/chat/leidos/${pacienteId}`, {}, {
        headers: this.getAuthHeaders()
      });
    } catch (error) {
      console.error('Error al marcar mensajes como leídos:', error);
      throw error;
    }
  }

  // Obtener estadísticas del chat
  async obtenerEstadisticas(): Promise<EstadisticasChat> {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/v1/chat/estadisticas`, {
        headers: this.getAuthHeaders()
      });
      return response.data.data;
    } catch (error) {
      console.error('Error al obtener estadísticas del chat:', error);
      throw error;
    }
  }

  // Generar backup del chat (PDF) con un participante (usuario_id)
  async generarBackupChat(participanteId: string): Promise<void> {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/v1/chat/backup`,
        { participante_id: participanteId },
        {
          headers: this.getAuthHeaders(),
          responseType: 'blob'
        }
      );

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const nombreArchivo = `backup_chat_${new Date().toISOString().slice(0,19).replace(/[:T]/g,'-')}.pdf`;
      link.download = nombreArchivo;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error: any) {
      console.error('Error al generar backup del chat:', error);
      const msg = error?.response?.data?.mensaje || 'No se pudo generar el backup del chat';
      throw new Error(msg);
    }
  }
}

export const chatService = new ChatService();
