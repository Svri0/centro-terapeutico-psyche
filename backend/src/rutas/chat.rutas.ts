import { Router } from 'express';
import { ChatController } from '../controladores/chat.controlador';
import { verificarToken } from '../middleware/auth.middleware';

const router = Router();

// Aplicar middleware de autenticación a todas las rutas
router.use(verificarToken);

// Obtener pacientes del psicólogo para el chat
router.get('/pacientes', ChatController.obtenerPacientesChat);

// Obtener personal (otros psicólogos y administrador) para el chat
router.get('/personal', ChatController.obtenerPersonalChat);

// Obtener psicólogo asignado para el paciente
router.get('/psicologo-asignado', ChatController.obtenerPsicologoAsignado);

// Obtener trabajadores (psicólogos y recepcionistas) para el chat del administrador
router.get('/trabajadores', ChatController.obtenerTrabajadoresChat);

// Obtener personal (administradores y psicólogos) para el chat del recepcionista
router.get('/personal-recepcionista', ChatController.obtenerPersonalRecepcionistaChat);

// Obtener mensajes entre psicólogo y paciente
router.get('/mensajes/:pacienteId', ChatController.obtenerMensajes);

// Enviar mensaje
router.post('/enviar', ChatController.enviarMensaje);

// Marcar mensajes como leídos
router.put('/leidos/:pacienteId', ChatController.marcarComoLeidos);

// Obtener estadísticas del chat
router.get('/estadisticas', ChatController.obtenerEstadisticas);

export default router;
