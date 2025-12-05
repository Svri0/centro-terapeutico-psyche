// Controlador de artículos
import { Request, Response } from 'express';
import Articulo from '../modelos/Articulo';
import { ManejadorRespuestas } from '../utilidades/respuestas';
import { log } from '../utilidades/logger';
import { Op } from 'sequelize';
import Usuario from '../modelos/Usuario';

// Obtener todos los artículos publicados (público)
export const obtenerArticulosPublicados = async (req: Request, res: Response) => {
  try {
    const { categoria, limit = '10', offset = '0' } = req.query;

    const whereClause: any = {
      publicado: true,
    };

    if (categoria) {
      whereClause.categoria = categoria;
    }

    const articulos = await Articulo.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Usuario,
          as: 'autor',
          attributes: ['id', 'nombres', 'apellidos'],
          required: false,
        },
      ],
      order: [['fecha_publicacion', 'DESC']],
      limit: parseInt(limit as string, 10),
      offset: parseInt(offset as string, 10),
    });

    return ManejadorRespuestas.exito(
      res,
      'Artículos obtenidos exitosamente',
      {
        articulos: articulos.rows,
        total: articulos.count,
        limit: parseInt(limit as string, 10),
        offset: parseInt(offset as string, 10),
      },
      'ART_001'
    );
  } catch (error: any) {
    log.error('Error en obtenerArticulosPublicados:', {
      message: error?.message,
      stack: error?.stack,
    });
    return ManejadorRespuestas.errorInterno(
      res,
      `Error al obtener artículos: ${error?.message || 'Error desconocido'}`,
      'ART_002'
    );
  }
};

// Obtener un artículo por slug (público)
export const obtenerArticuloPorSlug = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;

    const articulo = await Articulo.findOne({
      where: {
        slug,
        publicado: true,
      },
      include: [
        {
          model: Usuario,
          as: 'autor',
          attributes: ['id', 'nombres', 'apellidos'],
          required: false,
        },
      ],
    });

    if (!articulo) {
      return ManejadorRespuestas.noEncontrado(
        res,
        'Artículo no encontrado',
        'ART_003'
      );
    }

    // Incrementar contador de vistas
    await articulo.increment('vistas');

    return ManejadorRespuestas.exito(
      res,
      'Artículo obtenido exitosamente',
      articulo,
      'ART_004'
    );
  } catch (error: any) {
    log.error('Error en obtenerArticuloPorSlug:', {
      message: error?.message,
      stack: error?.stack,
    });
    return ManejadorRespuestas.errorInterno(
      res,
      `Error al obtener artículo: ${error?.message || 'Error desconocido'}`,
      'ART_005'
    );
  }
};

// Obtener todos los artículos (requiere autenticación - para admin)
export const obtenerTodos = async (req: Request, res: Response) => {
  try {
    const { categoria, publicado, limit = '50', offset = '0' } = req.query;

    const whereClause: any = {};

    if (categoria) {
      whereClause.categoria = categoria;
    }

    if (publicado !== undefined) {
      whereClause.publicado = publicado === 'true';
    }

    const articulos = await Articulo.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Usuario,
          as: 'autor',
          attributes: ['id', 'nombres', 'apellidos'],
          required: false,
        },
      ],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit as string, 10),
      offset: parseInt(offset as string, 10),
    });

    return ManejadorRespuestas.exito(
      res,
      'Artículos obtenidos exitosamente',
      {
        articulos: articulos.rows,
        total: articulos.count,
        limit: parseInt(limit as string, 10),
        offset: parseInt(offset as string, 10),
      },
      'ART_006'
    );
  } catch (error: any) {
    log.error('Error en obtenerTodos:', {
      message: error?.message,
      stack: error?.stack,
    });
    return ManejadorRespuestas.errorInterno(
      res,
      `Error al obtener artículos: ${error?.message || 'Error desconocido'}`,
      'ART_007'
    );
  }
};

// Obtener un artículo por ID (requiere autenticación)
export const obtenerPorId = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const articulo = await Articulo.findByPk(id, {
      include: [
        {
          model: Usuario,
          as: 'autor',
          attributes: ['id', 'nombres', 'apellidos'],
          required: false,
        },
      ],
    });

    if (!articulo) {
      return ManejadorRespuestas.noEncontrado(
        res,
        'Artículo no encontrado',
        'ART_008'
      );
    }

    return ManejadorRespuestas.exito(
      res,
      'Artículo obtenido exitosamente',
      articulo,
      'ART_009'
    );
  } catch (error: any) {
    log.error('Error en obtenerPorId:', {
      message: error?.message,
      stack: error?.stack,
    });
    return ManejadorRespuestas.errorInterno(
      res,
      `Error al obtener artículo: ${error?.message || 'Error desconocido'}`,
      'ART_010'
    );
  }
};

