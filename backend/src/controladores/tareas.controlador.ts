// Controlador de tareas
import { Request, Response } from 'express';
import sequelize from '../configuracion/database';
import { ManejadorRespuestas } from '../utilidades/respuestas';
import { log } from '../utilidades/logger';
import { RespuestaTarea } from '../modelos/RespuestaTarea';

// Obtener todas las tareas del psicólogo
export const obtenerTodas = async (req: Request, res: Response) => {
  try {
    const psicologoId = req.usuario?.id;
    const { paciente_id, estado, tipo_tarea } = req.query;

    if (!psicologoId) {
      return ManejadorRespuestas.noAutorizado(
        res,
        'Usuario no autenticado',
        'TAR_001'
      );
    }

    let whereClause = 't.psicologo_id = :psicologoId AND t.deleted_at IS NULL';
    let replacements: any = { psicologoId };

    if (paciente_id) {
      whereClause += ' AND t.paciente_id = :paciente_id';
      replacements.paciente_id = paciente_id;
    }

    if (estado) {
      whereClause += ' AND t.estado = :estado';
      replacements.estado = estado;
    }

    if (tipo_tarea) {
      whereClause += ' AND t.tipo_tarea = :tipo_tarea';
      replacements.tipo_tarea = tipo_tarea;
    }

    const [tareas] = await sequelize.query(`
      SELECT 
        t.id,
        t.titulo,
        t.descripcion,
        t.instrucciones,
        t.tipo_tarea,
        t.prioridad,
        t.fecha_asignacion,
        t.fecha_vencimiento,
        t.fecha_completada,
        t.estado,
        t.puntos_asignados,
        t.archivos_adjuntos,
        t.respuesta_paciente,
        t.archivos_respuesta,
        t.evaluacion_psicologo,
        t.created_at,
        t.updated_at,
        p.id as paciente_id,
        u.nombres as paciente_nombres,
        u.apellidos as paciente_apellidos,
        u.email as paciente_email,
        p.numero_ficha
      FROM tareas t
      INNER JOIN pacientes p ON t.paciente_id = p.id
      INNER JOIN usuarios u ON p.usuario_id = u.id
      WHERE ${whereClause}
      ORDER BY t.fecha_asignacion DESC
    `, {
      replacements
    }) as [any[], unknown];

    return ManejadorRespuestas.exito(
      res,
      'Tareas obtenidas exitosamente',
      { tareas },
      'TAR_002'
    );
  } catch (error) {
    log.error('Error en obtenerTodas:', error);
    return ManejadorRespuestas.errorInterno(
      res,
      'Error interno al obtener las tareas',
      'TAR_003'
    );
  }
};

// Obtener tarea por ID
export const obtenerPorId = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const psicologoId = req.usuario?.id;

    if (!psicologoId) {
      return ManejadorRespuestas.noAutorizado(
        res,
        'Usuario no autenticado',
        'TAR_004'
      );
    }

    const [tarea] = await sequelize.query(`
      SELECT 
        t.*,
        p.id as paciente_id,
        u.nombres as paciente_nombres,
        u.apellidos as paciente_apellidos,
        u.email as paciente_email,
        p.numero_ficha
      FROM tareas t
      INNER JOIN pacientes p ON t.paciente_id = p.id
      INNER JOIN usuarios u ON p.usuario_id = u.id
      WHERE t.id = :id AND t.psicologo_id = :psicologoId AND t.deleted_at IS NULL
    `, {
      replacements: { id, psicologoId }
    }) as [any[], unknown];

    if (!Array.isArray(tarea) || tarea.length === 0) {
      return ManejadorRespuestas.noEncontrado(
        res,
        'Tarea no encontrada',
        'TAR_005'
      );
    }

    return ManejadorRespuestas.exito(
      res,
      'Tarea obtenida exitosamente',
      tarea[0],
      'TAR_006'
    );
  } catch (error) {
    log.error('Error en obtenerPorId:', error);
    return ManejadorRespuestas.errorInterno(
      res,
      'Error interno al obtener la tarea',
      'TAR_007'
    );
  }
};

