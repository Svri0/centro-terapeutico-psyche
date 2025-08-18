import { Request, Response } from 'express';
import { ManejadorRespuestas } from '../utilidades/respuestas';
import { log } from '../utilidades/logger';
import sequelize from '../configuracion/database';
import { verificarToken } from '../middleware/auth.middleware';

// Importar tipos para Request extendido
import '../middleware/auth.middleware';

// Obtener citas del psicólogo autenticado
export const obtenerCitasPsicologo = async (req: Request, res: Response) => {
  try {
    const psicologoId = req.usuario?.id;
    
    console.log('🔍 Psicólogo ID:', psicologoId);
    console.log('🔍 Usuario completo:', req.usuario);
    
    if (!psicologoId) {
      return ManejadorRespuestas.noAutorizado(
        res,
        'No autorizado',
        'CITAS_001'
      );
    }

    const [citas] = await sequelize.query(
      `SELECT 
        c.id,
        c.paciente_id,
        p.nombres as paciente_nombres,
        p.apellidos as paciente_apellidos,
        p.email as paciente_email,
        p.numero_ficha,
        c.fecha,
        c.hora_inicio,
        c.hora_fin,
        c.duracion_minutos,
        c.estado,
        c.tipo_sesion,
        c.modalidad,
        c.notas_paciente,
        c.notas_psicologo,
        c.recordatorio_enviado,
        c.created_at,
        c.updated_at
       FROM citas c
       INNER JOIN pacientes p ON c.paciente_id = p.id
       WHERE c.psicologo_id = :psicologoId
       ORDER BY c.fecha ASC, c.hora_inicio ASC`,
      {
        replacements: { psicologoId }
      }
    ) as [any[], unknown];

    console.log('🔍 Citas encontradas:', citas);
    console.log('🔍 Número de citas:', Array.isArray(citas) ? citas.length : 0);

    return ManejadorRespuestas.exito(
      res,
      'Citas obtenidas exitosamente',
      citas,
      'CITAS_002'
    );

  } catch (error) {
    log.error('Error en obtenerCitasPsicologo:', error);
    return ManejadorRespuestas.errorInterno(
      res,
      'Error al obtener las citas',
      'CITAS_003'
    );
  }
};

// Obtener citas del paciente autenticado
export const obtenerCitasPaciente = async (req: Request, res: Response) => {
  try {
    const pacienteId = req.usuario?.id;
    
    if (!pacienteId) {
      return ManejadorRespuestas.noAutorizado(
        res,
        'No autorizado',
        'CITAS_004'
      );
    }

    const [citas] = await sequelize.query(
      `SELECT 
        c.id,
        c.psicologo_id,
        u.nombres as psicologo_nombres,
        u.apellidos as psicologo_apellidos,
        u.email as psicologo_email,
        c.fecha,
        c.hora_inicio,
        c.hora_fin,
        c.duracion_minutos,
        c.estado,
        c.tipo_sesion,
        c.modalidad,
        c.notas_paciente,
        c.notas_psicologo,
        c.recordatorio_enviado,
        c.created_at,
        c.updated_at
       FROM citas c
       INNER JOIN usuarios u ON c.psicologo_id = u.id
       WHERE c.paciente_id = :pacienteId
       ORDER BY c.fecha ASC, c.hora_inicio ASC`,
      {
        replacements: { pacienteId }
      }
    ) as [any[], unknown];

    return ManejadorRespuestas.exito(
      res,
      'Citas obtenidas exitosamente',
      citas,
      'CITAS_005'
    );

  } catch (error) {
    log.error('Error en obtenerCitasPaciente:', error);
    return ManejadorRespuestas.errorInterno(
      res,
      'Error al obtener las citas',
      'CITAS_006'
    );
  }
};

// Obtener una cita específica
export const obtenerCita = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.usuario?.id;

    if (!userId) {
      return ManejadorRespuestas.noAutorizado(
        res,
        'No autorizado',
        'CITAS_007'
      );
    }

    const [citas] = await sequelize.query(
      `SELECT 
        c.*,
        p.nombres as paciente_nombres,
        p.apellidos as paciente_apellidos,
        p.email as paciente_email,
        u.nombres as psicologo_nombres,
        u.apellidos as psicologo_apellidos,
        u.email as psicologo_email
       FROM citas c
       INNER JOIN pacientes p ON c.paciente_id = p.id
       INNER JOIN usuarios u ON c.psicologo_id = u.id
       WHERE c.id = :id AND (c.paciente_id = :userId OR c.psicologo_id = :userId)`,
      {
        replacements: { id, userId }
      }
    ) as [any[], unknown];

    if (!Array.isArray(citas) || citas.length === 0) {
      return ManejadorRespuestas.noEncontrado(
        res,
        'Cita no encontrada',
        'CITAS_008'
      );
    }

    return ManejadorRespuestas.exito(
      res,
      'Cita obtenida exitosamente',
      citas[0],
      'CITAS_009'
    );

  } catch (error) {
    log.error('Error en obtenerCita:', error);
    return ManejadorRespuestas.errorInterno(
      res,
      'Error al obtener la cita',
      'CITAS_010'
    );
  }
};

