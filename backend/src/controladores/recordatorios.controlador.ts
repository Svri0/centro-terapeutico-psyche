import { Request, Response } from 'express';
import { ManejadorRespuestas } from '../utilidades/respuestas';
import { log } from '../utilidades/logger';
import ConfiguracionRecordatorio from '../modelos/ConfiguracionRecordatorio';
import { Op } from 'sequelize';
import { RecordatoriosTareasService } from '../servicios/recordatorios-tareas.service';

// ==================== CONFIGURACIONES DE RECORDATORIOS ====================

// Obtener configuraciones de recordatorios del usuario
export const obtenerConfiguracionesRecordatorio = async (req: Request, res: Response) => {
  try {
    const usuarioId = req.usuario?.id;
    
    if (!usuarioId) {
      return ManejadorRespuestas.noAutorizado(
        res,
        'Usuario no autenticado',
        'RECORDATORIO_001'
      );
    }

    console.log('📋 Obteniendo configuraciones de recordatorios para usuario:', usuarioId);

    const configuraciones = await ConfiguracionRecordatorio.findAll({
      where: {
        usuario_id: usuarioId
      },
      order: [['tipo_evento', 'ASC']]
    });

    // Agrupar configuraciones por tipo de evento
    const configuracionesAgrupadas = configuraciones.reduce((acc, config) => {
      if (!acc[config.tipo_evento]) {
        acc[config.tipo_evento] = [];
      }
      acc[config.tipo_evento]!.push(config);
      return acc;
    }, {} as Record<string, any[]>);

    console.log('✅ Configuraciones obtenidas exitosamente');

    return ManejadorRespuestas.exito(
      res,
      'Configuraciones de recordatorios obtenidas exitosamente',
      {
        configuraciones: configuracionesAgrupadas,
        total: configuraciones.length
      },
      'RECORDATORIO_002'
    );

  } catch (error) {
    log.error('Error en obtenerConfiguracionesRecordatorio:', error);
    return ManejadorRespuestas.errorInterno(
      res,
      'Error al obtener las configuraciones de recordatorios',
      'RECORDATORIO_003'
    );
  }
};

// Crear o actualizar configuración de recordatorio
export const crearActualizarConfiguracionRecordatorio = async (req: Request, res: Response) => {
  try {
    const usuarioId = req.usuario?.id;
    const { tipo_evento, canal_notificacion, activo, configuracion_personalizada, horario_preferido, dias_semana } = req.body;
    
    if (!usuarioId) {
      return ManejadorRespuestas.noAutorizado(
        res,
        'Usuario no autenticado',
        'RECORDATORIO_004'
      );
    }

    if (!tipo_evento || !canal_notificacion) {
      return ManejadorRespuestas.errorValidacion(
        res,
        'Tipo de evento y canal de notificación son requeridos',
        'RECORDATORIO_005'
      );
    }

    console.log('📝 Creando/actualizando configuración de recordatorio:', {
      usuarioId,
      tipo_evento,
      canal_notificacion,
      activo
    });

    // Buscar configuración existente
    const configuracionExistente = await ConfiguracionRecordatorio.findOne({
      where: {
        usuario_id: usuarioId,
        tipo_evento,
        canal_notificacion
      }
    });

    let configuracion;

    if (configuracionExistente) {
      // Actualizar configuración existente
      configuracion = await configuracionExistente.update({
        activo: activo !== undefined ? activo : configuracionExistente.activo,
        configuracion_personalizada: configuracion_personalizada || configuracionExistente.configuracion_personalizada,
        horario_preferido: horario_preferido || configuracionExistente.horario_preferido,
        dias_semana: dias_semana || configuracionExistente.dias_semana
      });
      console.log('✅ Configuración actualizada exitosamente');
    } else {
      // Crear nueva configuración
      configuracion = await ConfiguracionRecordatorio.create({
        usuario_id: usuarioId,
        tipo_evento,
        canal_notificacion,
        activo: activo !== undefined ? activo : true,
        configuracion_personalizada: configuracion_personalizada || {},
        horario_preferido,
        dias_semana: dias_semana || [1, 2, 3, 4, 5]
      });
      console.log('✅ Configuración creada exitosamente');
    }

    return ManejadorRespuestas.exito(
      res,
      configuracionExistente ? 'Configuración actualizada exitosamente' : 'Configuración creada exitosamente',
      configuracion,
      'RECORDATORIO_006'
    );

  } catch (error) {
    log.error('Error en crearActualizarConfiguracionRecordatorio:', error);
    return ManejadorRespuestas.errorInterno(
      res,
      'Error al crear/actualizar la configuración de recordatorio',
      'RECORDATORIO_007'
    );
  }
};