// Crear nueva tarea
export const crear = async (req: Request, res: Response) => {
  try {
    const psicologoId = req.usuario?.id;
    const {
      paciente_id,
      titulo,
      descripcion,
      instrucciones,
      tipo_tarea,
      prioridad,
      fecha_vencimiento,
      puntos_asignados,
      archivos_adjuntos
    } = req.body;

    if (!psicologoId) {
      return ManejadorRespuestas.noAutorizado(
        res,
        'Usuario no autenticado',
        'TAR_008'
      );
    }

    if (!paciente_id || !titulo || !descripcion) {
      return ManejadorRespuestas.errorValidacion(
        res,
        'paciente_id, titulo y descripcion son requeridos',
        req.body,
        'TAR_009'
      );
    }

    // Verificar que el paciente pertenece al psicólogo
    const [paciente] = await sequelize.query(`
      SELECT id FROM pacientes
      WHERE id = :paciente_id AND psicologo_id = :psicologoId AND deleted_at IS NULL
    `, {
      replacements: { paciente_id, psicologoId }
    }) as [any[], unknown];

    if (!Array.isArray(paciente) || paciente.length === 0) {
      return ManejadorRespuestas.noEncontrado(
        res,
        'Paciente no encontrado o no pertenece al psicólogo',
        'TAR_010'
      );
    }

    // Crear la tarea
    const [tareaCreada] = await sequelize.query(`
      INSERT INTO tareas (
        id, paciente_id, psicologo_id, titulo, descripcion, instrucciones,
        tipo_tarea, prioridad, fecha_asignacion, fecha_vencimiento,
        estado, puntos_asignados, archivos_adjuntos, archivos_respuesta,
        created_at, updated_at
      ) VALUES (
        gen_random_uuid(), :paciente_id, :psicologoId, :titulo, :descripcion, :instrucciones,
        :tipo_tarea, :prioridad, NOW(), :fecha_vencimiento,
        'pendiente', :puntos_asignados, :archivos_adjuntos, '[]',
        NOW(), NOW()
      ) RETURNING id, titulo, fecha_asignacion
    `, {
      replacements: {
        paciente_id,
        psicologoId,
        titulo,
        descripcion,
        instrucciones: instrucciones || null,
        tipo_tarea: tipo_tarea || 'ejercicio',
        prioridad: prioridad || 'media',
        fecha_vencimiento: fecha_vencimiento || null,
        puntos_asignados: puntos_asignados || 2,
        archivos_adjuntos: JSON.stringify(archivos_adjuntos || [])
      }
    }) as [any[], unknown];

    return ManejadorRespuestas.exito(
      res,
      'Tarea creada exitosamente',
      tareaCreada[0],
      'TAR_011'
    );
  } catch (error) {
    log.error('Error en crear:', error);
    return ManejadorRespuestas.errorInterno(
      res,
      'Error interno al crear la tarea',
      'TAR_012'
    );
  }
};

