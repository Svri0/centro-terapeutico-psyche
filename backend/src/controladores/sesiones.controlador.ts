// Controlador de sesiones
import { Request, Response } from 'express';
import { ManejadorRespuestas } from '../utilidades/respuestas';
import { Sesion } from '../modelos';
import sequelize from '../configuracion/database';
import { QueryTypes } from 'sequelize';

export const obtenerTodas = async (_req: Request, res: Response) => {
  try {
    // TODO: Implementar lógica para obtener todas las sesiones
    res.json({ mensaje: 'Sesiones obtenidas exitosamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener sesiones' });
  }
};

// Obtener sesiones del psicólogo autenticado
export const obtenerSesionesPsicologo = async (req: Request, res: Response) => {
  try {
    const psicologoId = req.usuario?.id;
    
    if (!psicologoId) {
      return ManejadorRespuestas.noAutorizado(res, 'Usuario no autenticado', 'SESION_001');
    }

    console.log('🔍 Backend - Obteniendo sesiones para psicólogo ID:', psicologoId);

    // Obtener sesiones del psicólogo con información del paciente
    const sesiones = await sequelize.query(`
      SELECT 
        s.id,
        s.paciente_id,
        s.psicologo_id,
        u.nombres as psicologo_nombres,
        u.apellidos as psicologo_apellidos,
        u.email as psicologo_email,
        s.fecha_programada as fecha,
        s.fecha_inicio as hora_inicio,
        s.fecha_fin as hora_fin,
        s.duracion_minutos,
        s.estado,
        s.tipo_sesion,
        s.tipo_sesion as modalidad,
        s.observaciones as notas_paciente,
        s.notas_evolucion as notas_psicologo,
        false as recordatorio_enviado,
        s.created_at,
        s.updated_at
       FROM sesiones s
       LEFT JOIN usuarios u ON s.psicologo_id = u.id
       WHERE s.psicologo_id = :psicologoId
       ORDER BY s.fecha_programada ASC, s.fecha_inicio ASC
    `, {
      replacements: { psicologoId },
      type: QueryTypes.SELECT
    });

    console.log('🔍 Backend - Sesiones encontradas:', sesiones.length);

    return ManejadorRespuestas.exito(res, 'Sesiones obtenidas exitosamente', sesiones);
  } catch (error) {
    console.error('❌ Error al obtener sesiones del psicólogo:', error);
    return ManejadorRespuestas.errorInterno(res, 'Error al obtener sesiones');
  }
};

// Obtener sesiones del paciente autenticado
export const obtenerSesionesPaciente = async (req: Request, res: Response) => {
  try {
    const usuarioId = req.usuario?.id;
    
    if (!usuarioId) {
      return ManejadorRespuestas.noAutorizado(res, 'Usuario no autenticado', 'SESION_001');
    }

    console.log('🔍 Backend - Obteniendo sesiones para usuario ID:', usuarioId);

    // Primero obtener el ID del paciente
    const [pacienteResult] = await sequelize.query(
      'SELECT id FROM pacientes WHERE usuario_id = :usuarioId',
      {
      replacements: { usuarioId },
      type: QueryTypes.SELECT
      }
    ) as any[];

    if (!pacienteResult) {
      return ManejadorRespuestas.noEncontrado(res, 'Paciente no encontrado');
    }

    const pacienteId = pacienteResult.id;
    console.log('🔍 Backend - Paciente encontrado, ID real:', pacienteId);

    // Obtener sesiones del paciente con información del psicólogo
    const sesiones = await sequelize.query(`
      SELECT 
        s.id,
        s.psicologo_id,
        u.nombres as psicologo_nombres,
        u.apellidos as psicologo_apellidos,
        u.email as psicologo_email,
        s.fecha_programada as fecha,
        s.fecha_inicio as hora_inicio,
        s.fecha_fin as hora_fin,
        s.duracion_minutos,
        s.estado,
        s.tipo_sesion,
        s.tipo_sesion as modalidad,
        s.observaciones as notas_paciente,
        s.notas_evolucion as notas_psicologo,
        false as recordatorio_enviado,
        s.created_at,
        s.updated_at
       FROM sesiones s
       LEFT JOIN usuarios u ON s.psicologo_id = u.id
       WHERE s.paciente_id = :pacienteId
       ORDER BY s.fecha_programada ASC, s.fecha_inicio ASC
    `, {
      replacements: { pacienteId },
      type: QueryTypes.SELECT
    });

    console.log('🔍 Backend - Sesiones encontradas:', sesiones.length);

    return ManejadorRespuestas.exito(res, 'Sesiones obtenidas exitosamente', sesiones);
  } catch (error) {
    console.error('❌ Error al obtener sesiones del paciente:', error);
    return ManejadorRespuestas.errorInterno(res, 'Error al obtener sesiones');
  }
};

