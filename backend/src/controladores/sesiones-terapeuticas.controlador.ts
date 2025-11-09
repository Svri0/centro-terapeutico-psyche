import { Request, Response } from 'express';
import { ManejadorRespuestas } from '../utilidades/respuestas';
import { log } from '../utilidades/logger';
import sequelize from '../configuracion/database';

// Obtener información del paciente para la sesión
export const obtenerInfoPacienteSesion = async (req: Request, res: Response) => {
  try {
    const { pacienteId } = req.params;
    const psicologoId = req.usuario?.id;

    if (!psicologoId) {
      return ManejadorRespuestas.noAutorizado(
        res,
        'No autorizado',
        'SESION_001'
      );
    }

    // Obtener información completa del paciente (normalizado)
    const [pacienteData] = await sequelize.query(
      `SELECT 
        p.id, p.numero_ficha, p.rut, p.direccion,
        (
          SELECT ce.nombre FROM contactos_emergencia ce 
          WHERE ce.paciente_id = p.id AND ce.deleted_at IS NULL
          ORDER BY ce.created_at ASC LIMIT 1
        ) AS contacto_emergencia_nombre,
        (
          SELECT ce.telefono FROM contactos_emergencia ce 
          WHERE ce.paciente_id = p.id AND ce.deleted_at IS NULL
          ORDER BY ce.created_at ASC LIMIT 1
        ) AS contacto_emergencia_telefono,
        (
          SELECT ce.relacion FROM contactos_emergencia ce 
          WHERE ce.paciente_id = p.id AND ce.deleted_at IS NULL
          ORDER BY ce.created_at ASC LIMIT 1
        ) AS contacto_emergencia_relacion,
        p.observaciones, p.fecha_ingreso,
        u.nombres, u.apellidos, u.email, u.telefono, u.fecha_nacimiento
       FROM pacientes p
       INNER JOIN usuarios u ON p.usuario_id = u.id
       WHERE p.id = :pacienteId AND p.psicologo_id = :psicologoId AND p.deleted_at IS NULL`,
      {
        replacements: { pacienteId, psicologoId }
      }
    ) as [any[], unknown];

    if (!Array.isArray(pacienteData) || pacienteData.length === 0) {
      return ManejadorRespuestas.noEncontrado(
        res,
        'Paciente no encontrado',
        'SESION_002'
      );
    }

    const paciente = pacienteData[0];

    return ManejadorRespuestas.exito(
      res,
      'Información del paciente obtenida exitosamente',
      paciente,
      'SESION_003'
    );

  } catch (error) {
    log.error('Error en obtenerInfoPacienteSesion:', error);
    return ManejadorRespuestas.errorInterno(
      res,
      'Error al obtener la información del paciente',
      'SESION_004'
    );
  }
};

// Obtener historial de sesiones del paciente
export const obtenerHistorialSesiones = async (req: Request, res: Response) => {
  try {
    const { pacienteId } = req.params;
    const psicologoId = req.usuario?.id;

    if (!psicologoId) {
      return ManejadorRespuestas.noAutorizado(
        res,
        'No autorizado',
        'SESION_005'
      );
    }

    // Obtener historial de sesiones completadas
    const [sesiones] = await sequelize.query(
      `SELECT 
        s.id, s.fecha_programada as fecha_sesion, s.duracion_minutos, s.resumen_sesion,
        s.observaciones as notas_psicologo, s.estado, s.created_at
       FROM sesiones s
       INNER JOIN pacientes p ON s.paciente_id = p.id
       WHERE s.paciente_id = :pacienteId 
       AND p.psicologo_id = :psicologoId
       AND s.estado = 'completada'
       ORDER BY s.fecha_programada DESC
       LIMIT 10`,
      {
        replacements: { pacienteId, psicologoId }
      }
    ) as [any[], unknown];

    return ManejadorRespuestas.exito(
      res,
      'Historial de sesiones obtenido exitosamente',
      sesiones,
      'SESION_006'
    );

  } catch (error) {
    log.error('Error en obtenerHistorialSesiones:', error);
    return ManejadorRespuestas.errorInterno(
      res,
      'Error al obtener el historial de sesiones',
      'SESION_007'
    );
  }
};