// Crear un artículo (requiere autenticación)
export const crear = async (req: Request, res: Response) => {
  try {
    const usuarioId = req.usuario?.id;
    const {
      titulo,
      resumen,
      contenido,
      imagen_url,
      categoria,
      tiempo_lectura,
      publicado,
      etiquetas,
    } = req.body;

    if (!titulo || !resumen || !contenido || !imagen_url || !categoria) {
      return ManejadorRespuestas.errorValidacion(
        res,
        'Faltan campos requeridos: titulo, resumen, contenido, imagen_url, categoria',
        'ART_011'
      );
    }

    // Generar slug desde el título
    const slug = titulo
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    // Verificar que el slug sea único
    const slugExistente = await Articulo.findOne({ where: { slug } });
    if (slugExistente) {
      return ManejadorRespuestas.errorValidacion(
        res,
        'Ya existe un artículo con un título similar',
        'ART_012'
      );
    }

    const datosArticulo: any = {
      titulo,
      slug,
      resumen,
      contenido,
      imagen_url,
      categoria,
      tiempo_lectura: tiempo_lectura || 5,
      publicado: publicado !== undefined ? publicado : true,
      etiquetas: etiquetas || [],
      vistas: 0,
    };

    if (usuarioId) {
      datosArticulo.autor_id = usuarioId;
    }

    if (publicado !== false) {
      datosArticulo.fecha_publicacion = new Date();
    }

    const articulo = await Articulo.create(datosArticulo);

    const articuloCompleto = await Articulo.findByPk(articulo.id, {
      include: [
        {
          model: Usuario,
          as: 'autor',
          attributes: ['id', 'nombres', 'apellidos'],
          required: false,
        },
      ],
    });

    return ManejadorRespuestas.creado(
      res,
      'Artículo creado exitosamente',
      articuloCompleto,
      'ART_013'
    );
  } catch (error: any) {
    log.error('Error en crear:', {
      message: error?.message,
      stack: error?.stack,
    });
    return ManejadorRespuestas.errorInterno(
      res,
      `Error al crear artículo: ${error?.message || 'Error desconocido'}`,
      'ART_014'
    );
  }
};

// Actualizar un artículo (requiere autenticación)
export const actualizar = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      titulo,
      resumen,
      contenido,
      imagen_url,
      categoria,
      tiempo_lectura,
      publicado,
      etiquetas,
    } = req.body;

    const articulo = await Articulo.findByPk(id);

    if (!articulo) {
      return ManejadorRespuestas.noEncontrado(
        res,
        'Artículo no encontrado',
        'ART_015'
      );
    }

    // Si se cambia el título, actualizar el slug
    if (titulo && titulo !== articulo.titulo) {
      const nuevoSlug = titulo
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

      // Verificar que el nuevo slug sea único
      const slugExistente = await Articulo.findOne({
        where: { slug: nuevoSlug, id: { [Op.ne]: id } },
      });

      if (slugExistente) {
        return ManejadorRespuestas.errorValidacion(
          res,
          'Ya existe un artículo con un título similar',
          'ART_016'
        );
      }

      articulo.slug = nuevoSlug;
    }

    // Actualizar campos
    if (titulo) articulo.titulo = titulo;
    if (resumen) articulo.resumen = resumen;
    if (contenido) articulo.contenido = contenido;
    if (imagen_url) articulo.imagen_url = imagen_url;
    if (categoria) articulo.categoria = categoria;
    if (tiempo_lectura !== undefined) articulo.tiempo_lectura = tiempo_lectura;
    if (etiquetas) articulo.etiquetas = etiquetas;

    // Si se publica por primera vez, establecer fecha de publicación
    if (publicado === true && !articulo.fecha_publicacion) {
      articulo.fecha_publicacion = new Date();
    }

    if (publicado !== undefined) {
      articulo.publicado = publicado;
    }

    await articulo.save();

    const articuloActualizado = await Articulo.findByPk(articulo.id, {
      include: [
        {
          model: Usuario,
          as: 'autor',
          attributes: ['id', 'nombres', 'apellidos'],
          required: false,
        },
      ],
    });

    return ManejadorRespuestas.exito(
      res,
      'Artículo actualizado exitosamente',
      articuloActualizado,
      'ART_017'
    );
  } catch (error: any) {
    log.error('Error en actualizar:', {
      message: error?.message,
      stack: error?.stack,
    });
    return ManejadorRespuestas.errorInterno(
      res,
      `Error al actualizar artículo: ${error?.message || 'Error desconocido'}`,
      'ART_018'
    );
  }
};

// Eliminar un artículo (soft delete)
export const eliminar = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const articulo = await Articulo.findByPk(id);

    if (!articulo) {
      return ManejadorRespuestas.noEncontrado(
        res,
        'Artículo no encontrado',
        'ART_019'
      );
    }

    await articulo.destroy();

    return ManejadorRespuestas.exito(
      res,
      'Artículo eliminado exitosamente',
      null,
      'ART_020'
    );
  } catch (error: any) {
    log.error('Error en eliminar:', {
      message: error?.message,
      stack: error?.stack,
    });
    return ManejadorRespuestas.errorInterno(
      res,
      `Error al eliminar artículo: ${error?.message || 'Error desconocido'}`,
      'ART_021'
    );
  }
};