// Actualizar tarea
export const actualizar = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const psicologoId = req.usuario?.id;
    const {
      titulo,
      descripcion,
      instrucciones,
      tipo_tarea,
      prioridad,
      fecha_vencimiento,
      estado,
      puntos_asignados,
      archivos_adjuntos,
      respuesta_paciente,
      archivos_respuesta,
      evaluacion_psicologo
    } = req.body;

    if (!psicologoId) {
      return ManejadorRespuestas.noAutorizado(
        res,
        'Usuario no autenticado',
        'TAR_013'
      );
    }

    // Verificar que la tarea pertenece al psicólogo
    const [tarea] = await sequelize.query(`
      SELECT id FROM tareas
      WHERE id = :id AND psicologo_id = :psicologoId AND deleted_at IS NULL
    `, {
      replacements: { id, psicologoId }
    }) as [any[], unknown];

    if (!Array.isArray(tarea) || tarea.length === 0) {
      return ManejadorRespuestas.noEncontrado(
        res,
        'Tarea no encontrada',
        'TAR_014'
      );
    }

    // Construir query de actualización dinámicamente
    const campos = [];
    const valores: any = { id, psicologoId };

    if (titulo !== undefined) {
      campos.push('titulo = :titulo');
      valores.titulo = titulo;
    }

    if (descripcion !== undefined) {
      campos.push('descripcion = :descripcion');
      valores.descripcion = descripcion;
    }

    if (instrucciones !== undefined) {
      campos.push('instrucciones = :instrucciones');
      valores.instrucciones = instrucciones;
    }

    if (tipo_tarea !== undefined) {
      campos.push('tipo_tarea = :tipo_tarea');
      valores.tipo_tarea = tipo_tarea;
    }

    if (prioridad !== undefined) {
      campos.push('prioridad = :prioridad');
      valores.prioridad = prioridad;
    }

    if (fecha_vencimiento !== undefined) {
      campos.push('fecha_vencimiento = :fecha_vencimiento');
      valores.fecha_vencimiento = fecha_vencimiento;
    }

    if (estado !== undefined) {
      campos.push('estado = :estado');
      valores.estado = estado;
      
      // Si se marca como completada, establecer fecha_completada
      if (estado === 'completada') {
        campos.push('fecha_completada = NOW()');
      }
    }

    if (puntos_asignados !== undefined) {
      campos.push('puntos_asignados = :puntos_asignados');
      valores.puntos_asignados = puntos_asignados;
    }

    if (archivos_adjuntos !== undefined) {
      campos.push('archivos_adjuntos = :archivos_adjuntos');
      valores.archivos_adjuntos = JSON.stringify(archivos_adjuntos);
    }

    if (respuesta_paciente !== undefined) {
      campos.push('respuesta_paciente = :respuesta_paciente');
      valores.respuesta_paciente = respuesta_paciente;
    }

    if (archivos_respuesta !== undefined) {
      campos.push('archivos_respuesta = :archivos_respuesta');
      valores.archivos_respuesta = JSON.stringify(archivos_respuesta);
    }

    if (evaluacion_psicologo !== undefined) {
      campos.push('evaluacion_psicologo = :evaluacion_psicologo');
      valores.evaluacion_psicologo = JSON.stringify(evaluacion_psicologo);
    }

    campos.push('updated_at = NOW()');

    await sequelize.query(`
      UPDATE tareas
      SET ${campos.join(', ')}
      WHERE id = :id AND psicologo_id = :psicologoId
    `, {
      replacements: valores
    });

    return ManejadorRespuestas.exito(
      res,
      'Tarea actualizada exitosamente',
      { id },
      'TAR_015'
    );
  } catch (error) {
    log.error('Error en actualizar:', error);
    return ManejadorRespuestas.errorInterno(
      res,
      'Error interno al actualizar la tarea',
      'TAR_016'
    );
  }
};

// Eliminar tarea (soft delete)
export const eliminar = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const psicologoId = req.usuario?.id;

    if (!psicologoId) {
      return ManejadorRespuestas.noAutorizado(
        res,
        'Usuario no autenticado',
        'TAR_017'
      );
    }

    // Verificar que la tarea pertenece al psicólogo
    const [tarea] = await sequelize.query(`
      SELECT id FROM tareas
      WHERE id = :id AND psicologo_id = :psicologoId AND deleted_at IS NULL
    `, {
      replacements: { id, psicologoId }
    }) as [any[], unknown];

    if (!Array.isArray(tarea) || tarea.length === 0) {
      return ManejadorRespuestas.noEncontrado(
        res,
        'Tarea no encontrada',
        'TAR_018'
      );
    }

    // Soft delete
    await sequelize.query(`
      UPDATE tareas
      SET deleted_at = NOW()
      WHERE id = :id AND psicologo_id = :psicologoId
    `, {
      replacements: { id, psicologoId }
    });

    return ManejadorRespuestas.exito(
      res,
      'Tarea eliminada exitosamente',
      { id },
      'TAR_019'
    );
  } catch (error) {
    log.error('Error en eliminar:', error);
    return ManejadorRespuestas.errorInterno(
      res,
      'Error interno al eliminar la tarea',
      'TAR_020'
    );
  }
};

