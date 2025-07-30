// Rutas de autenticación
import { Router } from 'express';
import {
  actualizarPerfil,
  cambiarPassword,
  cerrarSesion,
  iniciarSesion,
  obtenerPerfil,
  refrescarToken,
  registrar
} from '../controladores/autenticacion.controlador';
import { verificarAuth } from '../intermediarios/auth.middleware';

const router = Router();

// Rutas públicas de autenticación
router.post('/login', iniciarSesion); // POST /api/v1/auth/login
router.post('/registro', registrar); // POST /api/v1/auth/registro
router.post('/refresh', refrescarToken); // POST /api/v1/auth/refresh

// Rutas protegidas de autenticación
router.post('/logout', verificarAuth, cerrarSesion); // POST /api/v1/auth/logout
router.get('/perfil', verificarAuth, obtenerPerfil); // GET /api/v1/auth/perfil
router.put('/perfil', verificarAuth, actualizarPerfil); // PUT /api/v1/auth/perfil
router.put('/cambiar-password', verificarAuth, cambiarPassword); // PUT /api/v1/auth/cambiar-password

export default router;
