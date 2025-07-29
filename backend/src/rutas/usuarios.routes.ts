import { Router } from 'express';
import { 
  obtenerTodosUsuarios, 
  obtenerUsuarioPorId, 
  crearUsuario, 
  actualizarUsuario, 
  eliminarUsuario 
} from '../controladores';

const router = Router();

// GET /usuarios
router.get('/', obtenerTodosUsuarios);

// GET /usuarios/:id
router.get('/:id', obtenerUsuarioPorId);

// POST /usuarios
router.post('/', crearUsuario);

// PUT /usuarios/:id
router.put('/:id', actualizarUsuario);

// DELETE /usuarios/:id
router.delete('/:id', eliminarUsuario);

export default router; 