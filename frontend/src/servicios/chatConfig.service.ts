import { api } from './api';

export interface TemaChat {
  id: string;
  nombre: string;
  descripcion: string;
  preview: string;
  estilos: {
    fondo: string;
    texto: string;
    bordes: string;
  };
}

export interface ConfiguracionChat {
  pacienteId: string;
  tema: string;
  ultimaModificacion: string;
}

class ChatConfigService {
  // Obtener la configuración actual del chat para un paciente
  async obtenerConfiguracion(pacienteId: string): Promise<ConfiguracionChat> {
    try {
      const response = await api.get(`/chat/configuracion/${pacienteId}`);
      return response.data.data;
    } catch (error) {
      console.error('Error al obtener configuración del chat:', error);
      // Intentar obtener del localStorage como fallback
      const temaGuardado = localStorage.getItem(`chat_tema_${pacienteId}`);
      return {
        pacienteId,
        tema: temaGuardado || 'default',
        ultimaModificacion: new Date().toISOString()
      };
    }
  }

  // Cambiar el tema del chat para un paciente específico
  async cambiarTema(pacienteId: string, tema: string): Promise<boolean> {
    try {
      const response = await api.post(`/chat/configuracion/${pacienteId}/tema`, { tema });
      // También guardar en localStorage para persistencia
      localStorage.setItem(`chat_tema_${pacienteId}`, tema);
      return response.data.success;
    } catch (error) {
      console.error('Error al cambiar tema del chat:', error);
      // Si falla la API, al menos guardar en localStorage
      try {
        localStorage.setItem(`chat_tema_${pacienteId}`, tema);
        return true;
      } catch (localError) {
        console.error('Error al guardar en localStorage:', localError);
        return false;
      }
    }
  }

  // Borrar completamente el chat de un paciente
  async borrarChat(pacienteId: string): Promise<boolean> {
    try {
      const response = await api.delete(`/chat/conversacion/${pacienteId}`);
      return response.data.success;
    } catch (error) {
      console.error('Error al borrar chat:', error);
      return false;
    }
  }

  // Obtener todos los temas disponibles
  obtenerTemasDisponibles(): TemaChat[] {
    return [
      {
        id: 'default',
        nombre: 'Tema Clásico',
        descripcion: 'Fondo blanco con bordes suaves',
        preview: 'bg-white border border-gray-200',
        estilos: {
          fondo: 'bg-white',
          texto: 'text-gray-800',
          bordes: 'border border-gray-200'
        }
      },
      {
        id: 'dark',
        nombre: 'Tema Oscuro',
        descripcion: 'Fondo oscuro elegante',
        preview: 'bg-gray-900 text-white',
        estilos: {
          fondo: 'bg-gray-900',
          texto: 'text-white',
          bordes: 'border border-gray-700'
        }
      },
      {
        id: 'blue',
        nombre: 'Tema Azul',
        descripcion: 'Fondo azul relajante',
        preview: 'bg-blue-50 border border-blue-200',
        estilos: {
          fondo: 'bg-blue-50',
          texto: 'text-gray-800',
          bordes: 'border border-blue-200'
        }
      },
      {
        id: 'green',
        nombre: 'Tema Verde',
        descripcion: 'Fondo verde natural',
        preview: 'bg-green-50 border border-green-200',
        estilos: {
          fondo: 'bg-green-50',
          texto: 'text-gray-800',
          bordes: 'border border-green-200'
        }
      },
      {
        id: 'purple',
        nombre: 'Tema Púrpura',
        descripcion: 'Fondo púrpura creativo',
        preview: 'bg-purple-50 border border-purple-200',
        estilos: {
          fondo: 'bg-purple-50',
          texto: 'text-gray-800',
          bordes: 'border border-purple-200'
        }
      },
      {
        id: 'warm',
        nombre: 'Tema Cálido',
        descripcion: 'Fondo cálido y acogedor',
        preview: 'bg-orange-50 border border-orange-200',
        estilos: {
          fondo: 'bg-orange-50',
          texto: 'text-gray-800',
          bordes: 'border border-orange-200'
        }
      }
    ];
  }

  // Aplicar estilos de tema a un elemento
  aplicarTema(elemento: HTMLElement, tema: string): void {
    const temas = this.obtenerTemasDisponibles();
    const temaSeleccionado = temas.find(t => t.id === tema) || temas[0];
    
    // Limpiar clases anteriores
    elemento.className = elemento.className.replace(/bg-\w+-\d+/g, '');
    elemento.className = elemento.className.replace(/text-\w+-\d+/g, '');
    elemento.className = elemento.className.replace(/border-\w+-\d+/g, '');
    
    // Aplicar nuevas clases
    elemento.classList.add(temaSeleccionado.estilos.fondo);
    elemento.classList.add(temaSeleccionado.estilos.texto);
    elemento.classList.add(temaSeleccionado.estilos.bordes);
  }
}

export const chatConfigService = new ChatConfigService();
export default chatConfigService;
