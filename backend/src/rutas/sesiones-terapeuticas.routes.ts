import { Router } from 'express';
import { verificarToken } from '../middleware/auth.middleware';
import {
  obtenerInfoPacienteSesion,
  obtenerHistorialSesiones,
  iniciarSesionTerapeutica,
  finalizarSesionTerapeutica,
  obtenerEstadoSesion
} from '../controladores/sesiones-terapeuticas.controlador';

const router = Router();

// Todas las rutas requieren autenticación
router.use(verificarToken);

// Obtener información del paciente para la sesión
router.get('/pacientes/:pacienteId/info', obtenerInfoPacienteSesion);

// Obtener historial de sesiones del paciente
router.get('/pacientes/:pacienteId/historial', obtenerHistorialSesiones);

// Iniciar sesión terapéutica
router.post('/citas/:citaId/iniciar', iniciarSesionTerapeutica);

// Finalizar sesión terapéutica
router.post('/sesiones/:sesionId/finalizar', finalizarSesionTerapeutica);

// Obtener estado de sesión activa
router.get('/citas/:citaId/estado', obtenerEstadoSesion);

export default router;