export const obtenerPorId = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    // TODO: Implementar lógica para obtener sesión por ID
    res.json({ mensaje: `Sesión ${id} obtenida exitosamente` });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener sesión' });
  }
};

export const crear = async (req: Request, res: Response) => {
  try {
    console.log('🔍 SESIONES - Crear sesión iniciado');
    console.log('🔍 SESIONES - Usuario autenticado:', req.usuario);
    console.log('🔍 SESIONES - Body recibido:', req.body);
    
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

    // Validaciones básicas
    if (!paciente_id || !fecha || !hora_inicio || !hora_fin) {
      console.log('❌ SESIONES - Validación fallida: campos requeridos faltantes');
      return ManejadorRespuestas.errorValidacion(
        res,
        'paciente_id, fecha, hora_inicio y hora_fin son requeridos',
        'SESION_002'
      );
    }

    console.log('🔍 SESIONES - Buscando paciente con usuario_id:', paciente_id);

    // Obtener el psicólogo asignado al paciente
    // El paciente_id que recibimos es el ID del usuario, necesitamos buscar el paciente real
    const [paciente] = await sequelize.query(
      'SELECT id, psicologo_id FROM pacientes WHERE usuario_id = :usuarioId',
      {
        replacements: { usuarioId: paciente_id },
        type: QueryTypes.SELECT
      }
    ) as any[];

    console.log('🔍 SESIONES - Paciente encontrado:', paciente);

    if (!paciente || !paciente.psicologo_id) {
      console.log('❌ SESIONES - Paciente no encontrado o sin psicólogo asignado');
      return ManejadorRespuestas.errorValidacion(
        res,
        'El paciente no tiene un psicólogo asignado',
        'SESION_003'
      );
    }

    const pacienteRealId = paciente.id;
    console.log('✅ SESIONES - Paciente real ID:', pacienteRealId);

    // Crear la fecha completa combinando fecha y hora
    const fechaCompletaInicio = `${fecha}T${hora_inicio}:00`;
    const fechaCompletaFin = `${fecha}T${hora_fin}:00`;

    // Verificar si ya existe una sesión en esa fecha y hora
    const [sesionExistente] = await sequelize.query(
      'SELECT id FROM sesiones WHERE paciente_id = :pacienteRealId AND fecha_programada = :fecha AND DATE(fecha_inicio) = :fecha AND EXTRACT(HOUR FROM fecha_inicio) = :hora',
      {
        replacements: {
          pacienteRealId: pacienteRealId,
          fecha: fecha,
          hora: parseInt(hora_inicio.split(':')[0])
        },
        type: QueryTypes.SELECT
      }
    ) as any[];

    if (sesionExistente) {
      return ManejadorRespuestas.errorValidacion(
        res,
        'Ya existe una sesión programada para esta fecha y hora',
        'SESION_004'
      );
    }

    // Crear la sesión
    const [nuevaSesion] = await sequelize.query(`
      INSERT INTO sesiones (
        id,
        paciente_id,
        psicologo_id,
        fecha_programada,
        fecha_inicio,
        fecha_fin,
        duracion_minutos,
        estado,
        tipo_sesion,
        observaciones,
        objetivos_sesion,
        tecnicas_utilizadas,
        objetivos_alcanzados,
        tareas_asignadas,
        derivacion_recomendada,
        archivos_sesion,
        archivos_adjuntos,
        created_at,
        updated_at
      ) VALUES (
        gen_random_uuid(),
        :paciente_real_id,
        :psicologo_id,
        :fecha,
        :fecha_inicio,
        :fecha_fin,
        :duracion_minutos,
        'programada',
        :tipo_sesion,
        :observaciones,
        '[]',
        '[]',
        '[]',
        '[]',
        '{}',
        '[]',
        '[]',
        NOW(),
        NOW()
      ) RETURNING *
    `, {
      replacements: {
        paciente_real_id: pacienteRealId,
        psicologo_id: paciente.psicologo_id,
        fecha,
        fecha_inicio: fechaCompletaInicio,
        fecha_fin: fechaCompletaFin,
        duracion_minutos: duracion_minutos || 60,
        tipo_sesion: tipo_sesion || 'presencial',
        observaciones: notas_paciente || 'Cita agendada desde el sistema'
      },
      type: QueryTypes.INSERT
    }) as any[];

    console.log('✅ Sesión creada exitosamente:', nuevaSesion);

    return ManejadorRespuestas.exito(
      res,
      'Sesión creada exitosamente',
      nuevaSesion,
      'SESION_005'
    );

  } catch (error: any) {
    console.error('❌ Error al crear sesión:', error);
    console.error('❌ Stack trace:', error.stack);
    return ManejadorRespuestas.errorInterno(
      res,
      'Error al crear la sesión',
      'SESION_006'
    );
  }
};

