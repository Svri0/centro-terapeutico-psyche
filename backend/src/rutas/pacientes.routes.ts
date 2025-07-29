// Rutas de pacientes
import { Router } from 'express';
import {
  actualizar,
  asignarPsicologo,
  crear,
  eliminar,
  obtenerHistorial,
  obtenerPorId,
  obtenerTodos
} from '../controladores/pacientes.controlador';

const router = Router();

// Rutas CRUD de pacientes con mensajes personalizados
router.get('/', obtenerTodos); // GET /api/v1/pacientes
router.post('/', crear); // POST /api/v1/pacientes
router.get('/:id', obtenerPorId); // GET /api/v1/pacientes/:id
router.put('/:id', actualizar); // PUT /api/v1/pacientes/:id
router.delete('/:id', eliminar); // DELETE /api/v1/pacientes/:id

// Rutas específicas de pacientes
router.put('/:pacienteId/asignar-psicologo', asignarPsicologo); // PUT /api/v1/pacientes/:pacienteId/asignar-psicologo
router.get('/:id/historial', obtenerHistorial); // GET /api/v1/pacientes/:id/historial

export default router;
