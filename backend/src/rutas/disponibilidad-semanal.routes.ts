import { Router } from 'express';
import {
  obtenerDisponibilidadSemanal,
  actualizarDisponibilidadSemanal,
  verificarDisponibilidadPendiente,
  obtenerFeriadosSemana
} from '../controladores/disponibilidad-semanal.controlador';
import { authPsicologo } from '../middleware/auth.middleware';

const router = Router();

// Obtener disponibilidad semanal actual
router.get('/', authPsicologo, obtenerDisponibilidadSemanal);

// Actualizar disponibilidad semanal
router.put('/', authPsicologo, actualizarDisponibilidadSemanal);

// Verificar si debe actualizar disponibilidad
router.get('/verificar', authPsicologo, verificarDisponibilidadPendiente);

// Obtener feriados de una semana
router.get('/feriados/:semanaInicio/:semanaFin', authPsicologo, obtenerFeriadosSemana);

export default router; 