export const actualizar = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      fecha,
      hora_inicio,
      hora_fin,
      duracion_minutos,
      tipo_sesion,
      modalidad,
      notas_paciente,
      notas_psicologo
    } = req.body;

    // Buscar la sesión existente
    const [sesionExistente] = await sequelize.query(
      'SELECT * FROM sesiones WHERE id = :id',
      {
        replacements: { id },
        type: QueryTypes.SELECT
      }
    ) as any[];

    if (!sesionExistente) {
      return ManejadorRespuestas.noEncontrado(
        res,
        'Sesión no encontrada',
        'SESION_007'
      );
    }

    // Preparar los datos para actualizar
    const datosActualizacion: any = {};
    
    if (fecha) datosActualizacion.fecha_programada = fecha;
    if (hora_inicio) datosActualizacion.fecha_inicio = `${fecha || sesionExistente.fecha_programada}T${hora_inicio}:00`;
    if (hora_fin) datosActualizacion.fecha_fin = `${fecha || sesionExistente.fecha_programada}T${hora_fin}:00`;
    if (duracion_minutos) datosActualizacion.duracion_minutos = duracion_minutos;
    if (tipo_sesion) datosActualizacion.tipo_sesion = tipo_sesion;
    if (notas_paciente) datosActualizacion.observaciones = notas_paciente;
    if (notas_psicologo) datosActualizacion.notas_evolucion = notas_psicologo;
    
    datosActualizacion.updated_at = new Date();

    // Construir la consulta de actualización dinámicamente
    const campos = Object.keys(datosActualizacion);
    const valores = campos.map(campo => `${campo} = :${campo}`).join(', ');
    
    const [sesionActualizada] = await sequelize.query(`
      UPDATE sesiones 
      SET ${valores}
      WHERE id = :id
      RETURNING *
    `, {
      replacements: {
        id,
        ...datosActualizacion
      },
      type: QueryTypes.UPDATE
    }) as any[];

    console.log('✅ Sesión actualizada exitosamente:', sesionActualizada);

    return ManejadorRespuestas.exito(
      res,
      'Sesión actualizada exitosamente',
      sesionActualizada,
      'SESION_008'
    );

  } catch (error: any) {
    console.error('❌ Error al actualizar sesión:', error);
    return ManejadorRespuestas.errorInterno(
      res,
      'Error al actualizar la sesión',
      'SESION_009'
    );
  }
};

export const eliminar = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Buscar la sesión existente
    const [sesionExistente] = await sequelize.query(
      'SELECT * FROM sesiones WHERE id = :id',
      {
        replacements: { id },
        type: QueryTypes.SELECT
      }
    ) as any[];

    if (!sesionExistente) {
      return ManejadorRespuestas.noEncontrado(
        res,
        'Sesión no encontrada',
        'SESION_010'
      );
    }

    // Eliminar la sesión (soft delete)
    await sequelize.query(
      'UPDATE sesiones SET deleted_at = NOW() WHERE id = :id',
      {
        replacements: { id },
        type: QueryTypes.UPDATE
      }
    );

    console.log('✅ Sesión eliminada exitosamente:', id);

    return ManejadorRespuestas.exito(
      res,
      'Sesión eliminada exitosamente',
      null,
      'SESION_011'
    );

  } catch (error: any) {
    console.error('❌ Error al eliminar sesión:', error);
    return ManejadorRespuestas.errorInterno(
      res,
      'Error al eliminar la sesión',
      'SESION_012'
    );
  }
};
