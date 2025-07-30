import { NextFunction, Request, Response } from 'express';
import Usuario from '../modelos/Usuario';
import JWTService from '../servicios/jwt.service';
import { log } from '../utilidades/logger';
import { ManejadorRespuestas } from '../utilidades/respuestas';

// Extender la interfaz Request para incluir el usuario
declare global {
  namespace Express {
    interface Request {
      usuario?: {
        id: number;
        email: string;
        rol: string;
        nombre: string;
      };
    }
  }
}

/**
 * Middleware para verificar autenticación
 */
export const verificarAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Extraer token del header
    const authHeader = req.headers.authorization;
    const token = JWTService.extraerToken(authHeader);

    // Verificar y decodificar token
    const decoded = JWTService.verificarToken(token);

    // Buscar usuario en la base de datos
    const usuario = await Usuario.findByPk(decoded.id, {
      attributes: { exclude: ['password'] }
    });

    if (!usuario || !usuario.activo) {
      ManejadorRespuestas.noAutorizado(
        res,
        'Usuario no encontrado o inactivo',
        'AUTH_MIDDLEWARE_001'
      );
      return;
    }

    // Actualizar último acceso
    await usuario.actualizarUltimoAcceso();

    // Agregar usuario a la request
    req.usuario = {
      id: usuario.id,
      email: usuario.email,
      rol: usuario.rol,
      nombre: usuario.nombre
    };

    next();
  } catch (error) {
    log.error('Error en middleware de autenticación:', error);
    ManejadorRespuestas.noAutorizado(res, 'Token inválido o expirado', 'AUTH_MIDDLEWARE_002');
    return;
  }
};

/**
 * Middleware para verificar roles específicos
 */
export const verificarRol = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.usuario) {
      ManejadorRespuestas.noAutorizado(res, 'Usuario no autenticado', 'AUTH_MIDDLEWARE_003');
      return;
    }

    if (!roles.includes(req.usuario.rol)) {
      ManejadorRespuestas.prohibido(
        res,
        'No tienes permisos para acceder a este recurso',
        'AUTH_MIDDLEWARE_004'
      );
      return;
    }

    next();
  };
};

/**
 * Middleware para verificar si es propietario del recurso o admin
 */
export const verificarPropietarioOAdmin = (campoId: string = 'id') => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.usuario) {
      ManejadorRespuestas.noAutorizado(res, 'Usuario no autenticado', 'AUTH_MIDDLEWARE_005');
      return;
    }

    // Los administradores pueden acceder a todo
    if (req.usuario.rol === 'admin') {
      next();
      return;
    }

    // Verificar si es propietario del recurso
    const idRecurso = req.params[campoId] || req.body[campoId];
    const idUsuario = req.usuario.id;

    if (idRecurso && parseInt(idRecurso) !== idUsuario) {
      ManejadorRespuestas.prohibido(
        res,
        'No tienes permisos para acceder a este recurso',
        'AUTH_MIDDLEWARE_006'
      );
      return;
    }

    next();
  };
};

/**
 * Middleware para verificar si el token está próximo a expirar
 */
export const verificarTokenPróximoAExpirar = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      next(); // No hay token, continuar
      return;
    }

    const token = JWTService.extraerToken(authHeader);

    if (JWTService.tokenPróximoAExpirar(token)) {
      // Agregar header para indicar que el token está próximo a expirar
      res.setHeader('X-Token-Expiring-Soon', 'true');
    }

    next();
  } catch (error) {
    // Si hay error, continuar sin el header
    next();
  }
};

/**
 * Middleware para logging de autenticación
 */
export const logAuth = (req: Request, res: Response, next: NextFunction): void => {
  const usuario = req.usuario;
  const metodo = req.method;
  const ruta = req.originalUrl;
  const ip = req.ip || req.connection.remoteAddress;

  if (usuario) {
    log.info(
      `Acceso autorizado - Usuario: ${usuario.email} (${usuario.rol}) - ${metodo} ${ruta} - IP: ${ip}`
    );
  } else {
    log.info(`Acceso no autorizado - ${metodo} ${ruta} - IP: ${ip}`);
  }

  next();
};

export default {
  verificarAuth,
  verificarRol,
  verificarPropietarioOAdmin,
  verificarTokenPróximoAExpirar,
  logAuth
};
