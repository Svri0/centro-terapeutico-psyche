// Controlador de autenticación
import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { QueryTypes } from 'sequelize';
import sequelize from '../configuracion/database';
import { log } from '../utilidades/logger';
import { MENSAJES_AUTH } from '../utilidades/mensajes';
import { ManejadorRespuestas } from '../utilidades/respuestas';

// Controlador para iniciar sesión
export const iniciarSesion = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Validar datos requeridos (ya validado por middleware)
    if (!email || !password) {
      return ManejadorRespuestas.errorValidacion(
        res,
        'Email y contraseña son requeridos',
        { camposRequeridos: ['email', 'password'] },
        'AUTH_001'
      );
    }

    // Log de intento de login (sin datos sensibles)
    log.info(`Intento de login para email: ${email.substring(0, 3)}***@${email.split('@')[1]}`);

    // Buscar usuario en la base de datos usando parámetros preparados
    const usuarios = await sequelize.query(
      `SELECT u.id, u.nombres, u.apellidos, u.email, u.password_hash, u.activo, u.rol_id, r.nombre as rol_nombre
       FROM usuarios u
       INNER JOIN roles r ON u.rol_id = r.id
       WHERE u.email = :email AND u.deleted_at IS NULL`,
      {
        replacements: { email },
        type: QueryTypes.SELECT
      }
    ) as any[];

    if (!Array.isArray(usuarios) || usuarios.length === 0) {
      // Log de intento fallido
      log.warn(`Login fallido - usuario no encontrado: ${email.substring(0, 3)}***@${email.split('@')[1]}`);
      
      return ManejadorRespuestas.noAutorizado(
        res,
        'Credenciales incorrectas. Verifica tu email y contraseña.',
        'AUTH_002'
      );
    }

    const usuario = usuarios[0] as any;

    // Verificar que el usuario esté activo
    if (!usuario.activo) {
      log.warn(`Intento de login para cuenta inactiva: ${email.substring(0, 3)}***@${email.split('@')[1]}`);
      
      return ManejadorRespuestas.prohibido(
        res,
        'Tu cuenta está desactivada. Contacta al administrador para reactivarla.',
        'AUTH_003'
      );
    }

    // Verificar contraseña con timing constante para prevenir timing attacks
    const passwordValida = await bcrypt.compare(password, usuario.password_hash);
    if (!passwordValida) {
      log.warn(`Login fallido - contraseña incorrecta para: ${email.substring(0, 3)}***@${email.split('@')[1]}`);
      
      return ManejadorRespuestas.noAutorizado(
        res,
        'Credenciales incorrectas. Verifica tu email y contraseña.',
        'AUTH_004'
      );
    }

    // Generar token JWT con configuración segura
    const secret = process.env.JWT_SECRET || 'tu_secreto_super_seguro_para_jwt_tokens_2024';
    console.log('🔍 JWT_SECRET usado:', secret);
    const token = jwt.sign(
      {
        id: usuario.id,
        email: usuario.email,
        rol_id: usuario.rol_id,
        nombres: usuario.nombres,
        apellidos: usuario.apellidos,
        iat: Math.floor(Date.now() / 1000)
      },
      secret,
      { 
        expiresIn: '24h',
        algorithm: 'HS256',
        issuer: 'psyche-api',
        audience: 'psyche-client'
      }
    );

    // Actualizar último acceso usando parámetros preparados
    await sequelize.query(
      'UPDATE usuarios SET ultimo_acceso = NOW(), updated_at = NOW() WHERE id = :id',
      {
        replacements: { id: usuario.id }
      }
    );

    // Log de login exitoso
    log.info(`Login exitoso para usuario: ${usuario.nombres} ${usuario.apellidos} (${usuario.rol_nombre})`);

    const respuesta = {
      usuario: {
        id: usuario.id,
        nombres: usuario.nombres,
        apellidos: usuario.apellidos,
        email: usuario.email,
        rol: usuario.rol_nombre,
        rol_id: usuario.rol_id
      },
      token,
      expira_en: '24 horas',
      tipo_token: 'Bearer'
    };

    return ManejadorRespuestas.exito(res, MENSAJES_AUTH.LOGIN_EXITOSO, respuesta, 'AUTH_005');

  } catch (error) {
    log.error('Error en iniciarSesion:', error);
    return ManejadorRespuestas.errorInterno(
      res,
      'Error interno del servidor',
      'AUTH_006'
    );
  }
};

