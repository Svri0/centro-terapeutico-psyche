import { Router } from 'express';
import { authPsicologo } from '../middleware/auth.middleware';
import { obtenerDashboardPsicologo } from '../controladores/psicologo-dashboard.controlador';

const router = Router();

// GET /psicologo-dashboard - Obtener dashboard completo del psicólogo
router.get('/', authPsicologo, obtenerDashboardPsicologo);

export default router;

