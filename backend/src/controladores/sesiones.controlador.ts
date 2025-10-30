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

export const crear = async (_req: Request, res: Response) => {
  try {
    // TODO: Implementar lógica para crear sesión
    res.json({ mensaje: 'Sesión creada exitosamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al crear sesión' });
  }
};

export const actualizar = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    // TODO: Implementar lógica para actualizar sesión
    res.json({ mensaje: `Sesión ${id} actualizada exitosamente` });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar sesión' });
  }
};

export const eliminar = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    // TODO: Implementar lógica para eliminar sesión
    res.json({ mensaje: `Sesión ${id} eliminada exitosamente` });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar sesión' });
  }
};
