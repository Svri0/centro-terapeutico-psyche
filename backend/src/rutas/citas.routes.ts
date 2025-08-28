import { Router } from 'express';
import { verificarToken } from '../middleware/auth.middleware';
import { 
  obtenerCitasPsicologo, 
  obtenerCitasPaciente, 
  obtenerCita, 
  crearCita, 
  actualizarCita, 
  actualizarEstadoCita, 
  cancelarCita, 
  obtenerDisponibilidad, 
  obtenerEstadisticasCitas,
  limpiarCitasCanceladas
} from '../controladores/citas.controlador';

const router = Router();

// Rutas protegidas (requieren autenticación)
router.use(verificarToken);

// Obtener citas del psicólogo autenticado
router.get('/psicologo', obtenerCitasPsicologo);

// Obtener citas del paciente autenticado
router.get('/paciente', obtenerCitasPaciente);

// Obtener disponibilidad del psicólogo
router.get('/psicologos/:psicologoId/disponibilidad', obtenerDisponibilidad);

// Obtener estadísticas de citas
router.get('/psicologos/estadisticas-citas', obtenerEstadisticasCitas);

// Crear una nueva cita
router.post('/', crearCita);

// Obtener una cita específica
router.get('/:id', obtenerCita);

// Actualizar una cita
router.put('/:id', actualizarCita);

// Actualizar estado de una cita
router.patch('/:id/estado', actualizarEstadoCita);

// Cancelar una cita
router.delete('/:id', cancelarCita);

// Limpiar citas canceladas manualmente (solo admin)
router.delete('/limpiar-canceladas', limpiarCitasCanceladas);

export default router; 