// Eliminar configuración de recordatorio
export const eliminarConfiguracionRecordatorio = async (req: Request, res: Response) => {
  try {
    const usuarioId = req.usuario?.id;
    const { id } = req.params;
    
    if (!usuarioId) {
      return ManejadorRespuestas.noAutorizado(
        res,
        'Usuario no autenticado',
        'RECORDATORIO_008'
      );
    }

    console.log('🗑️ Eliminando configuración de recordatorio:', id);

    const configuracion = await ConfiguracionRecordatorio.findOne({
      where: {
        id,
        usuario_id: usuarioId
      }
    });

    if (!configuracion) {
      return ManejadorRespuestas.noEncontrado(
        res,
        'Configuración de recordatorio no encontrada',
        'RECORDATORIO_009'
      );
    }

    await configuracion.destroy();

    console.log('✅ Configuración eliminada exitosamente');

    return ManejadorRespuestas.exito(
      res,
      'Configuración de recordatorio eliminada exitosamente',
      null,
      'RECORDATORIO_010'
    );

  } catch (error) {
    log.error('Error en eliminarConfiguracionRecordatorio:', error);
    return ManejadorRespuestas.errorInterno(
      res,
      'Error al eliminar la configuración de recordatorio',
      'RECORDATORIO_011'
    );
  }
};

// Obtener configuraciones activas para un tipo de evento específico
export const obtenerConfiguracionesActivas = async (tipoEvento: string, usuarioId?: string) => {
  try {
    const whereClause: any = {
      tipo_evento: tipoEvento,
      activo: true
    };

    if (usuarioId) {
      whereClause.usuario_id = usuarioId;
    }

    const configuraciones = await ConfiguracionRecordatorio.findAll({
      where: whereClause,
      include: [
        {
          model: require('../modelos/Usuario').default,
          as: 'usuario',
          attributes: ['id', 'nombres', 'apellidos', 'email', 'telefono']
        }
      ]
    });

    return configuraciones;
  } catch (error) {
    log.error('Error en obtenerConfiguracionesActivas:', error);
    return [];
  }
};

// Obtener todas las configuraciones activas agrupadas por canal
export const obtenerConfiguracionesPorCanal = async () => {
  try {
    const configuraciones = await ConfiguracionRecordatorio.findAll({
      where: {
        activo: true
      },
      include: [
        {
          model: require('../modelos/Usuario').default,
          as: 'usuario',
          attributes: ['id', 'nombres', 'apellidos', 'email', 'telefono']
        }
      ]
    });

    // Agrupar por canal de notificación
    const configuracionesPorCanal = configuraciones.reduce((acc, config) => {
      if (!acc[config.canal_notificacion]) {
        acc[config.canal_notificacion] = [];
      }
      acc[config.canal_notificacion]!.push(config);
      return acc;
    }, {} as Record<string, any[]>);

    return configuracionesPorCanal;
  } catch (error) {
    log.error('Error en obtenerConfiguracionesPorCanal:', error);
    return {};
  }
};

// ==================== RECORDATORIOS DE TAREAS ====================

export const ejecutarRecordatoriosTareas = async (req: Request, res: Response) => {
  try {
    const usuarioId = req.usuario?.id;
    const rolId = req.usuario?.rol_id;

    if (!usuarioId || (rolId !== 1 && rolId !== 2)) {
      return ManejadorRespuestas.noAutorizado(
        res,
        'No tienes permisos para ejecutar recordatorios de tareas',
        'RECORDATORIO_TAREAS_001'
      );
    }

    const resultado = await RecordatoriosTareasService.enviarRecordatoriosTareas();

    return ManejadorRespuestas.exito(
      res,
      'Recordatorios de tareas ejecutados exitosamente',
      resultado,
      'RECORDATORIO_TAREAS_002'
    );
  } catch (error) {
    log.error('Error en ejecutarRecordatoriosTareas:', error);
    return ManejadorRespuestas.errorInterno(
      res,
      'Error al ejecutar recordatorios de tareas',
      'RECORDATORIO_TAREAS_003'
    );
  }
};

export const ejecutarRecordatorioTareasPaciente = async (req: Request, res: Response) => {
  try {
    const usuarioId = req.usuario?.id;
    const rolId = req.usuario?.rol_id;
    const { pacienteId } = req.params;

    if (!usuarioId || (rolId !== 1 && rolId !== 2)) {
      return ManejadorRespuestas.noAutorizado(
        res,
        'No tienes permisos para ejecutar recordatorios de tareas',
        'RECORDATORIO_TAREAS_004'
      );
    }

    if (!pacienteId) {
      return ManejadorRespuestas.errorValidacion(
        res,
        'ID de paciente es requerido',
        'RECORDATORIO_TAREAS_005'
      );
    }

    const enviado = await RecordatoriosTareasService.enviarRecordatorioPaciente(pacienteId);

    return ManejadorRespuestas.exito(
      res,
      enviado
        ? 'Recordatorio de tareas enviado exitosamente al paciente'
        : 'No se pudo enviar el recordatorio (paciente sin email o sin tareas pendientes)',
      { pacienteId, enviado },
      enviado ? 'RECORDATORIO_TAREAS_006' : 'RECORDATORIO_TAREAS_007'
    );
  } catch (error) {
    log.error('Error en ejecutarRecordatorioTareasPaciente:', error);
    return ManejadorRespuestas.errorInterno(
      res,
      'Error al ejecutar recordatorio de tareas para el paciente',
      'RECORDATORIO_TAREAS_008'
    );
  }
};
