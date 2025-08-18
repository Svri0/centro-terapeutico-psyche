import { Request, Response } from 'express';
import sequelize from '../configuracion/database';
import { QueryTypes } from 'sequelize';
import { ManejadorRespuestas } from '../utilidades/respuestas';

// Obtener disponibilidad de un psicólogo
export const obtenerDisponibilidad = async (req: Request, res: Response) => {
  try {
    const { psicologoId } = req.params;

    const query = `
      SELECT 
        id,
        psicologo_id,
        dia_semana,
        hora_inicio,
        hora_fin,
        activo,
        created_at,
        updated_at
      FROM disponibilidad 
      WHERE psicologo_id = :psicologoId 
      AND deleted_at IS NULL
      ORDER BY dia_semana ASC
    `;

    const disponibilidades = await sequelize.query(query, {
      replacements: { psicologoId },
      type: QueryTypes.SELECT
    });

    return ManejadorRespuestas.exito(res, 'Disponibilidad obtenida correctamente', disponibilidades);
  } catch (error: any) {
    console.error('Error al obtener disponibilidad:', error);
    return ManejadorRespuestas.errorInterno(res, 'Error al obtener la disponibilidad');
  }
};

// Crear nueva disponibilidad
export const crearDisponibilidad = async (req: Request, res: Response) => {
  try {
    const { psicologo_id, dia_semana, hora_inicio, hora_fin, activo } = req.body;

    // Validar que no exista ya una disponibilidad para este psicólogo y día
    const existingQuery = `
      SELECT id FROM disponibilidad 
      WHERE psicologo_id = :psicologo_id 
      AND dia_semana = :dia_semana 
      AND deleted_at IS NULL
    `;

    const [existing] = await sequelize.query(existingQuery, {
      replacements: { psicologo_id, dia_semana },
      type: QueryTypes.SELECT
    });

    if (existing) {
      return ManejadorRespuestas.errorValidacion(res, 'Ya existe una disponibilidad para este día');
    }

    const insertQuery = `
      INSERT INTO disponibilidad (psicologo_id, dia_semana, hora_inicio, hora_fin, activo, created_at, updated_at)
      VALUES (:psicologo_id, :dia_semana, :hora_inicio, :hora_fin, :activo, NOW(), NOW())
      RETURNING *
    `;

    const [nuevaDisponibilidad] = await sequelize.query(insertQuery, {
      replacements: { psicologo_id, dia_semana, hora_inicio, hora_fin, activo },
      type: QueryTypes.INSERT
    });

    return ManejadorRespuestas.exito(res, 'Disponibilidad creada correctamente', nuevaDisponibilidad);
  } catch (error: any) {
    console.error('Error al crear disponibilidad:', error);
    return ManejadorRespuestas.errorInterno(res, 'Error al crear la disponibilidad');
  }
};

// Actualizar disponibilidad existente
export const actualizarDisponibilidad = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { hora_inicio, hora_fin, activo } = req.body;

    const updateQuery = `
      UPDATE disponibilidad 
      SET hora_inicio = :hora_inicio, 
          hora_fin = :hora_fin, 
          activo = :activo, 
          updated_at = NOW()
      WHERE id = :id AND deleted_at IS NULL
      RETURNING *
    `;

    const [disponibilidadActualizada] = await sequelize.query(updateQuery, {
      replacements: { id, hora_inicio, hora_fin, activo },
      type: QueryTypes.UPDATE
    });

    if (!disponibilidadActualizada) {
      return ManejadorRespuestas.noEncontrado(res, 'Disponibilidad no encontrada');
    }

    return ManejadorRespuestas.exito(res, 'Disponibilidad actualizada correctamente', disponibilidadActualizada);
  } catch (error: any) {
    console.error('Error al actualizar disponibilidad:', error);
    return ManejadorRespuestas.errorInterno(res, 'Error al actualizar la disponibilidad');
  }
};

