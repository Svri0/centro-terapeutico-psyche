// Ejemplos de uso del sistema de mensajes personalizados
// Centro Terapéutico Psyche

import { Request, Response } from 'express';
import { formatearMensaje, MENSAJES_GAMIFICACION, obtenerMensaje } from './mensajes';
import { ManejadorRespuestas } from './respuestas';

/**
 * EJEMPLO 1: Respuesta exitosa básica
 */
export const ejemploRespuestaExitosa = (req: Request, res: Response) => {
  const datos = {
    usuario: 'María González',
    puntos: 150
  };

  return ManejadorRespuestas.exito(res, 'Operación completada exitosamente', datos, 'EJ_001');
};

/**
 * EJEMPLO 2: Mensaje de gamificación con variables dinámicas
 */
export const ejemploGamificacion = (req: Request, res: Response) => {
  const puntos = 50;
  const nivel = 3;

  // Usar formatearMensaje para mensajes con variables
  const mensajePuntos = formatearMensaje(MENSAJES_GAMIFICACION.PUNTOS_OTORGADOS, { puntos });

  const mensajeNivel = formatearMensaje(MENSAJES_GAMIFICACION.NIVEL_ALCANZADO, { nivel });

  return ManejadorRespuestas.exito(
    res,
    mensajePuntos,
    {
      puntosGanados: puntos,
      nivelActual: nivel,
      mensajeAdicional: mensajeNivel
    },
    'GAM_001'
  );
};

/**
 * EJEMPLO 3: Usar obtenerMensaje con categorías
 */
export const ejemploCategoriaMensajes = (req: Request, res: Response) => {
  // Obtener mensaje desde categoría específica
  const mensajeTarea = obtenerMensaje('tareas', 'TAREA_COMPLETADA');
  const mensajeAuth = obtenerMensaje('auth', 'LOGIN_EXITOSO');

  return ManejadorRespuestas.exito(
    res,
    mensajeTarea,
    {
      ejemploAuth: mensajeAuth,
      categoria: 'tareas',
      tipo: 'TAREA_COMPLETADA'
    },
    'CAT_001'
  );
};

/**
 * EJEMPLO 4: Manejo de errores con códigos específicos
 */
export const ejemploManejoErrores = (req: Request, res: Response) => {
  const { tipo } = req.params;

  switch (tipo) {
    case 'validacion':
      return ManejadorRespuestas.errorValidacion(
        res,
        'Los datos proporcionados no son válidos',
        {
          errores: ['Email requerido', 'Contraseña muy corta'],
          camposAfectados: ['email', 'password']
        },
        'VAL_002'
      );

    case 'noautorizado':
      return ManejadorRespuestas.noAutorizado(
        res,
        'No tienes permisos para acceder a este recurso',
        'AUTH_401'
      );

    case 'noEncontrado':
      return ManejadorRespuestas.noEncontrado(
        res,
        'El paciente solicitado no fue encontrado',
        'PAC_404'
      );

    case 'conflicto':
      return ManejadorRespuestas.conflicto(
        res,
        'Ya exists un usuario con este email',
        { emailConflicto: 'usuario@email.com' },
        'USR_409'
      );

    default:
      return ManejadorRespuestas.errorInterno(res, 'Error interno del servidor', 'SYS_500');
  }
};

/**
 * EJEMPLO 5: Respuesta personalizada con estado específico
 */
export const ejemploRespuestaPersonalizada = (req: Request, res: Response) => {
  const { statusCode } = req.params;
  const codigo = parseInt(statusCode || '200') || 200;

  return ManejadorRespuestas.personalizado(
    res,
    codigo,
    `Respuesta personalizada con código ${codigo}`,
    {
      codigoPersonalizado: codigo,
      timestamp: new Date().toISOString(),
      ejemplo: true
    },
    codigo < 400, // success = true si código < 400
    `CUSTOM_${codigo}`
  );
};

/**
 * EJEMPLO 6: Mensaje dinámico basado en contexto de usuario
 */
export const ejemploMensajeDinamico = (req: Request, res: Response) => {
  const { rol, accion } = req.query;

  let mensaje = '';
  let codigo = '';

  // Personalizar mensaje según el rol del usuario
  switch (rol as string) {
    case 'psicologo':
      mensaje =
        accion === 'crear'
          ? '¡Paciente registrado exitosamente! Puedes comenzar a asignar tareas'
          : '¡Sesión completada! El progreso del paciente ha sido actualizado';
      codigo = 'PSI_001';
      break;

    case 'paciente':
      mensaje =
        accion === 'completar'
          ? '🎉 ¡Excelente trabajo! Has completado una nueva tarea'
          : '📅 Tu próxima sesión ha sido programada exitosamente';
      codigo = 'PAC_001';
      break;

    case 'admin':
      mensaje = '📊 Dashboard administrativo actualizado correctamente';
      codigo = 'ADM_001';
      break;

    default:
      mensaje = 'Acción realizada exitosamente';
      codigo = 'GEN_001';
  }

  return ManejadorRespuestas.exito(
    res,
    mensaje,
    {
      rol,
      accion,
      personalizacion: true,
      timestamp: new Date().toISOString()
    },
    codigo
  );
};

/**
 * EJEMPLO 7: Respuesta con múltiples tipos de datos
 */
export const ejemploRespuestaCompleja = (req: Request, res: Response) => {
  const datosComplejos = {
    paciente: {
      id: 1,
      nombre: 'María González',
      progreso: {
        sesionesCompletadas: 8,
        tareasAsignadas: 12,
        tareasCompletadas: 9,
        puntosTotal: 450,
        nivel: 3
      }
    },
    gamificacion: {
      puntosGanados: 50,
      nuevoLogro: '🏆 Completó 5 tareas seguidas',
      proximoNivel: {
        nivel: 4,
        puntosRequeridos: 550,
        puntosFaltantes: 100
      }
    },
    notificaciones: [
      {
        tipo: 'recordatorio',
        mensaje: 'Tienes una sesión programada para mañana',
        timestamp: new Date().toISOString()
      },
      {
        tipo: 'felicitacion',
        mensaje: '¡Has mejorado tu estado de ánimo esta semana!',
        timestamp: new Date().toISOString()
      }
    ]
  };

  const mensajePersonalizado = formatearMensaje(
    '¡Felicidades {nombre}! Has ganado {puntos} puntos y alcanzado el nivel {nivel}',
    {
      nombre: datosComplejos.paciente.nombre,
      puntos: datosComplejos.gamificacion.puntosGanados,
      nivel: datosComplejos.paciente.progreso.nivel
    }
  );

  return ManejadorRespuestas.exito(res, mensajePersonalizado, datosComplejos, 'COMP_001');
};
