import { Router } from 'express';
import { authAdmin } from '../middleware/auth.middleware';
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
  obtenerEstadisticasAuditoria
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
router.post('/psicologos', crearPsicologo);

// PUT /admin/psicologos/:id - Actualizar psicólogo
router.put('/psicologos/:id', actualizarPsicologo);

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

// GET /admin/auditoria/logs - Obtener logs de auditoría
router.get('/auditoria/logs', obtenerLogsAuditoria);

// GET /admin/auditoria/estadisticas - Obtener estadísticas de auditoría
router.get('/auditoria/estadisticas', obtenerEstadisticasAuditoria);

export default router; 