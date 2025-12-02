// Rutas de autenticación
import { Router } from 'express';
import {
  actualizarPerfil,
  cambiarPassword,
  cerrarSesion,
  iniciarSesion,
  obtenerPerfil,
  registrar,
  actualizarActividadSesion,
  forgotPassword,
  resetPassword
} from '../controladores/autenticacion.controlador';
import { verificarToken } from '../middleware/auth.middleware';
import { 
  validateLogin, 
  validateRegistro, 
  securityMiddleware 
} from '../middleware/validation.middleware';

const router = Router();

// Middleware de seguridad global para todas las rutas
router.use(securityMiddleware);

// Rutas de autenticación con validaciones y mensajes personalizados
router.post('/login', validateLogin, iniciarSesion); // POST /api/v1/auth/login
router.post('/registro', validateRegistro, registrar); // POST /api/v1/auth/registro
router.post('/logout', cerrarSesion); // POST /api/v1/auth/logout
router.post('/forgot-password', forgotPassword); // POST /api/v1/auth/forgot-password
router.post('/reset-password', resetPassword); // POST /api/v1/auth/reset-password

// Rutas de perfil de usuario (requieren autenticación)
router.get('/perfil', verificarToken, obtenerPerfil); // GET /api/v1/auth/perfil
router.put('/perfil', verificarToken, actualizarPerfil); // PUT /api/v1/auth/perfil
router.put('/cambiar-password', verificarToken, cambiarPassword); // PUT /api/v1/auth/cambiar-password
router.post('/actualizar-actividad', verificarToken, actualizarActividadSesion); // POST /api/v1/auth/actualizar-actividad

export default router;
