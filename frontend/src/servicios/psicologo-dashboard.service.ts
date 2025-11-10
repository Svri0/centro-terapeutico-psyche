import { api } from './api';

export interface DashboardKPIs {
  total_sesiones_mes: number;
  horas_trabajadas_acumuladas: number;
  tareas_completadas: number;
  tareas_asignadas: number;
  porcentaje_tareas_completadas: number;
  promedio_duracion_sesiones: number;
  pacientes_activos: number;
}

export interface SesionPorMes {
  mes: string; // YYYY-MM
  total: number;
  completadas: number;
}

export interface HoraPorMes {
  mes: string; // YYYY-MM
  horas: number;
}

export interface EvolucionPaciente {
  paciente_id: string;
  paciente_nombre: string;
  total_sesiones: number;
  sesiones_completadas: number;
  ultima_sesion: string | null;
}

export interface DashboardPsicologo {
  kpis: DashboardKPIs;
  graficas: {
    sesiones_por_mes: SesionPorMes[];
    horas_trabajadas_por_mes: HoraPorMes[];
    evolucion_pacientes: EvolucionPaciente[];
  };
  filtros: {
    fecha_inicio: string | null;
    fecha_fin: string | null;
    paciente_id: string | null;
  };
}

export interface DashboardFilters {
  fecha_inicio?: string;
  fecha_fin?: string;
  paciente_id?: string;
}

class PsicologoDashboardService {
  async obtenerDashboard(filtros?: DashboardFilters): Promise<DashboardPsicologo> {
    try {
      const params = new URLSearchParams();
      
      if (filtros?.fecha_inicio) {
        params.append('fecha_inicio', filtros.fecha_inicio);
      }
      if (filtros?.fecha_fin) {
        params.append('fecha_fin', filtros.fecha_fin);
      }
      if (filtros?.paciente_id) {
        params.append('paciente_id', filtros.paciente_id);
      }

      const url = `/psicologo-dashboard${params.toString() ? `?${params.toString()}` : ''}`;
      const response = await api.get(url);
      
      return response.data?.data || {
        kpis: {
          total_sesiones_mes: 0,
          horas_trabajadas_acumuladas: 0,
          tareas_completadas: 0,
          tareas_asignadas: 0,
          porcentaje_tareas_completadas: 0,
          promedio_duracion_sesiones: 0,
          pacientes_activos: 0
        },
        graficas: {
          sesiones_por_mes: [],
          horas_trabajadas_por_mes: [],
          evolucion_pacientes: []
        },
        filtros: {
          fecha_inicio: null,
          fecha_fin: null,
          paciente_id: null
        }
      };
    } catch (error: any) {
      console.error('Error al obtener dashboard:', error);
      console.error('Error response:', error.response);
      console.error('Error status:', error.response?.status);
      console.error('Error data:', error.response?.data);
      
      if (error.response?.status === 404) {
        throw new Error('El endpoint del dashboard no fue encontrado. Verifica que el backend esté actualizado.');
      } else if (error.response?.status === 401) {
        throw new Error('No autorizado. Por favor, inicia sesión nuevamente.');
      } else if (error.response?.data?.mensaje) {
        throw new Error(error.response.data.mensaje);
      } else if (error.message) {
        throw new Error(error.message);
      } else {
        throw new Error('Error al obtener el dashboard. Verifica que el backend esté corriendo.');
      }
    }
  }
}

export const psicologoDashboardService = new PsicologoDashboardService();

