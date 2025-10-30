import { Request, Response } from 'express';
import sequelize from '../configuracion/database';
import { ManejadorRespuestas } from '../utilidades/respuestas';
import { log } from '../utilidades/logger';

export const obtenerEstadisticasDashboard = async (req: Request, res: Response) => {
  try {
    const hoy = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

    // Obtener estadísticas básicas sin usar tabla pagos
    const [totalCitasResult] = await sequelize.query(`
      SELECT COUNT(*) as total_citas
      FROM sesiones s
      WHERE DATE(s.fecha_programada) = :hoy
    `, { replacements: { hoy } }) as [any[], unknown];

    const [citasCompletadasResult] = await sequelize.query(`
      SELECT COUNT(*) as citas_completadas
      FROM sesiones s
      WHERE DATE(s.fecha_programada) = :hoy AND s.estado = 'completada'
    `, { replacements: { hoy } }) as [any[], unknown];

    const [totalPacientesResult] = await sequelize.query(`
      SELECT COUNT(*) as total_pacientes
      FROM pacientes p
      WHERE p.deleted_at IS NULL
    `, { replacements: {} }) as [any[], unknown];

    // Para ingresos, usamos un valor simulado por ahora ya que no existe tabla pagos
    const ingresosDia = 0; // Simulado hasta que se implemente la tabla pagos

    const estadisticas = {
      totalCitasHoy: totalCitasResult[0]?.total_citas || 0,
      citasCompletadasHoy: citasCompletadasResult[0]?.citas_completadas || 0,
      totalPacientes: totalPacientesResult[0]?.total_pacientes || 0,
      totalIngresosHoy: ingresosDia,
      totalPagosPendientesHoy: 0 // Simulado hasta que se implemente la tabla pagos
    };

    return ManejadorRespuestas.exito(
      res,
      'Estadísticas obtenidas exitosamente',
      estadisticas,
      'REC_001'
    );

  } catch (error) {
    log.error('Error en obtenerEstadisticasDashboard:', error);
    return ManejadorRespuestas.errorInterno(
      res,
      'Error interno al obtener estadísticas',
      'REC_002'
    );
  }
};

export const obtenerCitasDelDia = async (req: Request, res: Response) => {
  try {
    const { fecha } = req.query;
    const fechaConsulta = fecha ? fecha as string : new Date().toISOString().split('T')[0];

    const [citas] = await sequelize.query(`
      SELECT 
        s.id,
        s.fecha_programada as fecha,
        s.fecha_inicio as hora_inicio,
        s.fecha_fin as hora_fin,
        s.estado,
        s.observaciones,
        p.nombres as paciente_nombres,
        p.apellidos as paciente_apellidos,
        ps.nombres as psicologo_nombres,
        ps.apellidos as psicologo_apellidos
      FROM sesiones s
      INNER JOIN pacientes pa ON s.paciente_id = pa.id
      INNER JOIN usuarios p ON pa.usuario_id = p.id
      INNER JOIN usuarios ps ON s.psicologo_id = ps.id
      WHERE DATE(s.fecha_programada) = :fecha
      ORDER BY s.fecha_inicio
    `, { replacements: { fecha: fechaConsulta } }) as [any[], unknown];

    const citasMapeadas = citas.map((cita: any) => ({
      id: cita.id,
      fecha: cita.fecha,
      horaInicio: cita.hora_inicio,
      horaFin: cita.hora_fin,
      estado: cita.estado,
      observaciones: cita.observaciones,
      paciente: {
        nombres: cita.paciente_nombres,
        apellidos: cita.paciente_apellidos
      },
      psicologo: {
        nombres: cita.psicologo_nombres,
        apellidos: cita.psicologo_apellidos
      }
    }));

    return ManejadorRespuestas.exito(
      res,
      'Citas del día obtenidas exitosamente',
      { citas: citasMapeadas },
      'REC_003'
    );

  } catch (error) {
    log.error('Error en obtenerCitasDelDia:', error);
    return ManejadorRespuestas.errorInterno(
      res,
      'Error interno al obtener citas del día',
      'REC_004'
    );
  }
};

