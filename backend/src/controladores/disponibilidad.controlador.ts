// Controlador de disponibilidad de psicólogos
import { Request, Response } from 'express';
import sequelize from '../configuracion/database';
import { ManejadorRespuestas } from '../utilidades/respuestas';
import { log } from '../utilidades/logger';

// Obtener disponibilidad de un psicólogo
export const obtenerDisponibilidadPsicologo = async (req: Request, res: Response) => {
  try {
    const { psicologoId } = req.params;
    const usuarioId = req.usuario?.id;

    if (!usuarioId) {
      return ManejadorRespuestas.noAutorizado(
        res,
        'Usuario no autenticado',
        'DISP_001'
      );
    }

    if (!psicologoId) {
      return ManejadorRespuestas.errorValidacion(
        res,
        'ID de psicólogo es requerido',
        { psicologoId },
        'DISP_002'
      );
    }

    const [disponibilidad] = await sequelize.query(`
      SELECT 
        id,
        dia_semana,
        hora_inicio,
        hora_fin,
        activo
      FROM disponibilidad_psicologos
      WHERE psicologo_id = :psicologoId
      ORDER BY dia_semana, hora_inicio
    `, {
      replacements: { psicologoId }
    }) as [any[], unknown];

    return ManejadorRespuestas.exito(
      res,
      'Disponibilidad obtenida exitosamente',
      { disponibilidad },
      'DISP_003'
    );
  } catch (error) {
    log.error('Error en obtenerDisponibilidadPsicologo:', error);
    return ManejadorRespuestas.errorInterno(
      res,
      'Error interno al obtener disponibilidad',
      'DISP_004'
    );
  }
};

// Actualizar disponibilidad de un psicólogo
export const actualizarDisponibilidad = async (req: Request, res: Response) => {
  try {
    const psicologoId = req.usuario?.id;
    const { disponibilidad } = req.body;

    if (!psicologoId) {
      return ManejadorRespuestas.noAutorizado(
        res,
        'Usuario no autenticado',
        'DISP_005'
      );
    }

    if (!disponibilidad || !Array.isArray(disponibilidad)) {
      return ManejadorRespuestas.errorValidacion(
        res,
        'Disponibilidad debe ser un array',
        req.body,
        'DISP_006'
      );
    }

    // Validar que el usuario es psicólogo
    const [usuario] = await sequelize.query(`
      SELECT rol_id FROM usuarios
      WHERE id = :psicologoId
    `, {
      replacements: { psicologoId }
    }) as [any[], unknown];

    if (!Array.isArray(usuario) || usuario.length === 0 || usuario[0].rol_id !== 2) {
      return ManejadorRespuestas.prohibido(
        res,
        'Solo los psicólogos pueden actualizar su disponibilidad',
        'DISP_007'
      );
    }

    // Eliminar disponibilidad existente
    await sequelize.query(`
      DELETE FROM disponibilidad_psicologos
      WHERE psicologo_id = :psicologoId
    `, {
      replacements: { psicologoId }
    });

    // Insertar nueva disponibilidad
    for (const disp of disponibilidad) {
      if (disp.dia_semana !== undefined && disp.hora_inicio && disp.hora_fin) {
        await sequelize.query(`
          INSERT INTO disponibilidad_psicologos (
            id, psicologo_id, dia_semana, hora_inicio, hora_fin, activo,
            created_at, updated_at
          ) VALUES (
            gen_random_uuid(), :psicologoId, :dia_semana, :hora_inicio, :hora_fin, :activo,
            NOW(), NOW()
          )
        `, {
          replacements: {
            psicologoId,
            dia_semana: disp.dia_semana,
            hora_inicio: disp.hora_inicio,
            hora_fin: disp.hora_fin,
            activo: disp.activo !== false
          }
        });
      }
    }

    return ManejadorRespuestas.exito(
      res,
      'Disponibilidad actualizada exitosamente',
      { psicologo_id: psicologoId },
      'DISP_008'
    );
  } catch (error) {
    log.error('Error en actualizarDisponibilidad:', error);
    return ManejadorRespuestas.errorInterno(
      res,
      'Error interno al actualizar disponibilidad',
      'DISP_009'
    );
  }
};

// Crear disponibilidad por defecto para un psicólogo (24/7)
export const crearDisponibilidadPorDefecto = async (psicologoId: string): Promise<void> => {
  try {
    // Horarios por defecto: Lunes a Viernes, 9:00 - 18:00
    const disponibilidadPorDefecto = [
      { dia_semana: 1, hora_inicio: '09:00', hora_fin: '18:00' }, // Lunes
      { dia_semana: 2, hora_inicio: '09:00', hora_fin: '18:00' }, // Martes
      { dia_semana: 3, hora_inicio: '09:00', hora_fin: '18:00' }, // Miércoles
      { dia_semana: 4, hora_inicio: '09:00', hora_fin: '18:00' }, // Jueves
      { dia_semana: 5, hora_inicio: '09:00', hora_fin: '18:00' }, // Viernes
    ];

    for (const disp of disponibilidadPorDefecto) {
      await sequelize.query(`
        INSERT INTO disponibilidad_psicologos (
          id, psicologo_id, dia_semana, hora_inicio, hora_fin, activo,
          created_at, updated_at
        ) VALUES (
          gen_random_uuid(), :psicologoId, :dia_semana, :hora_inicio, :hora_fin, true,
          NOW(), NOW()
        )
      `, {
        replacements: {
          psicologoId,
          dia_semana: disp.dia_semana,
          hora_inicio: disp.hora_inicio,
          hora_fin: disp.hora_fin
        }
      });
    }

    log.info(`✅ Disponibilidad por defecto creada para psicólogo ${psicologoId}`);
  } catch (error) {
    log.error('Error al crear disponibilidad por defecto:', error);
  }
}; 