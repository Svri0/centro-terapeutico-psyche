import { Router } from 'express';
import { verificarToken, verificarRol } from '../middleware/auth.middleware';
import {
  obtenerDisponibilidad,
  crearDisponibilidad,
  actualizarDisponibilidad,
  actualizarDisponibilidadMultiple,
  obtenerDisponibilidadPaciente,
  verificarDisponibilidadDia
} from '../controladores/disponibilidad.controlador';

const router = Router();

// Aplicar middleware de autenticación a todas las rutas
router.use(verificarToken);

// Rutas para psicólogos
router.get('/psicologo/:psicologoId', verificarRol(['psicologo', 'admin']), obtenerDisponibilidad);
router.post('/', verificarRol(['psicologo', 'admin']), crearDisponibilidad);
router.put('/:id', verificarRol(['psicologo', 'admin']), actualizarDisponibilidad);
router.put('/psicologo/:psicologoId', verificarRol(['psicologo', 'admin']), actualizarDisponibilidadMultiple);

// Rutas para pacientes
router.get('/paciente/:psicologoId', verificarRol(['paciente', 'psicologo', 'admin']), obtenerDisponibilidadPaciente);
router.get('/verificar/:psicologoId', verificarRol(['paciente', 'psicologo', 'admin']), verificarDisponibilidadDia);

export default router; 