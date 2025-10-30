import { Router } from 'express';
import { 
  obtenerTodosReportes, 
  obtenerReportePorId, 
  crearReporte, 
  exportarReporte,
  actualizarReporte,
  eliminarReporte,
  obtenerReportesPorPaciente
} from '../controladores/reportes.controlador';
import { verificarToken, verificarRol } from '../middleware/auth.middleware';

const router = Router();

// Aplicar middleware de autenticación a todas las rutas
router.use(verificarToken);

// GET /reportes - Solo psicólogos y admins
router.get('/', verificarRol(['psicologo', 'admin']), obtenerTodosReportes);

// POST /reportes - Crear un nuevo reporte
router.post('/', verificarRol(['psicologo', 'admin']), crearReporte);

// GET /reportes/paciente/:paciente_id - Obtener reportes de un paciente específico
router.get('/paciente/:paciente_id', verificarRol(['psicologo', 'admin']), obtenerReportesPorPaciente);

// GET /reportes/:id/exportar - Exportar un reporte (debe estar antes de /:id)
router.get('/:id/exportar', verificarRol(['psicologo', 'admin']), exportarReporte);

// GET /reportes/:id - Obtener un reporte por ID
router.get('/:id', verificarRol(['psicologo', 'admin']), obtenerReportePorId);

// PUT /reportes/:id - Actualizar un reporte
router.put('/:id', verificarRol(['psicologo', 'admin']), actualizarReporte);

// DELETE /reportes/:id - Eliminar un reporte
router.delete('/:id', verificarRol(['psicologo', 'admin']), eliminarReporte);

export default router; 