// Controlador para registrar nuevo usuario
export const registrar = async (req: Request, res: Response) => {
  try {
    const { nombres, apellidos, email, password, telefono } = req.body;

    // Verificar si el email ya existe
    const usuariosExistentes = await sequelize.query(
      'SELECT id FROM usuarios WHERE email = :email AND deleted_at IS NULL',
      {
        replacements: { email },
        type: QueryTypes.SELECT
      }
    ) as any[];

    if (Array.isArray(usuariosExistentes) && usuariosExistentes.length > 0) {
      return ManejadorRespuestas.conflicto(
        res,
        'El email ya está registrado',
        'AUTH_007'
      );
    }

    // Hash de la contraseña con salt seguro
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Insertar nuevo usuario usando parámetros preparados
    const resultado = await sequelize.query(
      `INSERT INTO usuarios (id, nombres, apellidos, email, password_hash, telefono, rol_id, activo, email_verificado, created_at, updated_at)
       VALUES (gen_random_uuid(), :nombres, :apellidos, :email, :password_hash, :telefono, 3, true, false, NOW(), NOW())
       RETURNING id`,
      {
        replacements: { nombres, apellidos, email, password_hash: passwordHash, telefono },
        type: QueryTypes.INSERT
      }
    );

    log.info(`Nuevo usuario registrado: ${nombres} ${apellidos} (${email})`);

    return ManejadorRespuestas.exito(
      res,
      'Usuario registrado exitosamente',
      { id: resultado },
      'AUTH_008'
    );

  } catch (error) {
    log.error('Error en registrar:', error);
    return ManejadorRespuestas.errorInterno(
      res,
      'Error interno del servidor',
      'AUTH_009'
    );
  }
};

// Controlador para cerrar sesión
export const cerrarSesion = async (_req: Request, res: Response) => {
  try {
    // En una implementación real, aquí invalidarías el token
    // Por ahora, solo retornamos éxito
    return ManejadorRespuestas.exito(
      res,
      'Sesión cerrada exitosamente',
      null,
      'AUTH_010'
    );
  } catch (error) {
    log.error('Error en cerrarSesion:', error);
    return ManejadorRespuestas.errorInterno(
      res,
      'Error interno del servidor',
      'AUTH_011'
    );
  }
};

// Controlador para obtener perfil del usuario
export const obtenerPerfil = async (req: Request, res: Response) => {
  try {
    // El usuario ya está autenticado por el middleware de auth
    const usuario = (req as any).usuario;

    if (!usuario) {
      return ManejadorRespuestas.noAutorizado(
        res,
        'Usuario no autenticado',
        'AUTH_012'
      );
    }

    return ManejadorRespuestas.exito(
      res,
      'Perfil obtenido exitosamente',
      { usuario },
      'AUTH_013'
    );

  } catch (error) {
    log.error('Error en obtenerPerfil:', error);
    return ManejadorRespuestas.errorInterno(
      res,
      'Error interno del servidor',
      'AUTH_014'
    );
  }
};

// Controlador para actualizar perfil
export const actualizarPerfil = async (req: Request, res: Response) => {
  try {
    const { nombres, apellidos, telefono } = req.body;
    const usuario = (req as any).usuario;

    if (!usuario) {
      return ManejadorRespuestas.noAutorizado(
        res,
        'Usuario no autenticado',
        'AUTH_015'
      );
    }

    // Actualizar perfil usando parámetros preparados
    await sequelize.query(
      `UPDATE usuarios 
       SET nombres = :nombres, apellidos = :apellidos, telefono = :telefono, updated_at = NOW()
       WHERE id = :id`,
      {
        replacements: { nombres, apellidos, telefono, id: usuario.id }
      }
    );

    log.info(`Perfil actualizado para usuario: ${usuario.email}`);

    return ManejadorRespuestas.exito(
      res,
      'Perfil actualizado exitosamente',
      null,
      'AUTH_016'
    );

  } catch (error) {
    log.error('Error en actualizarPerfil:', error);
    return ManejadorRespuestas.errorInterno(
      res,
      'Error interno del servidor',
      'AUTH_017'
    );
  }
};

// Controlador para cambiar contraseña
export const cambiarPassword = async (req: Request, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const usuario = (req as any).usuario;

    if (!usuario) {
      return ManejadorRespuestas.noAutorizado(
        res,
        'Usuario no autenticado',
        'AUTH_018'
      );
    }

    // Obtener hash actual de la contraseña
    const usuarios = await sequelize.query(
      'SELECT password_hash FROM usuarios WHERE id = :id',
      {
        replacements: { id: usuario.id },
        type: QueryTypes.SELECT
      }
    ) as any[];

    if (!Array.isArray(usuarios) || usuarios.length === 0) {
      return ManejadorRespuestas.noEncontrado(
        res,
        'Usuario no encontrado',
        'AUTH_019'
      );
    }

    const usuarioDB = usuarios[0] as any;

    // Verificar contraseña actual
    const passwordActualValida = await bcrypt.compare(currentPassword, usuarioDB.password_hash);
    if (!passwordActualValida) {
      return ManejadorRespuestas.noAutorizado(
        res,
        'Contraseña actual incorrecta',
        'AUTH_020'
      );
    }

    // Hash de la nueva contraseña
    const saltRounds = 12;
    const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

    // Actualizar contraseña
    await sequelize.query(
      'UPDATE usuarios SET password_hash = :password_hash, updated_at = NOW() WHERE id = :id',
      {
        replacements: { password_hash: newPasswordHash, id: usuario.id }
      }
    );

    log.info(`Contraseña cambiada para usuario: ${usuario.email}`);

    return ManejadorRespuestas.exito(
      res,
      'Contraseña cambiada exitosamente',
      null,
      'AUTH_021'
    );

  } catch (error) {
    log.error('Error en cambiarPassword:', error);
    return ManejadorRespuestas.errorInterno(
      res,
      'Error interno del servidor',
      'AUTH_022'
    );
  }
};


