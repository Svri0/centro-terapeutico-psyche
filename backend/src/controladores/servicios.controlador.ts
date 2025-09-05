import { Request, Response } from 'express';
import { ServicioPsicologo } from '../modelos/ServicioPsicologo';
import { logger } from '../utilidades/logger';

// Obtener todos los servicios de un psicólogo
export const obtenerServicios = async (req: Request, res: Response): Promise<void> => {
  try {
    const psicologoId = req.usuario?.id;
    
    if (!psicologoId) {
      res.status(401).json({ 
        success: false, 
        message: 'Usuario no autenticado' 
      });
      return;
    }

    const servicios = await ServicioPsicologo.findAll({
      where: {
        psicologo_id: psicologoId,
        activo: true
      },
      order: [['created_at', 'DESC']]
    });

    logger.info(`Servicios obtenidos para psicólogo ${psicologoId}: ${servicios.length} servicios`);

    res.json({
      success: true,
      data: servicios
    });
    return;
  } catch (error: any) {
    logger.error('Error al obtener servicios:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
    return;
  }
};

// Crear un nuevo servicio
export const crearServicio = async (req: Request, res: Response): Promise<void> => {
  try {
    const psicologoId = req.usuario?.id;
    
    if (!psicologoId) {
      res.status(401).json({ 
        success: false, 
        message: 'Usuario no autenticado' 
      });
      return;
    }

    const { tipo_servicio_id, nombre, descripcion, duracion, categoria } = req.body;

    // Validar campos requeridos
    if (!tipo_servicio_id || !nombre || !descripcion || !duracion || !categoria) {
      res.status(400).json({
        success: false,
        message: 'Todos los campos son requeridos'
      });
      return;
    }

    // Verificar si ya existe un servicio activo con el mismo tipo_servicio_id
    const servicioExistente = await ServicioPsicologo.findOne({
      where: {
        psicologo_id: psicologoId,
        tipo_servicio_id: tipo_servicio_id,
        activo: true
      }
    });

    if (servicioExistente) {
      res.status(400).json({
        success: false,
        message: 'Ya existe un servicio con este tipo'
      });
      return;
    }

    const nuevoServicio = await ServicioPsicologo.create({
      psicologo_id: psicologoId,
      tipo_servicio_id,
      nombre,
      descripcion,
      duracion,
      categoria,
      activo: true
    });

    logger.info(`Servicio creado para psicólogo ${psicologoId}: ${nuevoServicio.nombre}`);

    res.status(201).json({
      success: true,
      message: 'Servicio creado exitosamente',
      data: nuevoServicio
    });
    return;
  } catch (error: any) {
    logger.error('Error al crear servicio:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
    return;
  }
};

// Actualizar un servicio
export const actualizarServicio = async (req: Request, res: Response): Promise<void> => {
  try {
    const psicologoId = req.usuario?.id;
    const { id } = req.params;
    
    if (!psicologoId) {
      res.status(401).json({ 
        success: false, 
        message: 'Usuario no autenticado' 
      });
      return;
    }

    const servicio = await ServicioPsicologo.findOne({
      where: {
        id: id,
        psicologo_id: psicologoId
      }
    });

    if (!servicio) {
      res.status(404).json({
        success: false,
        message: 'Servicio no encontrado'
      });
      return;
    }

    const { nombre, descripcion, duracion, categoria, activo } = req.body;

    await servicio.update({
      nombre: nombre || servicio.nombre,
      descripcion: descripcion || servicio.descripcion,
      duracion: duracion || servicio.duracion,
      categoria: categoria || servicio.categoria,
      activo: activo !== undefined ? activo : servicio.activo
    });

    logger.info(`Servicio actualizado para psicólogo ${psicologoId}: ${servicio.nombre}`);

    res.json({
      success: true,
      message: 'Servicio actualizado exitosamente',
      data: servicio
    });
    return;
  } catch (error: any) {
    logger.error('Error al actualizar servicio:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
    return;
  }
};

// Eliminar un servicio (soft delete)
export const eliminarServicio = async (req: Request, res: Response): Promise<void> => {
  try {
    const psicologoId = req.usuario?.id;
    const { id } = req.params;
    
    if (!psicologoId) {
      res.status(401).json({ 
        success: false, 
        message: 'Usuario no autenticado' 
      });
      return;
    }

    const servicio = await ServicioPsicologo.findOne({
      where: {
        id: id,
        psicologo_id: psicologoId
      }
    });

    if (!servicio) {
      res.status(404).json({
        success: false,
        message: 'Servicio no encontrado'
      });
      return;
    }

    await servicio.update({ activo: false });

    logger.info(`Servicio eliminado para psicólogo ${psicologoId}: ${servicio.nombre}`);

    res.json({
      success: true,
      message: 'Servicio eliminado exitosamente'
    });
    return;
  } catch (error: any) {
    logger.error('Error al eliminar servicio:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
    return;
  }
};

// Obtener servicios de un psicólogo específico (para pacientes)
export const obtenerServiciosPsicologo = async (req: Request, res: Response): Promise<void> => {
  try {
    const { psicologoId } = req.params;

    if (!psicologoId) {
      res.status(400).json({
        success: false,
        message: 'ID del psicólogo es requerido'
      });
      return;
    }

    const servicios = await ServicioPsicologo.findAll({
      where: {
        psicologo_id: psicologoId,
        activo: true
      },
      order: [['categoria', 'ASC'], ['nombre', 'ASC']]
    });

    logger.info(`Servicios obtenidos para psicólogo ${psicologoId}: ${servicios.length} servicios`);

    res.json({
      success: true,
      data: servicios
    });
    return;
  } catch (error: any) {
    logger.error('Error al obtener servicios del psicólogo:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
    return;
  }
}; 