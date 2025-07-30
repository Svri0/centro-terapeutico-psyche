import { Router } from 'express';
import {
  obtenerDisponibilidad,
  crearCita,
  obtenerCitasPaciente,
  obtenerCitasPsicologo,
  actualizarEstadoCita,
  cancelarCita
} from '../controladores/citas.controlador';
import { verificarToken } from '../middleware/auth.middleware';

const router = Router();

// Rutas públicas (requieren autenticación)
router.use(verificarToken);

// Obtener disponibilidad de un psicólogo para una fecha
router.get('/disponibilidad/:psicologoId/:fecha', obtenerDisponibilidad);

// Crear una nueva cita (paciente)
router.post('/', crearCita);

// Obtener citas del paciente
router.get('/paciente', obtenerCitasPaciente);

// Obtener citas del psicólogo
router.get('/psicologo', obtenerCitasPsicologo);

// Actualizar estado de una cita (psicólogo)
router.put('/:id/estado', actualizarEstadoCita);

// Cancelar cita (paciente)
router.put('/:id/cancelar', cancelarCita);

export default router; 