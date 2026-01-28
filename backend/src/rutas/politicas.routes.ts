// Rutas de políticas
import { Router } from 'express';
import {
  obtenerPoliticas,
  obtenerPoliticaPorTipo,
  crearActualizarPolitica,
  obtenerHistorialPolitica,
} from '../controladores/politicas.controlador';
import { verificarToken } from '../middleware/auth.middleware';
import { securityMiddleware } from '../middleware/validation.middleware';

const router = Router();

// Middleware de seguridad global para todas las rutas
router.use(securityMiddleware);

// Rutas públicas (no requieren autenticación)
router.get('/', obtenerPoliticas); // GET /api/v1/politicas

// Rutas protegidas (requieren autenticación y rol de administrador)
router.post('/', verificarToken, crearActualizarPolitica); // POST /api/v1/politicas

// Rutas con parámetros - las más específicas primero
router.get('/:tipo/historial', verificarToken, obtenerHistorialPolitica); // GET /api/v1/politicas/:tipo/historial
router.get('/:tipo', obtenerPoliticaPorTipo); // GET /api/v1/politicas/seguridad o /api/v1/politicas/privacidad
router.put('/:tipo', verificarToken, crearActualizarPolitica); // PUT /api/v1/politicas/:tipo

export default router;