// Crear una nueva cita
export const crearCita = async (req: Request, res: Response) => {
  try {
    const {
      paciente_id,
      fecha,
      hora_inicio,
      hora_fin,
      duracion_minutos,
      tipo_sesion,
      modalidad,
      notas_paciente
    } = req.body;

    const userId = req.usuario?.id;
    const userRole = req.usuario?.rol_id;

    console.log('🔍 Creando cita con datos:', {
      paciente_id,
      fecha,
      hora_inicio,
      hora_fin,
      duracion_minutos,
      tipo_sesion,
      modalidad,
      notas_paciente,
      userId,
      userRole
    });

    if (!userId) {
      return ManejadorRespuestas.noAutorizado(
        res,
        'No autorizado',
        'CITAS_011'
      );
    }

    let psicologoId: string;

    // Si es un paciente (rol_id = 3), obtener el psicólogo del paciente
    if (userRole === 3) {
      console.log('🔍 Buscando paciente con usuario_id:', userId);
      
      const [pacienteData] = await sequelize.query(
        `SELECT id, psicologo_id FROM pacientes WHERE usuario_id = :userId`,
        {
          replacements: { userId }
        }
      ) as [any[], unknown];

      console.log('🔍 Resultado de la consulta paciente:', pacienteData);
      console.log('🔍 Comparación - paciente_id recibido:', paciente_id, 'vs userId:', userId, 'vs pacienteId de BD:', pacienteData[0]?.id);

      if (!Array.isArray(pacienteData) || pacienteData.length === 0) {
        console.log('❌ Paciente no encontrado en la tabla pacientes para usuario_id:', userId);
        return ManejadorRespuestas.noEncontrado(
          res,
          'Paciente no encontrado. Contacta al administrador para completar tu registro.',
          'CITAS_012'
        );
      }

      const pacienteId = pacienteData[0].id;
      psicologoId = pacienteData[0].psicologo_id;
      
      console.log('✅ Paciente encontrado - ID:', pacienteId, 'Psicólogo ID:', psicologoId);
      
      // Verificar que el paciente_id coincide con el usuario autenticado
      // El frontend puede enviar el usuario_id como paciente_id, así que verificamos ambos casos
      if (paciente_id !== pacienteId && paciente_id !== userId) {
        return ManejadorRespuestas.noAutorizado(
          res,
          'No puedes crear citas para otros pacientes',
          'CITAS_013'
        );
      }
      
      // Actualizar el paciente_id para usar el ID correcto de la tabla pacientes
      req.body.paciente_id = pacienteId;
    } else {
      // Si es un psicólogo (rol_id = 2), usar su ID
      psicologoId = userId;
      
      // Validar que el paciente existe y pertenece al psicólogo
      const [paciente] = await sequelize.query(
        `SELECT id FROM pacientes WHERE id = :pacienteId AND psicologo_id = :psicologoId`,
        {
          replacements: { pacienteId: paciente_id, psicologoId }
        }
      ) as [any[], unknown];

      if (!Array.isArray(paciente) || paciente.length === 0) {
        return ManejadorRespuestas.noEncontrado(
          res,
          'Paciente no encontrado o no pertenece al psicólogo',
          'CITAS_014'
        );
      }
    }

    // Verificar disponibilidad
    const [citasExistentes] = await sequelize.query(
      `SELECT id FROM citas 
       WHERE psicologo_id = :psicologoId 
       AND fecha = :fecha 
       AND (
         (hora_inicio <= :horaInicio AND hora_fin > :horaInicio) OR
         (hora_inicio < :horaFin AND hora_fin >= :horaFin) OR
         (hora_inicio >= :horaInicio AND hora_fin <= :horaFin)
       )`,
      {
        replacements: { 
          psicologoId, 
          fecha, 
          horaInicio: hora_inicio, 
          horaFin: hora_fin 
        }
      }
    ) as [any[], unknown];

    if (Array.isArray(citasExistentes) && citasExistentes.length > 0) {
      return ManejadorRespuestas.conflicto(
        res,
        'Ya existe una cita en ese horario',
        'CITAS_015'
      );
    }

         // Crear la cita
     const [resultado] = await sequelize.query(
       `INSERT INTO citas (
         id, paciente_id, psicologo_id, fecha, hora_inicio, hora_fin,
         duracion_minutos, tipo_sesion, modalidad, notas_paciente,
         estado, recordatorio_enviado, created_at, updated_at
       ) VALUES (
         gen_random_uuid(), :pacienteId, :psicologoId, :fecha, :horaInicio, :horaFin,
         :duracionMinutos, :tipoSesion, :modalidad, :notasPaciente,
         'programada', false, NOW(), NOW()
       ) RETURNING id`,
       {
         replacements: {
           pacienteId: req.body.paciente_id, // Usar el paciente_id actualizado
           psicologoId,
           fecha,
           horaInicio: hora_inicio,
           horaFin: hora_fin,
           duracionMinutos: duracion_minutos,
           tipoSesion: tipo_sesion,
           modalidad,
           notasPaciente: notas_paciente
         }
       }
     ) as [any[], unknown];

    const citaId = Array.isArray(resultado) ? resultado[0]?.id : null;

    console.log('✅ Cita creada exitosamente con ID:', citaId);

    return ManejadorRespuestas.creado(
      res,
      'Cita creada exitosamente',
      { id: citaId },
      'CITAS_016'
    );

  } catch (error) {
    log.error('Error en crearCita:', error);
    return ManejadorRespuestas.errorInterno(
      res,
      'Error al crear la cita',
      'CITAS_017'
    );
  }
};

