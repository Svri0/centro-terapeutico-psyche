import { Request, Response } from 'express';
import sequelize from '../configuracion/database';
import DisponibilidadSemanal from '../modelos/DisponibilidadSemanal';
import { ManejadorRespuestas } from '../utilidades/respuestas';
import { log } from '../utilidades/logger';
import { 
  obtenerFechasSemana, 
  esFeriado, 
  estaEnVacaciones, 
  validarLimiteHoras,
  obtenerFeriadosSemana as obtenerFeriadosSemanaUtil,
  formatearFechaChilena
} from '../utilidades/fechas-chile';

// Helper function para validar usuario
const validarUsuario = (req: Request): string => {
  const usuarioId = req.usuario?.id;
  if (!usuarioId) {
    throw new Error('Usuario no autenticado');
  }
  return usuarioId;
};

// Helper function para formatear fecha
const formatearFecha = (fecha: Date): string => {
  return fecha.toISOString().split('T')[0] || '';
};

// Obtener disponibilidad semanal actual
export const obtenerDisponibilidadSemanal = async (req: Request, res: Response) => {
  try {
    const psicologoId = validarUsuario(req);

    // Obtener la semana actual
    const fechaActual = new Date();
    const { lunes, domingo } = obtenerFechasSemana(fechaActual);
    
    const disponibilidad = await DisponibilidadSemanal.findOne({
      where: {
        psicologo_id: psicologoId,
        semana_inicio: formatearFecha(lunes),
        semana_fin: formatearFecha(domingo)
      }
    });

    // Si no existe, crear una nueva disponibilidad semanal
    if (!disponibilidad) {
      const nuevaDisponibilidad = await DisponibilidadSemanal.create({
        psicologo_id: psicologoId,
        semana_inicio: formatearFecha(lunes),
        semana_fin: formatearFecha(domingo),
        estado: 'borrador',
        total_horas_semana: 0
      });

      return ManejadorRespuestas.exito(
        res,
        'Disponibilidad semanal creada',
        { 
          disponibilidad: nuevaDisponibilidad,
          semana: {
            inicio: formatearFechaChilena(lunes),
            fin: formatearFechaChilena(domingo)
          }
        },
        'DISP_SEM_002'
      );
    }

    return ManejadorRespuestas.exito(
      res,
      'Disponibilidad semanal obtenida',
      { 
        disponibilidad,
        semana: {
          inicio: formatearFechaChilena(lunes),
          fin: formatearFechaChilena(domingo)
        }
      },
      'DISP_SEM_003'
    );
  } catch (error) {
    log.error('Error en obtenerDisponibilidadSemanal:', error);
    return ManejadorRespuestas.errorInterno(
      res,
      'Error interno al obtener disponibilidad semanal',
      'DISP_SEM_004'
    );
  }
};

// Actualizar disponibilidad semanal
export const actualizarDisponibilidadSemanal = async (req: Request, res: Response) => {
  try {
    const psicologoId = validarUsuario(req);
    const { disponibilidad } = req.body;

    if (!disponibilidad || !disponibilidad.id) {
      return ManejadorRespuestas.errorValidacion(
        res,
        'Datos de disponibilidad inválidos',
        req.body,
        'DISP_SEM_006'
      );
    }

    // Buscar la disponibilidad existente
    const disponibilidadExistente = await DisponibilidadSemanal.findOne({
      where: {
        id: disponibilidad.id,
        psicologo_id: psicologoId
      }
    });

    if (!disponibilidadExistente) {
      return ManejadorRespuestas.noEncontrado(
        res,
        'Disponibilidad semanal no encontrada',
        'DISP_SEM_007'
      );
    }

    // Calcular horas totales
    let totalHoras = 0;
    const dias = ['lunes_horarios', 'martes_horarios', 'miercoles_horarios', 'jueves_horarios', 'viernes_horarios', 'sabado_horarios', 'domingo_horarios'];
    
    dias.forEach(dia => {
      const horarios = disponibilidad[dia] || [];
      horarios.forEach((horario: any) => {
        if (horario.activo && horario.hora_inicio && horario.hora_fin) {
          const inicio = new Date(`2000-01-01T${horario.hora_inicio}`);
          const fin = new Date(`2000-01-01T${horario.hora_fin}`);
          const horas = (fin.getTime() - inicio.getTime()) / (1000 * 60 * 60);
          totalHoras += horas;
        }
      });
    });

    // Validar límite de 40 horas
    if (totalHoras > 40) {
      return ManejadorRespuestas.errorValidacion(
        res,
        `Excedes el límite de 40 horas semanales. Tienes ${Math.round(totalHoras)} horas configuradas.`,
        { totalHoras: Math.round(totalHoras) },
        'DISP_SEM_008'
      );
    }

    // Actualizar disponibilidad
    await disponibilidadExistente.update({
      ...disponibilidad,
      total_horas_semana: Math.round(totalHoras),
      estado: 'confirmada'
    });

    return ManejadorRespuestas.exito(
      res,
      'Disponibilidad semanal actualizada exitosamente',
      { 
        disponibilidad: disponibilidadExistente,
        totalHoras: Math.round(totalHoras)
      },
      'DISP_SEM_009'
    );
  } catch (error) {
    log.error('Error en actualizarDisponibilidadSemanal:', error);
    return ManejadorRespuestas.errorInterno(
      res,
      'Error interno al actualizar disponibilidad semanal',
      'DISP_SEM_010'
    );
  }
};

// Verificar si el psicólogo debe actualizar su disponibilidad
export const verificarDisponibilidadPendiente = async (req: Request, res: Response) => {
  try {
    const psicologoId = validarUsuario(req);

    // Obtener la semana actual
    const fechaActual = new Date();
    const { lunes, domingo } = obtenerFechasSemana(fechaActual);
    
    const disponibilidad = await DisponibilidadSemanal.findOne({
      where: {
        psicologo_id: psicologoId,
        semana_inicio: formatearFecha(lunes),
        semana_fin: formatearFecha(domingo)
      }
    });

    const debeActualizar = !disponibilidad || disponibilidad.estado === 'borrador';

    return ManejadorRespuestas.exito(
      res,
      'Verificación completada',
      { 
        debeActualizar,
        disponibilidad: disponibilidad || null,
        semana: {
          inicio: formatearFechaChilena(lunes),
          fin: formatearFechaChilena(domingo)
        }
      },
      'DISP_SEM_012'
    );
  } catch (error) {
    log.error('Error en verificarDisponibilidadPendiente:', error);
    return ManejadorRespuestas.errorInterno(
      res,
      'Error interno al verificar disponibilidad',
      'DISP_SEM_013'
    );
  }
};

// Obtener feriados de la semana
export const obtenerFeriadosSemana = async (req: Request, res: Response) => {
  try {
    const { semanaInicio, semanaFin } = req.params;

    if (!semanaInicio || !semanaFin) {
      return ManejadorRespuestas.errorValidacion(
        res,
        'Fechas de semana requeridas',
        req.params,
        'DISP_SEM_014'
      );
    }

    const feriados = obtenerFeriadosSemanaUtil(semanaInicio, semanaFin);

    return ManejadorRespuestas.exito(
      res,
      'Feriados obtenidos exitosamente',
      { feriados },
      'DISP_SEM_015'
    );
  } catch (error) {
    log.error('Error en obtenerFeriadosSemana:', error);
    return ManejadorRespuestas.errorInterno(
      res,
      'Error interno al obtener feriados',
      'DISP_SEM_016'
    );
  }
}; 