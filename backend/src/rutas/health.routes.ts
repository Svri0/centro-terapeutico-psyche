import { Router } from 'express';
import { healthCheck } from '../controladores/health.controlador';

const router = Router();

// GET /health - Health check endpoint
router.get('/', healthCheck);

export default router;

