import api from './api';

// Tipos para las configuraciones de recordatorios
export interface ConfiguracionRecordatorio {
  id: string;
  usuario_id: string;
  tipo_evento: 'sesion_programada' | 'sesion_confirmada' | 'sesion_24h_antes' | 'sesion_1h_antes' | 'tarea_asignada' | 'tarea_vencida' | 'tarea_1semana_antes' | 'tarea_1dia_antes';
  canal_notificacion: 'email' | 'whatsapp' | 'push' | 'sms';
  activo: boolean;
  configuracion_personalizada: any;
  horario_preferido?: string;
  dias_semana?: number[];
  created_at: string;
  updated_at: string;
}

export interface CrearConfiguracionRecordatorioData {
  tipo_evento: string;
  canal_notificacion: string;
  activo?: boolean;
  configuracion_personalizada?: any;
  horario_preferido?: string;
  dias_semana?: number[];
}

export interface ConfiguracionesAgrupadas {
  [tipoEvento: string]: ConfiguracionRecordatorio[];
}

export interface RespuestaConfiguraciones {
  configuraciones: ConfiguracionesAgrupadas;
  total: number;
}

// Servicio para gestionar configuraciones de recordatorios
class RecordatoriosService {
  // Obtener configuraciones de recordatorios del usuario
  async obtenerConfiguraciones(): Promise<RespuestaConfiguraciones> {
    try {
      const response = await api.get('/recordatorios/configuraciones');
      return response.data?.data || { configuraciones: {}, total: 0 };
    } catch (error: any) {
      console.error('Error al obtener configuraciones de recordatorios:', error);
      return { configuraciones: {}, total: 0 };
    }
  }

  // Crear o actualizar configuración de recordatorio
  async crearActualizarConfiguracion(data: CrearConfiguracionRecordatorioData): Promise<ConfiguracionRecordatorio> {
    try {
      const response = await api.post('/recordatorios/configuraciones', data);
      return response.data?.data;
    } catch (error: any) {
      console.error('Error al crear/actualizar configuración:', error);
      throw new Error(error.response?.data?.mensaje || 'Error al crear/actualizar configuración');
    }
  }

  // Eliminar configuración de recordatorio
  async eliminarConfiguracion(id: string): Promise<void> {
    try {
      await api.delete(`/recordatorios/configuraciones/${id}`);
    } catch (error: any) {
      console.error('Error al eliminar configuración:', error);
      throw new Error(error.response?.data?.mensaje || 'Error al eliminar configuración');
    }
  }

  // Obtener opciones de tipos de eventos
  obtenerTiposEventos() {
    return [
      {
        value: 'sesion_programada',
        label: 'Sesión Programada',
        descripcion: 'Cuando se programa una nueva sesión'
      },
      {
        value: 'sesion_confirmada',
        label: 'Sesión Confirmada',
        descripcion: 'Cuando se confirma una sesión'
      },
      {
        value: 'sesion_24h_antes',
        label: 'Recordatorio 24h Antes',
        descripcion: '24 horas antes de la sesión'
      },
      {
        value: 'sesion_1h_antes',
        label: 'Recordatorio 1h Antes',
        descripcion: '1 hora antes de la sesión'
      },
      {
        value: 'tarea_asignada',
        label: 'Tarea Asignada',
        descripcion: 'Cuando se asigna una nueva tarea'
      },
      {
        value: 'tarea_vencida',
        label: 'Tarea Vencida',
        descripcion: 'Cuando una tarea está vencida'
      },
      {
        value: 'tarea_1semana_antes',
        label: 'Recordatorio 1 Semana Antes',
        descripcion: '1 semana antes del vencimiento'
      },
      {
        value: 'tarea_1dia_antes',
        label: 'Recordatorio 1 Día Antes',
        descripcion: '1 día antes del vencimiento'
      }
    ];
  }

  // Obtener opciones de canales de notificación
  obtenerCanalesNotificacion() {
    return [
      {
        value: 'email',
        label: 'Correo Electrónico',
        descripcion: 'Notificaciones por email',
        icono: '📧'
      },
      {
        value: 'whatsapp',
        label: 'WhatsApp',
        descripcion: 'Notificaciones por WhatsApp',
        icono: '📱'
      },
      {
        value: 'push',
        label: 'Notificación Push',
        descripcion: 'Notificaciones en el navegador',
        icono: '🔔'
      },
      {
        value: 'sms',
        label: 'SMS',
        descripcion: 'Notificaciones por SMS',
        icono: '💬'
      }
    ];
  }

  // Obtener días de la semana
  obtenerDiasSemana() {
    return [
      { value: 0, label: 'Domingo' },
      { value: 1, label: 'Lunes' },
      { value: 2, label: 'Martes' },
      { value: 3, label: 'Miércoles' },
      { value: 4, label: 'Jueves' },
      { value: 5, label: 'Viernes' },
      { value: 6, label: 'Sábado' }
    ];
  }

  // Obtener configuración por defecto para un tipo de evento
  obtenerConfiguracionPorDefecto(tipoEvento: string, canal: string) {
    const configuracionesPorDefecto: Record<string, Record<string, any>> = {
      sesion_programada: {
        email: { plantilla: 'sesion_programada', asunto: 'Nueva sesión programada' },
        whatsapp: { plantilla: 'sesion_programada_whatsapp', mensaje: 'Tienes una nueva sesión programada' },
        push: { titulo: 'Nueva sesión', mensaje: 'Se ha programado una nueva sesión' },
        sms: { mensaje: 'Nueva sesión programada en Psyche' }
      },
      sesion_24h_antes: {
        email: { plantilla: 'recordatorio_24h', asunto: 'Recordatorio: Sesión mañana' },
        whatsapp: { plantilla: 'recordatorio_24h_whatsapp', mensaje: 'Recordatorio: Tu sesión es mañana' },
        push: { titulo: 'Recordatorio', mensaje: 'Tu sesión es mañana' },
        sms: { mensaje: 'Recordatorio: Tu sesión es mañana' }
      },
      tarea_asignada: {
        email: { plantilla: 'tarea_asignada', asunto: 'Nueva tarea asignada' },
        whatsapp: { plantilla: 'tarea_asignada_whatsapp', mensaje: 'Tienes una nueva tarea asignada' },
        push: { titulo: 'Nueva tarea', mensaje: 'Se te ha asignado una nueva tarea' },
        sms: { mensaje: 'Nueva tarea asignada en Psyche' }
      }
    };

    return configuracionesPorDefecto[tipoEvento]?.[canal] || {};
  }
}

export const recordatoriosService = new RecordatoriosService();
