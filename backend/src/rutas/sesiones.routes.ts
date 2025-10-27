import { Router } from 'express';
import { verificarToken, verificarRol } from '../middleware/auth.middleware';
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

// GET /sesiones - Solo administradores
router.get('/', verificarRol(['admin']), obtenerTodas);

// GET /sesiones/psicologo - Obtener sesiones del psicólogo autenticado
router.get('/psicologo', verificarRol(['psicologo', 'admin']), obtenerSesionesPsicologo);

// GET /sesiones/paciente - Obtener sesiones del paciente autenticado
router.get('/paciente', verificarRol(['paciente', 'admin']), obtenerSesionesPaciente);

// GET /sesiones/:id - Psicólogos y administradores pueden ver cualquier sesión
router.get('/:id', verificarRol(['psicologo', 'admin']), obtenerPorId);

// POST /sesiones - Pacientes pueden crear sesiones, psicólogos y admin también
router.post('/', verificarRol(['paciente', 'psicologo', 'admin']), crear);

// PUT /sesiones/:id - Psicólogos y administradores pueden actualizar
router.put('/:id', verificarRol(['psicologo', 'admin']), actualizar);

// DELETE /sesiones/:id - Psicólogos y administradores pueden eliminar
router.delete('/:id', verificarRol(['psicologo', 'admin']), eliminar);

export default router; 