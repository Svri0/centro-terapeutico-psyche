import { Router } from 'express';

const router = Router();

// Importar rutas
import autenticacionRoutes from './autenticacion.routes';
import usuariosRoutes from './usuarios.routes';
import sesionesRoutes from './sesiones.routes';
import tareasRoutes from './tareas.routes';
import pacientesRoutes from './pacientes.routes';
import reportesRoutes from './reportes.routes';
import adminRoutes from './admin.routes';

// Configurar rutas
router.use('/autenticacion', autenticacionRoutes);
router.use('/usuarios', usuariosRoutes);
router.use('/sesiones', sesionesRoutes);
router.use('/tareas', tareasRoutes);
router.use('/pacientes', pacientesRoutes);
router.use('/reportes', reportesRoutes);
router.use('/admin', adminRoutes);

export default router; 