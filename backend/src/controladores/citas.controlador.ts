// Controlador de citas
import { Request, Response } from 'express';
import sequelize from '../configuracion/database';
import { ManejadorRespuestas } from '../utilidades/respuestas';
import { log } from '../utilidades/logger';

// Obtener disponibilidad de un psicólogo para una fecha específica
export const obtenerDisponibilidad = async (req: Request, res: Response) => {
  try {
    const { psicologoId, fecha } = req.params;
    const pacienteId = req.usuario?.id;

    if (!pacienteId) {
      return ManejadorRespuestas.noAutorizado(
        res,
        'Usuario no autenticado',
        'CIT_001'
      );
    }

    if (!psicologoId || !fecha) {
      return ManejadorRespuestas.errorValidacion(
        res,
        'ID de psicólogo y fecha son requeridos',
        { psicologoId, fecha },
        'CIT_002'
      );
    }

    // Obtener el día de la semana (0 = Domingo, 1 = Lunes, etc.)
    const fechaObj = new Date(fecha);
    const diaSemana = fechaObj.getDay();

    // Obtener disponibilidad del psicólogo para ese día
    const [disponibilidad] = await sequelize.query(`
      SELECT hora_inicio, hora_fin
      FROM disponibilidad_psicologos
      WHERE psicologo_id = :psicologoId
      AND dia_semana = :diaSemana
      AND activo = true
      ORDER BY hora_inicio
    `, {
      replacements: { psicologoId, diaSemana }
    }) as [any[], unknown];

    if (!Array.isArray(disponibilidad) || disponibilidad.length === 0) {
      return ManejadorRespuestas.exito(
        res,
        'No hay disponibilidad para esta fecha',
        { horarios: [] },
        'CIT_003'
      );
    }

    // Obtener citas existentes para esa fecha
    const [citasExistentes] = await sequelize.query(`
      SELECT hora_inicio, hora_fin, duracion_minutos
      FROM citas
      WHERE psicologo_id = :psicologoId
      AND fecha = :fecha
      AND estado NOT IN ('cancelada', 'no_show')
    `, {
      replacements: { psicologoId, fecha }
    }) as [any[], unknown];

    // Generar horarios disponibles
    const horariosDisponibles = [];
    const duracionCita = 60; // 60 minutos por defecto

    for (const disp of disponibilidad) {
      const horaInicio = new Date(`2000-01-01T${disp.hora_inicio}`);
      const horaFin = new Date(`2000-01-01T${disp.hora_fin}`);

      // Generar slots de 60 minutos
      let horaActual = new Date(horaInicio);
      while (horaActual < horaFin) {
        const horaSlotInicio = horaActual.toTimeString().slice(0, 5);
        const horaSlotFin = new Date(horaActual.getTime() + duracionCita * 60000).toTimeString().slice(0, 5);

        // Verificar si el slot está disponible
        const slotOcupado = Array.isArray(citasExistentes) && citasExistentes.some((cita: any) => {
          const citaInicio = new Date(`2000-01-01T${cita.hora_inicio}`);
          const citaFin = new Date(`2000-01-01T${cita.hora_fin}`);
          const slotInicio = new Date(`2000-01-01T${horaSlotInicio}`);
          const slotFin = new Date(`2000-01-01T${horaSlotFin}`);

          return (slotInicio < citaFin && slotFin > citaInicio);
        });

        if (!slotOcupado) {
          horariosDisponibles.push({
            hora_inicio: horaSlotInicio,
            hora_fin: horaSlotFin,
            disponible: true
          });
        }

        horaActual = new Date(horaActual.getTime() + duracionCita * 60000);
      }
    }

    return ManejadorRespuestas.exito(
      res,
      'Disponibilidad obtenida exitosamente',
      { 
        fecha,
        psicologo_id: psicologoId,
        horarios: horariosDisponibles
      },
      'CIT_004'
    );
  } catch (error) {
    log.error('Error en obtenerDisponibilidad:', error);
    return ManejadorRespuestas.errorInterno(
      res,
      'Error interno al obtener disponibilidad',
      'CIT_005'
    );
  }
};

