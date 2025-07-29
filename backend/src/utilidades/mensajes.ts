// Sistema de mensajes personalizados
// Centro Terapéutico Psyche

export interface MensajeResponse {
  success: boolean;
  mensaje: string;
  data?: any;
  error?: string;
  codigo?: string;
}

// ===== MENSAJES GENERALES =====
export const MENSAJES_GENERALES = {
  EXITO: 'Operación realizada exitosamente',
  ERROR_INTERNO: 'Ha ocurrido un error interno del servidor',
  DATOS_INVALIDOS: 'Los datos proporcionados no son válidos',
  NO_AUTORIZADO: 'No tienes permisos para realizar esta acción',
  RECURSO_NO_ENCONTRADO: 'El recurso solicitado no fue encontrado',
  BIENVENIDA: '¡Bienvenido al Centro Terapéutico Psyche!'
};

// ===== MENSAJES DE AUTENTICACIÓN =====
export const MENSAJES_AUTH = {
  LOGIN_EXITOSO: '¡Bienvenido! Has iniciado sesión correctamente',
  LOGIN_FALLIDO: 'Credenciales incorrectas. Por favor verifica tu email y contraseña',
  LOGOUT_EXITOSO: 'Has cerrado sesión correctamente. ¡Hasta pronto!',
  REGISTRO_EXITOSO: '¡Cuenta creada exitosamente! Ya puedes iniciar sesión',
  REGISTRO_FALLIDO: 'No se pudo crear la cuenta. Por favor intenta nuevamente',
  EMAIL_YA_EXISTE: 'Ya existe una cuenta asociada a este email',
  TOKEN_EXPIRADO: 'Tu sesión ha expirado. Por favor inicia sesión nuevamente',
  TOKEN_INVALIDO: 'Token de acceso inválido',
  PERFIL_ACTUALIZADO: 'Tu perfil ha sido actualizado correctamente',
  CAMBIO_PASSWORD_EXITOSO: 'Tu contraseña ha sido cambiada exitosamente'
};

// ===== MENSAJES DE USUARIOS =====
export const MENSAJES_USUARIOS = {
  LISTA_OBTENIDA: 'Lista de usuarios obtenida exitosamente',
  USUARIO_CREADO: 'Usuario creado exitosamente',
  USUARIO_ACTUALIZADO: 'Usuario actualizado exitosamente',
  USUARIO_ELIMINADO: 'Usuario eliminado exitosamente',
  USUARIO_NO_ENCONTRADO: 'El usuario solicitado no fue encontrado',
  ROL_ACTUALIZADO: 'El rol del usuario ha sido actualizado exitosamente',
  ESTADO_ACTUALIZADO: 'El estado del usuario ha sido actualizado'
};

// ===== MENSAJES DE PACIENTES =====
export const MENSAJES_PACIENTES = {
  LISTA_OBTENIDA: 'Lista de pacientes obtenida exitosamente',
  PACIENTE_CREADO: '¡Paciente registrado exitosamente! Ya puede acceder al sistema',
  PACIENTE_ACTUALIZADO: 'Información del paciente actualizada correctamente',
  PACIENTE_ELIMINADO: 'Paciente eliminado del sistema exitosamente',
  PACIENTE_NO_ENCONTRADO: 'El paciente solicitado no fue encontrado',
  FICHA_CREADA: 'Ficha clínica creada exitosamente',
  FICHA_ACTUALIZADA: 'Ficha clínica actualizada correctamente',
  HISTORIAL_OBTENIDO: 'Historial clínico obtenido exitosamente',
  ASIGNACION_EXITOSA: 'Paciente asignado al psicólogo exitosamente'
};

// ===== MENSAJES DE SESIONES =====
export const MENSAJES_SESIONES = {
  LISTA_OBTENIDA: 'Lista de sesiones obtenida exitosamente',
  SESION_CREADA: 'Sesión programada exitosamente',
  SESION_ACTUALIZADA: 'Sesión actualizada correctamente',
  SESION_CANCELADA: 'Sesión cancelada exitosamente',
  SESION_COMPLETADA: '¡Sesión marcada como completada!',
  SESION_NO_ENCONTRADA: 'La sesión solicitada no fue encontrada',
  HORARIO_NO_DISPONIBLE: 'El horario seleccionado no está disponible',
  RECORDATORIO_ENVIADO: 'Recordatorio de sesión enviado exitosamente',
  NOTAS_GUARDADAS: 'Notas de la sesión guardadas correctamente'
};

