import { Router } from 'express';
import { ConfiguracionController } from '../controladores/configuracion.controlador';
import { verificarToken } from '../middleware/auth.middleware';
import { verificarRol } from '../middleware/auth.middleware';

const router = Router();

// Aplicar middleware de autenticación a todas las rutas
router.use(verificarToken);

// Solo administradores y psicólogos pueden gestionar configuraciones
router.use(verificarRol(['admin', 'psicologo']));

// Obtener todas las configuraciones
router.get('/', ConfiguracionController.obtenerConfiguraciones);

// Obtener una configuración por clave
router.get('/:clave', ConfiguracionController.obtenerConfiguracion);

// Actualizar una configuración
router.put('/:clave', ConfiguracionController.actualizarConfiguracion);

// Crear una nueva configuración (admin o psicólogo)
router.post('/', verificarRol(['admin', 'psicologo']), ConfiguracionController.crearConfiguracion);

export default router;

