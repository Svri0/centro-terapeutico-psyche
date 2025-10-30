// Controlador de reportes de progreso
import { Request, Response } from 'express';
import { ReporteProgreso } from '../modelos';
import { ManejadorRespuestas } from '../utilidades/respuestas';
import { verificarToken } from '../middleware/auth.middleware';

// Función auxiliar para extraer el usuario del token
const extraerUsuarioId = (req: Request): string => {
  return (req as any).usuario?.id || '';
};

// Obtener todos los reportes del psicólogo autenticado
export const obtenerTodosReportes = async (req: Request, res: Response) => {
  try {
    const psicologoId = extraerUsuarioId(req);
    const { paciente_id, estado } = req.query;

    const where: any = {
      psicologo_id: psicologoId,
    };

    if (paciente_id) {
      where.paciente_id = paciente_id;
    }

    if (estado) {
      where.estado = estado;
    }

    const reportes = await ReporteProgreso.findAll({
      where,

      include: [
        {
          model: require('../modelos/Paciente').default,
          as: 'paciente',
          attributes: ['id', 'nombres', 'apellidos', 'numero_ficha'],
        },
        {
          model: require('../modelos/Usuario').default,
          as: 'psicologo',
          attributes: ['id', 'nombres', 'apellidos'],
        },
      ],
      order: [['fecha_reporte', 'DESC']],
    });

    return ManejadorRespuestas.exito(
      res,
      'Reportes obtenidos exitosamente',
      reportes,
      'REP_001'
    );
  } catch (error: any) {
    console.error('Error al obtener reportes:', error);
    return ManejadorRespuestas.errorInterno(
      res,
      'Error al obtener reportes',
      'REP_002'
    );
  }
};

// Obtener un reporte por ID
export const obtenerReportePorId = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const psicologoId = extraerUsuarioId(req);

    const reporte = await ReporteProgreso.findOne({
      where: {
        id,
        psicologo_id: psicologoId,
      },
      include: [
        {
          model: require('../modelos/Paciente').default,
          as: 'paciente',
          attributes: ['id', 'nombres', 'apellidos', 'numero_ficha', 'email', 'telefono'],
        },
        {
          model: require('../modelos/Usuario').default,
          as: 'psicologo',
          attributes: ['id', 'nombres', 'apellidos'],
        },
      ],
    });

    if (!reporte) {
      return ManejadorRespuestas.noEncontrado(
        res,
        'Reporte no encontrado',
        'REP_003'
      );
    }

    return ManejadorRespuestas.exito(
      res,
      'Reporte obtenido exitosamente',
      reporte,
      'REP_004'
    );
  } catch (error: any) {
    console.error('Error al obtener reporte:', error);
    return ManejadorRespuestas.errorInterno(
      res,
      'Error al obtener reporte',
      'REP_005'
    );
  }
};

// Crear un nuevo reporte de progreso
export const crearReporte = async (req: Request, res: Response) => {
  try {
    const psicologoId = extraerUsuarioId(req);
    const {
      paciente_id,
      sesion_id,
      periodo_inicio,
      periodo_fin,
      resumen_evolucion,
      objetivos_cumplidos,
      objetivos_pendientes,
      areas_trabajadas,
      conductas_observadas,
      logros_importantes,
      desafios_identificados,
      sugerencias_terapeuticas,
      progreso_general,
      metrica_satisfaccion,
      observaciones_adicionales,
      estado,
    } = req.body;

    // Validaciones básicas
    if (!paciente_id || !periodo_inicio || !periodo_fin || !resumen_evolucion) {
      return ManejadorRespuestas.errorValidacion(
        res,
        'Faltan campos requeridos',
        {
          campos_requeridos: [
            'paciente_id',
            'periodo_inicio',
            'periodo_fin',
            'resumen_evolucion',
          ],
        },
        'REP_006'
      );
    }

    const reporte = await ReporteProgreso.create({
      paciente_id,
      psicologo_id: psicologoId,
      sesion_id,
      fecha_reporte: new Date(),
      periodo_inicio,
      periodo_fin,
      resumen_evolucion,
      objetivos_cumplidos: objetivos_cumplidos || [],
      objetivos_pendientes: objetivos_pendientes || [],
      areas_trabajadas: areas_trabajadas || [],
      conductas_observadas: conductas_observadas || [],
      logros_importantes: logros_importantes || [],
      desafios_identificados: desafios_identificados || [],
      sugerencias_terapeuticas: sugerencias_terapeuticas || '',
      progreso_general: progreso_general || 'bueno',
      metrica_satisfaccion,
      observaciones_adicionales,
      estado: estado || 'borrador',
    });

    return ManejadorRespuestas.exito(
      res,
      'Reporte creado exitosamente',
      reporte,
      'REP_007'
    );
  } catch (error: any) {
    console.error('Error al crear reporte:', error);
    return ManejadorRespuestas.errorInterno(
      res,
      'Error al crear reporte',
      'REP_008'
    );
  }
};

