// Controlador de tareas
import { Request, Response } from 'express';

export const obtenerTodas = async (_req: Request, res: Response) => {
  try {
    // TODO: Implementar lógica para obtener todas las tareas
    res.json({ mensaje: 'Tareas obtenidas exitosamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener tareas' });
  }
};

export const obtenerPorId = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    // TODO: Implementar lógica para obtener tarea por ID
    res.json({ mensaje: `Tarea ${id} obtenida exitosamente` });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener tarea' });
  }
};

export const crear = async (_req: Request, res: Response) => {
  try {
    // TODO: Implementar lógica para crear tarea
    res.json({ mensaje: 'Tarea creada exitosamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al crear tarea' });
  }
};

export const actualizar = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    // TODO: Implementar lógica para actualizar tarea
    res.json({ mensaje: `Tarea ${id} actualizada exitosamente` });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar tarea' });
  }
};

export const eliminar = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    // TODO: Implementar lógica para eliminar tarea
    res.json({ mensaje: `Tarea ${id} eliminada exitosamente` });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar tarea' });
  }
};
