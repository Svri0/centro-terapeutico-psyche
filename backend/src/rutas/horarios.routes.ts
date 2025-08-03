import { Router } from 'express';
import {
  obtenerEspecialidades,
  obtenerHorariosPorEspecialidad,
  obtenerTodosLosHorarios
} from '../controladores/horarios.controlador';
import { authAdmin } from '../middleware/auth.middleware';

const router = Router();

// Obtener todas las especialidades disponibles
router.get('/especialidades', authAdmin, obtenerEspecialidades);

// Obtener horarios por especialidad específica
router.get('/especialidad/:especialidad', authAdmin, obtenerHorariosPorEspecialidad);

// Obtener todos los horarios de todas las especialidades
router.get('/todos', authAdmin, obtenerTodosLosHorarios);

export default router; 