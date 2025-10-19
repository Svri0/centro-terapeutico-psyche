// Controladores del sistema
// Este archivo exporta todos los controladores

// Autenticación
export {
  iniciarSesion,
  registrar,
  cerrarSesion,
  obtenerPerfil
} from './autenticacion.controlador';

// Usuarios
export {
  obtenerTodos as obtenerTodosUsuarios,
  obtenerPorId as obtenerUsuarioPorId,
  crear as crearUsuario,
  actualizar as actualizarUsuario,
  eliminar as eliminarUsuario
} from './usuarios.controlador';

// Sesiones
export {
  obtenerTodas as obtenerTodasSesiones,
  obtenerPorId as obtenerSesionPorId,
  crear as crearSesion,
  actualizar as actualizarSesion,
  eliminar as eliminarSesion
} from './sesiones.controlador';

// Tareas
export {
  obtenerTodas as obtenerTodasTareas,
  obtenerPorId as obtenerTareaPorId,
  crear as crearTarea,
  actualizar as actualizarTarea,
  eliminar as eliminarTarea
} from './tareas.controlador';

// Pacientes
export {
  obtenerTodos as obtenerTodosPacientes,
  obtenerPorId as obtenerPacientePorId,
  crear as crearPaciente,
  actualizar as actualizarPaciente,
  eliminar as eliminarPaciente
} from './pacientes.controlador';

// Reportes
export {
  obtenerTodos as obtenerTodosReportes,
  obtenerPorId as obtenerReportePorId,
  crear as crearReporte,
  exportar as exportarReporte
} from './reportes.controlador';

// Administrador
export {
  obtenerPsicologos,
  obtenerPsicologoPorId,
  crearPsicologo,
  actualizarPsicologo,
  desactivarPsicologo,
  reactivarPsicologo,
  eliminarPsicologo,
  obtenerPacientesPsicologo,
  obtenerSesionesPsicologo,
  eliminarSesion,
  reasignarPaciente,
  obtenerPsicologosDisponibles,
  obtenerLogsAuditoria,
  obtenerEstadisticasAuditoria,
  obtenerTodosPacientes,
  crearPaciente,
  actualizarPaciente,
  eliminarPaciente,
  activarPaciente,
  desactivarPaciente,
  obtenerRecepcionistas,
  crearRecepcionista,
  actualizarRecepcionista,
  desactivarRecepcionista,
  activarRecepcionista,
  eliminarRecepcionista
} from './admin.controlador'; 