// Crear una nueva cita
export const crearCita = async (req: Request, res: Response) => {
  try {
    const pacienteId = req.usuario?.id;
    const { psicologo_id, fecha, hora_inicio, tipo_sesion, modalidad, notas_paciente } = req.body;

    if (!pacienteId) {
      return ManejadorRespuestas.noAutorizado(
        res,
        'Usuario no autenticado',
        'CIT_006'
      );
    }

    if (!psicologo_id || !fecha || !hora_inicio) {
      return ManejadorRespuestas.errorValidacion(
        res,
        'psicologo_id, fecha y hora_inicio son requeridos',
        req.body,
        'CIT_007'
      );
    }

    // Verificar que el paciente existe y pertenece al psicólogo
    const [paciente] = await sequelize.query(`
      SELECT id FROM pacientes
      WHERE usuario_id = :pacienteId
      AND psicologo_id = :psicologo_id
      AND deleted_at IS NULL
    `, {
      replacements: { pacienteId, psicologo_id }
    }) as [any[], unknown];

    if (!Array.isArray(paciente) || paciente.length === 0) {
      return ManejadorRespuestas.noEncontrado(
        res,
        'Paciente no encontrado o no pertenece al psicólogo',
        'CIT_008'
      );
    }

    const pacienteIdReal = paciente[0].id;

    // Calcular hora_fin (60 minutos por defecto)
    const horaInicio = new Date(`2000-01-01T${hora_inicio}`);
    const horaFin = new Date(horaInicio.getTime() + 60 * 60000);
    const hora_fin = horaFin.toTimeString().slice(0, 5);

    // Verificar que el horario esté disponible
    const [citaExistente] = await sequelize.query(`
      SELECT id FROM citas
      WHERE psicologo_id = :psicologo_id
      AND fecha = :fecha
      AND (
        (hora_inicio <= :hora_inicio AND hora_fin > :hora_inicio) OR
        (hora_inicio < :hora_fin AND hora_fin >= :hora_fin) OR
        (hora_inicio >= :hora_inicio AND hora_fin <= :hora_fin)
      )
      AND estado NOT IN ('cancelada', 'no_show')
    `, {
      replacements: { psicologo_id, fecha, hora_inicio, hora_fin }
    }) as [any[], unknown];

    if (Array.isArray(citaExistente) && citaExistente.length > 0) {
      return ManejadorRespuestas.conflicto(
        res,
        'El horario seleccionado no está disponible',
        'CIT_009'
      );
    }

    // Crear la cita
    const [citaCreada] = await sequelize.query(`
      INSERT INTO citas (
        id, paciente_id, psicologo_id, fecha, hora_inicio, hora_fin,
        duracion_minutos, estado, tipo_sesion, modalidad, notas_paciente,
        created_at, updated_at
      ) VALUES (
        gen_random_uuid(), :paciente_id, :psicologo_id, :fecha, :hora_inicio, :hora_fin,
        60, 'programada', :tipo_sesion, :modalidad, :notas_paciente,
        NOW(), NOW()
      ) RETURNING id, fecha, hora_inicio, hora_fin
    `, {
      replacements: {
        paciente_id: pacienteIdReal,
        psicologo_id,
        fecha,
        hora_inicio,
        hora_fin,
        tipo_sesion: tipo_sesion || 'individual',
        modalidad: modalidad || 'presencial',
        notas_paciente: notas_paciente || null
      }
    }) as [any[], unknown];

    return ManejadorRespuestas.exito(
      res,
      'Cita creada exitosamente',
      citaCreada[0],
      'CIT_010'
    );
  } catch (error) {
    log.error('Error en crearCita:', error);
    return ManejadorRespuestas.errorInterno(
      res,
      'Error interno al crear la cita',
      'CIT_011'
    );
  }
};

// Obtener citas del paciente
export const obtenerCitasPaciente = async (req: Request, res: Response) => {
  try {
    const pacienteId = req.usuario?.id;

    if (!pacienteId) {
      return ManejadorRespuestas.noAutorizado(
        res,
        'Usuario no autenticado',
        'CIT_012'
      );
    }

    const [citas] = await sequelize.query(`
      SELECT 
        c.id,
        c.fecha,
        c.hora_inicio,
        c.hora_fin,
        c.duracion_minutos,
        c.estado,
        c.tipo_sesion,
        c.modalidad,
        c.notas_paciente,
        c.notas_psicologo,
        c.created_at,
        u.nombres as psicologo_nombres,
        u.apellidos as psicologo_apellidos,
        u.email as psicologo_email
      FROM citas c
      INNER JOIN pacientes p ON c.paciente_id = p.id
      INNER JOIN usuarios u ON c.psicologo_id = u.id
      WHERE p.usuario_id = :pacienteId
      AND c.fecha >= CURRENT_DATE
      ORDER BY c.fecha ASC, c.hora_inicio ASC
    `, {
      replacements: { pacienteId }
    }) as [any[], unknown];

    return ManejadorRespuestas.exito(
      res,
      'Citas obtenidas exitosamente',
      { citas },
      'CIT_013'
    );
  } catch (error) {
    log.error('Error en obtenerCitasPaciente:', error);
    return ManejadorRespuestas.errorInterno(
      res,
      'Error interno al obtener las citas',
      'CIT_014'
    );
  }
};