// Iniciar sesión terapéutica
export const iniciarSesionTerapeutica = async (req: Request, res: Response) => {
  try {
    const { citaId } = req.params; // tratado como sesionId programada
    const psicologoId = req.usuario?.id;

    if (!psicologoId) {
      return ManejadorRespuestas.noAutorizado(
        res,
        'No autorizado',
        'SESION_008'
      );
    }

    // Verificar que la "cita" (sesión programada) existe y pertenece al psicólogo
    const [citaData] = await sequelize.query(
      `SELECT 
        s.id, s.paciente_id, s.fecha_programada as fecha, s.fecha_inicio, s.fecha_fin,
        s.duracion_minutos, s.estado, s.tipo_sesion
       FROM sesiones s
       WHERE s.id = :citaId AND s.psicologo_id = :psicologoId`,
      {
        replacements: { citaId, psicologoId }
      }
    ) as [any[], unknown];

    if (!Array.isArray(citaData) || citaData.length === 0) {
      return ManejadorRespuestas.noEncontrado(
        res,
        'Cita no encontrada',
        'SESION_009'
      );
    }

    const cita = citaData[0];

    // Verificar que la sesión esté en estado válido para iniciar
    if (!['programada', 'confirmada', 'en_curso'].includes(cita.estado)) {
      return ManejadorRespuestas.errorValidacion(
        res,
        'La sesión debe estar programada/confirmada para iniciar',
        null,
        'SESION_010'
      );
    }

    // Verificar si ya existe una sesión activa para esta cita
    // Solo buscar sesiones del mismo día que la cita
    const fechaCita = new Date(cita.fecha + 'T00:00:00');
    const fechaCitaInicio = new Date(fechaCita);
    fechaCitaInicio.setHours(0, 0, 0, 0);
    const fechaCitaFin = new Date(fechaCita);
    fechaCitaFin.setHours(23, 59, 59, 999);
    
    const [sesionActiva] = await sequelize.query(
      `SELECT id, estado, fecha_inicio, duracion_minutos, fecha_programada
       FROM sesiones 
       WHERE paciente_id = :pacienteId 
       AND psicologo_id = :psicologoId
       AND estado IN ('en_curso')
       AND fecha_programada >= :fechaInicio
       AND fecha_programada <= :fechaFin
       ORDER BY created_at DESC
       LIMIT 1`,
      {
        replacements: { 
          pacienteId: cita.paciente_id,
          psicologoId,
          fechaInicio: fechaCitaInicio.toISOString(),
          fechaFin: fechaCitaFin.toISOString()
        }
      }
    ) as [any[], unknown];

    if (Array.isArray(sesionActiva) && sesionActiva.length > 0) {
      // Calcular tiempo transcurrido para la sesión existente
      const sesion = sesionActiva[0];
      const fechaInicio = new Date(sesion.fecha_inicio);
      const ahora = new Date();
      const tiempoTranscurridoMs = ahora.getTime() - fechaInicio.getTime();
      const tiempoTranscurridoMinutos = Math.round(tiempoTranscurridoMs / (1000 * 60));
      
      // Log para debugging
      console.log('🕐 Reanudando sesión - Cálculo de tiempo:', {
        sesionId: sesion.id,
        fechaInicio: sesion.fecha_inicio,
        fechaInicioDate: fechaInicio.toISOString(),
        ahora: ahora.toISOString(),
        tiempoTranscurridoMs,
        tiempoTranscurridoMinutos,
        duracionMinutos: sesion.duracion_minutos
      });
      
      // Retornar la sesión existente con tiempo transcurrido
      return ManejadorRespuestas.exito(
        res,
        'Sesión ya iniciada',
        {
          sesionId: sesion.id,
          estado: sesion.estado,
          fechaInicio: sesion.fecha_inicio,
          duracionMinutos: sesion.duracion_minutos,
          tiempoTranscurrido: tiempoTranscurridoMinutos,
          esReanudacion: true
        },
        'SESION_011'
      );
    }

    // Crear nueva sesión (si no existe activa)
    const [nuevaSesion] = await sequelize.query(
      `INSERT INTO sesiones (
        id, paciente_id, psicologo_id, fecha_programada,
        fecha_inicio, duracion_minutos, estado, tipo_sesion,
        objetivos_sesion, tecnicas_utilizadas, archivos_adjuntos,
        objetivos_alcanzados, tareas_asignadas, derivacion_recomendada,
        archivos_sesion, created_at, updated_at
      ) VALUES (
        gen_random_uuid(), :pacienteId, :psicologoId, :fechaSesion,
        NOW(), :duracionMinutos, 'en_curso', :tipoSesion,
        '[]', '[]', '[]', '[]', '[]', '[]', '[]', NOW(), NOW()
      ) RETURNING id, fecha_inicio, duracion_minutos`,
      {
        replacements: {
          pacienteId: cita.paciente_id,
          psicologoId,
          fechaSesion: cita.fecha,
          duracionMinutos: cita.duracion_minutos || 60,
          tipoSesion: cita.tipo_sesion || 'presencial'
        }
      }
    ) as [any[], unknown];

    const sesion = Array.isArray(nuevaSesion) ? nuevaSesion[0] : null;

    return ManejadorRespuestas.creado(
      res,
      'Sesión terapéutica iniciada exitosamente',
      {
        sesionId: sesion?.id,
        fechaInicio: sesion?.fecha_inicio,
        duracionMinutos: sesion?.duracion_minutos,
        esReanudacion: false
      },
      'SESION_012'
    );

  } catch (error) {
    log.error('Error en iniciarSesionTerapeutica:', error);
    return ManejadorRespuestas.errorInterno(
      res,
      'Error al iniciar la sesión terapéutica',
      'SESION_013'
    );
  }
};