// Obtener tareas del paciente
export const obtenerTareasPaciente = async (req: Request, res: Response) => {
  try {
    const pacienteId = req.usuario?.id;
    const { estado, tipo_tarea } = req.query;

    if (!pacienteId) {
      return ManejadorRespuestas.noAutorizado(
        res,
        'Usuario no autenticado',
        'TAR_021'
      );
    }

    let whereClause = 'p.usuario_id = :pacienteId AND t.deleted_at IS NULL';
    let replacements: any = { pacienteId };

    if (estado) {
      whereClause += ' AND t.estado = :estado';
      replacements.estado = estado;
    }

    if (tipo_tarea) {
      whereClause += ' AND t.tipo_tarea = :tipo_tarea';
      replacements.tipo_tarea = tipo_tarea;
    }

    const [tareas] = await sequelize.query(`
      SELECT 
        t.id,
        t.titulo,
        t.descripcion,
        t.instrucciones,
        t.tipo_tarea,
        t.prioridad,
        t.fecha_asignacion,
        t.fecha_vencimiento,
        t.fecha_completada,
        t.estado,
        t.puntos_asignados,
        t.archivos_adjuntos,
        t.respuesta_paciente,
        t.archivos_respuesta,
        t.evaluacion_psicologo,
        t.created_at,
        t.updated_at,
        u.nombres as psicologo_nombres,
        u.apellidos as psicologo_apellidos,
        u.email as psicologo_email
      FROM tareas t
      INNER JOIN pacientes p ON t.paciente_id = p.id
      INNER JOIN usuarios u ON t.psicologo_id = u.id
      WHERE ${whereClause}
      ORDER BY t.fecha_asignacion DESC
    `, {
      replacements
    }) as [any[], unknown];

    return ManejadorRespuestas.exito(
      res,
      'Tareas obtenidas exitosamente',
      { tareas },
      'TAR_022'
    );
  } catch (error) {
    log.error('Error en obtenerTareasPaciente:', error);
    return ManejadorRespuestas.errorInterno(
      res,
      'Error interno al obtener las tareas',
      'TAR_023'
    );
  }
};

// Actualizar tarea del paciente (para pacientes)
export const actualizarTareaPaciente = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const pacienteId = req.usuario?.id;
    const { estado, respuesta_paciente, archivos_respuesta } = req.body;

    if (!pacienteId) {
      return ManejadorRespuestas.noAutorizado(
        res,
        'Usuario no autenticado',
        'TAR_024'
      );
    }

    // Verificar que la tarea pertenece al paciente
    const [tarea] = await sequelize.query(`
      SELECT t.id, t.estado
      FROM tareas t
      INNER JOIN pacientes p ON t.paciente_id = p.id
      WHERE t.id = :id AND p.usuario_id = :pacienteId AND t.deleted_at IS NULL
    `, {
      replacements: { id, pacienteId }
    }) as [any[], unknown];

    if (!Array.isArray(tarea) || tarea.length === 0) {
      return ManejadorRespuestas.noEncontrado(
        res,
        'Tarea no encontrada o no tienes permisos para modificarla',
        'TAR_025'
      );
    }

    // Preparar los campos a actualizar
    const camposActualizar: any = {};
    if (estado) camposActualizar.estado = estado;
    if (respuesta_paciente !== undefined) camposActualizar.respuesta_paciente = respuesta_paciente;
    if (archivos_respuesta !== undefined) camposActualizar.archivos_respuesta = archivos_respuesta;
    
    // Si se marca como completada, agregar fecha de completado
    if (estado === 'completada') {
      camposActualizar.fecha_completada = new Date().toISOString();
    }

    // Construir la consulta SQL dinámicamente
    const campos = Object.keys(camposActualizar).map(key => `${key} = :${key}`).join(', ');
    const replacements = { id, ...camposActualizar };

    await sequelize.query(`
      UPDATE tareas
      SET ${campos}, updated_at = NOW()
      WHERE id = :id
    `, {
      replacements
    });

    return ManejadorRespuestas.exito(
      res,
      'Tarea actualizada exitosamente',
      { id },
      'TAR_026'
    );
  } catch (error) {
    log.error('Error en actualizarTareaPaciente:', error);
    return ManejadorRespuestas.errorInterno(
      res,
      'Error interno al actualizar la tarea',
      'TAR_027'
    );
  }
};

