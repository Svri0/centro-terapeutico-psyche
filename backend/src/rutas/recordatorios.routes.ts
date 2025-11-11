// Rutas de recordatorios
import { Router } from 'express';
import {
  obtenerConfiguracionesRecordatorio,
  crearActualizarConfiguracionRecordatorio,
  eliminarConfiguracionRecordatorio,
  ejecutarRecordatoriosTareas,
  ejecutarRecordatorioTareasPaciente
} from '../controladores/recordatorios.controlador';
import { verificarToken } from '../middleware/auth.middleware';

const router = Router();

// Todas las rutas requieren autenticación
router.use(verificarToken);

// GET /api/v1/recordatorios/configuraciones - Obtener configuraciones del usuario
router.get('/configuraciones', obtenerConfiguracionesRecordatorio);

// POST /api/v1/recordatorios/configuraciones - Crear o actualizar configuración
router.post('/configuraciones', crearActualizarConfiguracionRecordatorio);

// DELETE /api/v1/recordatorios/configuraciones/:id - Eliminar configuración
router.delete('/configuraciones/:id', eliminarConfiguracionRecordatorio);

// POST /api/v1/recordatorios/tareas/enviar - Ejecutar recordatorios de tareas para todos los pacientes
router.post('/tareas/enviar', ejecutarRecordatoriosTareas);

// POST /api/v1/recordatorios/tareas/enviar/:pacienteId - Ejecutar recordatorio de tareas para un paciente específico
router.post('/tareas/enviar/:pacienteId', ejecutarRecordatorioTareasPaciente);

export default router;
