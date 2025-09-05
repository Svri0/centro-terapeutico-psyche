import { Router } from 'express';
import { 
  obtenerTodas, 
  obtenerPorId, 
  crear, 
  actualizar, 
  eliminar,
  obtenerTareasPaciente,
  actualizarTareaPaciente,
  crearTareaAvanzada,
  guardarRespuesta,
  obtenerRespuestas,
  evaluarRespuesta
} from '../controladores/tareas.controlador';
import { verificarToken, verificarRol } from '../middleware/auth.middleware';

const router = Router();

// Middleware de autenticación para todas las rutas
router.use(verificarToken);

// Rutas para pacientes (deben ir antes de las rutas con parámetros)
router.get('/paciente/mis-tareas', verificarRol(['paciente']), obtenerTareasPaciente);
router.put('/paciente/mis-tareas/:id', verificarRol(['paciente']), actualizarTareaPaciente);

// Rutas para psicólogos
router.get('/', verificarRol(['psicologo', 'admin']), obtenerTodas);
router.get('/:id', verificarRol(['psicologo', 'admin']), obtenerPorId);
router.post('/', verificarRol(['psicologo', 'admin']), crear);
router.post('/avanzada', verificarRol(['psicologo', 'admin']), crearTareaAvanzada);
router.put('/:id', verificarRol(['psicologo', 'admin']), actualizar);
router.delete('/:id', verificarRol(['psicologo', 'admin']), eliminar);

// Rutas para respuestas
router.get('/:tarea_id/respuestas', verificarRol(['psicologo', 'admin']), obtenerRespuestas);
router.post('/:tarea_id/respuestas', verificarRol(['paciente']), guardarRespuesta);
router.put('/respuestas/:respuesta_id/evaluar', verificarRol(['psicologo', 'admin']), evaluarRespuesta);

export default router; 