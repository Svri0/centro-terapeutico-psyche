import { Router } from 'express';
import { authAdmin } from '../middleware/auth.middleware';
import upload, { handleUploadError } from '../middleware/upload.middleware';
import {
  obtenerPsicologos,
  obtenerPsicologoPorId,
  crearPsicologo,
  actualizarPsicologo,
  desactivarPsicologo,
  reactivarPsicologo,
  eliminarPsicologo,
  obtenerPacientesPsicologo,
  obtenerCitasPsicologo,
  eliminarCita,
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
} from '../controladores/admin.controlador';

const router = Router();

// Aplicar middleware de autenticación y autorización de administrador a todas las rutas
router.use(authAdmin);

// GET /admin/psicologos - Obtener todos los psicólogos
router.get('/psicologos', obtenerPsicologos);

// GET /admin/psicologos/disponibles - Obtener psicólogos disponibles para reasignación
router.get('/psicologos/disponibles', obtenerPsicologosDisponibles);

// GET /admin/psicologos/:id - Obtener psicólogo por ID
router.get('/psicologos/:id', obtenerPsicologoPorId);

// POST /admin/psicologos - Crear nuevo psicólogo
router.post('/psicologos', upload.single('avatar'), handleUploadError, crearPsicologo);

// PUT /admin/psicologos/:id - Actualizar psicólogo
router.put('/psicologos/:id', upload.single('avatar'), handleUploadError, actualizarPsicologo);

// PATCH /admin/psicologos/:id/desactivar - Desactivar psicólogo
router.patch('/psicologos/:id/desactivar', desactivarPsicologo);

// PATCH /admin/psicologos/:id/reactivar - Reactivar psicólogo
router.patch('/psicologos/:id/reactivar', reactivarPsicologo);

// DELETE /admin/psicologos/:id - Eliminar psicólogo
router.delete('/psicologos/:id', eliminarPsicologo);

// GET /admin/psicologos/:id/pacientes - Obtener pacientes de un psicólogo
router.get('/psicologos/:id/pacientes', obtenerPacientesPsicologo);

// GET /admin/psicologos/:id/citas - Obtener citas de un psicólogo
router.get('/psicologos/:id/citas', obtenerCitasPsicologo);

// DELETE /admin/citas/:id - Eliminar cita específica
router.delete('/citas/:id', eliminarCita);

// POST /admin/pacientes/reasignar - Reasignar paciente a otro psicólogo
router.post('/pacientes/reasignar', reasignarPaciente);

// Rutas de gestión de pacientes para administradores
// GET /admin/pacientes - Obtener todos los pacientes
router.get('/pacientes', obtenerTodosPacientes);

// POST /admin/pacientes - Crear nuevo paciente
router.post('/pacientes', crearPaciente);

// PUT /admin/pacientes/:id - Actualizar paciente
router.put('/pacientes/:id', actualizarPaciente);

// DELETE /admin/pacientes/:id - Eliminar paciente
router.delete('/pacientes/:id', eliminarPaciente);

// PATCH /admin/pacientes/:id/activar - Activar paciente
router.patch('/pacientes/:id/activar', activarPaciente);

// PATCH /admin/pacientes/:id/desactivar - Desactivar paciente
router.patch('/pacientes/:id/desactivar', desactivarPaciente);

// GET /admin/auditoria/logs - Obtener logs de auditoría
router.get('/auditoria/logs', obtenerLogsAuditoria);

// GET /admin/auditoria/estadisticas - Obtener estadísticas de auditoría
router.get('/auditoria/estadisticas', obtenerEstadisticasAuditoria);

// Rutas de gestión de recepcionistas para administradores
// GET /admin/recepcionistas - Obtener todos los recepcionistas
router.get('/recepcionistas', obtenerRecepcionistas);

// POST /admin/recepcionistas - Crear nuevo recepcionista
router.post('/recepcionistas', upload.single('avatar'), handleUploadError, crearRecepcionista);

// PUT /admin/recepcionistas/:id - Actualizar recepcionista
router.put('/recepcionistas/:id', upload.single('avatar'), handleUploadError, actualizarRecepcionista);

// DELETE /admin/recepcionistas/:id - Eliminar recepcionista
router.delete('/recepcionistas/:id', eliminarRecepcionista);

// PATCH /admin/recepcionistas/:id/activar - Activar recepcionista
router.patch('/recepcionistas/:id/activar', activarRecepcionista);

// PATCH /admin/recepcionistas/:id/desactivar - Desactivar recepcionista
router.patch('/recepcionistas/:id/desactivar', desactivarRecepcionista);

export default router; 