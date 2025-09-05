import express, { Router } from 'express';
import { obtenerTodos, obtenerPorId, crear, actualizar, eliminar, actualizarPerfilPsicologo, actualizarPerfilPaciente, subirImagenReal, testConnection } from '../controladores/usuarios.controlador';
import { verificarToken, verificarRol } from '../middleware/auth.middleware';
import upload from '../middleware/upload.middleware';

const router: Router = express.Router();

// Endpoint de prueba
router.get('/test', testConnection);

// Rutas públicas
router.get('/', obtenerTodos);
router.get('/:id', obtenerPorId);

// Rutas protegidas
router.use(verificarToken);

router.post('/', verificarRol(['admin']), crear);
router.put('/:id', verificarRol(['admin']), actualizar);
router.delete('/:id', verificarRol(['admin']), eliminar);

// Rutas de perfil
router.put('/perfil/:id', verificarToken, actualizarPerfilPsicologo);
router.put('/perfil-paciente/:id', verificarToken, actualizarPerfilPaciente);

// Ruta para subir imagen
router.post('/subir-imagen', verificarToken, upload.single('avatar'), subirImagenReal);

export default router; 