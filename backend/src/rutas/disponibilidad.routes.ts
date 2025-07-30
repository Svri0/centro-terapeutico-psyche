import { Router } from 'express';
import {
  obtenerDisponibilidadPsicologo,
  actualizarDisponibilidad
} from '../controladores/disponibilidad.controlador';
import { authPsicologo } from '../middleware/auth.middleware';

const router = Router();

// Obtener disponibilidad de un psicólogo
router.get('/:psicologoId', obtenerDisponibilidadPsicologo);

// Actualizar disponibilidad (solo psicólogos)
router.put('/', authPsicologo, actualizarDisponibilidad);

export default router; 