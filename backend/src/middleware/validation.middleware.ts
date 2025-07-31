import { Request, Response, NextFunction } from 'express';
import { ManejadorRespuestas } from '../utilidades/respuestas';

// Tipos de validación
interface ValidationRule {
  field: string;
  required?: boolean;
  type?: 'string' | 'email' | 'password' | 'number';
  minLength?: number;
  maxLength?: number;
  sanitize?: boolean;
}

// Configuración de validaciones
const VALIDATION_RULES = {
  login: [
    { field: 'email', required: true, type: 'email', maxLength: 255, sanitize: true },
    { field: 'password', required: true, type: 'string', minLength: 1, maxLength: 128, sanitize: true }
  ],
  registro: [
    { field: 'nombres', required: true, type: 'string', minLength: 2, maxLength: 50, sanitize: true },
    { field: 'apellidos', required: true, type: 'string', minLength: 2, maxLength: 50, sanitize: true },
    { field: 'email', required: true, type: 'email', maxLength: 255, sanitize: true },
    { field: 'password', required: true, type: 'password', minLength: 8, maxLength: 128, sanitize: true },
    { field: 'telefono', required: false, type: 'string', maxLength: 20, sanitize: true }
  ]
};

// Patrones de validación
const PATTERNS = {
  email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
  phone: /^[+]?[0-9\s\-()]{8,20}$/,
  name: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/,
  alphanumeric: /^[a-zA-Z0-9\s]+$/
};

// Función para sanitizar entrada
function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remover caracteres peligrosos
    .replace(/javascript:/gi, '') // Remover javascript:
    .replace(/on\w+=/gi, '') // Remover event handlers
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ''); // Remover scripts
}

// Función para validar tipo de dato
function validateType(value: any, type: string): boolean {
  switch (type) {
    case 'string':
      return typeof value === 'string';
    case 'email':
      return typeof value === 'string' && PATTERNS.email.test(value);
    case 'password':
      // Para login, solo validar que sea string
      return typeof value === 'string';
    case 'number':
      return typeof value === 'number' || !isNaN(Number(value));
    default:
      return true;
  }
}

// Función para validar longitud
function validateLength(value: string, minLength?: number, maxLength?: number): boolean {
  if (minLength && value.length < minLength) return false;
  if (maxLength && value.length > maxLength) return false;
  return true;
}

// Middleware principal de validación
export const validateRequest = (validationType: keyof typeof VALIDATION_RULES) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const rules = VALIDATION_RULES[validationType];
      const errors: string[] = [];
      const sanitizedData: any = {};

      // Validar cada campo según las reglas
      for (const rule of rules) {
        const value = req.body[rule.field];

        // Verificar si es requerido
        if (rule.required && (!value || value === '')) {
          errors.push(`El campo '${rule.field}' es requerido`);
          continue;
        }

        // Si no es requerido y no tiene valor, continuar
        if (!rule.required && (!value || value === '')) {
          continue;
        }

        // Sanitizar si es necesario
        let sanitizedValue = value;
        if (rule.sanitize && typeof value === 'string') {
          sanitizedValue = sanitizeInput(value);
        }

        // Validar tipo
        if (rule.type && !validateType(sanitizedValue, rule.type)) {
          errors.push(`El campo '${rule.field}' tiene un formato inválido`);
          continue;
        }

        // Validar longitud
        if (typeof sanitizedValue === 'string' && !validateLength(sanitizedValue, rule.minLength, rule.maxLength)) {
          const minMsg = rule.minLength ? `mínimo ${rule.minLength} caracteres` : '';
          const maxMsg = rule.maxLength ? `máximo ${rule.maxLength} caracteres` : '';
          const lengthMsg = [minMsg, maxMsg].filter(Boolean).join(', ');
          errors.push(`El campo '${rule.field}' debe tener ${lengthMsg}`);
          continue;
        }

        // Agregar valor sanitizado
        sanitizedData[rule.field] = sanitizedValue;
      }

      // Si hay errores, retornar error
      if (errors.length > 0) {
        ManejadorRespuestas.errorValidacion(
          res,
          'Datos de entrada inválidos',
          { errores: errors },
          'VALID_001'
        );
        return;
      }

      // Reemplazar datos originales con datos sanitizados
      req.body = { ...req.body, ...sanitizedData };

      next();
    } catch (error) {
      ManejadorRespuestas.errorInterno(
        res,
        'Error en la validación de datos',
        'VALID_002'
      );
      return;
    }
  };
};

// Middleware específico para login
export const validateLogin = validateRequest('login');

// Middleware específico para registro
export const validateRegistro = validateRequest('registro');

// Middleware para prevenir ataques comunes
export const securityMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  try {
    // Verificar Content-Type
    const contentType = req.get('Content-Type');
    if (req.method === 'POST' && contentType && !contentType.includes('application/json')) {
      ManejadorRespuestas.errorValidacion(
        res,
        'Content-Type debe ser application/json',
        'SEC_001'
      );
      return;
    }

    // Verificar tamaño del payload
    const contentLength = parseInt(req.get('Content-Length') || '0');
    if (contentLength > 1024 * 1024) { // 1MB máximo
      ManejadorRespuestas.errorValidacion(
        res,
        'Payload demasiado grande',
        'SEC_002'
      );
      return;
    }

    // Verificar headers maliciosos
    const headers = req.headers;
    const maliciousHeaders = ['x-forwarded-for', 'x-real-ip', 'x-forwarded-proto'];
    
    for (const header of maliciousHeaders) {
      if (headers[header] && typeof headers[header] === 'string') {
        const value = headers[header] as string;
        if (value.includes('<') || value.includes('>') || value.includes('javascript:')) {
          ManejadorRespuestas.errorValidacion(
            res,
            'Headers maliciosos detectados',
            'SEC_003'
          );
          return;
        }
      }
    }

    // Rate limiting básico (implementar Redis para producción)
    const clientIP = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('User-Agent') || '';
    
    // Verificar User-Agent malicioso
    if (userAgent.toLowerCase().includes('sqlmap') || 
        userAgent.toLowerCase().includes('nikto') ||
        userAgent.toLowerCase().includes('nmap')) {
      ManejadorRespuestas.errorValidacion(
        res,
        'Acceso denegado',
        'SEC_004'
      );
      return;
    }

    next();
  } catch (error) {
    ManejadorRespuestas.errorInterno(
      res,
      'Error en el middleware de seguridad',
      'SEC_005'
    );
    return;
  }
};

// Middleware para validar JWT
export const validateJWT = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      ManejadorRespuestas.noAutorizado(
        res,
        'Token de autorización requerido',
        'AUTH_006'
      );
      return;
    }

    const token = authHeader.replace('Bearer ', '');
    
    if (!token) {
      ManejadorRespuestas.noAutorizado(
        res,
        'Token inválido',
        'AUTH_007'
      );
      return;
    }

    // Verificar formato del token
    if (!/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]*$/.test(token)) {
      ManejadorRespuestas.noAutorizado(
        res,
        'Formato de token inválido',
        'AUTH_008'
      );
      return;
    }

    next();
  } catch (error) {
    ManejadorRespuestas.errorInterno(
      res,
      'Error en la validación del token',
      'AUTH_009'
    );
    return;
  }
}; 