// Crear tarea con nuevo sistema de tipos
export const crearTareaAvanzada = async (req: Request, res: Response) => {
  try {
    const psicologoId = req.usuario?.id;
    const {
      paciente_id,
      titulo,
      descripcion,
      instrucciones,
      tipo_tarea,
      tipo_tarea_avanzado,
      prioridad,
      fecha_vencimiento,
      puntos_asignados,
      archivos_adjuntos,
      contenido_tarea,
      configuracion_tarea,
      es_borrador,
      fecha_publicacion
    } = req.body;

    if (!psicologoId) {
      return ManejadorRespuestas.noAutorizado(
        res,
        'Usuario no autenticado',
        'TAR_028'
      );
    }

    if (!paciente_id || !titulo || !descripcion) {
      return ManejadorRespuestas.errorValidacion(
        res,
        'paciente_id, titulo y descripcion son requeridos',
        req.body,
        'TAR_029'
      );
    }

    // Validar tipo de tarea avanzado si se proporciona
    if (tipo_tarea_avanzado) {
      const tiposValidos = [
        'texto_abierto', 'opcion_multiple', 'test_psicologico', 
        'test_imagenes', 'tarea_dibujo', 'ejercicio', 'lectura', 
        'reflexion', 'practica', 'evaluacion'
      ];

      if (!tiposValidos.includes(tipo_tarea_avanzado)) {
        return ManejadorRespuestas.errorValidacion(
          res,
          'Tipo de tarea avanzado no válido',
          { tipo_tarea_avanzado, tiposValidos },
          'TAR_030'
        );
      }
    }

    // Verificar que el paciente pertenece al psicólogo
    const [paciente] = await sequelize.query(`
      SELECT id FROM pacientes
      WHERE id = :paciente_id AND psicologo_id = :psicologoId AND deleted_at IS NULL
    `, {
      replacements: { paciente_id, psicologoId }
    }) as [any[], unknown];

    if (!Array.isArray(paciente) || paciente.length === 0) {
      return ManejadorRespuestas.noEncontrado(
        res,
        'Paciente no encontrado o no pertenece al psicólogo',
        'TAR_031'
      );
    }

    // Crear la tarea con los nuevos campos
    const [tareaCreada] = await sequelize.query(`
      INSERT INTO tareas (
        id, paciente_id, psicologo_id, titulo, descripcion, instrucciones,
        tipo_tarea, tipo_tarea_avanzado, prioridad, fecha_asignacion, fecha_vencimiento,
        estado, puntos_asignados, archivos_adjuntos, archivos_respuesta,
        contenido_tarea, configuracion_tarea, es_borrador, fecha_publicacion,
        created_at, updated_at
      ) VALUES (
        gen_random_uuid(), :paciente_id, :psicologoId, :titulo, :descripcion, :instrucciones,
        :tipo_tarea, :tipo_tarea_avanzado, :prioridad, NOW(), :fecha_vencimiento,
        'pendiente', :puntos_asignados, :archivos_adjuntos, '[]',
        :contenido_tarea, :configuracion_tarea, :es_borrador, :fecha_publicacion,
        NOW(), NOW()
      ) RETURNING id, titulo, fecha_asignacion, tipo_tarea, tipo_tarea_avanzado
    `, {
      replacements: {
        paciente_id,
        psicologoId,
        titulo,
        descripcion,
        instrucciones: instrucciones || null,
        tipo_tarea: tipo_tarea || 'ejercicio',
        tipo_tarea_avanzado: tipo_tarea_avanzado || null,
        prioridad: prioridad || 'media',
        fecha_vencimiento: fecha_vencimiento || null,
        puntos_asignados: puntos_asignados || 2,
        archivos_adjuntos: JSON.stringify(archivos_adjuntos || []),
        contenido_tarea: JSON.stringify(contenido_tarea || {}),
        configuracion_tarea: JSON.stringify(configuracion_tarea || {}),
        es_borrador: es_borrador || false,
        fecha_publicacion: fecha_publicacion || null
      }
    }) as [any[], unknown];

    return ManejadorRespuestas.exito(
      res,
      'Tarea creada exitosamente',
      tareaCreada[0],
      'TAR_032'
    );
  } catch (error) {
    log.error('Error en crearTareaAvanzada:', error);
    return ManejadorRespuestas.errorInterno(
      res,
      'Error interno al crear la tarea',
      'TAR_033'
    );
  }
};

