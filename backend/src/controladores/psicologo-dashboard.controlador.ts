import { Request, Response } from 'express';
import { QueryTypes } from 'sequelize';
import sequelize from '../configuracion/database';
import { ManejadorRespuestas } from '../utilidades/respuestas';

// Obtener dashboard completo del psicólogo con KPIs, gráficas y filtros
export const obtenerDashboardPsicologo = async (req: Request, res: Response) => {
  try {
    const psicologoId = req.usuario?.id;
    
    if (!psicologoId) {
      return ManejadorRespuestas.noAutorizado(
        res,
        'Usuario no autenticado',
        'DASH_001'
      );
    }

    // Obtener parámetros de filtro
    const fechaInicio = req.query.fecha_inicio as string;
    const fechaFin = req.query.fecha_fin as string;
    const pacienteId = req.query.paciente_id as string;

    // Construir condiciones de filtro para consultas SQL
    const replacements: any = {
      psicologoId
    };

    let whereSesiones = 'WHERE s.psicologo_id = :psicologoId AND s.deleted_at IS NULL';
    let whereTareas = 'WHERE t.psicologo_id = :psicologoId AND t.deleted_at IS NULL';

    if (fechaInicio) {
      whereSesiones += ' AND s.fecha_programada >= :fechaInicio';
      replacements.fechaInicio = new Date(fechaInicio).toISOString();
    }
    if (fechaFin) {
      const fechaFinDate = new Date(fechaFin);
      fechaFinDate.setHours(23, 59, 59, 999);
      whereSesiones += ' AND s.fecha_programada <= :fechaFin';
      replacements.fechaFin = fechaFinDate.toISOString();
    }

    if (pacienteId) {
      whereSesiones += ' AND s.paciente_id = :pacienteId';
      whereTareas += ' AND t.paciente_id = :pacienteId';
      replacements.pacienteId = pacienteId;
    }

    // Obtener KPIs usando consultas SQL directas
    const ahora = new Date();
    const inicioMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1);

    // Total de sesiones este mes
    const [sesionesMesResult] = await sequelize.query(`
      SELECT COUNT(*)::integer as total
      FROM sesiones s
      ${whereSesiones}
        AND s.fecha_programada >= :inicioMes
    `, {
      replacements: {
        ...replacements,
        inicioMes: inicioMes.toISOString()
      },
      type: QueryTypes.SELECT
    }) as Array<{ total: number }>;
    const totalSesionesEsteMes = sesionesMesResult?.total || 0;

    // Horas trabajadas acumuladas
    const [horasResult] = await sequelize.query(`
      SELECT COALESCE(SUM(duracion_minutos), 0)::integer as total_minutos
      FROM sesiones s
      ${whereSesiones}
        AND s.estado = 'completada'
    `, {
      replacements,
      type: QueryTypes.SELECT
    }) as Array<{ total_minutos: number }>;
    const horasTrabajadas = (horasResult?.total_minutos || 0) / 60;

    // Promedio de duración de sesiones
    const [promedioResult] = await sequelize.query(`
      SELECT 
        COALESCE(AVG(duracion_minutos), 0)::numeric as promedio
      FROM sesiones s
      ${whereSesiones}
        AND s.estado = 'completada'
        AND s.duracion_minutos IS NOT NULL
    `, {
      replacements,
      type: QueryTypes.SELECT
    }) as Array<{ promedio: number }>;
    const promedioDuracion = Math.round(promedioResult?.promedio || 0);

    // Tareas completadas vs asignadas
    const [tareasResult] = await sequelize.query(`
      SELECT 
        COUNT(*)::integer as total,
        COUNT(CASE WHEN estado = 'completada' THEN 1 END)::integer as completadas
      FROM tareas t
      ${whereTareas}
    `, {
      replacements,
      type: QueryTypes.SELECT
    }) as Array<{ total: number; completadas: number }>;
    const tareasAsignadas = tareasResult?.total || 0;
    const tareasCompletadas = tareasResult?.completadas || 0;
    const porcentajeTareasCompletadas = tareasAsignadas > 0
      ? Math.round((tareasCompletadas / tareasAsignadas) * 100)
      : 0;

    // Pacientes activos
    let wherePacientes = 'WHERE p.psicologo_id = :psicologoId AND p.estado = \'activo\' AND p.deleted_at IS NULL';
    if (pacienteId) {
      wherePacientes += ' AND p.id = :pacienteId';
    }
    const [pacientesResult] = await sequelize.query(`
      SELECT COUNT(*)::integer as total
      FROM pacientes p
      ${wherePacientes}
    `, {
      replacements,
      type: QueryTypes.SELECT
    }) as Array<{ total: number }>;
    const pacientesActivos = pacientesResult?.total || 0;

    // Gráficas: Sesiones por mes (últimos 12 meses)
    const fechaHace12Meses = new Date();
    fechaHace12Meses.setMonth(fechaHace12Meses.getMonth() - 12);
    
    const replacementsSesiones: any = {
      ...replacements,
      fechaHace12Meses: fechaHace12Meses.toISOString()
    };
    
    // Construir WHERE para gráficas de sesiones (últimos 12 meses)
    let whereSesionesGrafica = 'WHERE s.psicologo_id = :psicologoId AND s.deleted_at IS NULL AND s.fecha_programada >= :fechaHace12Meses';
    if (fechaInicio) {
      whereSesionesGrafica += ' AND s.fecha_programada >= :fechaInicio';
    }
    if (fechaFin) {
      whereSesionesGrafica += ' AND s.fecha_programada <= :fechaFin';
    }
    if (pacienteId) {
      whereSesionesGrafica += ' AND s.paciente_id = :pacienteId';
    }
    
    let querySesiones = `
      SELECT 
        DATE_TRUNC('month', s.fecha_programada) as mes,
        COUNT(*)::integer as total,
        COUNT(CASE WHEN s.estado = 'completada' THEN 1 END)::integer as completadas
      FROM sesiones s
      ${whereSesionesGrafica}
      GROUP BY DATE_TRUNC('month', s.fecha_programada)
      ORDER BY mes ASC
    `;
    
    const sesionesPorMes = await sequelize.query(querySesiones, {
      replacements: replacementsSesiones,
      type: QueryTypes.SELECT
    }) as Array<{ mes: Date; total: number; completadas: number }>;

    // Horas trabajadas por mes (últimos 12 meses)
    let whereHoras = whereSesionesGrafica + " AND s.estado = 'completada'";
    
    let queryHoras = `
      SELECT 
        DATE_TRUNC('month', s.fecha_programada) as mes,
        COALESCE(ROUND(SUM(s.duracion_minutos) / 60.0, 1), 0)::numeric as horas
      FROM sesiones s
      ${whereHoras}
      GROUP BY DATE_TRUNC('month', s.fecha_programada)
      ORDER BY mes ASC
    `;
    
    const horasPorMes = await sequelize.query(queryHoras, {
      replacements: replacementsSesiones,
      type: QueryTypes.SELECT
    }) as Array<{ mes: Date; horas: number }>;

    // Evolución de pacientes (sesiones por paciente)
    let joinCondicionSesiones = 'p.id = s.paciente_id AND s.deleted_at IS NULL AND s.psicologo_id = :psicologoId';
    if (fechaInicio) {
      joinCondicionSesiones += ' AND s.fecha_programada >= :fechaInicio';
    }
    if (fechaFin) {
      joinCondicionSesiones += ' AND s.fecha_programada <= :fechaFin';
    }
    
    let wherePacientesEvolucion = 'WHERE p.psicologo_id = :psicologoId AND p.deleted_at IS NULL';
    if (pacienteId) {
      wherePacientesEvolucion += ' AND p.id = :pacienteId';
    }
    
    const queryEvolucion = `
      SELECT 
        p.id as paciente_id,
        COALESCE(u.nombres || ' ' || u.apellidos, 'Sin nombre') as paciente_nombre,
        COUNT(s.id)::integer as total_sesiones,
        COUNT(CASE WHEN s.estado = 'completada' THEN 1 END)::integer as sesiones_completadas,
        MAX(s.fecha_programada) as ultima_sesion
      FROM pacientes p
      LEFT JOIN usuarios u ON p.usuario_id = u.id
      LEFT JOIN sesiones s ON ${joinCondicionSesiones}
      ${wherePacientesEvolucion}
      GROUP BY p.id, u.nombres, u.apellidos
      ORDER BY total_sesiones DESC
      LIMIT 10
    `;
    
    const evolucionPacientes = await sequelize.query(queryEvolucion, {
      replacements,
      type: QueryTypes.SELECT
    }) as Array<{
      paciente_id: string;
      paciente_nombre: string;
      total_sesiones: number;
      sesiones_completadas: number;
      ultima_sesion: Date;
    }>;

    // Preparar respuesta
    const dashboard = {
      kpis: {
        total_sesiones_mes: totalSesionesEsteMes,
        horas_trabajadas_acumuladas: Math.round(horasTrabajadas * 10) / 10,
        tareas_completadas: tareasCompletadas,
        tareas_asignadas: tareasAsignadas,
        porcentaje_tareas_completadas: porcentajeTareasCompletadas,
        promedio_duracion_sesiones: promedioDuracion,
        pacientes_activos: pacientesActivos
      },
      graficas: {
        sesiones_por_mes: sesionesPorMes.map(item => {
          const fecha = item.mes instanceof Date ? item.mes : new Date(item.mes);
          const fechaStr = fecha.toISOString().split('T')[0] || '';
          return {
            mes: fechaStr.substring(0, 7), // YYYY-MM
            total: Number(item.total),
            completadas: Number(item.completadas)
          };
        }),
        horas_trabajadas_por_mes: horasPorMes.map(item => {
          const fecha = item.mes instanceof Date ? item.mes : new Date(item.mes);
          const fechaStr = fecha.toISOString().split('T')[0] || '';
          return {
            mes: fechaStr.substring(0, 7), // YYYY-MM
            horas: Math.round(Number(item.horas) * 10) / 10
          };
        }),
        evolucion_pacientes: evolucionPacientes.map(item => ({
          paciente_id: item.paciente_id,
          paciente_nombre: item.paciente_nombre,
          total_sesiones: Number(item.total_sesiones),
          sesiones_completadas: Number(item.sesiones_completadas),
          ultima_sesion: item.ultima_sesion ? (item.ultima_sesion instanceof Date ? item.ultima_sesion.toISOString().split('T')[0] : new Date(item.ultima_sesion).toISOString().split('T')[0]) : null
        }))
      },
      filtros: {
        fecha_inicio: fechaInicio || null,
        fecha_fin: fechaFin || null,
        paciente_id: pacienteId || null
      }
    };

    return ManejadorRespuestas.exito(
      res,
      'Dashboard obtenido exitosamente',
      dashboard,
      'DASH_002'
    );

  } catch (error: any) {
    console.error('Error al obtener dashboard del psicólogo:', error);
    console.error('Error stack:', error.stack);
    console.error('Error message:', error.message);
    return ManejadorRespuestas.errorInterno(
      res,
      `Error al obtener el dashboard: ${error.message || 'Error desconocido'}`,
      'DASH_003'
    );
  }
};