// Obtener citas del psicólogo
export const obtenerCitasPsicologo = async (req: Request, res: Response) => {
  try {
    const psicologoId = req.usuario?.id;
    const { fecha } = req.query;

    if (!psicologoId) {
      return ManejadorRespuestas.noAutorizado(
        res,
        'Usuario no autenticado',
        'CIT_015'
      );
    }

    let whereClause = 'c.psicologo_id = :psicologoId';
    let replacements: any = { psicologoId };

    if (fecha) {
      whereClause += ' AND c.fecha = :fecha';
      replacements.fecha = fecha;
    } else {
      // Por defecto, mostrar citas de la semana actual
      whereClause += ' AND c.fecha >= CURRENT_DATE AND c.fecha <= CURRENT_DATE + INTERVAL \'7 days\'';
    }

    const [citas] = await sequelize.query(`
      SELECT 
        c.id,
        c.fecha,
        c.hora_inicio,
        c.hora_fin,
        c.duracion_minutos,
        c.estado,
        c.tipo_sesion,
        c.modalidad,
        c.notas_paciente,
        c.notas_psicologo,
        c.created_at,
        u.nombres as paciente_nombres,
        u.apellidos as paciente_apellidos,
        u.email as paciente_email,
        p.numero_ficha
      FROM citas c
      INNER JOIN pacientes p ON c.paciente_id = p.id
      INNER JOIN usuarios u ON p.usuario_id = u.id
      WHERE ${whereClause}
      ORDER BY c.fecha ASC, c.hora_inicio ASC
    `, {
      replacements
    }) as [any[], unknown];

    return ManejadorRespuestas.exito(
      res,
      'Citas obtenidas exitosamente',
      { citas },
      'CIT_016'
    );
  } catch (error) {
    log.error('Error en obtenerCitasPsicologo:', error);
    return ManejadorRespuestas.errorInterno(
      res,
      'Error interno al obtener las citas',
      'CIT_017'
    );
  }
};

// Actualizar estado de una cita
export const actualizarEstadoCita = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { estado, notas_psicologo } = req.body;
    const psicologoId = req.usuario?.id;

    if (!psicologoId) {
      return ManejadorRespuestas.noAutorizado(
        res,
        'Usuario no autenticado',
        'CIT_018'
      );
    }

    if (!id || !estado) {
      return ManejadorRespuestas.errorValidacion(
        res,
        'ID de cita y estado son requeridos',
        { id, estado },
        'CIT_019'
      );
    }

    // Verificar que la cita pertenece al psicólogo
    const [cita] = await sequelize.query(`
      SELECT id FROM citas
      WHERE id = :id
      AND psicologo_id = :psicologoId
    `, {
      replacements: { id, psicologoId }
    }) as [any[], unknown];

    if (!Array.isArray(cita) || cita.length === 0) {
      return ManejadorRespuestas.noEncontrado(
        res,
        'Cita no encontrada',
        'CIT_020'
      );
    }

    // Actualizar la cita
    const campos = ['estado = :estado'];
    const valores: any = { id, psicologoId, estado };

    if (notas_psicologo !== undefined) {
      campos.push('notas_psicologo = :notas_psicologo');
      valores.notas_psicologo = notas_psicologo;
    }

    campos.push('updated_at = NOW()');

    await sequelize.query(`
      UPDATE citas
      SET ${campos.join(', ')}
      WHERE id = :id AND psicologo_id = :psicologoId
    `, {
      replacements: valores
    });

    return ManejadorRespuestas.exito(
      res,
      'Estado de cita actualizado exitosamente',
      { id, estado },
      'CIT_021'
    );
  } catch (error) {
    log.error('Error en actualizarEstadoCita:', error);
    return ManejadorRespuestas.errorInterno(
      res,
      'Error interno al actualizar el estado de la cita',
      'CIT_022'
    );
  }
};

// Cancelar cita (paciente)
export const cancelarCita = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const pacienteId = req.usuario?.id;

    if (!pacienteId) {
      return ManejadorRespuestas.noAutorizado(
        res,
        'Usuario no autenticado',
        'CIT_023'
      );
    }

    if (!id) {
      return ManejadorRespuestas.errorValidacion(
        res,
        'ID de cita es requerido',
        { id },
        'CIT_024'
      );
    }

    // Verificar que la cita pertenece al paciente
    const [cita] = await sequelize.query(`
      SELECT c.id FROM citas c
      INNER JOIN pacientes p ON c.paciente_id = p.id
      WHERE c.id = :id
      AND p.usuario_id = :pacienteId
    `, {
      replacements: { id, pacienteId }
    }) as [any[], unknown];

    if (!Array.isArray(cita) || cita.length === 0) {
      return ManejadorRespuestas.noEncontrado(
        res,
        'Cita no encontrada',
        'CIT_025'
      );
    }

    // Cancelar la cita
    await sequelize.query(`
      UPDATE citas
      SET estado = 'cancelada', updated_at = NOW()
      WHERE id = :id
    `, {
      replacements: { id }
    });

    return ManejadorRespuestas.exito(
      res,
      'Cita cancelada exitosamente',
      { id },
      'CIT_026'
    );
  } catch (error) {
    log.error('Error en cancelarCita:', error);
    return ManejadorRespuestas.errorInterno(
      res,
      'Error interno al cancelar la cita',
      'CIT_027'
    );
  }
}; 