// Controlador de autenticación
import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import sequelize from '../configuracion/database';
import { log } from '../utilidades/logger';
import { MENSAJES_AUTH } from '../utilidades/mensajes';
import { ManejadorRespuestas } from '../utilidades/respuestas';

// Controlador para iniciar sesión
export const iniciarSesion = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Validar datos requeridos
    if (!email || !password) {
      return ManejadorRespuestas.errorValidacion(
        res,
        'Email y contraseña son requeridos',
        { camposRequeridos: ['email', 'password'] },
        'AUTH_001'
      );
    }

    // Buscar usuario en la base de datos
    const [usuarios] = await sequelize.query(
      `SELECT u.id, u.nombres, u.apellidos, u.email, u.password_hash, u.activo, u.rol_id, r.nombre as rol_nombre
       FROM usuarios u
       INNER JOIN roles r ON u.rol_id = r.id
       WHERE u.email = :email`,
      {
        replacements: { email }
      }
    );

    if (!Array.isArray(usuarios) || usuarios.length === 0) {
      return ManejadorRespuestas.noAutorizado(
        res,
        'Credenciales inválidas',
        'AUTH_002'
      );
    }

    const usuario = usuarios[0] as any;

    // Verificar que el usuario esté activo
    if (!usuario.activo) {
      return ManejadorRespuestas.prohibido(
        res,
        'Cuenta desactivada. Contacta al administrador.',
        'AUTH_003'
      );
    }

    // Verificar contraseña
    const passwordValida = await bcrypt.compare(password, usuario.password_hash);
    if (!passwordValida) {
      return ManejadorRespuestas.noAutorizado(
        res,
        'Credenciales inválidas',
        'AUTH_004'
      );
    }

    // Generar token JWT
    const secret = 'tu_secreto_super_seguro_para_jwt_tokens_2024';
    const token = jwt.sign(
      {
        id: usuario.id,
        email: usuario.email,
        rol_id: usuario.rol_id,
        nombres: usuario.nombres,
        apellidos: usuario.apellidos
      },
      secret,
      { expiresIn: '24h' }
    );

    // Actualizar último acceso
    await sequelize.query(
      'UPDATE usuarios SET ultimo_acceso = NOW() WHERE id = :id',
      {
        replacements: { id: usuario.id }
      }
    );

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
      expira_en: '24 horas'
    };

    return ManejadorRespuestas.exito(res, MENSAJES_AUTH.LOGIN_EXITOSO, respuesta, 'AUTH_005');
  } catch (error) {
    log.error('Error en iniciarSesion:', error);
    return ManejadorRespuestas.errorInterno(
      res,
      'Error interno al procesar el inicio de sesión',
      'AUTH_006'
    );
  }
};

export const registrar = async (req: Request, res: Response) => {
  try {
    const { nombre, email, password, rol } = req.body;

    // Validar datos requeridos
    if (!nombre || !email || !password) {
      return ManejadorRespuestas.errorValidacion(
        res,
        'Nombre, email y contraseña son requeridos',
        { camposRequeridos: ['nombre', 'email', 'password'] },
        'AUTH_004'
      );
    }

    // TODO: Implementar lógica de registro real
    // Por ahora simular registro exitoso
    const nuevoUsuario = {
      id: 2,
      nombre,
      email,
      rol: rol || 'paciente',
      fechaCreacion: new Date().toISOString()
    };

    return ManejadorRespuestas.creado(
      res,
      MENSAJES_AUTH.REGISTRO_EXITOSO,
      nuevoUsuario,
      'AUTH_005'
    );
  } catch (error) {
    log.error('Error en registrar:', error);
    return ManejadorRespuestas.errorInterno(
      res,
      'Error interno al procesar el registro',
      'AUTH_006'
    );
  }
};

export const cerrarSesion = async (_req: Request, res: Response) => {
  try {
    // TODO: Implementar lógica de cierre de sesión (invalidar token, etc.)

    return ManejadorRespuestas.exito(
      res,
      MENSAJES_AUTH.LOGOUT_EXITOSO,
      { timestamp: new Date().toISOString() },
      'AUTH_007'
    );
  } catch (error) {
    log.error('Error en cerrarSesion:', error);
    return ManejadorRespuestas.errorInterno(res, 'Error interno al cerrar sesión', 'AUTH_008');
  }
};

