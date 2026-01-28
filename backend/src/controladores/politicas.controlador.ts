import { Request, Response } from 'express';
import { ManejadorRespuestas } from '../utilidades/respuestas';
import Politica from '../modelos/Politica';
import { log } from '../utilidades/logger';
import { AuditoriaService } from '../utilidades/auditoria.service';

// Obtener todas las políticas activas
export const obtenerPoliticas = async (req: Request, res: Response) => {
  try {
    const { tipo } = req.query;

    const where: any = { activo: true };
    if (tipo && (tipo === 'seguridad' || tipo === 'privacidad')) {
      where.tipo = tipo;
    }

    const politicas = await Politica.findAll({
      where,
      order: [['tipo', 'ASC'], ['version', 'DESC']],
    });

    // Parsear el contenido JSON de cada política
    const politicasParseadas = politicas.map(politica => ({
      ...politica.toJSON(),
      contenido: politica.getContenidoParseado(),
    }));

    return ManejadorRespuestas.exito(
      res,
      'Políticas obtenidas exitosamente',
      politicasParseadas,
      'POL_001'
    );
  } catch (error: any) {
    log.error('Error al obtener políticas:', error);
    
    // Verificar si es un error de tabla no encontrada
    const errorMessage = error?.message || '';
    const isTableError = errorMessage.includes('does not exist') || 
                        errorMessage.includes('relation') ||
                        error?.name === 'SequelizeDatabaseError';
    
    if (isTableError) {
      return ManejadorRespuestas.errorInterno(
        res,
        'La tabla de políticas no existe. Por favor, ejecuta la migración de base de datos.',
        'POL_002_DB'
      );
    }
    
    return ManejadorRespuestas.errorInterno(
      res,
      'Error al obtener las políticas',
      'POL_002'
    );
  }
};

// Obtener una política por tipo
export const obtenerPoliticaPorTipo = async (req: Request, res: Response) => {
  try {
    const { tipo } = req.params;

    if (tipo !== 'seguridad' && tipo !== 'privacidad') {
      return ManejadorRespuestas.errorValidacion(
        res,
        'Tipo de política inválido. Debe ser "seguridad" o "privacidad"',
        null,
        'POL_003'
      );
    }

    const politica = await Politica.findOne({
      where: { tipo, activo: true },
      order: [['version', 'DESC']],
    });

    if (!politica) {
      return ManejadorRespuestas.noEncontrado(
        res,
        'Política no encontrada',
        'POL_004'
      );
    }

    // Parsear el contenido JSON
    const politicaParseada = {
      ...politica.toJSON(),
      contenido: politica.getContenidoParseado(),
    };

    return ManejadorRespuestas.exito(
      res,
      'Política obtenida exitosamente',
      politicaParseada,
      'POL_005'
    );
  } catch (error: any) {
    log.error('Error al obtener política:', error);
    
    // Verificar si es un error de tabla no encontrada
    const errorMessage = error?.message || '';
    const isTableError = errorMessage.includes('does not exist') || 
                        errorMessage.includes('relation') ||
                        error?.name === 'SequelizeDatabaseError';
    
    if (isTableError) {
      return ManejadorRespuestas.errorInterno(
        res,
        'La tabla de políticas no existe. Por favor, ejecuta la migración de base de datos.',
        'POL_006_DB'
      );
    }
    
    return ManejadorRespuestas.errorInterno(
      res,
      'Error al obtener la política',
      'POL_006'
    );
  }
};