// Finalizar sesión terapéutica
export const finalizarSesionTerapeutica = async (req: Request, res: Response) => {
  try {
    const { sesionId } = req.params;
    const { resumenSesion, notasPsicologo } = req.body;
    const psicologoId = req.usuario?.id;

    if (!psicologoId) {
      return ManejadorRespuestas.noAutorizado(
        res,
        'No autorizado',
        'SESION_014'
      );
    }

    // Verificar que la sesión existe y pertenece al psicólogo
    const [sesionData] = await sequelize.query(
      `SELECT 
        s.id, s.paciente_id, s.fecha_inicio, s.duracion_minutos,
        s.estado, s.fecha_programada
       FROM sesiones s
       WHERE s.id = :sesionId AND s.psicologo_id = :psicologoId`,
      {
        replacements: { sesionId, psicologoId }
      }
    ) as [any[], unknown];

    if (!Array.isArray(sesionData) || sesionData.length === 0) {
      return ManejadorRespuestas.noEncontrado(
        res,
        'Sesión no encontrada',
        'SESION_015'
      );
    }

    const sesion = sesionData[0];

    // Calcular duración real de la sesión
    const fechaInicio = new Date(sesion.fecha_inicio);
    const fechaFin = new Date();
    const duracionReal = Math.round((fechaFin.getTime() - fechaInicio.getTime()) / (1000 * 60)); // en minutos

    // Actualizar sesión
    await sequelize.query(
      `UPDATE sesiones SET 
        estado = 'completada',
        fecha_fin = NOW(),
        duracion_minutos = :duracionReal,
        resumen_sesion = :resumenSesion,
        observaciones = :notasPsicologo,
        updated_at = NOW()
       WHERE id = :sesionId`,
      {
        replacements: {
          sesionId,
          duracionReal,
          resumenSesion,
          notasPsicologo
        }
      }
    );

    // No hay citas legacy que actualizar; mantenemos solo el estado de la sesión

    return ManejadorRespuestas.exito(
      res,
      'Sesión terapéutica finalizada exitosamente',
      {
        sesionId,
        duracionReal,
        fechaFin: fechaFin.toISOString()
      },
      'SESION_016'
    );

  } catch (error: any) {
    console.error('❌ Error detallado en finalizarSesionTerapeutica:', {
      message: error.message,
      stack: error.stack,
      sesionId: req.params.sesionId,
      psicologoId: req.usuario?.id
    });
    log.error('Error en finalizarSesionTerapeutica:', error);
    return ManejadorRespuestas.errorInterno(
      res,
      'Error al finalizar la sesión terapéutica: ' + error.message,
      'SESION_017'
    );
  }
};