export const obtenerPerfil = async (_req: Request, res: Response) => {
  try {
    // TODO: Implementar obtención de perfil real desde la base de datos
    const perfilSimulado = {
      id: 1,
      nombre: 'Dr. Juan Pérez',
      email: 'juan.perez@psyche.cl',
      rol: 'psicologo',
      especialidad: 'Psicología Clínica',
      añosExperiencia: 5,
      pacientesAsignados: 12,
      fechaUltimoAcceso: new Date().toISOString()
    };

    return ManejadorRespuestas.exito(
      res,
      'Perfil obtenido exitosamente',
      perfilSimulado,
      'AUTH_009'
    );
  } catch (error) {
    log.error('Error en obtenerPerfil:', error);
    return ManejadorRespuestas.errorInterno(res, 'Error interno al obtener el perfil', 'AUTH_010');
  }
};

export const actualizarPerfil = async (req: Request, res: Response) => {
  try {
    const { nombre, telefono, especialidad } = req.body;

    // TODO: Implementar actualización real del perfil
    const perfilActualizado = {
      id: 1,
      nombre: nombre || 'Dr. Juan Pérez',
      telefono: telefono || '+56912345678',
      especialidad: especialidad || 'Psicología Clínica',
      fechaActualizacion: new Date().toISOString()
    };

    return ManejadorRespuestas.exito(
      res,
      MENSAJES_AUTH.PERFIL_ACTUALIZADO,
      perfilActualizado,
      'AUTH_011'
    );
  } catch (error) {
    log.error('Error en actualizarPerfil:', error);
    return ManejadorRespuestas.errorInterno(
      res,
      'Error interno al actualizar el perfil',
      'AUTH_012'
    );
  }
};

export const cambiarPassword = async (req: Request, res: Response) => {
  try {
    const { contraseña_actual, nueva_contraseña } = req.body;
    const userId = req.usuario?.id;

    log.info(`🔍 cambiarPassword - req.usuario:`, req.usuario);
    log.info(`🔍 cambiarPassword - userId: ${userId}`);

    if (!userId) {
      return ManejadorRespuestas.noAutorizado(
        res,
        'Usuario no autenticado',
        'AUTH_108'
      );
    }

    if (!contraseña_actual || !nueva_contraseña) {
      return ManejadorRespuestas.errorValidacion(
        res,
        'Contraseña actual y nueva contraseña son requeridas',
        null,
        'AUTH_109'
      );
    }

    if (nueva_contraseña.length < 8) {
      return ManejadorRespuestas.errorValidacion(
        res,
        'La nueva contraseña debe tener al menos 8 caracteres',
        null,
        'AUTH_110'
      );
    }

    // Obtener usuario actual
    const [usuarios] = await sequelize.query(
      'SELECT password_hash FROM usuarios WHERE id = :userId',
      {
        replacements: { userId }
      }
    );

    if (!Array.isArray(usuarios) || usuarios.length === 0) {
      return ManejadorRespuestas.noEncontrado(
        res,
        'Usuario no encontrado',
        'AUTH_111'
      );
    }

    const usuario = usuarios[0] as any;
    log.info(`🔍 Usuario encontrado: ${userId}, password_hash: ${usuario.password_hash ? 'EXISTE' : 'NO EXISTE'}`);

    // Verificar contraseña actual
    const contraseñaValida = await bcrypt.compare(contraseña_actual, usuario.password_hash);
    log.info(`🔍 Contraseña actual válida: ${contraseñaValida}`);
    
    if (!contraseñaValida) {
      return ManejadorRespuestas.noAutorizado(
        res,
        'Contraseña actual incorrecta',
        'AUTH_112'
      );
    }

    // Hashear nueva contraseña
    const saltRounds = 12;
    const nuevaContraseñaHash = await bcrypt.hash(nueva_contraseña, saltRounds);
    log.info(`🔍 Nueva contraseña hasheada: ${nuevaContraseñaHash.substring(0, 20)}...`);

    // Actualizar contraseña
    const [resultado] = await sequelize.query(
      'UPDATE usuarios SET password_hash = :passwordHash, updated_at = NOW() WHERE id = :userId',
      {
        replacements: { 
          passwordHash: nuevaContraseñaHash,
          userId 
        }
      }
    );

    log.info(`🔍 Resultado de actualización: ${JSON.stringify(resultado)}`);
    log.info(`🔍 Contraseña cambiada para usuario: ${userId}`);

    return ManejadorRespuestas.exito(
      res,
      'Contraseña cambiada exitosamente',
      { mensaje: 'Contraseña actualizada correctamente' },
      'AUTH_113'
    );

  } catch (error) {
    log.error('Error en cambiarPassword:', error);
    return ManejadorRespuestas.errorInterno(
      res,
      'Error al cambiar la contraseña',
      'AUTH_114'
    );
  }
};


