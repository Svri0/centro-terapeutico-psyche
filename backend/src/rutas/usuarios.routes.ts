import { Router } from 'express';
import { obtenerTodos, obtenerPorId, crear, actualizar, eliminar, actualizarPerfilPsicologo, subirImagenReal } from '../controladores/usuarios.controlador';
import { verificarToken } from '../middleware/auth.middleware';
import upload from '../middleware/upload.middleware';

const router = Router();

// Rutas públicas
router.get('/', obtenerTodos);
router.get('/:id', obtenerPorId);

// Rutas protegidas
router.post('/', verificarToken, crear);
router.put('/:id', verificarToken, actualizar);
router.delete('/:id', verificarToken, eliminar);

// Ruta para actualizar perfil del psicólogo
router.put('/perfil/:id', verificarToken, actualizarPerfilPsicologo);

// Ruta para subir imagen real
router.post('/subir-imagen', verificarToken, upload.single('avatar'), subirImagenReal);

export default router; 