// Actualizar múltiples disponibilidades (para el psicólogo)
export const actualizarDisponibilidadMultiple = async (req: Request, res: Response) => {
  try {
    const { psicologoId } = req.params;
    const { disponibilidades } = req.body;

    // Verificar que el usuario autenticado sea el psicólogo
    if (!req.usuario?.id || req.usuario.id !== psicologoId) {
      return ManejadorRespuestas.prohibido(res, 'No tienes permisos para modificar esta disponibilidad');
    }

    // Eliminar disponibilidades existentes
    const deleteQuery = `
      UPDATE disponibilidad 
      SET deleted_at = NOW() 
      WHERE psicologo_id = :psicologoId AND deleted_at IS NULL
    `;

    await sequelize.query(deleteQuery, {
      replacements: { psicologoId },
      type: QueryTypes.UPDATE
    });

    // Insertar nuevas disponibilidades
    const insertQuery = `
      INSERT INTO disponibilidad (psicologo_id, dia_semana, hora_inicio, hora_fin, activo, created_at, updated_at)
      VALUES (:psicologo_id, :dia_semana, :hora_inicio, :hora_fin, :activo, NOW(), NOW())
    `;

    for (const disp of disponibilidades) {
      await sequelize.query(insertQuery, {
        replacements: {
          psicologo_id: psicologoId,
          dia_semana: disp.dia_semana,
          hora_inicio: disp.hora_inicio,
          hora_fin: disp.hora_fin,
          activo: disp.activo
        },
        type: QueryTypes.INSERT
      });
    }

    // Obtener disponibilidades actualizadas
    const selectQuery = `
      SELECT * FROM disponibilidad 
      WHERE psicologo_id = :psicologoId AND deleted_at IS NULL
      ORDER BY dia_semana ASC
    `;

    const [disponibilidadesActualizadas] = await sequelize.query(selectQuery, {
      replacements: { psicologoId },
      type: QueryTypes.SELECT
    });

    return ManejadorRespuestas.exito(res, 'Disponibilidad actualizada correctamente', disponibilidadesActualizadas);
  } catch (error: any) {
    console.error('Error al actualizar disponibilidad múltiple:', error);
    return ManejadorRespuestas.errorInterno(res, 'Error al actualizar la disponibilidad');
  }
};

// Obtener disponibilidad para un paciente (días disponibles)
export const obtenerDisponibilidadPaciente = async (req: Request, res: Response) => {
  try {
    const { psicologoId } = req.params;
    const { fecha } = req.query;

    // Obtener disponibilidad del psicólogo
    const disponibilidadQuery = `
      SELECT dia_semana, hora_inicio, hora_fin, activo
      FROM disponibilidad 
      WHERE psicologo_id = :psicologoId 
      AND activo = true 
      AND deleted_at IS NULL
      ORDER BY dia_semana ASC
    `;

    const disponibilidades = await sequelize.query(disponibilidadQuery, {
      replacements: { psicologoId },
      type: QueryTypes.SELECT
    }) as any[];

    // Generar días disponibles para el próximo mes
    const fechaInicio = fecha ? new Date(fecha as string) : new Date();
    const fechaFin = new Date(fechaInicio);
    fechaFin.setMonth(fechaFin.getMonth() + 1);

    const diasDisponibles: string[] = [];
    const horariosPorDia: Record<string, { inicio: string; fin: string }> = {};

    for (let fecha = new Date(fechaInicio); fecha < fechaFin; fecha.setDate(fecha.getDate() + 1)) {
      const diaSemana = fecha.getDay() === 0 ? 7 : fecha.getDay(); // Convertir domingo de 0 a 7
      const disponibilidadDia = disponibilidades?.find((d: any) => d.dia_semana === diaSemana);

      if (disponibilidadDia && disponibilidadDia.activo) {
        const fechaString = fecha.toISOString().split('T')[0];
        if (fechaString) {
          diasDisponibles.push(fechaString);
          horariosPorDia[fechaString] = {
            inicio: disponibilidadDia.hora_inicio,
            fin: disponibilidadDia.hora_fin
          };
        }
      }
    }

    return ManejadorRespuestas.exito(res, 'Disponibilidad obtenida correctamente', {
      diasDisponibles,
      horariosPorDia
    });
  } catch (error: any) {
    console.error('Error al obtener disponibilidad para paciente:', error);
    return ManejadorRespuestas.errorInterno(res, 'Error al obtener la disponibilidad');
  }
};

// Verificar si un día específico está disponible
export const verificarDisponibilidadDia = async (req: Request, res: Response) => {
  try {
    const { psicologoId } = req.params;
    const { fecha } = req.query;

    if (!fecha) {
      return ManejadorRespuestas.errorValidacion(res, 'Fecha es requerida');
    }

    const fechaObj = new Date(fecha as string);
    const diaSemana = fechaObj.getDay() === 0 ? 7 : fechaObj.getDay(); // Convertir domingo de 0 a 7

    const query = `
      SELECT hora_inicio, hora_fin, activo
      FROM disponibilidad 
      WHERE psicologo_id = :psicologoId 
      AND dia_semana = :diaSemana 
      AND activo = true 
      AND deleted_at IS NULL
    `;

    const disponibilidades = await sequelize.query(query, {
      replacements: { psicologoId, diaSemana },
      type: QueryTypes.SELECT
    }) as any[];

    const disponibilidad = disponibilidades?.[0];
    const disponible = !!disponibilidad;

    return ManejadorRespuestas.exito(res, 'Verificación completada', {
      disponible,
      horarios: disponible ? {
        inicio: (disponibilidad as any).hora_inicio,
        fin: (disponibilidad as any).hora_fin
      } : undefined
    });
  } catch (error: any) {
    console.error('Error al verificar disponibilidad:', error);
    return ManejadorRespuestas.errorInterno(res, 'Error al verificar la disponibilidad');
  }
}; 