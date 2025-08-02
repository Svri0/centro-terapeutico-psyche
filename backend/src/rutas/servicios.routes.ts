import { Router } from 'express';
import { 
  obtenerServicios, 
  crearServicio, 
  actualizarServicio, 
  eliminarServicio,
  obtenerServiciosPsicologo 
} from '../controladores/servicios.controlador';
import { authPsicologo } from '../middleware/auth.middleware';

const router = Router();

// Rutas protegidas para psicólogos
router.get('/', authPsicologo, obtenerServicios);
router.post('/', authPsicologo, crearServicio);
router.put('/:id', authPsicologo, actualizarServicio);
router.delete('/:id', authPsicologo, eliminarServicio);

// Ruta pública para obtener servicios de un psicólogo específico
router.get('/psicologo/:psicologoId', obtenerServiciosPsicologo);

export default router; 