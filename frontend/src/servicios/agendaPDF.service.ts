import api from './api';

export interface GenerarPDFRequest {
  periodo: 'diario' | 'semanal' | 'mensual';
  fechaInicio: string;
  fechaFin: string;
}

export interface PeriodoDisponible {
  fechaInicio: string;
  fechaFin: string;
  sesiones: number;
}

export interface PeriodosDisponibles {
  diario: PeriodoDisponible[];
  semanal: PeriodoDisponible[];
  mensual: PeriodoDisponible[];
}

export class AgendaPDFService {
  
  static async generarPDF(data: GenerarPDFRequest): Promise<void> {
    try {
      const response = await api.post('/agenda-pdf/generar', data, {
        responseType: 'blob'
      });

      // Crear blob y descargar
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // Generar nombre de archivo
      const fechaInicio = new Date(data.fechaInicio).toISOString().split('T')[0];
      const fechaFin = new Date(data.fechaFin).toISOString().split('T')[0];
      link.download = `agenda_${data.periodo}_${fechaInicio}_${fechaFin}.pdf`;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

    } catch (error: any) {
      console.error('Error al generar PDF:', error);
      throw new Error(error.response?.data?.mensaje || 'Error al generar el PDF');
    }
  }

  static async obtenerPeriodosDisponibles(): Promise<PeriodosDisponibles> {
    try {
      const response = await api.get('/agenda-pdf/periodos-disponibles');
      return response.data.data;
    } catch (error: any) {
      console.error('Error al obtener períodos disponibles:', error);
      throw new Error(error.response?.data?.mensaje || 'Error al obtener períodos disponibles');
    }
  }

  static formatearFecha(fecha: string): string {
    return new Date(fecha).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  static formatearRangoFechas(fechaInicio: string, fechaFin: string): string {
    const inicio = new Date(fechaInicio);
    const fin = new Date(fechaFin);
    
    if (inicio.toDateString() === fin.toDateString()) {
      return this.formatearFecha(fechaInicio);
    }
    
    return `${this.formatearFecha(fechaInicio)} - ${this.formatearFecha(fechaFin)}`;
  }

  static obtenerTextoPeriodo(periodo: string): string {
    const periodos: { [key: string]: string } = {
      'diario': 'Agenda Diaria',
      'semanal': 'Agenda Semanal',
      'mensual': 'Agenda Mensual'
    };
    return periodos[periodo] || periodo;
  }
}