// Obtener estado de sesión activa
export const obtenerEstadoSesion = async (req: Request, res: Response) => {
  try {
    const { citaId } = req.params; // tratado como sesionId programada
    const psicologoId = req.usuario?.id;

    if (!psicologoId) {
      return ManejadorRespuestas.noAutorizado(
        res,
        'No autorizado',
        'SESION_018'
      );
    }

    // Obtener el paciente_id desde la sesión programada
    const [citaData] = await sequelize.query(
      `SELECT paciente_id FROM sesiones WHERE id = :citaId AND psicologo_id = :psicologoId`,
      {
        replacements: { citaId, psicologoId }
      }
    ) as [any[], unknown];

    if (!Array.isArray(citaData) || citaData.length === 0) {
      return ManejadorRespuestas.noEncontrado(
        res,
        'Cita no encontrada',
        'SESION_019'
      );
    }

    const pacienteId = citaData[0].paciente_id;

    // Buscar sesión activa para el paciente
    const [sesionActiva] = await sequelize.query(
      `SELECT 
        s.id, s.estado, s.fecha_inicio, s.duracion_minutos,
        s.resumen_sesion, s.observaciones
       FROM sesiones s
       WHERE s.paciente_id = :pacienteId
       AND s.psicologo_id = :psicologoId
       AND s.estado IN ('en_curso')
       ORDER BY s.created_at DESC
       LIMIT 1`,
      {
        replacements: { pacienteId, psicologoId }
      }
    ) as [any[], unknown];

    if (!Array.isArray(sesionActiva) || sesionActiva.length === 0) {
      return ManejadorRespuestas.noEncontrado(
        res,
        'No hay sesión activa para esta cita',
        'SESION_019'
      );
    }

    const sesion = sesionActiva[0];
    const fechaInicio = new Date(sesion.fecha_inicio);
    const ahora = new Date();
    const tiempoTranscurridoMs = ahora.getTime() - fechaInicio.getTime();
    const tiempoTranscurrido = Math.round(tiempoTranscurridoMs / (1000 * 60));

    // Log para debugging
    console.log('🕐 Cálculo de tiempo en backend:', {
      sesionId: sesion.id,
      fechaInicio: sesion.fecha_inicio,
      fechaInicioDate: fechaInicio.toISOString(),
      ahora: ahora.toISOString(),
      tiempoTranscurridoMs,
      tiempoTranscurrido,
      duracionMinutos: sesion.duracion_minutos
    });

    return ManejadorRespuestas.exito(
      res,
      'Estado de sesión obtenido exitosamente',
      {
        sesionId: sesion.id,
        estado: sesion.estado,
        fechaInicio: sesion.fecha_inicio,
        duracionMinutos: sesion.duracion_minutos,
        tiempoTranscurrido,
        resumenSesion: sesion.resumen_sesion,
        notasPsicologo: sesion.observaciones
      },
      'SESION_020'
    );

  } catch (error) {
    log.error('Error en obtenerEstadoSesion:', error);
    return ManejadorRespuestas.errorInterno(
      res,
      'Error al obtener el estado de la sesión',
      'SESION_021'
    );
  }
};