// Actualizar una cita
export const actualizarCita = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.usuario?.id;
    const datosActualizacion = req.body;

    if (!userId) {
      return ManejadorRespuestas.noAutorizado(
        res,
        'No autorizado',
        'CITAS_016'
      );
    }

    // Verificar que la cita existe y pertenece al usuario
    const [cita] = await sequelize.query(
      `SELECT id FROM citas WHERE id = :id AND (paciente_id = :userId OR psicologo_id = :userId)`,
      {
        replacements: { id, userId }
      }
    ) as [any[], unknown];

    if (!Array.isArray(cita) || cita.length === 0) {
      return ManejadorRespuestas.noEncontrado(
        res,
        'Cita no encontrada',
        'CITAS_017'
      );
    }

    // Construir la consulta de actualización dinámicamente
    const camposActualizables = [
      'fecha', 'hora_inicio', 'hora_fin', 'duracion_minutos',
      'tipo_sesion', 'modalidad', 'notas_paciente', 'notas_psicologo'
    ];

    const camposParaActualizar = camposActualizables.filter(campo => 
      datosActualizacion[campo] !== undefined
    );

    if (camposParaActualizar.length === 0) {
      return ManejadorRespuestas.errorValidacion(
        res,
        'No hay campos válidos para actualizar',
        null,
        'CITAS_018'
      );
    }

    const setClause = camposParaActualizar.map(campo => `${campo} = :${campo}`).join(', ');
    
    await sequelize.query(
      `UPDATE citas SET ${setClause}, updated_at = NOW() WHERE id = :id`,
      {
        replacements: { ...datosActualizacion, id }
      }
    );

    return ManejadorRespuestas.exito(
      res,
      'Cita actualizada exitosamente',
      null,
      'CITAS_019'
    );

  } catch (error) {
    log.error('Error en actualizarCita:', error);
    return ManejadorRespuestas.errorInterno(
      res,
      'Error al actualizar la cita',
      'CITAS_020'
    );
  }
};

// Actualizar estado de una cita
export const actualizarEstadoCita = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;
    const userId = req.usuario?.id;

    console.log('🔍 Actualizando estado de cita:', { id, estado, userId });

    if (!userId) {
      return ManejadorRespuestas.noAutorizado(
        res,
        'No autorizado',
        'CITAS_021'
      );
    }

    // Verificar que la cita existe y pertenece al usuario
    const [cita] = await sequelize.query(
      `SELECT id FROM citas WHERE id = :id AND (paciente_id = :userId OR psicologo_id = :userId)`,
      {
        replacements: { id, userId }
      }
    ) as [any[], unknown];

    console.log('🔍 Resultado de verificación de cita:', cita);

    if (!Array.isArray(cita) || cita.length === 0) {
      console.log('❌ Cita no encontrada o no pertenece al usuario');
      return ManejadorRespuestas.noEncontrado(
        res,
        'Cita no encontrada',
        'CITAS_022'
      );
    }

    // Validar estado
    const estadosValidos = ['programada', 'confirmada', 'en_progreso', 'completada', 'cancelada', 'no_show'];
    console.log('🔍 Estado recibido:', estado, 'Estados válidos:', estadosValidos);
    
    if (!estadosValidos.includes(estado)) {
      console.log('❌ Estado no válido:', estado);
      return ManejadorRespuestas.errorValidacion(
        res,
        'Estado no válido',
        null,
        'CITAS_023'
      );
    }

    console.log('✅ Estado válido, actualizando cita...');
    
    await sequelize.query(
      `UPDATE citas SET estado = :estado, updated_at = NOW() WHERE id = :id`,
      {
        replacements: { estado, id }
      }
    );

    console.log('✅ Cita actualizada exitosamente');

    return ManejadorRespuestas.exito(
      res,
      'Estado de cita actualizado exitosamente',
      null,
      'CITAS_024'
    );

  } catch (error) {
    log.error('Error en actualizarEstadoCita:', error);
    return ManejadorRespuestas.errorInterno(
      res,
      'Error al actualizar el estado de la cita',
      'CITAS_025'
    );
  }
};

