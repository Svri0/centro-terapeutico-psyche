import { Request, Response, NextFunction } from 'express';
import { ManejadorRespuestas } from '../utilidades/respuestas';
import { log } from '../utilidades/logger';
import { verificarToken } from './auth.middleware';

// Middleware para verificar que el usuario es recepcionista
export const verificarRecepcionista = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  console.log('🔍 verificarRecepcionista - INICIANDO');
  console.log('🔍 Usuario:', req.usuario);
  
  try {
    if (!req.usuario) {
      ManejadorRespuestas.noAutorizado(
        res,
        'Usuario no autenticado',
        'AUTH_115'
      );
      return;
    }

    // Verificar que el usuario tenga rol de recepcionista (ID 3)
    if (req.usuario.rol_id !== 3) {
      ManejadorRespuestas.prohibido(
        res,
        'Acceso denegado. Se requieren permisos de recepcionista',
        'AUTH_116'
      );
      return;
    }

    console.log('✅ Usuario es recepcionista, continuando...');
    next();
  } catch (error) {
    log.error('Error en verificarRecepcionista:', error);
    ManejadorRespuestas.errorInterno(
      res,
      'Error al verificar permisos de recepcionista',
      'AUTH_117'
    );
  }
};

// Middleware para verificar permisos específicos de recepcionista
export const verificarPermisoRecepcionista = (permiso: string) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    console.log('🔍 verificarPermisoRecepcionista - INICIANDO');
    console.log('🔍 Permiso requerido:', permiso);
    console.log('🔍 Usuario:', req.usuario);
    
    try {
      if (!req.usuario) {
        ManejadorRespuestas.noAutorizado(
          res,
          'Usuario no autenticado',
          'AUTH_118'
        );
        return;
      }

      // Verificar que el usuario tenga rol de recepcionista
      if (req.usuario.rol_id !== 3) {
        ManejadorRespuestas.prohibido(
          res,
          'Acceso denegado. Se requieren permisos de recepcionista',
          'AUTH_119'
        );
        return;
      }

      // Verificar permisos específicos del recepcionista
      const permisosRecepcionista = {
        pacientes: ['crear', 'leer', 'actualizar'],
        citas: ['crear', 'leer', 'actualizar', 'eliminar'],
        pagos: ['crear', 'leer', 'actualizar'],
        agenda: ['leer', 'actualizar'],
        mensajes: ['crear', 'leer'],
        reportes: ['leer'],
        dashboard: ['leer']
      };

      // Extraer el recurso y la acción del permiso (ej: "pacientes:crear")
      const [recurso, accion] = permiso.split(':');
      
      if (!recurso || !accion) {
        ManejadorRespuestas.prohibido(
          res,
          'Formato de permiso inválido',
          'AUTH_120'
        );
        return;
      }

      // Verificar si el recepcionista tiene el permiso específico
      const permisosDelRecurso = permisosRecepcionista[recurso as keyof typeof permisosRecepcionista];
      
      if (!permisosDelRecurso || !permisosDelRecurso.includes(accion)) {
        ManejadorRespuestas.prohibido(
          res,
          `Acceso denegado. No tienes permisos para ${accion} ${recurso}`,
          'AUTH_121'
        );
        return;
      }

      console.log('✅ Permiso verificado, continuando...');
      next();
    } catch (error) {
      log.error('Error en verificarPermisoRecepcionista:', error);
      ManejadorRespuestas.errorInterno(
        res,
        'Error al verificar permisos específicos',
        'AUTH_122'
      );
    }
  };
};

// Middleware combinado para rutas de recepcionista
export const authRecepcionista = [verificarToken, verificarRecepcionista];

// Middleware para rutas que requieren permisos específicos
export const authRecepcionistaConPermiso = (permiso: string) => [
  verificarToken,
  verificarRecepcionista,
  verificarPermisoRecepcionista(permiso)
];

