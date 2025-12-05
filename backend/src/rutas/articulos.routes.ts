import { Router } from 'express';
import {
  obtenerArticulosPublicados,
  obtenerArticuloPorSlug,
  obtenerTodos,
  obtenerPorId,
  crear,
  actualizar,
  eliminar,
} from '../controladores/articulos.controlador';
import { verificarToken, verificarRol } from '../middleware/auth.middleware';

const router = Router();

// Rutas públicas (no requieren autenticación)
router.get('/publicos', obtenerArticulosPublicados);
router.get('/publicos/:slug', obtenerArticuloPorSlug);

// Rutas protegidas (requieren autenticación)
router.use(verificarToken);

// Obtener todos los artículos (para admin/psicólogo)
router.get('/', obtenerTodos);

// Obtener un artículo por ID
router.get('/:id', obtenerPorId);

// Crear un artículo
router.post('/', crear);

// Actualizar un artículo
router.put('/:id', actualizar);

// Eliminar un artículo
router.delete('/:id', eliminar);

export default router;