// Cancelar una cita
export const cancelarCita = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.usuario?.id;

    if (!userId) {
      return ManejadorRespuestas.noAutorizado(
        res,
        'No autorizado',
        'CITAS_026'
      );
    }

    // Verificar que la cita existe y pertenece al usuario
    const [cita] = await sequelize.query(
      `SELECT id FROM citas WHERE id = :id AND (paciente_id = :userId OR psicologo_id = :userId)`,
      {
        replacements: { id, userId }
      }
    ) as [any[], unknown];

    if (!Array.isArray(cita) || cita.length === 0) {
      return ManejadorRespuestas.noEncontrado(
        res,
        'Cita no encontrada',
        'CITAS_027'
      );
    }

    await sequelize.query(
      `UPDATE citas SET estado = 'cancelada', updated_at = NOW() WHERE id = :id`,
      {
        replacements: { id }
      }
    );

    return ManejadorRespuestas.exito(
      res,
      'Cita cancelada exitosamente',
      null,
      'CITAS_028'
    );

  } catch (error) {
    log.error('Error en cancelarCita:', error);
    return ManejadorRespuestas.errorInterno(
      res,
      'Error al cancelar la cita',
      'CITAS_029'
    );
  }
};

// Obtener disponibilidad del psicólogo
export const obtenerDisponibilidad = async (req: Request, res: Response) => {
  try {
    const { psicologoId } = req.params;
    const { fecha } = req.query;

    if (!fecha) {
      return ManejadorRespuestas.errorValidacion(
        res,
        'Fecha requerida',
        null,
        'CITAS_030'
      );
    }

    // Obtener horarios disponibles (por ahora retornamos horarios por defecto)
    const horariosDisponibles = [
      { hora: '09:00', disponible: true },
      { hora: '10:00', disponible: true },
      { hora: '11:00', disponible: true },
      { hora: '12:00', disponible: true },
      { hora: '14:00', disponible: true },
      { hora: '15:00', disponible: true },
      { hora: '16:00', disponible: true },
      { hora: '17:00', disponible: true }
    ];

    return ManejadorRespuestas.exito(
      res,
      'Disponibilidad obtenida exitosamente',
      horariosDisponibles,
      'CITAS_031'
    );

  } catch (error) {
    log.error('Error en obtenerDisponibilidad:', error);
    return ManejadorRespuestas.errorInterno(
      res,
      'Error al obtener la disponibilidad',
      'CITAS_032'
    );
  }
};

// Obtener estadísticas de citas
export const obtenerEstadisticasCitas = async (req: Request, res: Response) => {
  try {
    const psicologoId = req.usuario?.id;

    if (!psicologoId) {
      return ManejadorRespuestas.noAutorizado(
        res,
        'No autorizado',
        'CITAS_033'
      );
    }

    const [estadisticas] = await sequelize.query(
      `SELECT 
        COUNT(*) as total_citas,
        COUNT(CASE WHEN estado = 'completada' THEN 1 END) as citas_completadas,
        COUNT(CASE WHEN estado = 'cancelada' THEN 1 END) as citas_canceladas,
        COUNT(CASE WHEN estado = 'no_show' THEN 1 END) as citas_no_show,
        COUNT(CASE WHEN fecha = CURRENT_DATE THEN 1 END) as citas_hoy
       FROM citas 
       WHERE psicologo_id = :psicologoId`,
      {
        replacements: { psicologoId }
      }
    ) as [any[], unknown];

    const stats = Array.isArray(estadisticas) ? estadisticas[0] : {};

    return ManejadorRespuestas.exito(
      res,
      'Estadísticas obtenidas exitosamente',
      stats,
      'CITAS_034'
    );

  } catch (error) {
    log.error('Error en obtenerEstadisticasCitas:', error);
    return ManejadorRespuestas.errorInterno(
      res,
      'Error al obtener las estadísticas',
      'CITAS_035'
    );
  }
}; 