export const obtenerPacientesRecepcionista = async (req: Request, res: Response) => {
  try {
    const { busqueda, estado } = req.query;

    let query = `
      SELECT 
        p.id,
        p.numero_ficha,
        p.rut,
        p.estado,
        p.fecha_ingreso,
        u.nombres,
        u.apellidos,
        u.email,
        u.telefono
      FROM pacientes p
      INNER JOIN usuarios u ON p.usuario_id = u.id
      WHERE p.deleted_at IS NULL
    `;

    const replacements: any = {};

    if (busqueda) {
      query += ' AND (u.nombres ILIKE :busqueda OR u.apellidos ILIKE :busqueda OR u.email ILIKE :busqueda OR p.numero_ficha ILIKE :busqueda)';
      replacements.busqueda = `%${busqueda}%`;
    }

    if (estado) {
      query += ' AND p.estado = :estado';
      replacements.estado = estado;
    }

    query += ' ORDER BY u.apellidos, u.nombres';

    const [pacientes] = await sequelize.query(query, { replacements }) as [any[], unknown];

    const pacientesMapeados = pacientes.map((paciente: any) => ({
      id: paciente.id,
      numeroFicha: paciente.numero_ficha,
      rut: paciente.rut,
      estado: paciente.estado,
      fechaIngreso: paciente.fecha_ingreso,
      nombres: paciente.nombres,
      apellidos: paciente.apellidos,
      email: paciente.email,
      telefono: paciente.telefono
    }));

    return ManejadorRespuestas.exito(
      res,
      'Pacientes obtenidos exitosamente',
      { pacientes: pacientesMapeados },
      'REC_005'
    );

  } catch (error) {
    log.error('Error en obtenerPacientesRecepcionista:', error);
    return ManejadorRespuestas.errorInterno(
      res,
      'Error interno al obtener pacientes',
      'REC_006'
    );
  }
};

export const obtenerPagosRecepcionista = async (req: Request, res: Response) => {
  try {
    // Por ahora retornamos datos simulados ya que no existe tabla pagos
    const pagosSimulados = [
      {
        id: '1',
        monto: 50000,
        estado: 'pagado',
        metodoPago: 'efectivo',
        fecha: new Date().toISOString().split('T')[0],
        paciente: {
          nombres: 'Juan',
          apellidos: 'Pérez'
        },
        cita: {
          fecha: new Date().toISOString().split('T')[0],
          hora: '10:00'
        }
      }
    ];

    return ManejadorRespuestas.exito(
      res,
      'Pagos obtenidos exitosamente (datos simulados)',
      { pagos: pagosSimulados },
      'REC_007'
    );

  } catch (error) {
    log.error('Error en obtenerPagosRecepcionista:', error);
    return ManejadorRespuestas.errorInterno(
      res,
      'Error interno al obtener pagos',
      'REC_008'
    );
  }
};

export const obtenerPsicologosRecepcionista = async (req: Request, res: Response) => {
  try {
    const [psicologos] = await sequelize.query(`
      SELECT 
        u.id,
        u.especialidad,
        u.codigo_sbs as numero_colegiado,
        u.activo as estado,
        u.nombres,
        u.apellidos,
        u.email,
        u.telefono
      FROM usuarios u
      WHERE u.rol_id = 2 AND u.activo = true AND u.deleted_at IS NULL
      ORDER BY u.apellidos, u.nombres
    `, { replacements: {} }) as [any[], unknown];

    const psicologosMapeados = psicologos.map((psicologo: any) => ({
      id: psicologo.id,
      especialidad: psicologo.especialidad,
      numeroColegiado: psicologo.numero_colegiado,
      estado: psicologo.estado,
      nombres: psicologo.nombres,
      apellidos: psicologo.apellidos,
      email: psicologo.email,
      telefono: psicologo.telefono
    }));

    return ManejadorRespuestas.exito(
      res,
      'Psicólogos obtenidos exitosamente',
      { psicologos: psicologosMapeados },
      'REC_009'
    );

  } catch (error) {
    log.error('Error en obtenerPsicologosRecepcionista:', error);
    return ManejadorRespuestas.errorInterno(
      res,
      'Error interno al obtener psicólogos',
      'REC_010'
    );
  }
};