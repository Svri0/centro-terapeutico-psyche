import { Request, Response } from 'express';
import { AgendaPDFService } from '../servicios/agendaPDF.service';
import { ManejadorRespuestas } from '../utilidades/respuestas';
import sequelize from '../configuracion/database';
import { QueryTypes } from 'sequelize';

export class AgendaPDFController {
  
  static async generarPDF(req: Request, res: Response) {
    return AgendaPDFService.generarAgendaPDF(req, res);
  }

  static async obtenerPeriodosDisponibles(req: Request, res: Response) {
    try {
      const psicologoId = req.usuario?.id;

      if (!psicologoId) {
        return ManejadorRespuestas.noAutorizado(
          res,
          'Usuario no autenticado',
          'AGENDA_PDF_006'
        );
      }

      // Obtener fechas disponibles para el psicólogo
      const fechas = await sequelize.query(`
        SELECT 
          DATE(fecha_programada) as fecha,
          COUNT(*) as total_sesiones
        FROM sesiones 
        WHERE psicologo_id = :psicologoId 
          AND deleted_at IS NULL
        GROUP BY DATE(fecha_programada)
        ORDER BY fecha DESC
        LIMIT 30
      `, {
        replacements: { psicologoId },
        type: QueryTypes.SELECT
      }) as any[];

      const periodos = {
        diario: fechas.map(f => ({
          fechaInicio: f.fecha,
          fechaFin: f.fecha,
          sesiones: f.total_sesiones
        })),
        semanal: AgendaPDFController.agruparPorSemana(fechas),
        mensual: AgendaPDFController.agruparPorMes(fechas)
      };

      return ManejadorRespuestas.exito(
        res,
        'Períodos disponibles obtenidos exitosamente',
        periodos,
        'AGENDA_PDF_007'
      );

    } catch (error) {
      console.error('❌ Error al obtener períodos disponibles:', error);
      return ManejadorRespuestas.errorInterno(
        res,
        'Error al obtener períodos disponibles',
        'AGENDA_PDF_008'
      );
    }
  }

  private static agruparPorSemana(fechas: any[]): any[] {
    const semanas: { [key: string]: any } = {};
    
    fechas.forEach(fecha => {
      const date = new Date(fecha.fecha);
      const inicioSemana = new Date(date);
      inicioSemana.setDate(date.getDate() - date.getDay());
      
      const finSemana = new Date(inicioSemana);
      finSemana.setDate(inicioSemana.getDate() + 6);
      
      const claveSemana = `${inicioSemana.toISOString().split('T')[0]}_${finSemana.toISOString().split('T')[0]}`;
      
      if (!semanas[claveSemana]) {
        semanas[claveSemana] = {
          fechaInicio: inicioSemana.toISOString().split('T')[0],
          fechaFin: finSemana.toISOString().split('T')[0],
          sesiones: 0
        };
      }
      
      semanas[claveSemana].sesiones += fecha.total_sesiones;
    });
    
    return Object.values(semanas).slice(0, 8); // Últimas 8 semanas
  }

  private static agruparPorMes(fechas: any[]): any[] {
    const meses: { [key: string]: any } = {};
    
    fechas.forEach(fecha => {
      const date = new Date(fecha.fecha);
      const año = date.getFullYear();
      const mes = date.getMonth();
      
      const inicioMes = new Date(año, mes, 1);
      const finMes = new Date(año, mes + 1, 0);
      
      const claveMes = `${año}-${String(mes + 1).padStart(2, '0')}`;
      
      if (!meses[claveMes]) {
        meses[claveMes] = {
          fechaInicio: inicioMes.toISOString().split('T')[0],
          fechaFin: finMes.toISOString().split('T')[0],
          sesiones: 0
        };
      }
      
      meses[claveMes].sesiones += fecha.total_sesiones;
    });
    
    return Object.values(meses).slice(0, 6); // Últimos 6 meses
  }
}
