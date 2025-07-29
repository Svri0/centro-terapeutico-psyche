import { Router } from 'express';
import { 
  obtenerTodosReportes, 
  obtenerReportePorId, 
  crearReporte, 
  exportarReporte 
} from '../controladores';

const router = Router();

// GET /reportes
router.get('/', obtenerTodosReportes);

// GET /reportes/:id
router.get('/:id', obtenerReportePorId);

// POST /reportes
router.post('/', crearReporte);

// GET /reportes/:id/exportar
router.get('/:id/exportar', exportarReporte);

export default router; 