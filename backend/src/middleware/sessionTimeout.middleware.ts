import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { log } from '../utilidades/logger';

// Configuración del timeout (en milisegundos)
const SESSION_TIMEOUT = 10 * 1000; // 10 segundos para pruebas (cambiar a 15 * 60 * 1000 para 15 minutos)

// Interfaz para extender Request con información de sesión
interface AuthenticatedRequest extends Request {
  usuario?: {
    id: string;
    email: string;
    rol_id: number;
    nombres: string;
    apellidos: string;
    lastActivity?: number;
  };
}

// Middleware para verificar timeout de sesión
export const verificarTimeoutSesion = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    // Solo aplicar a rutas autenticadas
    if (!req.headers.authorization) {
      return next();
    }

    const token = req.headers.authorization.split(' ')[1];
    
    if (!token) {
      return next();
    }

    // Decodificar el token para obtener información de la sesión
    const decoded = jwt.decode(token) as any;
    
    if (!decoded || !decoded.lastActivity) {
      return next();
    }

    const lastActivity = decoded.lastActivity;
    const now = Date.now();
    const timeSinceLastActivity = now - lastActivity;

    // Verificar si ha pasado el tiempo límite
    if (timeSinceLastActivity > SESSION_TIMEOUT) {
      log.warn(`Sesión expirada por timeout para usuario: ${decoded.email || 'desconocido'}`);
      
      return res.status(401).json({
        success: false,
        mensaje: 'Sesión expirada por inactividad. Por favor, inicia sesión nuevamente.',
        codigo: 'SESSION_TIMEOUT',
        timeout: true
      });
    }

    // Actualizar la última actividad en el token si es necesario
    if (timeSinceLastActivity > 60000) { // Actualizar cada minuto
      req.usuario = {
        id: decoded.id || '',
        email: decoded.email || '',
        rol_id: decoded.rol_id || 0,
        nombres: decoded.nombres || '',
        apellidos: decoded.apellidos || '',
        lastActivity: now
      };
    }

    next();
  } catch (error) {
    log.error('Error en verificarTimeoutSesion:', error);
    next();
  }
};

// Función para generar token con timestamp de actividad
export const generarTokenConActividad = (payload: any): string => {
  const tokenPayload = {
    ...payload,
    lastActivity: Date.now()
  };
  
  return jwt.sign(tokenPayload, process.env.JWT_SECRET || 'fallback-secret', {
    expiresIn: '24h'
  });
};

// Función para actualizar actividad en token existente
export const actualizarActividadToken = (token: string): string => {
  try {
    const decoded = jwt.decode(token) as any;
    if (!decoded) {
      throw new Error('Token inválido');
    }

    const newPayload = {
      ...decoded,
      lastActivity: Date.now()
    };

    return jwt.sign(newPayload, process.env.JWT_SECRET || 'fallback-secret', {
      expiresIn: '24h'
    });
  } catch (error) {
    log.error('Error al actualizar actividad del token:', error);
    throw error;
  }
};

// Middleware para actualizar actividad en cada request
export const actualizarActividadSesion = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    // Solo aplicar a rutas autenticadas
    if (!req.headers.authorization) {
      return next();
    }

    const token = req.headers.authorization.split(' ')[1];
    
    if (!token) {
      return next();
    }

    // Actualizar el token con nueva actividad
    const newToken = actualizarActividadToken(token);
    
    // Agregar el nuevo token a la respuesta
    res.setHeader('X-New-Token', newToken);
    
    next();
  } catch (error) {
    log.error('Error en actualizarActividadSesion:', error);
    next();
  }
};

export default {
  verificarTimeoutSesion,
  generarTokenConActividad,
  actualizarActividadToken,
  actualizarActividadSesion,
  SESSION_TIMEOUT
};
