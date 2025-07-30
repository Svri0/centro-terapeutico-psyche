// Controlador de autenticación
import { Request, Response } from 'express';
import Usuario from '../modelos/Usuario';
import JWTService from '../servicios/jwt.service';
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

    // Datos simulados para pruebas
    const usuariosSimulados = [
      {
        id: 1,
        email: 'admin@psyche.cl',
        password: 'admin123',
        nombre: 'Administrador',
        apellidos: 'Sistema',
        rol: 'admin',
        activo: true
      },
      {
        id: 2,
        email: 'juan.perez@psyche.cl',
        password: 'password123',
        nombre: 'Juan',
        apellidos: 'Pérez',
        rol: 'psicologo',
        activo: true
      },
      {
        id: 3,
        email: 'carlos.rodriguez@psyche.cl',
        password: 'password123',
        nombre: 'Carlos',
        apellidos: 'Rodríguez',
        rol: 'paciente',
        activo: true
      }
    ];

    // Buscar usuario simulado
    const usuario = usuariosSimulados.find(u => u.email === email && u.password === password);

    if (!usuario) {
      return ManejadorRespuestas.noAutorizado(res, 'Credenciales inválidas', 'AUTH_002');
    }

    // Verificar si el usuario está activo
    if (!usuario.activo) {
      return ManejadorRespuestas.prohibido(
        res,
        'Cuenta desactivada. Contacta al administrador.',
        'AUTH_003'
      );
    }

    // Generar tokens simulados
    const tokens = {
      accessToken: `token_${usuario.id}_${Date.now()}`,
      refreshToken: `refresh_${usuario.id}_${Date.now()}`,
      expiresIn: 3600
    };

    // Preparar respuesta
    const respuesta = {
      usuario: {
        id: usuario.id,
        email: usuario.email,
        nombre: usuario.nombre,
        apellidos: usuario.apellidos,
        rol: usuario.rol,
        activo: usuario.activo
      },
      tokens: {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        expiresIn: tokens.expiresIn
      }
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
    const { nombre, email, password, rol, telefono, especialidad } = req.body;

    // Validar datos requeridos
    if (!nombre || !email || !password) {
      return ManejadorRespuestas.errorValidacion(
        res,
        'Nombre, email y contraseña son requeridos',
        { camposRequeridos: ['nombre', 'email', 'password'] },
        'AUTH_007'
      );
    }

    // Verificar si el email ya existe
    const usuarioExistente = await Usuario.findOne({
      where: { email: email.toLowerCase() }
    });

    if (usuarioExistente) {
      return ManejadorRespuestas.conflicto(
        res,
        'El email ya está registrado',
        { email },
        'AUTH_008'
      );
    }

    // Crear nuevo usuario
    const nuevoUsuario = await Usuario.create({
      nombre,
      email: email.toLowerCase(),
      password,
      rol: rol || 'paciente',
      telefono,
      especialidad
    });

    // Generar tokens
    const tokens = JWTService.generarTokens({
      id: nuevoUsuario.id,
      email: nuevoUsuario.email,
      rol: nuevoUsuario.rol,
      nombre: nuevoUsuario.nombre
    });

    // Preparar respuesta
    const respuesta = {
      usuario: nuevoUsuario.toJSON(),
      tokens: {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        expiresIn: tokens.expiresIn
      }
    };

    return ManejadorRespuestas.creado(res, MENSAJES_AUTH.REGISTRO_EXITOSO, respuesta, 'AUTH_009');
  } catch (error) {
    log.error('Error en registrar:', error);
    return ManejadorRespuestas.errorInterno(
      res,
      'Error interno al procesar el registro',
      'AUTH_010'
    );
  }
};

export const cerrarSesion = async (req: Request, res: Response) => {
  try {
    // TODO: Implementar blacklist de tokens si es necesario
    // Por ahora solo devolvemos éxito

    return ManejadorRespuestas.exito(
      res,
      MENSAJES_AUTH.LOGOUT_EXITOSO,
      { timestamp: new Date().toISOString() },
      'AUTH_011'
    );
  } catch (error) {
    log.error('Error en cerrarSesion:', error);
    return ManejadorRespuestas.errorInterno(res, 'Error interno al cerrar sesión', 'AUTH_012');
  }
};

