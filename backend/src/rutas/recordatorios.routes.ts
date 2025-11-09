// Rutas de recordatorios
import { Router } from 'express';
import {
  obtenerConfiguracionesRecordatorio,
  crearActualizarConfiguracionRecordatorio,
  eliminarConfiguracionRecordatorio
} from '../controladores/recordatorios.controlador';
import { verificarToken } from '../middleware/auth.middleware';

const router = Router();

// Todas las rutas requieren autenticación
router.use(verificarToken);

// GET /api/v1/recordatorios/configuraciones - Obtener configuraciones del usuario
router.get('/configuraciones', obtenerConfiguracionesRecordatorio);

// POST /api/v1/recordatorios/configuraciones - Crear o actualizar configuración
router.post('/configuraciones', crearActualizarConfiguracionRecordatorio);

// DELETE /api/v1/recordatorios/configuraciones/:id - Eliminar configuración
router.delete('/configuraciones/:id', eliminarConfiguracionRecordatorio);

export default router;