// ===== MENSAJES DE TAREAS =====
export const MENSAJES_TAREAS = {
  LISTA_OBTENIDA: 'Lista de tareas obtenida exitosamente',
  TAREA_CREADA: '¡Tarea asignada exitosamente! El paciente ha sido notificado',
  TAREA_ACTUALIZADA: 'Tarea actualizada correctamente',
  TAREA_COMPLETADA: '¡Felicidades! Has completado la tarea exitosamente',
  TAREA_ELIMINADA: 'Tarea eliminada exitosamente',
  TAREA_NO_ENCONTRADA: 'La tarea solicitada no fue encontrada',
  PROGRESO_ACTUALIZADO: 'Progreso de la tarea actualizado correctamente',
  PUNTOS_OTORGADOS: '¡Excelente trabajo! Has ganado puntos por completar la tarea',
  RECORDATORIO_ENVIADO: 'Recordatorio de tarea enviado al paciente'
};

// ===== MENSAJES DE REPORTES =====
export const MENSAJES_REPORTES = {
  REPORTE_GENERADO: 'Reporte generado exitosamente',
  ESTADISTICAS_OBTENIDAS: 'Estadísticas obtenidas correctamente',
  PROGRESO_CALCULADO: 'Progreso del paciente calculado exitosamente',
  DATOS_INSUFICIENTES: 'No hay suficientes datos para generar el reporte',
  PERIODO_INVALIDO: 'El período seleccionado no es válido',
  EXPORTACION_EXITOSA: 'Reporte exportado exitosamente'
};

// ===== MENSAJES DE SISTEMA =====
export const MENSAJES_SISTEMA = {
  SERVIDOR_INICIADO: '🚀 Servidor backend ejecutándose correctamente',
  BASE_DATOS_CONECTADA: '✅ Conexión a la base de datos establecida',
  BASE_DATOS_ERROR: '❌ Error al conectar con la base de datos',
  BACKUP_CREADO: 'Respaldo de datos creado exitosamente',
  MANTENIMIENTO_PROGRAMADO: 'Mantenimiento programado del sistema',
  ACTUALIZACION_DISPONIBLE: 'Nueva actualización disponible para el sistema'
};

// ===== MENSAJES GAMIFICACIÓN =====
export const MENSAJES_GAMIFICACION = {
  PUNTOS_OTORGADOS: '¡Has ganado {puntos} puntos!',
  NIVEL_ALCANZADO: '¡Felicidades! Has alcanzado el nivel {nivel}',
  LOGRO_DESBLOQUEADO: '🏆 ¡Nuevo logro desbloqueado: {logro}!',
  RACHA_COMPLETADA: '🔥 ¡Increíble! Has completado {dias} días seguidos',
  RANKING_ACTUALIZADO: 'Tu posición en el ranking ha sido actualizada',
  META_ALCANZADA: '🎯 ¡Has alcanzado tu meta semanal! Excelente trabajo'
};

// ===== FUNCIONES PARA FORMATEAR MENSAJES =====

/**
 * Crea una respuesta exitosa estandarizada
 */
export const respuestaExitosa = (
  mensaje: string,
  data?: any,
  codigo?: string
): MensajeResponse => ({
  success: true,
  mensaje,
  data,
  ...(codigo && { codigo })
});

/**
 * Crea una respuesta de error estandarizada
 */
export const respuestaError = (mensaje: string, codigo?: string, data?: any): MensajeResponse => ({
  success: false,
  mensaje,
  error: mensaje,
  ...(codigo && { codigo }),
  ...(data && { data })
});

/**
 * Formatea mensajes con variables dinámicas
 */
export const formatearMensaje = (plantilla: string, variables: Record<string, any>): string => {
  return plantilla.replace(/\{(\w+)\}/g, (match, key) => {
    return variables[key] !== undefined ? variables[key].toString() : match;
  });
};

/**
 * Obtiene mensaje personalizado según el contexto
 */
export const obtenerMensaje = (
  categoria: string,
  tipo: string,
  variables?: Record<string, any>
): string => {
  const categorias: Record<string, any> = {
    generales: MENSAJES_GENERALES,
    auth: MENSAJES_AUTH,
    usuarios: MENSAJES_USUARIOS,
    pacientes: MENSAJES_PACIENTES,
    sesiones: MENSAJES_SESIONES,
    tareas: MENSAJES_TAREAS,
    reportes: MENSAJES_REPORTES,
    sistema: MENSAJES_SISTEMA,
    gamificacion: MENSAJES_GAMIFICACION
  };

  const mensaje = categorias[categoria]?.[tipo.toUpperCase()];

  if (!mensaje) {
    return MENSAJES_GENERALES.ERROR_INTERNO;
  }

  return variables ? formatearMensaje(mensaje, variables) : mensaje;
};
