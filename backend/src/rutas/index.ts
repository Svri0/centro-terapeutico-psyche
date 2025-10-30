import { Router } from 'express';
import autenticacionRoutes from './autenticacion.routes';
import usuariosRoutes from './usuarios.routes';
import pacientesRoutes from './pacientes.routes';
import tareasRoutes from './tareas.routes';
import citasRoutes from './citas.routes';
import disponibilidadRoutes from './disponibilidad.routes';
import disponibilidadMensualRoutes from './disponibilidadMensual.routes';
import serviciosRoutes from './servicios.routes';
import adminRoutes from './admin.routes';
import recepcionistaRoutes from './recepcionista.routes';
import sesionesTerapeuticasRoutes from './sesiones-terapeuticas.routes';

const router = Router();

// Rutas de autenticación
router.use('/autenticacion', autenticacionRoutes);

// Rutas de usuarios
router.use('/usuarios', usuariosRoutes);

// Rutas de pacientes
router.use('/pacientes', pacientesRoutes);

// Rutas de tareas
router.use('/tareas', tareasRoutes);

// Rutas de citas
router.use('/citas', citasRoutes);

// Rutas de disponibilidad (semanal - legacy)
router.use('/disponibilidad', disponibilidadRoutes);

// Rutas de disponibilidad mensual
router.use('/disponibilidad-mensual', disponibilidadMensualRoutes);

// Rutas de servicios
router.use('/servicios', serviciosRoutes);

// Rutas de administración
router.use('/admin', adminRoutes);

// Rutas de recepcionista
router.use('/recepcionista', recepcionistaRoutes);

// Rutas de sesiones terapéuticas
router.use('/sesiones-terapeuticas', sesionesTerapeuticasRoutes);

// Rutas de agenda PDF
router.use('/agenda-pdf', agendaPDFRoutes);

// Rutas de reportes de progreso
router.use('/reportes', reportesRoutes);

// Rutas de recordatorios
router.use('/recordatorios', recordatoriosRoutes);

export default router; 