// Crear o actualizar una política (solo para administradores)
export const crearActualizarPolitica = async (req: Request, res: Response) => {
  try {
    const usuario = (req as any).usuario;

    // Verificar que el usuario es administrador
    if (!usuario || usuario.rol_id !== 1) {
      return ManejadorRespuestas.noAutorizado(
        res,
        'Solo los administradores pueden crear o actualizar políticas',
        'POL_007'
      );
    }

    const { tipo, titulo, contenido, version } = req.body;

    // Validaciones
    if (!tipo || (tipo !== 'seguridad' && tipo !== 'privacidad')) {
      return ManejadorRespuestas.errorValidacion(
        res,
        'El tipo de política debe ser "seguridad" o "privacidad"',
        null,
        'POL_008'
      );
    }

    if (!titulo || !contenido) {
      return ManejadorRespuestas.errorValidacion(
        res,
        'El título y contenido son requeridos',
        null,
        'POL_009'
      );
    }

    // Validar que el contenido sea un JSON válido si es string
    let contenidoValidado = contenido;
    if (typeof contenido === 'string') {
      try {
        JSON.parse(contenido);
        contenidoValidado = contenido;
      } catch (e) {
        // Si no es JSON válido, crear estructura básica
        contenidoValidado = JSON.stringify({ secciones: [{ titulo: 'Contenido', contenido }] });
      }
    } else if (typeof contenido === 'object') {
      contenidoValidado = JSON.stringify(contenido);
    } else {
      return ManejadorRespuestas.errorValidacion(
        res,
        'El contenido debe ser un objeto o string JSON válido',
        null,
        'POL_010'
      );
    }

    // Buscar si ya existe una política activa del mismo tipo
    const politicaExistente = await Politica.findOne({
      where: { tipo, activo: true },
      order: [['version', 'DESC']],
    });

    const nuevaVersion = version || (politicaExistente ? politicaExistente.version + 1 : 1);

    // Si existe una política activa, desactivarla
    if (politicaExistente) {
      await politicaExistente.update({ activo: false });
    }

    // Crear nueva política
    const nuevaPolitica = await Politica.create({
      tipo,
      titulo,
      contenido: contenidoValidado,
      version: nuevaVersion,
      activo: true,
    });

    log.info(`Política ${tipo} creada/actualizada por administrador: ${usuario.email}`, {
      politicaId: nuevaPolitica.id,
      version: nuevaVersion,
    });

    // Registrar log de auditoría
    try {
      await AuditoriaService.crearLog({
        usuario_id: usuario.id,
        accion: 'CREAR_ACTUALIZAR_POLITICA',
        metadatos: {
          entidad: 'politica',
          entidad_id: nuevaPolitica.id,
          tipo,
          version: nuevaVersion,
          titulo,
        },
        req,
      });
    } catch (auditError) {
      log.warn('Error al registrar log de auditoría (no crítico):', auditError);
    }

    // Parsear el contenido para la respuesta
    const politicaParseada = {
      ...nuevaPolitica.toJSON(),
      contenido: nuevaPolitica.getContenidoParseado(),
    };

    return ManejadorRespuestas.exito(
      res,
      'Política creada/actualizada exitosamente',
      politicaParseada,
      'POL_011'
    );
  } catch (error) {
    log.error('Error al crear/actualizar política:', error);
    return ManejadorRespuestas.errorInterno(
      res,
      'Error al crear/actualizar la política',
      'POL_012'
    );
  }
};

// Obtener historial de versiones de una política (solo para administradores)
export const obtenerHistorialPolitica = async (req: Request, res: Response) => {
  try {
    const usuario = (req as any).usuario;

    // Verificar que el usuario es administrador
    if (!usuario || usuario.rol_id !== 1) {
      return ManejadorRespuestas.noAutorizado(
        res,
        'Solo los administradores pueden ver el historial de políticas',
        'POL_013'
      );
    }

    const { tipo } = req.params;

    if (tipo !== 'seguridad' && tipo !== 'privacidad') {
      return ManejadorRespuestas.errorValidacion(
        res,
        'Tipo de política inválido. Debe ser "seguridad" o "privacidad"',
        null,
        'POL_014'
      );
    }

    const politicas = await Politica.findAll({
      where: { tipo },
      order: [['version', 'DESC']],
    });

    const politicasParseadas = politicas.map(politica => ({
      ...politica.toJSON(),
      contenido: politica.getContenidoParseado(),
    }));

    return ManejadorRespuestas.exito(
      res,
      'Historial de políticas obtenido exitosamente',
      politicasParseadas,
      'POL_015'
    );
  } catch (error) {
    log.error('Error al obtener historial de política:', error);
    return ManejadorRespuestas.errorInterno(
      res,
      'Error al obtener el historial de políticas',
      'POL_016'
    );
  }
};
