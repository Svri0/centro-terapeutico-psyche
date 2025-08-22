import express from 'express';
import chatController from '../controladores/chat.controlador';
import { verificarToken } from '../middleware/auth.middleware';

const router = express.Router();

// Aplicar middleware de autenticación a todas las rutas
router.use(verificarToken);

// Obtener conversaciones del usuario actual
router.get('/conversaciones', chatController.obtenerConversaciones);

// Obtener mensajes de una conversación específica
router.get('/conversaciones/:conversacionId/mensajes', chatController.obtenerMensajes);

// Enviar un nuevo mensaje
router.post('/mensajes', chatController.enviarMensaje);

// Iniciar una nueva conversación
router.post('/conversaciones', chatController.iniciarConversacion);

// Marcar mensajes como leídos
router.put('/conversaciones/:conversacionId/leer', chatController.marcarComoLeidos);

// Obtener estadísticas del chat
router.get('/estadisticas', chatController.obtenerEstadisticas);

// Buscar usuarios para iniciar conversación
router.get('/usuarios/buscar', chatController.buscarUsuarios);

export default router;
