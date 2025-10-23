import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { ManejadorRespuestas } from '../utilidades/respuestas';
import { log } from '../utilidades/logger';

// Extender la interfaz Request para incluir el usuario
declare global {
  namespace Express {
    interface Request {
      usuario?: {
        id: string;
        email: string;
        rol_id: number;
        nombres: string;
        apellidos: string;
        lastActivity?: number;
      };
    }
  }
}

// Middleware para verificar JWT (sin timeout para login inicial)
export const verificarToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  console.log('🔍 verificarToken - INICIANDO');
  console.log('🔍 URL:', req.url);
  console.log('🔍 Method:', req.method);
  try {
    console.log('🔍 Headers recibidos:', req.headers);
    console.log('🔍 Authorization header:', req.headers.authorization);
    
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      console.log('❌ No se encontró token en headers');
      ManejadorRespuestas.noAutorizado(
        res,
        'Token de acceso requerido',
        'AUTH_101'
      );
      return;
    }

    console.log('🔍 Token extraído:', token.substring(0, 50) + '...');
    
    const secret = process.env.JWT_SECRET || 'tu_secreto_super_seguro_para_jwt_tokens_2024';
    console.log('🔍 JWT_SECRET usado en verificación:', secret);
    
    const decoded = jwt.verify(token, secret) as any;
    console.log('🔍 Token decodificado:', decoded);
    
    // Verificar que el usuario existe y está activo
    // TODO: Implementar verificación en base de datos
    req.usuario = {
      id: decoded.id,
      email: decoded.email,
      rol_id: decoded.rol_id,
      nombres: decoded.nombres,
      apellidos: decoded.apellidos,
      lastActivity: decoded.lastActivity
    };

    console.log('🔍 Usuario configurado en req:', req.usuario);
    next();
  } catch (error) {
    log.error('Error en verificarToken:', error);
    
    if (error instanceof jwt.JsonWebTokenError) {
      ManejadorRespuestas.noAutorizado(
        res,
        'Token inválido o expirado',
        'AUTH_102'
      );
      return;
    }

    ManejadorRespuestas.errorInterno(
      res,
      'Error al verificar el token',
      'AUTH_103'
    );
  }
};

// Middleware para verificar timeout de sesión (solo para rutas protegidas)
export const verificarTimeoutSesion = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.usuario || !req.usuario.lastActivity) {
      // Si no hay usuario o lastActivity, continuar (token nuevo)
      return next();
    }

    const now = Date.now();
    const timeSinceLastActivity = now - req.usuario.lastActivity;
    const SESSION_TIMEOUT = 10 * 1000; // 10 segundos para pruebas
    
    console.log('🔍 Verificando timeout:', {
      lastActivity: req.usuario.lastActivity,
      now: now,
      timeSinceLastActivity: timeSinceLastActivity,
      timeout: SESSION_TIMEOUT
    });
    
    if (timeSinceLastActivity > SESSION_TIMEOUT) {
      console.log('⏰ Sesión expirada por timeout');
      ManejadorRespuestas.noAutorizado(
        res,
        'Sesión expirada por inactividad. Por favor, inicia sesión nuevamente.',
        'AUTH_TIMEOUT'
      );
      return;
    }

    next();
  } catch (error) {
    log.error('Error en verificarTimeoutSesion:', error);
    next();
  }
};

// Middleware para verificar que el usuario es administrador
export const verificarAdmin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.usuario) {
      ManejadorRespuestas.noAutorizado(
        res,
        'Usuario no autenticado',
        'AUTH_104'
      );
      return;
    }

    // Verificar que el rol_id sea 1 (administrador según el seeder)
    if (req.usuario.rol_id !== 1) {
      ManejadorRespuestas.prohibido(
        res,
        'Acceso denegado. Se requieren permisos de administrador',
        'AUTH_105'
      );
      return;
    }

    next();
  } catch (error) {
    log.error('Error en verificarAdmin:', error);
    ManejadorRespuestas.errorInterno(
      res,
      'Error al verificar permisos de administrador',
      'AUTH_106'
    );
  }
};

// Middleware para verificar subdominio admin
export const verificarSubdominioAdmin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const hostname = req.hostname;
    
    if (!hostname.includes('admin')) {
      ManejadorRespuestas.prohibido(
        res,
        'Acceso denegado. Esta funcionalidad solo está disponible desde el subdominio admin',
        'AUTH_107'
      );
      return;
    }

    next();
  } catch (error) {
    log.error('Error en verificarSubdominioAdmin:', error);
    ManejadorRespuestas.errorInterno(
      res,
      'Error al verificar subdominio',
      'AUTH_108'
    );
  }
};

// Middleware para verificar que el usuario es psicólogo
export const verificarPsicologo = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.usuario) {
      ManejadorRespuestas.noAutorizado(
        res,
        'Usuario no autenticado',
        'AUTH_109'
      );
      return;
    }

    // Verificar que el rol_id sea 2 (psicólogo según el seeder)
    if (req.usuario.rol_id !== 2) {
      ManejadorRespuestas.prohibido(
        res,
        'Acceso denegado. Se requieren permisos de psicólogo',
        'AUTH_110'
      );
      return;
    }

    next();
  } catch (error) {
    log.error('Error en verificarPsicologo:', error);
    ManejadorRespuestas.errorInterno(
      res,
      'Error al verificar permisos de psicólogo',
      'AUTH_111'
    );
  }
};

// Middleware para verificar roles específicos
export const verificarRol = (rolesPermitidos: string[]) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    console.log('🔍 verificarRol - INICIANDO');
    console.log('🔍 Roles permitidos:', rolesPermitidos);
    console.log('🔍 Usuario:', req.usuario);
    try {
      if (!req.usuario) {
        ManejadorRespuestas.noAutorizado(
          res,
          'Usuario no autenticado',
          'AUTH_112'
        );
        return;
      }

      // Mapear rol_id a nombres de roles
      const rolMap: { [key: number]: string } = {
        1: 'admin',
        2: 'psicologo',
        3: 'paciente',
        4: 'recepcionista'
      };

      const rolUsuario = rolMap[req.usuario.rol_id];
      
      if (!rolUsuario || !rolesPermitidos.includes(rolUsuario)) {
        ManejadorRespuestas.prohibido(
          res,
          `Acceso denegado. Se requieren permisos de: ${rolesPermitidos.join(', ')}`,
          'AUTH_113'
        );
        return;
      }

      next();
    } catch (error) {
      log.error('Error en verificarRol:', error);
      ManejadorRespuestas.errorInterno(
        res,
        'Error al verificar permisos',
        'AUTH_114'
      );
    }
  };
};

// Middleware combinado para rutas de administrador
// En desarrollo, omitimos la verificación de subdominio
export const authAdmin = [verificarToken, verificarTimeoutSesion, verificarAdmin];

// Middleware combinado para rutas de psicólogo
export const authPsicologo = [verificarToken, verificarTimeoutSesion, verificarPsicologo]; 