// Rutas de pacientes
import { Router } from 'express';
import {
  actualizar,
  asignarPsicologo,
  buscarPacientes,
  crear,
  eliminar,
  obtenerHistorial,
  obtenerPorId,
  obtenerTodos
} from '../controladores/pacientes.controlador';
import { authPsicologo } from '../middleware/auth.middleware';

const router = Router();

// Rutas CRUD de pacientes con mensajes personalizados
// Todas las rutas requieren autenticación de psicólogo
router.get('/', authPsicologo, obtenerTodos); // GET /api/v1/pacientes
router.get('/buscar', authPsicologo, buscarPacientes); // GET /api/v1/pacientes/buscar?q=termino
router.post('/', authPsicologo, crear); // POST /api/v1/pacientes
router.get('/:id', authPsicologo, obtenerPorId); // GET /api/v1/pacientes/:id
router.put('/:id', authPsicologo, actualizar); // PUT /api/v1/pacientes/:id
router.delete('/:id', authPsicologo, eliminar); // DELETE /api/v1/pacientes/:id

// Rutas específicas de pacientes
router.put('/:pacienteId/asignar-psicologo', authPsicologo, asignarPsicologo); // PUT /api/v1/pacientes/:pacienteId/asignar-psicologo
router.get('/:id/historial', authPsicologo, obtenerHistorial); // GET /api/v1/pacientes/:id/historial

export default router;
