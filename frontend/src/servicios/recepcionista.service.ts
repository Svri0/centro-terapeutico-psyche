import api from './api';

export interface PacienteRecepcionista {
  id: string;
  numero_ficha: string;
  rut?: string;
  direccion?: string;
  contacto_emergencia_nombre?: string;
  contacto_emergencia_telefono?: string;
  contacto_emergencia_relacion?: string;
  estado: string;
  fecha_ingreso: string;
  fecha_alta?: string;
  observaciones?: string;
  nombres: string;
  apellidos: string;
  email: string;
  telefono?: string;
  fecha_nacimiento?: string;
  genero?: string;
  psicologo_nombres?: string;
  psicologo_apellidos?: string;
}

export interface CrearPacienteData {
  nombres: string;
  apellidos: string;
  email: string;
  telefono?: string;
  fecha_nacimiento?: string;
  genero?: string;
  rut?: string;
  direccion?: string;
  contacto_emergencia_nombre?: string;
  contacto_emergencia_telefono?: string;
  contacto_emergencia_relacion?: string;
  observaciones?: string;
  antecedentes_medicos?: any[];
  medicacion_actual?: any[];
  alergias?: any[];
  condiciones_cronicas?: any[];
  historial_psiquiatrico?: any[];
  observaciones_medicas?: string;
}

export interface PacienteCreado extends PacienteRecepcionista {
  numero_ficha: string;
  password_temporal: string;
}

class RecepcionistaService {
  async obtenerPacientes(busqueda?: string, psicologo_id?: string, estado?: string): Promise<PacienteRecepcionista[]> {
    try {
      const params = new URLSearchParams();
      if (busqueda) params.append('busqueda', busqueda);
      if (psicologo_id) params.append('psicologo_id', psicologo_id);
      if (estado) params.append('estado', estado);

      const response = await api.get(`/recepcionista/pacientes?${params.toString()}`);
      console.log('Respuesta del backend para pacientes recepcionista:', response.data);
      
      if (response.data.data && response.data.data.pacientes && Array.isArray(response.data.data.pacientes)) {
        // Mapear los datos del backend al formato esperado por el frontend
        return response.data.data.pacientes.map((paciente: any) => ({
          id: paciente.id,
          numero_ficha: paciente.numeroFicha,
          rut: paciente.rut,
          estado: paciente.estado,
          fecha_ingreso: paciente.fechaIngreso,
          nombres: paciente.nombres,
          apellidos: paciente.apellidos,
          email: paciente.email,
          telefono: paciente.telefono,
          direccion: paciente.direccion,
          contacto_emergencia_nombre: paciente.contacto_emergencia_nombre,
          contacto_emergencia_telefono: paciente.contacto_emergencia_telefono,
          contacto_emergencia_relacion: paciente.contacto_emergencia_relacion,
          observaciones: paciente.observaciones,
          psicologo_nombres: paciente.psicologo_nombres,
          psicologo_apellidos: paciente.psicologo_apellidos
        }));
      } else {
        return [];
      }
    } catch (error: any) {
      console.error('Error al obtener pacientes:', error);
      throw new Error(error.response?.data?.mensaje || 'Error al obtener pacientes');
    }
  }

  async buscarPacientes(termino: string): Promise<PacienteRecepcionista[]> {
    try {
      const response = await api.get(`/recepcionista/pacientes?busqueda=${encodeURIComponent(termino)}`);
      console.log('Respuesta de búsqueda de pacientes recepcionista:', response.data);
      
      if (response.data.data && response.data.data.pacientes && Array.isArray(response.data.data.pacientes)) {
        return response.data.data.pacientes;
      } else {
        return [];
      }
    } catch (error: any) {
      console.error('Error al buscar pacientes:', error);
      throw new Error(error.response?.data?.mensaje || 'Error al buscar pacientes');
    }
  }

