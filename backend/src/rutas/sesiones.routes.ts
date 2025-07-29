import { Router } from 'express';
import { 
  obtenerTodasSesiones, 
  obtenerSesionPorId, 
  crearSesion, 
  actualizarSesion, 
  eliminarSesion 
} from '../controladores';

const router = Router();

// GET /sesiones
router.get('/', obtenerTodasSesiones);

// GET /sesiones/:id
router.get('/:id', obtenerSesionPorId);

// POST /sesiones
router.post('/', crearSesion);

// PUT /sesiones/:id
router.put('/:id', actualizarSesion);

// DELETE /sesiones/:id
router.delete('/:id', eliminarSesion);

export default router; 