// Actualizar un reporte existente
export const actualizarReporte = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const psicologoId = extraerUsuarioId(req);

    const reporte = await ReporteProgreso.findOne({
      where: {
        id,
        psicologo_id: psicologoId,
      },
    });

    if (!reporte) {
      return ManejadorRespuestas.noEncontrado(
        res,
        'Reporte no encontrado',
        'REP_009'
      );
    }

    await reporte.update(req.body);

    return ManejadorRespuestas.exito(
      res,
      'Reporte actualizado exitosamente',
      reporte,
      'REP_010'
    );
  } catch (error: any) {
    console.error('Error al actualizar reporte:', error);
    return ManejadorRespuestas.errorInterno(
      res,
      'Error al actualizar reporte',
      'REP_011'
    );
  }
};

// Eliminar un reporte (soft delete)
export const eliminarReporte = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const psicologoId = extraerUsuarioId(req);

    const reporte = await ReporteProgreso.findOne({
      where: {
        id,
        psicologo_id: psicologoId,
      },
    });

    if (!reporte) {
      return ManejadorRespuestas.noEncontrado(
        res,
        'Reporte no encontrado',
        'REP_012'
      );
    }

    await reporte.destroy();

    return ManejadorRespuestas.exito(
      res,
      'Reporte eliminado exitosamente',
      null,
      'REP_013'
    );
  } catch (error: any) {
    console.error('Error al eliminar reporte:', error);
    return ManejadorRespuestas.errorInterno(
      res,
      'Error al eliminar reporte',
      'REP_014'
    );
  }
};

// Exportar un reporte (PDF/JSON)
export const exportarReporte = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { formato } = req.query; // 'pdf' o 'json'
    const psicologoId = extraerUsuarioId(req);

    const reporte = await ReporteProgreso.findOne({
      where: {
        id,
        psicologo_id: psicologoId,
      },
      include: [
        {
          model: require('../modelos/Paciente').default,
          as: 'paciente',
        },
        {
          model: require('../modelos/Usuario').default,
          as: 'psicologo',
        },
      ],
    });

    if (!reporte) {
      return ManejadorRespuestas.noEncontrado(
        res,
        'Reporte no encontrado',
        'REP_015'
      );
    }

    // Por ahora solo exportamos JSON
    // TODO: Implementar exportación a PDF
    if (formato === 'json') {
      return res.json({
        success: true,
        mensaje: 'Reporte exportado exitosamente',
        data: reporte,
        formato: 'json',
      });
    }

    // Retornar reporte en JSON por defecto
    return ManejadorRespuestas.exito(
      res,
      'Reporte exportado exitosamente',
      reporte,
      'REP_016'
    );
  } catch (error: any) {
    console.error('Error al exportar reporte:', error);
    return ManejadorRespuestas.errorInterno(
      res,
      'Error al exportar reporte',
      'REP_017'
    );
  }
};

// Obtener reportes por paciente
export const obtenerReportesPorPaciente = async (req: Request, res: Response) => {
  try {
    const { paciente_id } = req.params;
    const psicologoId = extraerUsuarioId(req);

    const reportes = await ReporteProgreso.findAll({
      where: {
        paciente_id,
        psicologo_id: psicologoId,
      },
      order: [['fecha_reporte', 'DESC']],
    });

    return ManejadorRespuestas.exito(
      res,
      'Reportes del paciente obtenidos exitosamente',
      reportes,
      'REP_018'
    );
  } catch (error: any) {
    console.error('Error al obtener reportes del paciente:', error);
    return ManejadorRespuestas.errorInterno(
      res,
      'Error al obtener reportes del paciente',
      'REP_019'
    );
  }
};
