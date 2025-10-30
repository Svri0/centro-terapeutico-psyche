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
  // Obtener todas las citas del psicólogo logueado
  async obtenerCitas(): Promise<Cita[]> {
    try {
      const response = await api.get('/citas/psicologo');
      console.log('🔍 Respuesta completa del backend:', response);
      console.log('🔍 response.data:', response.data);
      console.log('🔍 response.data.data:', response.data.data);
      
      // Verificar si la respuesta tiene la estructura esperada
      if (response.data && response.data.data) {
        return response.data.data;
      } else if (Array.isArray(response.data)) {
        return response.data;
      } else {
        console.error('Estructura de respuesta inesperada:', response.data);
        return [];
      }
    } catch (error) {
      console.error('Error al obtener citas:', error);
      throw error;
    }
  }

  // Obtener todas las citas del paciente logueado
  async obtenerCitasPaciente(): Promise<Cita[]> {
    try {
      console.log('🔍 [CITAS SERVICE] Llamando a obtenerCitasPaciente - Timestamp:', new Date().toISOString());
      const response = await api.get(`/citas/paciente?t=${Date.now()}`);
      console.log('🔍 [CITAS SERVICE] Respuesta del backend para paciente:', response);
      console.log('🔍 [CITAS SERVICE] response.data:', response.data);
      console.log('🔍 [CITAS SERVICE] response.data.data:', response.data.data);
      
      // Verificar si la respuesta tiene la estructura esperada
      if (response.data && response.data.data) {
        console.log('✅ [CITAS SERVICE] Devolviendo response.data.data:', response.data.data);
        return response.data.data;
      } else if (Array.isArray(response.data)) {
        console.log('✅ [CITAS SERVICE] Devolviendo response.data (array):', response.data);
        return response.data;
      } else {
        console.error('❌ [CITAS SERVICE] Estructura de respuesta inesperada:', response.data);
        return [];
      }
    } catch (error) {
      console.error('❌ [CITAS SERVICE] Error al obtener citas del paciente:', error);
      throw error;
    }
  }

  // Obtener citas del día
  async obtenerCitasDelDia(fecha: string): Promise<Cita[]> {
    try {
      // Filtrar las citas del psicólogo por fecha
      const todasLasCitas = await this.obtenerCitas();
      return todasLasCitas.filter(cita => cita.fecha === fecha);
    } catch (error) {
      console.error('Error al obtener citas del día:', error);
      throw error;
    }
  }

  // Obtener citas por rango de fechas
  async obtenerCitasPorRango(fechaInicio: string, fechaFin: string): Promise<Cita[]> {
    try {
      // Filtrar las citas del psicólogo por rango de fechas
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

  // Obtener citas de la semana actual
  async obtenerCitasSemanaActual(): Promise<Cita[]> {
    try {
      const hoy = new Date();
      const inicioSemana = new Date(hoy);
      inicioSemana.setDate(hoy.getDate() - hoy.getDay() + 1); // Lunes
      
      const finSemana = new Date(inicioSemana);
      finSemana.setDate(inicioSemana.getDate() + 6); // Domingo
      
      return await this.obtenerCitasPorRango(
        inicioSemana.toISOString().split('T')[0],
        finSemana.toISOString().split('T')[0]
      );
    } catch (error) {
      console.error('Error al obtener citas de la semana:', error);
      throw error;
    }
  }

  // Obtener citas del mes actual
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

  // Obtener una cita por ID
  async obtenerCitaPorId(id: string): Promise<Cita> {
    try {
      const response = await api.get(`/citas/${id}`);
      return response.data.data;
    } catch (error) {
      console.error('Error al obtener cita:', error);
      throw error;
    }
  }

  // Crear nueva cita
  async crearCita(data: CrearCitaData): Promise<Cita> {
    try {
      const response = await api.post('/citas', data);
      return response.data.data;
    } catch (error) {
      console.error('Error al crear cita:', error);
      throw error;
    }
  }

  // Actualizar cita
  async actualizarCita(id: string, data: ActualizarCitaData): Promise<Cita> {
    try {
      const response = await api.put(`/citas/${id}`, data);
      return response.data.data;
    } catch (error) {
      console.error('Error al actualizar cita:', error);
      throw error;
    }
  }

  // Actualizar estado de cita
  async actualizarEstado(id: string, data: { estado: string }): Promise<Cita> {
    try {
      const response = await api.patch(`/citas/${id}/estado`, data);
      return response.data.data;
    } catch (error) {
      console.error('Error al actualizar estado de cita:', error);
      throw error;
    }
  }

  // Cancelar cita
  async cancelarCita(id: string, motivo?: string): Promise<Cita> {
    try {
      const response = await api.patch(`/citas/${id}/cancelar`, { motivo });
      return response.data.data;
    } catch (error) {
      console.error('Error al cancelar cita:', error);
      throw error;
    }
  }

  // Eliminar cita
  async eliminarCita(id: string): Promise<void> {
    try {
      await api.delete(`/citas/${id}`);
    } catch (error) {
      console.error('Error al eliminar cita:', error);
      throw error;
    }
  }

  // Obtener estadísticas de citas
  async obtenerEstadisticas(_fechaInicio?: string, _fechaFin?: string): Promise<any> {
    try {
      const response = await api.get('/citas/psicologos/estadisticas-citas');
      return response.data.data;
    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
      throw error;
    }
  }

  // Enviar recordatorio de cita
  async enviarRecordatorio(id: string): Promise<void> {
    try {
      // TODO: Implementar endpoint de recordatorio en el backend
      console.log('Enviando recordatorio para cita:', id);
      // await api.post(`/citas/${id}/recordatorio`);
    } catch (error) {
      console.error('Error al enviar recordatorio:', error);
      throw error;
    }
  }

  // Obtener disponibilidad del psicólogo
  async obtenerDisponibilidad(psicologoId: string, fecha: string): Promise<any> {
    try {
      const response = await api.get(`/citas/psicologos/${psicologoId}/disponibilidad`, {
        params: { fecha }
      });
      return response.data.data;
    } catch (error) {
      console.error('Error al obtener disponibilidad:', error);
      throw error;
    }
  }

  // Verificar conflictos de horario
  async verificarConflictos(psicologoId: string, fecha: string, _horaInicio: string, _horaFin: string, _citaId?: string): Promise<boolean> {
    try {
      // TODO: Implementar endpoint de verificación de conflictos en el backend
      console.log('Verificando conflictos para psicólogo:', psicologoId, 'fecha:', fecha);
      return false; // Por ahora retorna false (sin conflictos)
      // const response = await api.post('/citas/verificar-conflictos', {
      //   psicologo_id: psicologoId,
      //   fecha,
      //   hora_inicio: horaInicio,
      //   hora_fin: horaFin,
      //   cita_id: citaId // Para excluir la cita actual en caso de edición
      // });
      // return response.data.tiene_conflictos;
    } catch (error) {
      console.error('Error al verificar conflictos:', error);
      throw error;
    }
  }
}

export const citasService = new CitasService();