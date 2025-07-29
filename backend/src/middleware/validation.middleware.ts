import { Request, Response, NextFunction } from 'express';
import { ManejadorRespuestas } from '../utilidades/respuestas';

// Validar datos para crear psicólogo
export const validarCrearPsicologo = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const { nombres, apellidos, email, password } = req.body;

    const errores: string[] = [];

    // Validar nombres
    if (!nombres || typeof nombres !== 'string' || nombres.trim().length < 2) {
      errores.push('Nombres debe tener al menos 2 caracteres');
    }

    // Validar apellidos
    if (!apellidos || typeof apellidos !== 'string' || apellidos.trim().length < 2) {
      errores.push('Apellidos debe tener al menos 2 caracteres');
    }

    // Validar email
    if (!email || typeof email !== 'string') {
      errores.push('Email es requerido');
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        errores.push('Formato de email inválido');
      }
    }

    // Validar contraseña
    if (!password || typeof password !== 'string') {
      errores.push('Contraseña es requerida');
    } else if (password.length < 8) {
      errores.push('Contraseña debe tener al menos 8 caracteres');
    }

    // Validar teléfono si se proporciona
    if (req.body.telefono && typeof req.body.telefono !== 'string') {
      errores.push('Teléfono debe ser una cadena de texto');
    }

    // Validar fecha de nacimiento si se proporciona
    if (req.body.fecha_nacimiento) {
      const fecha = new Date(req.body.fecha_nacimiento);
      if (isNaN(fecha.getTime())) {
        errores.push('Fecha de nacimiento inválida');
      }
    }

    // Validar género si se proporciona
    const generosValidos = ['masculino', 'femenino', 'otro', 'prefiero_no_decir'];
    if (req.body.genero && !generosValidos.includes(req.body.genero)) {
      errores.push('Género debe ser uno de: masculino, femenino, otro, prefiero_no_decir');
    }

    if (errores.length > 0) {
      ManejadorRespuestas.errorValidacion(
        res,
        'Datos de validación incorrectos',
        { errores },
        'VAL_001'
      );
      return;
    }

    next();
  } catch (error) {
    ManejadorRespuestas.errorInterno(
      res,
      'Error en la validación de datos',
      'VAL_002'
    );
  }
};

// Validar datos para actualizar psicólogo
export const validarActualizarPsicologo = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const { nombres, apellidos, email, telefono, fecha_nacimiento, genero } = req.body;

    const errores: string[] = [];

    // Validar nombres si se proporciona
    if (nombres !== undefined) {
      if (typeof nombres !== 'string' || nombres.trim().length < 2) {
        errores.push('Nombres debe tener al menos 2 caracteres');
      }
    }

    // Validar apellidos si se proporciona
    if (apellidos !== undefined) {
      if (typeof apellidos !== 'string' || apellidos.trim().length < 2) {
        errores.push('Apellidos debe tener al menos 2 caracteres');
      }
    }

    // Validar email si se proporciona
    if (email !== undefined) {
      if (typeof email !== 'string') {
        errores.push('Email debe ser una cadena de texto');
      } else {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          errores.push('Formato de email inválido');
        }
      }
    }

    // Validar teléfono si se proporciona
    if (telefono !== undefined && typeof telefono !== 'string') {
      errores.push('Teléfono debe ser una cadena de texto');
    }

    // Validar fecha de nacimiento si se proporciona
    if (fecha_nacimiento !== undefined) {
      const fecha = new Date(fecha_nacimiento);
      if (isNaN(fecha.getTime())) {
        errores.push('Fecha de nacimiento inválida');
      }
    }

    // Validar género si se proporciona
    if (genero !== undefined) {
      const generosValidos = ['masculino', 'femenino', 'otro', 'prefiero_no_decir'];
      if (!generosValidos.includes(genero)) {
        errores.push('Género debe ser uno de: masculino, femenino, otro, prefiero_no_decir');
      }
    }

    if (errores.length > 0) {
      ManejadorRespuestas.errorValidacion(
        res,
        'Datos de validación incorrectos',
        { errores },
        'VAL_003'
      );
      return;
    }

    next();
  } catch (error) {
    ManejadorRespuestas.errorInterno(
      res,
      'Error en la validación de datos',
      'VAL_004'
    );
  }
};

// Validar ID de psicólogo
export const validarIdPsicologo = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const { id } = req.params;

    if (!id || typeof id !== 'string') {
      ManejadorRespuestas.errorValidacion(
        res,
        'ID de psicólogo es requerido',
        'VAL_005'
      );
      return;
    }

    // Validar formato UUID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      ManejadorRespuestas.errorValidacion(
        res,
        'Formato de ID inválido',
        'VAL_006'
      );
      return;
    }

    next();
  } catch (error) {
    ManejadorRespuestas.errorInterno(
      res,
      'Error en la validación del ID',
      'VAL_007'
    );
  }
}; 