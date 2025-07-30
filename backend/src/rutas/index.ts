import { Router } from 'express';

const router = Router();

// Importar rutas
import autenticacionRoutes from './autenticacion.routes';
import pacientesRoutes from './pacientes.routes';
import reportesRoutes from './reportes.routes';
import sesionesRoutes from './sesiones.routes';
import tareasRoutes from './tareas.routes';
import usuariosRoutes from './usuarios.routes';

// Configurar rutas
router.use('/auth', autenticacionRoutes);
router.use('/usuarios', usuariosRoutes);
router.use('/sesiones', sesionesRoutes);
router.use('/tareas', tareasRoutes);
router.use('/pacientes', pacientesRoutes);
router.use('/reportes', reportesRoutes);

export default router;
