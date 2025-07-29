import { Router } from 'express';
import { authAdmin } from '../middleware/auth.middleware';
import {
  validarCrearPsicologo,
  validarActualizarPsicologo,
  validarIdPsicologo
} from '../middleware/validation.middleware';
import {
  obtenerPsicologos,
  obtenerPsicologoPorId,
  crearPsicologo,
  actualizarPsicologo,
  desactivarPsicologo,
  reactivarPsicologo
} from '../controladores/admin.controlador';

const router = Router();

// Aplicar middleware de autenticación y autorización de administrador a todas las rutas
router.use(authAdmin);

// GET /admin/psicologos - Obtener todos los psicólogos
router.get('/psicologos', obtenerPsicologos);

// GET /admin/psicologos/:id - Obtener psicólogo por ID
router.get('/psicologos/:id', validarIdPsicologo, obtenerPsicologoPorId);

// POST /admin/psicologos - Crear nuevo psicólogo
router.post('/psicologos', validarCrearPsicologo, crearPsicologo);

// PUT /admin/psicologos/:id - Actualizar psicólogo
router.put('/psicologos/:id', validarIdPsicologo, validarActualizarPsicologo, actualizarPsicologo);

// PATCH /admin/psicologos/:id/desactivar - Desactivar psicólogo
router.patch('/psicologos/:id/desactivar', validarIdPsicologo, desactivarPsicologo);

// PATCH /admin/psicologos/:id/reactivar - Reactivar psicólogo
router.patch('/psicologos/:id/reactivar', validarIdPsicologo, reactivarPsicologo);

export default router; 