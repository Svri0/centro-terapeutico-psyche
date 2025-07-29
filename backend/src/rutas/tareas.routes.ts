import { Router } from 'express';
import { 
  obtenerTodasTareas, 
  obtenerTareaPorId, 
  crearTarea, 
  actualizarTarea, 
  eliminarTarea 
} from '../controladores';

const router = Router();

// GET /tareas
router.get('/', obtenerTodasTareas);

// GET /tareas/:id
router.get('/:id', obtenerTareaPorId);

// POST /tareas
router.post('/', crearTarea);

// PUT /tareas/:id
router.put('/:id', actualizarTarea);

// DELETE /tareas/:id
router.delete('/:id', eliminarTarea);

export default router; 