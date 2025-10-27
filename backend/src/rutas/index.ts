import { Router } from 'express';
import autenticacionRoutes from './autenticacion.routes';
import usuariosRoutes from './usuarios.routes';
import pacientesRoutes from './pacientes.routes';
import tareasRoutes from './tareas.routes';
import sesionesRoutes from './sesiones.routes';
import disponibilidadMensualRoutes from './disponibilidadMensual.routes';
import serviciosRoutes from './servicios.routes';
import adminRoutes from './admin.routes';
import recepcionistaRoutes from './recepcionista.routes';
import chatRoutes from './chat.rutas';
import agendaPDFRoutes from './agendaPDF.routes';
import reportesRoutes from './reportes.routes';

const router = Router();

// Rutas de autenticación
router.use('/autenticacion', autenticacionRoutes);

// Rutas de usuarios
router.use('/usuarios', usuariosRoutes);

// Rutas de pacientes
router.use('/pacientes', pacientesRoutes);

// Rutas de tareas
router.use('/tareas', tareasRoutes);

// Rutas de sesiones
router.use('/sesiones', sesionesRoutes);

// Rutas de disponibilidad mensual
router.use('/disponibilidad-mensual', disponibilidadMensualRoutes);

// Rutas de servicios
router.use('/servicios', serviciosRoutes);

// Rutas de administración
router.use('/admin', adminRoutes);


// Rutas de recepcionista
router.use('/recepcionista', recepcionistaRoutes);

// Rutas de chat
router.use('/chat', chatRoutes);

// Rutas de agenda PDF
router.use('/agenda-pdf', agendaPDFRoutes);

// Rutas de reportes de progreso
router.use('/reportes', reportesRoutes);

export default router; 