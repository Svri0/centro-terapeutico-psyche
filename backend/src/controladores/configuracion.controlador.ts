import { Request, Response } from 'express';
import { ManejadorRespuestas } from '../utilidades/respuestas';
import ConfiguracionSistema from '../modelos/ConfiguracionSistema';
import { Op } from 'sequelize';

// Fallback en memoria cuando la base de datos no está disponible
type ConfigMem = {
  id: string;
  clave: string;
  valor: string;
  descripcion?: string;
  tipo: 'boolean' | 'number' | 'string' | 'json';
  categoria: 'chat' | 'mensajes' | 'general' | 'backup';
  activo: boolean;
  created_at: Date;
  updated_at: Date;
};
const memoriaConfiguraciones = new Map<string, ConfigMem>();

export class ConfiguracionController {
  // Obtener todas las configuraciones
  static async obtenerConfiguraciones(req: Request, res: Response) {
    try {
      const { categoria } = req.query;

      const where: any = { activo: true };
      if (categoria) {
        where.categoria = categoria;
      }

      const configuraciones = await ConfiguracionSistema.findAll({
        where,
        order: [['categoria', 'ASC'], ['clave', 'ASC']],
      });

      return ManejadorRespuestas.exito(
        res,
        'Configuraciones obtenidas exitosamente',
        configuraciones,
        'CONFIG_001'
      );
    } catch (error) {
      console.error('Error al obtener configuraciones:', error);
      // Fallback: devolver desde memoria (persistente durante el proceso)
      const { categoria } = req.query as { categoria?: string };
      const todas = Array.from(memoriaConfiguraciones.values());
      const filtradas = categoria
        ? todas.filter(c => c.categoria === categoria)
        : todas;
      return ManejadorRespuestas.exito(
        res,
        'Configuraciones (fallback memoria)',
        filtradas,
        'CONFIG_001_EMPTY'
      );
    }
  }

  // Obtener una configuración por clave
  static async obtenerConfiguracion(req: Request, res: Response) {
    try {
      const { clave } = req.params as { clave: string };

      const configuracion = await ConfiguracionSistema.findOne({
        where: { clave, activo: true },
      });

      if (!configuracion) {
        // Buscar en memoria como fallback
        const mem = memoriaConfiguraciones.get(clave as string);
        if (mem) {
          return ManejadorRespuestas.exito(
            res,
            'Configuración obtenida exitosamente (fallback)',
            mem,
            'CONFIG_004_FALLBACK'
          );
        } else {
          return ManejadorRespuestas.noEncontrado(
            res,
            'Configuración no encontrada',
            'CONFIG_003'
          );
        }
      }

      return ManejadorRespuestas.exito(
        res,
        'Configuración obtenida exitosamente',
        configuracion,
        'CONFIG_004'
      );
    } catch (error) {
      console.error('Error al obtener configuración:', error);
      // Buscar en memoria
      const { clave } = req.params as { clave: string };
      const mem = memoriaConfiguraciones.get(clave as string);
      if (mem) {
        return ManejadorRespuestas.exito(
          res,
          'Configuración obtenida exitosamente (fallback)',
          mem,
          'CONFIG_004_FALLBACK'
        );
      }
      return ManejadorRespuestas.noEncontrado(
        res,
        'Configuración no disponible',
        'CONFIG_005'
      );
    }
  }

