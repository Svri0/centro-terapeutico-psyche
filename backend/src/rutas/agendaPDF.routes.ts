import { Router } from 'express';
import { AgendaPDFController } from '../controladores/agendaPDF.controlador';
import { verificarToken, verificarRol } from '../middleware/auth.middleware';

const router = Router();

// Generar PDF de agenda
router.post('/generar', 
  verificarToken,
  verificarRol(['psicologo']),
  AgendaPDFController.generarPDF
);

// Obtener períodos disponibles para generar PDF
router.get('/periodos-disponibles',
  verificarToken,
  verificarRol(['psicologo']),
  AgendaPDFController.obtenerPeriodosDisponibles
);

export default router;
