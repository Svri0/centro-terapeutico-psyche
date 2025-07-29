// Rutas de autenticación
import { Router } from 'express';
import {
  actualizarPerfil,
  cambiarPassword,
  cerrarSesion,
  iniciarSesion,
  obtenerPerfil,
  registrar,
  cambiarContraseña
} from '../controladores/autenticacion.controlador';
import { verificarToken } from '../middleware/auth.middleware';

const router = Router();

// Rutas de autenticación con mensajes personalizados
router.post('/login', iniciarSesion); // POST /api/v1/auth/login
router.post('/registro', registrar); // POST /api/v1/auth/registro
router.post('/logout', cerrarSesion); // POST /api/v1/auth/logout

// Rutas de perfil de usuario
router.get('/perfil', obtenerPerfil); // GET /api/v1/auth/perfil
router.put('/perfil', actualizarPerfil); // PUT /api/v1/auth/perfil
router.put('/cambiar-password', cambiarPassword); // PUT /api/v1/auth/cambiar-password
router.put('/cambiar-contraseña', verificarToken, cambiarContraseña); // PUT /api/v1/auth/cambiar-contraseña

export default router;