  // Actualizar una configuración
  static async actualizarConfiguracion(req: Request, res: Response) {
    try {
      const { clave } = req.params;
      const { valor, descripcion, activo } = req.body;

      const configuracion = await ConfiguracionSistema.findOne({
        where: { clave },
      });

      if (!configuracion) {
        return ManejadorRespuestas.noEncontrado(
          res,
          'Configuración no encontrada',
          'CONFIG_006'
        );
      }

      // Validar tipo de valor según el tipo de configuración
      if (valor !== undefined) {
        if (configuracion.tipo === 'boolean') {
          configuracion.valor = String(valor === true || valor === 'true');
        } else if (configuracion.tipo === 'number') {
          const numValue = Number(valor);
          if (isNaN(numValue)) {
            return ManejadorRespuestas.errorValidacion(
              res,
              'El valor debe ser un número',
              'CONFIG_007'
            );
          }
          configuracion.valor = String(numValue);
        } else {
          configuracion.valor = String(valor);
        }
      }

      if (descripcion !== undefined) {
        configuracion.descripcion = descripcion;
      }

      if (activo !== undefined) {
        configuracion.activo = activo;
      }

      await configuracion.save();

      // Sincronizar memoria (omitimos descripcion si es undefined/null)
      memoriaConfiguraciones.set(configuracion.clave, {
        id: configuracion.id,
        clave: configuracion.clave,
        valor: configuracion.valor,
        ...(configuracion.descripcion != null ? { descripcion: configuracion.descripcion } : {} as any),
        tipo: configuracion.tipo,
        categoria: configuracion.categoria,
        activo: configuracion.activo,
        created_at: configuracion.created_at,
        updated_at: configuracion.updated_at,
      } as ConfigMem);

      return ManejadorRespuestas.exito(
        res,
        'Configuración actualizada exitosamente',
        configuracion,
        'CONFIG_008'
      );
    } catch (error) {
      console.error('Error al actualizar configuración:', error);
      // Actualizar en memoria como fallback
      const { clave } = req.params;
      const { valor, descripcion, activo } = req.body;
      const existente = memoriaConfiguraciones.get((clave as string));
      const ahora = new Date();
      if (existente) {
        const actualizado: ConfigMem = {
          ...existente,
          valor: String(valor ?? existente.valor),
          descripcion: descripcion ?? existente.descripcion,
          activo: activo ?? existente.activo,
          updated_at: ahora,
        };
        memoriaConfiguraciones.set((clave as string), actualizado);
        return ManejadorRespuestas.exito(
          res,
          'Configuración actualizada (fallback memoria)',
          actualizado,
          'CONFIG_008_FALLBACK'
        );
      }
      return ManejadorRespuestas.noEncontrado(
        res,
        'Configuración no disponible o tabla ausente',
        'CONFIG_009'
      );
    }
  }

  // Crear una nueva configuración
  static async crearConfiguracion(req: Request, res: Response) {
    try {
      const { clave, valor, descripcion, tipo, categoria, activo } = req.body;

      if (!clave || !valor || !tipo || !categoria) {
        return ManejadorRespuestas.errorValidacion(
          res,
          'Faltan campos requeridos: clave, valor, tipo, categoria',
          'CONFIG_010'
        );
      }

      // Verificar si ya existe
      const existe = await ConfiguracionSistema.findOne({
        where: { clave },
      });

      if (existe) {
        return ManejadorRespuestas.errorValidacion(
          res,
          'Ya existe una configuración con esta clave',
          'CONFIG_011'
        );
      }

      const configuracion = await ConfiguracionSistema.create({
        clave,
        valor: String(valor),
        descripcion,
        tipo,
        categoria,
        activo: activo !== undefined ? activo : true,
      });

      // Sincronizar memoria (omitimos descripcion si es undefined/null)
      memoriaConfiguraciones.set(configuracion.clave, {
        id: configuracion.id,
        clave: configuracion.clave,
        valor: configuracion.valor,
        ...(configuracion.descripcion != null ? { descripcion: configuracion.descripcion } : {} as any),
        tipo: configuracion.tipo,
        categoria: configuracion.categoria,
        activo: configuracion.activo,
        created_at: configuracion.created_at,
        updated_at: configuracion.updated_at,
      } as ConfigMem);

      return ManejadorRespuestas.exito(
        res,
        'Configuración creada exitosamente',
        configuracion,
        'CONFIG_012'
      );
    } catch (error) {
      console.error('Error al crear configuración:', error);
      // Fallback: crear en memoria para no perder cambios
      const { clave, valor, descripcion, tipo, categoria, activo } = req.body;
      const ahora = new Date();
      const simulada: ConfigMem = {
        id: `fallback-${clave}`,
        clave,
        valor: String(valor),
        descripcion,
        tipo,
        categoria,
        activo: activo !== undefined ? !!activo : true,
        created_at: ahora,
        updated_at: ahora,
      };
      memoriaConfiguraciones.set(clave, simulada);

      return ManejadorRespuestas.exito(
        res,
        'Configuración creada (fallback memoria)',
        simulada,
        'CONFIG_013_FALLBACK'
      );
    }
  }

  // Obtener valor de configuración por clave (método helper)
  static async obtenerValor(clave: string): Promise<string | null> {
    try {
      const config = await ConfiguracionSistema.findOne({
        where: { clave, activo: true },
      });
      return config ? config.valor : null;
    } catch (error) {
      console.error(`Error al obtener valor de configuración ${clave}:`, error);
      return null;
    }
  }

  // Obtener valor booleano
  static async obtenerValorBooleano(clave: string): Promise<boolean> {
    const valor = await this.obtenerValor(clave);
    return valor === 'true' || valor === '1';
  }

  // Obtener valor numérico
  static async obtenerValorNumerico(clave: string): Promise<number> {
    const valor = await this.obtenerValor(clave);
    return valor ? Number(valor) : 0;
  }
}