// Guardar respuesta de tarea
// Guardar respuesta de paciente
export const guardarRespuesta = async (req: Request, res: Response) => {
  try {
    const { tarea_id } = req.params;
    const pacienteId = req.usuario?.id;
    const { contenido_respuesta, archivo_respuesta } = req.body;

    if (!pacienteId) {
      return ManejadorRespuestas.noAutorizado(
        res,
        'Usuario no autenticado',
        'TAR_038'
      );
    }

    // Verificar que la tarea existe y pertenece al paciente
    const [tarea] = await sequelize.query(`
      SELECT t.id FROM tareas t
      INNER JOIN pacientes p ON t.paciente_id = p.id
      WHERE t.id = :tarea_id AND p.usuario_id = :pacienteId AND t.deleted_at IS NULL
    `, {
      replacements: { tarea_id, pacienteId }
    }) as [any[], unknown];

    if (!Array.isArray(tarea) || tarea.length === 0) {
      return ManejadorRespuestas.noEncontrado(
        res,
        'Tarea no encontrada',
        'TAR_039'
      );
    }

    // Crear la respuesta
    const respuesta = await RespuestaTarea.create({
      tarea_id: tarea_id as string,
      paciente_id: pacienteId as string,
      contenido_respuesta,
      archivo_respuesta,
      fecha_envio: new Date()
    });

    // Actualizar el estado de la tarea a completada
    await sequelize.query(`
      UPDATE tareas 
      SET estado = 'completada', fecha_completada = NOW(), updated_at = NOW()
      WHERE id = :tarea_id
    `, {
      replacements: { tarea_id }
    });

    return ManejadorRespuestas.exito(
      res,
      'Respuesta guardada exitosamente',
      { respuesta },
      'TAR_040'
    );
  } catch (error) {
    log.error('Error en guardarRespuesta:', error);
    return ManejadorRespuestas.errorInterno(
      res,
      'Error interno al guardar la respuesta',
      'TAR_041'
    );
  }
};

// Obtener respuestas de una tarea
export const obtenerRespuestas = async (req: Request, res: Response) => {
  try {
    const { tarea_id } = req.params;
    const psicologoId = req.usuario?.id;

    if (!psicologoId) {
      return ManejadorRespuestas.noAutorizado(
        res,
        'Usuario no autenticado',
        'TAR_039'
      );
    }

    // Verificar que la tarea pertenece al psicólogo
    const [tarea] = await sequelize.query(`
      SELECT id FROM tareas
      WHERE id = :tarea_id AND psicologo_id = :psicologoId AND deleted_at IS NULL
    `, {
      replacements: { tarea_id, psicologoId }
    }) as [any[], unknown];

    if (!Array.isArray(tarea) || tarea.length === 0) {
      return ManejadorRespuestas.noEncontrado(
        res,
        'Tarea no encontrada',
        'TAR_040'
      );
    }

    // Obtener las respuestas
    const respuestas = await RespuestaTarea.findAll({
      where: { tarea_id },
      include: [
        {
          model: require('../modelos/Paciente').default,
          as: 'paciente',
          include: [
            {
              model: require('../modelos/Usuario').default,
              as: 'usuario',
              attributes: ['nombres', 'apellidos', 'email']
            }
          ]
        }
      ],
      order: [['fecha_envio', 'DESC']]
    });

    return ManejadorRespuestas.exito(
      res,
      'Respuestas obtenidas exitosamente',
      { respuestas },
      'TAR_041'
    );
  } catch (error) {
    log.error('Error en obtenerRespuestas:', error);
    return ManejadorRespuestas.errorInterno(
      res,
      'Error interno al obtener las respuestas',
      'TAR_042'
    );
  }
};

// Evaluar respuesta de tarea
export const evaluarRespuesta = async (req: Request, res: Response) => {
  try {
    const { respuesta_id } = req.params;
    const psicologoId = req.usuario?.id;
    const { evaluacion_psicologo } = req.body;

    if (!psicologoId) {
      return ManejadorRespuestas.noAutorizado(
        res,
        'Usuario no autenticado',
        'TAR_043'
      );
    }

    if (!evaluacion_psicologo) {
      return ManejadorRespuestas.errorValidacion(
        res,
        'evaluacion_psicologo es requerido',
        req.body,
        'TAR_044'
      );
    }

    // Verificar que la respuesta existe y pertenece a una tarea del psicólogo
    const respuesta = await RespuestaTarea.findOne({
      where: { id: respuesta_id },
      include: [
        {
          model: require('../modelos/Tarea').default,
          as: 'tarea',
          where: { psicologo_id: psicologoId }
        }
      ]
    });

    if (!respuesta) {
      return ManejadorRespuestas.noEncontrado(
        res,
        'Respuesta no encontrada o no tienes permisos para evaluarla',
        'TAR_045'
      );
    }

    // Actualizar la evaluación
    await respuesta.update({
      evaluacion_psicologo: JSON.stringify(evaluacion_psicologo)
    });

    return ManejadorRespuestas.exito(
      res,
      'Respuesta evaluada exitosamente',
      respuesta,
      'TAR_046'
    );
  } catch (error) {
    log.error('Error en evaluarRespuesta:', error);
    return ManejadorRespuestas.errorInterno(
      res,
      'Error interno al evaluar la respuesta',
      'TAR_047'
    );
  }
};
