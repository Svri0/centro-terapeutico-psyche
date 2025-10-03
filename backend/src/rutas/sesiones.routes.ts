import { Router } from 'express';
import { verificarToken } from '../middleware/auth.middleware';
import { 
  obtenerTodas, 
  obtenerPorId, 
  crear, 
  actualizar, 
  eliminar,
  obtenerSesionesPsicologo,
  obtenerSesionesPaciente
} from '../controladores/sesiones.controlador';

const router = Router();

// Aplicar middleware de autenticación a todas las rutas
router.use(verificarToken);

// GET /sesiones
router.get('/', obtenerTodas);

// GET /sesiones/psicologo - Obtener sesiones del psicólogo autenticado
router.get('/psicologo', obtenerSesionesPsicologo);

// GET /sesiones/paciente - Obtener sesiones del paciente autenticado
router.get('/paciente', obtenerSesionesPaciente);

// GET /sesiones/:id
router.get('/:id', obtenerPorId);

// POST /sesiones
router.post('/', crear);

// PUT /sesiones/:id
router.put('/:id', actualizar);

// DELETE /sesiones/:id
router.delete('/:id', eliminar);

export default router; 