// Controlador de autenticación
import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { QueryTypes } from 'sequelize';
import sequelize from '../configuracion/database';
import { log } from '../utilidades/logger';
import { MENSAJES_AUTH } from '../utilidades/mensajes';
import { ManejadorRespuestas } from '../utilidades/respuestas';
import { AuditoriaService } from '../utilidades/auditoria.service';
import { enviarEmailRecuperacionPassword } from '../utilidades/email.service';
import { v4 as uuidv4 } from 'uuid';

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
    // Intentar con JOIN primero, si falla intentar sin JOIN
    let usuarios: any[] = [];
    try {
      usuarios = await sequelize.query(
        `SELECT u.id, u.nombres, u.apellidos, u.email, u.telefono, u.especialidad, u.descripcion, u.avatar_url, u.password_hash, u.activo, u.rol_id, r.nombre as rol_nombre
         FROM usuarios u
         INNER JOIN roles r ON u.rol_id = r.id
         WHERE u.email = :email AND u.deleted_at IS NULL`,
        {
          replacements: { email },
          type: QueryTypes.SELECT
        }
      ) as any[];
    } catch (joinError: any) {
      // Si falla el JOIN (tabla roles no existe), intentar sin JOIN
      log.warn('Error en JOIN con roles, intentando sin JOIN:', joinError?.message);
      try {
        usuarios = await sequelize.query(
          `SELECT u.id, u.nombres, u.apellidos, u.email, u.telefono, u.especialidad, u.descripcion, u.avatar_url, u.password_hash, u.activo, u.rol_id, 'psicologo' as rol_nombre
           FROM usuarios u
           WHERE u.email = :email AND u.deleted_at IS NULL`,
          {
            replacements: { email },
            type: QueryTypes.SELECT
          }
        ) as any[];
      } catch (queryError: any) {
        log.error('Error en consulta de usuarios:', queryError);
        throw queryError;
      }
    }

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

    // Generar token JWT con configuración segura (sin lastActivity para tokens nuevos)
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

    // Registrar log de auditoría para login exitoso (no crítico, no debe romper el flujo)
    try {
      await AuditoriaService.crearLog({
        usuario_id: usuario.id,
        accion: 'LOGIN',
        metadatos: {
          email: usuario.email,
          rol: usuario.rol_nombre,
          nombres: usuario.nombres,
          apellidos: usuario.apellidos
        },
        req
      });
    } catch (auditError) {
      // Log del error pero no interrumpir el flujo
      log.warn('Error al registrar log de auditoría (no crítico):', auditError);
    }

    const respuesta = {
      usuario: {
        id: usuario.id,
        nombres: usuario.nombres,
        apellidos: usuario.apellidos,
        email: usuario.email,
        telefono: usuario.telefono,
        especialidad: usuario.especialidad,
        descripcion: usuario.descripcion,
        avatar_url: usuario.avatar_url,
        rol: usuario.rol_nombre,
        rol_id: usuario.rol_id
      },
      token,
      expira_en: '24 horas',
      tipo_token: 'Bearer'
    };

    return ManejadorRespuestas.exito(res, MENSAJES_AUTH.LOGIN_EXITOSO, respuesta, 'AUTH_005');

  } catch (error: any) {
    // Log detallado del error
    log.error('Error en iniciarSesion:', error);
    console.error('❌ ========== ERROR EN LOGIN ==========');
    console.error('❌ Mensaje:', error?.message);
    console.error('❌ Código:', error?.code || error?.original?.code);
    console.error('❌ Stack:', error?.stack);
    if (error?.original) {
      console.error('❌ Error original:', error.original);
      console.error('❌ Código original:', error.original.code);
      console.error('❌ Mensaje original:', error.original.message);
    }
    console.error('❌ ====================================');
    
    // Mensaje más específico según el tipo de error
    let mensajeError = 'Error interno del servidor. Por favor, intenta nuevamente.';
    
    // Errores de conexión
    if (error?.message?.includes('ECONNREFUSED') || 
        error?.message?.includes('connection') ||
        error?.original?.code === 'ECONNREFUSED') {
      mensajeError = 'Error de conexión con la base de datos. Verifica que PostgreSQL esté corriendo.';
    } 
    // Errores de autenticación PostgreSQL
    else if (error?.message?.includes('password') || 
             error?.original?.code === '28P01' ||
             error?.code === '28P01') {
      mensajeError = 'Error de autenticación con la base de datos. Verifica las credenciales en el archivo .env.';
    } 
    // Errores de tablas/estructura
    else if (error?.message?.includes('relation') || 
             error?.message?.includes('table') ||
             error?.message?.includes('does not exist')) {
      mensajeError = 'Error en la estructura de la base de datos. Ejecuta: npm run db:migrate';
    }
    // Errores de sintaxis SQL
    else if (error?.message?.includes('syntax') || 
             error?.message?.includes('SQL')) {
      mensajeError = 'Error en la consulta a la base de datos. Contacta al administrador.';
    }
    
    return ManejadorRespuestas.errorInterno(
      res,
      mensajeError,
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
export const cerrarSesion = async (req: Request, res: Response) => {
  try {
    // Obtener información del usuario autenticado si está disponible
    const usuario = (req as any).usuario;
    
    if (usuario) {
      // Registrar log de auditoría para logout
      await AuditoriaService.crearLog({
        usuario_id: usuario.id,
        accion: 'LOGOUT',
        metadatos: {
          email: usuario.email,
          nombres: usuario.nombres,
          apellidos: usuario.apellidos
        },
        req
      });
      
      log.info(`Logout exitoso para usuario: ${usuario.nombres} ${usuario.apellidos}`);
    }
    
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
    const usuarioAutenticado = (req as any).usuario;

    if (!usuarioAutenticado) {
      return ManejadorRespuestas.noAutorizado(
        res,
        'Usuario no autenticado',
        'AUTH_012'
      );
    }

    // Obtener usuario completo de la base de datos
    const usuarios = await sequelize.query(
      `SELECT u.id, u.nombres, u.apellidos, u.email, u.telefono, u.especialidad, u.descripcion, u.avatar_url, u.rol_id, r.nombre as rol
       FROM usuarios u
       INNER JOIN roles r ON u.rol_id = r.id
       WHERE u.id = :id AND u.deleted_at IS NULL`,
      {
        replacements: { id: usuarioAutenticado.id },
        type: QueryTypes.SELECT
      }
    ) as any[];

    if (!Array.isArray(usuarios) || usuarios.length === 0) {
      return ManejadorRespuestas.noEncontrado(
        res,
        'Usuario no encontrado',
        'AUTH_013'
      );
    }

    const usuario = usuarios[0];

    return ManejadorRespuestas.exito(
      res,
      'Perfil obtenido exitosamente',
      { usuario },
      'AUTH_014'
    );

  } catch (error) {
    log.error('Error en obtenerPerfil:', error);
    return ManejadorRespuestas.errorInterno(
      res,
      'Error interno del servidor',
      'AUTH_015'
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

// Controlador para actualizar actividad de sesión
export const actualizarActividadSesion = async (req: Request, res: Response): Promise<void> => {
  try {
    const usuarioId = req.usuario?.id;
    
    if (!usuarioId || !req.usuario) {
      ManejadorRespuestas.noAutorizado(
        res,
        'Usuario no autenticado',
        'AUTH_023'
      );
      return;
    }

    // Generar nuevo token con timestamp actualizado
    const secret = process.env.JWT_SECRET || 'tu_secreto_super_seguro_para_jwt_tokens_2024';
    const nuevoToken = jwt.sign(
      {
        id: req.usuario.id,
        email: req.usuario.email,
        rol_id: req.usuario.rol_id,
        nombres: req.usuario.nombres,
        apellidos: req.usuario.apellidos,
        lastActivity: Date.now(), // Actualizar timestamp de actividad
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

    ManejadorRespuestas.exito(
      res,
      'Actividad de sesión actualizada',
      { token: nuevoToken },
      'AUTH_024'
    );
  } catch (error) {
    log.error('Error en actualizarActividadSesion:', error);
    ManejadorRespuestas.errorInterno(
      res,
      'Error al actualizar actividad de sesión',
      'AUTH_025'
    );
  }
};

// Controlador para solicitar recuperación de contraseña
export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return ManejadorRespuestas.errorValidacion(
        res,
        'El email es requerido',
        { camposRequeridos: ['email'] },
        'AUTH_026'
      );
    }

    // Buscar usuario por email
    const usuarios = await sequelize.query(
      'SELECT id, nombres, apellidos, email FROM usuarios WHERE email = :email AND deleted_at IS NULL AND activo = true',
      {
        replacements: { email },
        type: QueryTypes.SELECT
      }
    ) as any[];

    // Por seguridad, siempre devolvemos éxito aunque el email no exista
    // Esto previene que atacantes descubran qué emails están registrados
    if (!Array.isArray(usuarios) || usuarios.length === 0) {
      log.warn(`Intento de recuperación de contraseña para email no registrado: ${email.substring(0, 3)}***@${email.split('@')[1]}`);
      return ManejadorRespuestas.exito(
        res,
        'Si el email está registrado, recibirás un enlace de recuperación',
        null,
        'AUTH_027'
      );
    }

    const usuario = usuarios[0];

    // Generar token de recuperación
    const tokenRecuperacion = uuidv4();
    const tokenExpira = new Date();
    tokenExpira.setHours(tokenExpira.getHours() + 1); // Expira en 1 hora

    // Guardar token en la base de datos
    await sequelize.query(
      'UPDATE usuarios SET token_activacion = :token, token_activacion_expira = :expira, updated_at = NOW() WHERE id = :id',
      {
        replacements: {
          token: tokenRecuperacion,
          expira: tokenExpira,
          id: usuario.id
        }
      }
    );

    // Enviar email de recuperación
    const nombreCompleto = `${usuario.nombres} ${usuario.apellidos}`;
    const emailEnviado = await enviarEmailRecuperacionPassword(
      usuario.email,
      nombreCompleto,
      tokenRecuperacion
    );

    if (emailEnviado) {
      log.info(`Email de recuperación de contraseña enviado a: ${usuario.email}`);
    } else {
      log.warn(`No se pudo enviar el email de recuperación a: ${usuario.email}`);
    }

    return ManejadorRespuestas.exito(
      res,
      'Si el email está registrado, recibirás un enlace de recuperación',
      null,
      'AUTH_028'
    );

  } catch (error) {
    log.error('Error en forgotPassword:', error);
    return ManejadorRespuestas.errorInterno(
      res,
      'Error interno del servidor',
      'AUTH_029'
    );
  }
};

// Controlador para resetear contraseña con token
export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return ManejadorRespuestas.errorValidacion(
        res,
        'Token y nueva contraseña son requeridos',
        { camposRequeridos: ['token', 'newPassword'] },
        'AUTH_030'
      );
    }

    // Validar longitud mínima de contraseña
    if (newPassword.length < 6) {
      return ManejadorRespuestas.errorValidacion(
        res,
        'La contraseña debe tener al menos 6 caracteres',
        { minLength: 6 },
        'AUTH_031'
      );
    }

    // Buscar usuario por token
    const usuarios = await sequelize.query(
      'SELECT id, email, token_activacion, token_activacion_expira FROM usuarios WHERE token_activacion = :token AND deleted_at IS NULL',
      {
        replacements: { token },
        type: QueryTypes.SELECT
      }
    ) as any[];

    if (!Array.isArray(usuarios) || usuarios.length === 0) {
      return ManejadorRespuestas.noAutorizado(
        res,
        'Token inválido o expirado',
        'AUTH_032'
      );
    }

    const usuario = usuarios[0];

    // Verificar que el token no haya expirado
    if (!usuario.token_activacion_expira) {
      return ManejadorRespuestas.noAutorizado(
        res,
        'Token inválido o expirado',
        'AUTH_033'
      );
    }

    const fechaExpiracion = new Date(usuario.token_activacion_expira);
    const ahora = new Date();

    if (ahora > fechaExpiracion) {
      return ManejadorRespuestas.noAutorizado(
        res,
        'Token expirado. Por favor, solicita un nuevo enlace de recuperación',
        'AUTH_034'
      );
    }

    // Hash de la nueva contraseña
    const saltRounds = 12;
    const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

    // Actualizar contraseña y limpiar token
    await sequelize.query(
      'UPDATE usuarios SET password_hash = :password_hash, token_activacion = NULL, token_activacion_expira = NULL, updated_at = NOW() WHERE id = :id',
      {
        replacements: {
          password_hash: newPasswordHash,
          id: usuario.id
        }
      }
    );

    log.info(`Contraseña restablecida exitosamente para usuario: ${usuario.email}`);

    return ManejadorRespuestas.exito(
      res,
      'Contraseña restablecida exitosamente',
      null,
      'AUTH_035'
    );

  } catch (error) {
    log.error('Error en resetPassword:', error);
    return ManejadorRespuestas.errorInterno(
      res,
      'Error interno del servidor',
      'AUTH_036'
    );
  }
};