  async obtenerPacientePorId(id: string): Promise<PacienteRecepcionista> {
    try {
      const response = await api.get(`/recepcionista/pacientes/${id}`);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.mensaje || 'Error al obtener paciente');
    }
  }

  async crearPaciente(data: CrearPacienteData): Promise<PacienteCreado> {
    try {
      console.log('Datos enviados para crear paciente desde recepcionista:', data);
      const response = await api.post('/recepcionista/pacientes', data);
      console.log('Respuesta exitosa al crear paciente desde recepcionista:', response.data);
      return response.data.data;
    } catch (error: any) {
      console.error('Error completo al crear paciente desde recepcionista:', error);
      console.error('Respuesta del servidor:', error.response?.data);
      
      if (error.response?.status === 409) {
        const mensaje = error.response?.data?.mensaje || 'Conflicto: El paciente ya existe';
        throw new Error(mensaje);
      } else if (error.response?.status === 400) {
        const mensaje = error.response?.data?.mensaje || 'Datos inválidos';
        throw new Error(mensaje);
      } else {
        throw new Error(error.response?.data?.mensaje || 'Error al crear paciente');
      }
    }
  }

  async actualizarPaciente(id: string, data: Partial<CrearPacienteData>): Promise<PacienteRecepcionista> {
    try {
      const response = await api.put(`/recepcionista/pacientes/${id}`, data);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.mensaje || 'Error al actualizar paciente');
    }
  }

  async eliminarPaciente(id: string): Promise<void> {
    try {
      await api.delete(`/recepcionista/pacientes/${id}`);
    } catch (error: any) {
      throw new Error(error.response?.data?.mensaje || 'Error al eliminar paciente');
    }
  }

  async activarPaciente(id: string): Promise<PacienteRecepcionista> {
    try {
      const response = await api.patch(`/recepcionista/pacientes/${id}/activar`);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.mensaje || 'Error al activar paciente');
    }
  }

  async desactivarPaciente(id: string): Promise<PacienteRecepcionista> {
    try {
      const response = await api.patch(`/recepcionista/pacientes/${id}/desactivar`);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.mensaje || 'Error al desactivar paciente');
    }
  }

  async obtenerPsicologos(): Promise<any[]> {
    try {
      const response = await api.get('/recepcionista/psicologos');
      const psicologos = response.data.data.psicologos || [];
      
      // Mapear los datos del backend al formato esperado por el frontend
      return psicologos.map((psicologo: any) => ({
        id: psicologo.id,
        nombres: psicologo.nombres,
        apellidos: psicologo.apellidos,
        email: psicologo.email,
        telefono: psicologo.telefono,
        especialidad: psicologo.especialidad || 'Sin especialidad',
        numeroColegiado: psicologo.numeroColegiado || 'Sin número',
        estado: psicologo.estado
      }));
    } catch (error: any) {
      throw new Error(error.response?.data?.mensaje || 'Error al obtener psicólogos');
    }
  }

  async obtenerCitasDelDia(fecha?: string): Promise<any[]> {
    try {
      const params = fecha ? `?fecha=${fecha}` : '';
      const response = await api.get(`/recepcionista/citas/dia${params}`);
      const citas = response.data.data.citas || [];
      
      // Mapear los datos del backend al formato esperado por el frontend
      return citas.map((cita: any) => ({
        id: cita.id,
        fecha: cita.fecha,
        horaInicio: cita.horaInicio,
        horaFin: cita.horaFin,
        estado: cita.estado,
        observaciones: cita.observaciones,
        paciente: {
          nombres: cita.paciente?.nombres || '',
          apellidos: cita.paciente?.apellidos || ''
        },
        psicologo: {
          nombres: cita.psicologo?.nombres || '',
          apellidos: cita.psicologo?.apellidos || ''
        }
      }));
    } catch (error: any) {
      throw new Error(error.response?.data?.mensaje || 'Error al obtener citas del día');
    }
  }

  async obtenerEstadisticasDashboard(): Promise<any> {
    try {
      const response = await api.get('/recepcionista/dashboard/estadisticas');
      const data = response.data.data || {};
      
      // Mapear los datos del backend al formato esperado por el frontend
      return {
        citas_hoy: data.totalCitasHoy || 0,
        citas_completadas: data.citasCompletadasHoy || 0,
        pacientes_activos: data.totalPacientes || 0,
        pagos_hoy: data.totalPagosPendientesHoy || 0,
        ingresos_hoy: data.totalIngresosHoy || 0
      };
    } catch (error: any) {
      throw new Error(error.response?.data?.mensaje || 'Error al obtener estadísticas');
    }
  }

  async obtenerPagos(fecha_inicio?: string, fecha_fin?: string, estado?: string, metodo_pago?: string): Promise<any[]> {
    try {
      const params = new URLSearchParams();
      if (fecha_inicio) params.append('fecha_inicio', fecha_inicio);
      if (fecha_fin) params.append('fecha_fin', fecha_fin);
      if (estado) params.append('estado', estado);
      if (metodo_pago) params.append('metodo_pago', metodo_pago);

      const response = await api.get(`/recepcionista/pagos?${params.toString()}`);
      return response.data.data.pagos || [];
    } catch (error: any) {
      throw new Error(error.response?.data?.mensaje || 'Error al obtener pagos');
    }
  }
}

export const recepcionistaService = new RecepcionistaService();
