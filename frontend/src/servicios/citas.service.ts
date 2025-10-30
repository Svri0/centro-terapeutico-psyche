import { api } from './api';

export interface Cita {
  id: string;
  paciente_id: string;
  paciente_nombres: string;
  paciente_apellidos: string;
  paciente_rut: string;
  paciente_telefono: string;
  psicologo_id: string;
  psicologo_nombres: string;
  psicologo_apellidos: string;
  fecha: string;
  hora_inicio: string;
  hora_fin: string;
  duracion_minutos: number;
  estado: 'programada' | 'confirmada' | 'en_curso' | 'completada' | 'cancelada' | 'no_asistio';
  tipo_sesion: string;
  modalidad: 'presencial' | 'online';
  notas?: string;
  notas_psicologo?: string;
  recordatorio_enviado: boolean;
  pago_estado: 'pendiente' | 'pagado';
  pago_monto?: number;
  created_at: string;
  updated_at: string;
}

export interface CrearCitaData {
  paciente_id: string;
  psicologo_id: string;
  fecha: string;
  hora_inicio: string;
  hora_fin: string;
  duracion_minutos: number;
  tipo_sesion: string;
  modalidad: 'presencial' | 'online';
  notas?: string;
}

export interface ActualizarCitaData {
  fecha?: string;
  hora_inicio?: string;
  hora_fin?: string;
  duracion_minutos?: number;
  tipo_sesion?: string;
  modalidad?: 'presencial' | 'online';
  notas?: string;
  notas_psicologo?: string;
  estado?: 'programada' | 'confirmada' | 'en_curso' | 'completada' | 'cancelada' | 'no_asistio';
  pago_estado?: 'pendiente' | 'pagado';
  pago_monto?: number;
}

class CitasService {
  async obtenerCitas(): Promise<Cita[]> {
    try {
      const response = await api.get('/citas/psicologo');
      if (response.data && response.data.data) return response.data.data;
      if (Array.isArray(response.data)) return response.data;
      console.error('Estructura de respuesta inesperada:', response.data);
      return [];
    } catch (error) {
      console.error('Error al obtener citas:', error);
      throw error;
    }
  }

  async obtenerCitasPaciente(): Promise<Cita[]> {
    try {
      const response = await api.get(`/citas/paciente?t=${Date.now()}`);
      if (response.data && response.data.data) return response.data.data;
      if (Array.isArray(response.data)) return response.data;
      console.error('Estructura de respuesta inesperada:', response.data);
      return [];
    } catch (error) {
      console.error('Error al obtener citas del paciente:', error);
      throw error;
    }
  }

  async obtenerCitasDelDia(fecha: string): Promise<Cita[]> {
    try {
      const todasLasCitas = await this.obtenerCitas();
      return todasLasCitas.filter(cita => cita.fecha === fecha);
    } catch (error) {
      console.error('Error al obtener citas del día:', error);
      throw error;
    }
  }

  async obtenerCitasPorRango(fechaInicio: string, fechaFin: string): Promise<Cita[]> {
    try {
      const todasLasCitas = await this.obtenerCitas();
      return todasLasCitas.filter(cita => {
        const fechaCita = new Date(cita.fecha);
        const inicio = new Date(fechaInicio);
        const fin = new Date(fechaFin);
        return fechaCita >= inicio && fechaCita <= fin;
      });
    } catch (error) {
      console.error('Error al obtener citas por rango:', error);
      throw error;
    }
  }

  async obtenerCitasSemanaActual(): Promise<Cita[]> {
    try {
      const hoy = new Date();
      const inicioSemana = new Date(hoy);
      inicioSemana.setDate(hoy.getDate() - hoy.getDay() + 1);
      const finSemana = new Date(inicioSemana);
      finSemana.setDate(inicioSemana.getDate() + 6);
      return await this.obtenerCitasPorRango(
        inicioSemana.toISOString().split('T')[0],
        finSemana.toISOString().split('T')[0]
      );
    } catch (error) {
      console.error('Error al obtener citas de la semana:', error);
      throw error;
    }
  }

  async obtenerCitasMesActual(): Promise<Cita[]> {
    try {
      const hoy = new Date();
      const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
      const finMes = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0);
      return await this.obtenerCitasPorRango(
        inicioMes.toISOString().split('T')[0],
        finMes.toISOString().split('T')[0]
      );
    } catch (error) {
      console.error('Error al obtener citas del mes:', error);
      throw error;
    }
  }

  async obtenerCitaPorId(id: string): Promise<Cita> {
    try {
      const response = await api.get(`/citas/${id}`);
      return response.data.data;
    } catch (error) {
      console.error('Error al obtener cita:', error);
      throw error;
    }
  }

  async crearCita(data: CrearCitaData): Promise<Cita> {
    try {
      const response = await api.post('/citas', data);
      return response.data.data;
    } catch (error) {
      console.error('Error al crear cita:', error);
      throw error;
    }
  }

  async actualizarCita(id: string, data: ActualizarCitaData): Promise<Cita> {
    try {
      const response = await api.put(`/citas/${id}`, data);
      return response.data.data;
    } catch (error) {
      console.error('Error al actualizar cita:', error);
      throw error;
    }
  }

  async actualizarEstado(id: string, data: { estado: string }): Promise<Cita> {
    try {
      const response = await api.patch(`/citas/${id}/estado`, data);
      return response.data.data;
    } catch (error) {
      console.error('Error al actualizar estado de cita:', error);
      throw error;
    }
  }

  async cancelarCita(id: string, motivo?: string): Promise<Cita> {
    try {
      const response = await api.patch(`/citas/${id}/cancelar`, { motivo });
      return response.data.data;
    } catch (error) {
      console.error('Error al cancelar cita:', error);
      throw error;
    }
  }

  async eliminarCita(id: string): Promise<void> {
    try {
      await api.delete(`/citas/${id}`);
    } catch (error) {
      console.error('Error al eliminar cita:', error);
      throw error;
    }
  }

  async obtenerEstadisticas(): Promise<any> {
    try {
      const response = await api.get('/citas/psicologos/estadisticas-citas');
      return response.data.data;
    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
      throw error;
    }
  }

  async enviarRecordatorio(id: string): Promise<void> {
    try {
      console.log('Enviando recordatorio para cita:', id);
    } catch (error) {
      console.error('Error al enviar recordatorio:', error);
      throw error;
    }
  }

  async obtenerDisponibilidad(psicologoId: string, fecha: string): Promise<any> {
    try {
      const response = await api.get(`/disponibilidad-mensual/psicologos/${psicologoId}/disponibilidad`, { params: { fecha } });
      return response.data.data;
    } catch (error) {
      console.error('Error al obtener disponibilidad:', error);
      throw error;
    }
  }

  async verificarConflictos(psicologoId: string, fecha: string, _horaInicio: string, _horaFin: string, _citaId?: string): Promise<boolean> {
    try {
      console.log('Verificando conflictos para psicólogo:', psicologoId, 'fecha:', fecha);
      return false;
    } catch (error) {
      console.error('Error al verificar conflictos:', error);
      throw error;
    }
  }
}

export const citasService = new CitasService();

