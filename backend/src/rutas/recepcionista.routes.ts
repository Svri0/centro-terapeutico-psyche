import { Router } from 'express';
import { authRecepcionista, authRecepcionistaConPermiso } from '../middleware/recepcionista.middleware';
import {
  obtenerEstadisticasDashboard,
  obtenerCitasDelDia,
  obtenerPacientesRecepcionista,
  obtenerPagosRecepcionista,
  obtenerPsicologosRecepcionista
} from '../controladores/recepcionista.controlador';
import { crearPacienteBasico } from '../controladores/recepcionista-pacientes.controlador';

const router = Router();

// Dashboard y estadísticas
router.get('/dashboard/estadisticas', 
  authRecepcionista, 
  obtenerEstadisticasDashboard
);

// Gestión de citas
router.get('/citas/dia', 
  authRecepcionistaConPermiso('citas:leer'), 
  obtenerCitasDelDia
);

// Gestión de pacientes
router.get('/pacientes', 
  authRecepcionistaConPermiso('pacientes:leer'), 
  obtenerPacientesRecepcionista
);

// Crear paciente básico
router.post('/pacientes', 
  authRecepcionistaConPermiso('pacientes:crear'), 
  crearPacienteBasico
);

// Gestión de pagos
router.get('/pagos', 
  authRecepcionistaConPermiso('pagos:leer'), 
  obtenerPagosRecepcionista
);

// Obtener psicólogos
router.get('/psicologos', 
  authRecepcionista, 
  obtenerPsicologosRecepcionista
);

export default router;