export const obtenerPerfil = async (req: Request, res: Response) => {
  try {
    if (!req.usuario) {
      return ManejadorRespuestas.noAutorizado(res, 'Usuario no autenticado', 'AUTH_013');
    }

    const usuario = await Usuario.findByPk(req.usuario.id, {
      attributes: { exclude: ['password'] }
    });

    if (!usuario) {
      return ManejadorRespuestas.noEncontrado(res, 'Usuario no encontrado', 'AUTH_014');
    }

    return ManejadorRespuestas.exito(
      res,
      'Perfil obtenido exitosamente',
      usuario.toJSON(),
      'AUTH_015'
    );
  } catch (error) {
    log.error('Error en obtenerPerfil:', error);
    return ManejadorRespuestas.errorInterno(res, 'Error interno al obtener el perfil', 'AUTH_016');
  }
};

export const actualizarPerfil = async (req: Request, res: Response) => {
  try {
    if (!req.usuario) {
      return ManejadorRespuestas.noAutorizado(res, 'Usuario no autenticado', 'AUTH_017');
    }

    const { nombre, telefono, especialidad, direccion } = req.body;

    const usuario = await Usuario.findByPk(req.usuario.id);
    if (!usuario) {
      return ManejadorRespuestas.noEncontrado(res, 'Usuario no encontrado', 'AUTH_018');
    }

    // Actualizar campos permitidos
    await usuario.update({
      nombre: nombre || usuario.nombre,
      telefono: telefono || usuario.telefono,
      especialidad: especialidad || usuario.especialidad,
      direccion: direccion || usuario.direccion
    });

    return ManejadorRespuestas.exito(
      res,
      MENSAJES_AUTH.PERFIL_ACTUALIZADO,
      usuario.toJSON(),
      'AUTH_019'
    );
  } catch (error) {
    log.error('Error en actualizarPerfil:', error);
    return ManejadorRespuestas.errorInterno(
      res,
      'Error interno al actualizar el perfil',
      'AUTH_020'
    );
  }
};

export const cambiarPassword = async (req: Request, res: Response) => {
  try {
    if (!req.usuario) {
      return ManejadorRespuestas.noAutorizado(res, 'Usuario no autenticado', 'AUTH_021');
    }

    const { passwordActual, passwordNuevo } = req.body;

    // Validar datos requeridos
    if (!passwordActual || !passwordNuevo) {
      return ManejadorRespuestas.errorValidacion(
        res,
        'Contraseña actual y nueva contraseña son requeridas',
        { camposRequeridos: ['passwordActual', 'passwordNuevo'] },
        'AUTH_022'
      );
    }

    const usuario = await Usuario.findByPk(req.usuario.id);
    if (!usuario) {
      return ManejadorRespuestas.noEncontrado(res, 'Usuario no encontrado', 'AUTH_023');
    }

    // Verificar contraseña actual
    const passwordValida = await usuario.compararPassword(passwordActual);
    if (!passwordValida) {
      return ManejadorRespuestas.noAutorizado(res, 'Contraseña actual incorrecta', 'AUTH_024');
    }

    // Actualizar contraseña
    usuario.password = passwordNuevo;
    await usuario.save();

    return ManejadorRespuestas.exito(
      res,
      MENSAJES_AUTH.CAMBIO_PASSWORD_EXITOSO,
      { fechaCambio: new Date().toISOString() },
      'AUTH_025'
    );
  } catch (error) {
    log.error('Error en cambiarPassword:', error);
    return ManejadorRespuestas.errorInterno(
      res,
      'Error interno al cambiar la contraseña',
      'AUTH_026'
    );
  }
};

export const refrescarToken = async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return ManejadorRespuestas.errorValidacion(
        res,
        'Refresh token es requerido',
        { camposRequeridos: ['refreshToken'] },
        'AUTH_027'
      );
    }

    // Verificar refresh token
    const decoded = JWTService.verificarRefreshToken(refreshToken);

    // Buscar usuario
    const usuario = await Usuario.findByPk(decoded.id);
    if (!usuario || !usuario.activo) {
      return ManejadorRespuestas.noAutorizado(res, 'Usuario no encontrado o inactivo', 'AUTH_028');
    }

    // Generar nuevos tokens
    const tokens = JWTService.generarTokens({
      id: usuario.id,
      email: usuario.email,
      rol: usuario.rol,
      nombre: usuario.nombre
    });

    return ManejadorRespuestas.exito(
      res,
      'Token refrescado exitosamente',
      {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        expiresIn: tokens.expiresIn
      },
      'AUTH_029'
    );
  } catch (error) {
    log.error('Error en refrescarToken:', error);
    return ManejadorRespuestas.noAutorizado(res, 'Refresh token inválido o expirado', 'AUTH_030');
  }
};
