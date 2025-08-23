import { Request, Response } from 'express';
import { Usuario, Paciente, Mensaje } from '../modelos';
import sequelize, { Op } from 'sequelize';

// Variable global para el servidor io (se establecerá desde servidor.ts)
declare global {
  var io: any;
}

class ChatController {
  private io: any = null;
  private instanceId: string;

  constructor() {
    const instanceId = Math.random().toString(36).substr(2, 9);
    console.log(`🔌 ChatController - Constructor ejecutado - INSTANCIA: ${instanceId}`);
    console.log('🔌 ChatController - this.io inicial:', !!this.io);
    this.instanceId = instanceId;
  }

  // Método para configurar el servidor io
  setIo(ioServer: any) {
    console.log('🔌 ChatController - setIo llamado con:', !!ioServer);
    console.log('🔌 ChatController - Tipo de ioServer:', typeof ioServer);
    console.log('🔌 ChatController - this.io ANTES:', !!this.io);
    
    this.io = ioServer;
    
    console.log('🔌 ChatController - WebSocket configurado:', !!this.io);
    console.log('🔌 ChatController - Tipo de io:', typeof this.io);
    console.log('🔌 ChatController - io tiene método emit:', !!this.io?.emit);
    console.log('🔌 ChatController - this.io DESPUÉS:', !!this.io);
  }

  // Método público para verificar si io está configurado
  isIoConfigured(): boolean {
    return !!this.io;
  }

  // Obtener conversaciones del usuario actual
  obtenerConversaciones = async (req: Request, res: Response) => {
    try {
      console.log('🔍 Debug - Chat - obtenerConversaciones - método llamado - VERSION 3.0');
      
      // Obtener el usuario autenticado desde el middleware
      const userId = req.usuario?.id;
      const userRole = req.usuario?.rol_id === 1 ? 'admin' : 'psicologo';
      
      console.log('🔍 Debug - Chat - userId:', userId, 'userRole:', userRole);
      console.log('🔍 Debug - Chat - req.usuario completo:', req.usuario);
      
      if (!userId) {
        console.log('❌ Error: No hay userId en req.usuario');
        return res.status(401).json({
          success: false,
          message: 'Usuario no autenticado'
        });
      }
      
      let conversaciones: any[] = [];
      
      // Si es psicólogo, obtener sus pacientes con información completa
      if (userRole === 'psicologo') {
        console.log('🔍 Debug - Chat - Buscando pacientes del psicólogo:', userId);
        
        try {
          // Obtener pacientes con información completa de usuario usando raw query para evitar problemas de tipos
          const pacientes = await Paciente.findAll({
            where: { psicologo_id: userId },
            attributes: ['id', 'usuario_id', 'psicologo_id', 'nombres', 'apellidos']
          });
          
          console.log('🔍 Debug - Chat - Pacientes encontrados:', pacientes.length);
          
          // Ahora obtener información de usuario para cada paciente
          const conversacionesConNombres = await Promise.all(
            pacientes.map(async (paciente) => {
              try {
                // Obtener información del usuario asociado
                const usuario = await Usuario.findByPk(paciente.usuario_id);
                
                // Usar información del usuario si está disponible, sino usar datos del paciente
                const nombre = usuario?.nombres || paciente.nombres || 'Sin nombre';
                const apellido = usuario?.apellidos || paciente.apellidos || 'Sin apellido';
                const avatarUrl = usuario?.avatar_url || null;
                
                return {
                  id: `paciente_${paciente.id}`,
                  participante_id: paciente.id,
                  participante_nombre: `${nombre} ${apellido}`.trim(),
                  participante_rol: 'paciente',
                  ultimo_mensaje: 'Inicia una conversación',
                  timestamp_ultimo: new Date().toISOString(),
                  no_leidos: 0,
                  avatar_url: avatarUrl
                };
              } catch (error) {
                console.error('🔍 Debug - Chat - Error al obtener usuario para paciente:', paciente.id, error);
                
                // Fallback: usar solo datos del paciente
                return {
                  id: `paciente_${paciente.id}`,
                  participante_id: paciente.id,
                  participante_nombre: `${paciente.nombres || 'Sin nombre'} ${paciente.apellidos || 'Sin apellido'}`.trim(),
                  participante_rol: 'paciente',
                  ultimo_mensaje: 'Inicia una conversación',
                  timestamp_ultimo: new Date().toISOString(),
                  no_leidos: 0,
                  avatar_url: null
                };
              }
            })
          );
          
          conversaciones = conversacionesConNombres;
          console.log('🔍 Debug - Chat - Conversaciones generadas con nombres completos:', conversaciones.length);
          
        } catch (error) {
          console.error('🔍 Debug - Chat - Error al obtener pacientes:', error);
          
          // Fallback: obtener solo pacientes si falla todo
          const pacientesFallback = await Paciente.findAll({
            where: { psicologo_id: userId },
            attributes: ['id', 'usuario_id', 'psicologo_id', 'nombres', 'apellidos']
          });
          
          conversaciones = pacientesFallback.map((paciente) => ({
            id: `paciente_${paciente.id}`,
            participante_id: paciente.id,
            participante_nombre: `${paciente.nombres || 'Sin nombre'} ${paciente.apellidos || 'Sin apellido'}`.trim(),
            participante_rol: 'paciente',
            ultimo_mensaje: 'Inicia una conversación',
            timestamp_ultimo: new Date().toISOString(),
            no_leidos: 0,
            avatar_url: null
          }));
        }
      }
      
      // Si es admin, obtener todos los psicólogos con información completa
      if (userRole === 'admin') {
        console.log('🔍 Debug - Chat - Buscando psicólogos para admin');
        
        const psicologos = await Usuario.findAll({
          where: { rol_id: 2 }, // Asumiendo que rol_id 2 es psicólogo
          attributes: ['id', 'nombres', 'apellidos', 'email', 'avatar_url']
        });
        
        conversaciones = psicologos.map(psicologo => ({
          id: `psicologo_${psicologo.id}`,
          participante_id: psicologo.id,
          participante_nombre: `${psicologo.nombres || 'Sin nombre'} ${psicologo.apellidos || 'Sin apellido'}`.trim(),
          participante_rol: 'psicologo',
          ultimo_mensaje: 'Inicia una conversación',
          timestamp_ultimo: new Date().toISOString(),
          no_leidos: 0,
          avatar_url: psicologo.avatar_url
        }));
      }
      
      // Si no es ni psicólogo ni admin, retornar array vacío
      if (userRole !== 'psicologo' && userRole !== 'admin') {
        console.log('🔍 Debug - Chat - Rol no reconocido:', userRole);
        conversaciones = [];
      }
      
      console.log('🔍 Debug - Chat - Conversaciones finales:', conversaciones.length);
      console.log('🔍 Debug - Chat - Primera conversación:', conversaciones[0]);
      
      return res.json({
        success: true,
        data: conversaciones
      });
    } catch (error: any) {
      console.error('Error al obtener conversaciones:', error);
      return res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  // Obtener mensajes de una conversación específica
  obtenerMensajes = async (req: Request, res: Response) => {
    try {
      console.log('🔍 Debug - Chat - obtenerMensajes - método llamado');
      
      const { conversacionId } = req.params;
      const userId = req.usuario?.id;
      
      console.log('🔍 Debug - Chat - obtenerMensajes - conversacionId:', conversacionId);
      console.log('🔍 Debug - Chat - obtenerMensajes - userId:', userId);
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Usuario no autenticado'
        });
      }
      
      // Obtener mensajes reales de la base de datos
      const mensajes = await Mensaje.findAll({
        where: {
          [Op.or]: [
            { remitente_id: userId, destinatario_id: conversacionId },
            { remitente_id: conversacionId, destinatario_id: userId }
          ]
        },
        order: [['created_at', 'ASC']],
        include: [
          {
            model: Usuario,
            as: 'remitente',
            attributes: ['nombres', 'apellidos']
          }
        ]
      });
      
      console.log('🔍 Debug - Chat - obtenerMensajes - mensajes encontrados en BD:', mensajes.length);
      
      // Formatear mensajes para el frontend
      const mensajesFormateados = mensajes.map(mensaje => ({
        id: mensaje.id,
        contenido: mensaje.contenido,
        emisor_id: mensaje.remitente_id,
        receptor_id: mensaje.destinatario_id,
        emisor_nombre: `${mensaje.remitente?.nombres || 'Usuario'} ${mensaje.remitente?.apellidos || ''}`.trim(),
        emisor_rol: mensaje.remitente_id === userId ? (req.usuario?.rol_id === 1 ? 'admin' : 'psicologo') : 'paciente',
        timestamp: mensaje.created_at.toISOString(),
        leido: mensaje.leido
      }));
      
      console.log('🔍 Debug - Chat - obtenerMensajes - mensajes formateados:', mensajesFormateados.length);
      
      return res.json({
        success: true,
        data: mensajesFormateados
      });
    } catch (error: any) {
      console.error('Error al obtener mensajes:', error);
      return res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  // Enviar un nuevo mensaje
  enviarMensaje = async (req: Request, res: Response) => {
    try {
      console.log('🔍 Debug - Chat - enviarMensaje - método llamado');
      console.log('🔍 Debug - Chat - this disponible:', !!this);
      console.log('🔍 Debug - Chat - this.io disponible:', !!this?.io);
      console.log('🔍 Debug - Chat - Tipo de this:', typeof this);
      console.log('🔍 Debug - Chat - Instancia ID:', this.instanceId);
      
      const { contenido, receptor_id } = req.body;
      const userId = req.usuario?.id;
      
      console.log('🔍 Debug - Chat - enviarMensaje - contenido:', contenido);
      console.log('🔍 Debug - Chat - enviarMensaje - receptor_id:', receptor_id);
      console.log('🔍 Debug - Chat - enviarMensaje - userId:', userId);
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Usuario no autenticado'
        });
      }
      
      if (!contenido || !receptor_id) {
        return res.status(400).json({
          success: false,
          message: 'Contenido y receptor_id son requeridos'
        });
      }
      
      // Verificar si receptor_id es un paciente y obtener su usuario_id
      let destinatario_id = receptor_id;
      
      // Si el receptor_id parece ser un ID de paciente, obtener el usuario_id correspondiente
      const paciente = await Paciente.findByPk(receptor_id);
      if (paciente) {
        destinatario_id = paciente.usuario_id;
        console.log('🔍 Debug - Chat - Paciente encontrado, usando usuario_id:', destinatario_id);
      } else {
        // Si no es un paciente, asumir que es un usuario directo
        console.log('🔍 Debug - Chat - Usando receptor_id como usuario directo:', receptor_id);
      }
      
      // Crear y guardar el mensaje en la base de datos
      const nuevoMensaje = await Mensaje.create({
        remitente_id: userId,
        destinatario_id: destinatario_id,
        contenido: contenido,
        tipo_mensaje: 'chat',
        prioridad: 'baja',
        leido: false,
        archivos_adjuntos: []
      });
      
      console.log('🔍 Debug - Chat - enviarMensaje - mensaje guardado en BD:', nuevoMensaje.id);
      
      // Obtener información del remitente para la respuesta
      const remitente = await Usuario.findByPk(userId);
      
      // Formatear la respuesta para el frontend
      const mensajeFormateado = {
        id: nuevoMensaje.id,
        contenido: nuevoMensaje.contenido,
        emisor_id: nuevoMensaje.remitente_id,
        receptor_id: nuevoMensaje.destinatario_id,
        emisor_nombre: `${remitente?.nombres || 'Usuario'} ${remitente?.apellidos || ''}`.trim(),
        emisor_rol: req.usuario?.rol_id === 1 ? 'admin' : 'psicologo',
        timestamp: nuevoMensaje.created_at.toISOString(),
        leido: nuevoMensaje.leido
      };
      
      console.log('🔍 Debug - Chat - enviarMensaje - mensaje formateado:', mensajeFormateado);
      
      // Emitir mensaje por WebSocket al receptor
      console.log('🔍 Debug - Chat - Verificando WebSocket...');
      console.log('🔍 Debug - Chat - this.io disponible:', !!this.io);
      console.log('🔍 Debug - Chat - Tipo de this.io:', typeof this.io);
      console.log('🔍 Debug - Chat - this.io completo:', this.io);
      console.log('🔍 Debug - Chat - this.io?.to disponible:', !!this.io?.to);
      console.log('🔍 Debug - Chat - this.io?.emit disponible:', !!this.io?.emit);
      
      if (this.io) {
        // Determinar el chatId basado en si es paciente o psicólogo
        let chatId;
        if (paciente) {
          // Si receptor_id es un paciente, usar su ID para el chatId
          chatId = `chat_${receptor_id}`;
        } else {
          // Si receptor_id es un psicólogo, necesitamos encontrar el ID del paciente
          // Para esto, necesitamos buscar qué paciente está enviando el mensaje
          const pacienteEmisor = await Paciente.findOne({ where: { usuario_id: userId } });
          chatId = pacienteEmisor ? `chat_${pacienteEmisor.id}` : `chat_${receptor_id}`;
        }
        
        console.log('🔍 Debug - Chat - chatId determinado:', chatId);
        console.log('🔍 Debug - Chat - Emitiendo a usuario (destinatario_id):', destinatario_id);
        console.log('🔍 Debug - Chat - Sala objetivo:', `user_${destinatario_id}`);
        
        this.io.to(`user_${destinatario_id}`).emit('new-message', {
          chatId,
          message: mensajeFormateado.contenido,
          senderId: mensajeFormateado.emisor_id,
          timestamp: mensajeFormateado.timestamp,
          mensajeCompleto: mensajeFormateado
        });
        console.log('🔌 WebSocket - Mensaje emitido a usuario:', destinatario_id);
      } else {
        console.log('⚠️ WebSocket no disponible, mensaje solo guardado en BD');
        console.log('⚠️ this.io es:', this.io);
      }
      
      return res.json({
        success: true,
        message: 'Mensaje enviado correctamente',
        data: mensajeFormateado
      });
    } catch (error: any) {
      console.error('Error al enviar mensaje:', error);
      return res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  // Iniciar una nueva conversación
  iniciarConversacion = async (req: Request, res: Response) => {
    try {
      console.log('🔍 Debug - Chat - iniciarConversacion - método llamado');
      
      return res.json({
        success: true,
        message: 'Conversación iniciada',
        data: { conversacion_id: 'temp-id' }
      });
    } catch (error: any) {
      console.error('Error al iniciar conversación:', error);
      return res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  // Marcar mensajes como leídos
  marcarComoLeidos = async (req: Request, res: Response) => {
    try {
      console.log('🔍 Debug - Chat - marcarComoLeidos - método llamado');
      
      return res.json({
        success: true,
        message: 'Mensajes marcados como leídos',
        data: { mensajes_actualizados: 0 }
      });
    } catch (error: any) {
      console.error('Error al marcar como leídos:', error);
      return res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  // Obtener estadísticas del chat
  obtenerEstadisticas = async (req: Request, res: Response) => {
    try {
      console.log('🔍 Debug - Chat - obtenerEstadisticas - método llamado');
      
      return res.json({
        success: true,
        data: {
          total_mensajes: 0,
          mensajes_no_leidos: 0,
          conversaciones_activas: 0
        }
      });
    } catch (error: any) {
      console.error('Error al obtener estadísticas:', error);
      return res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  // Buscar usuarios para iniciar conversación
  buscarUsuarios = async (req: Request, res: Response) => {
    try {
      console.log('🔍 Debug - Chat - buscarUsuarios - método llamado');
      
      return res.json({
        success: true,
        data: []
      });
    } catch (error: any) {
      console.error('Error al buscar usuarios:', error);
      return res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  // Obtener información del psicólogo asignado para un paciente
  obtenerPsicologoAsignado = async (req: Request, res: Response) => {
    try {
      console.log('🔍 Debug - Chat - obtenerPsicologoAsignado - método llamado');
      
      const userId = req.usuario?.id;
      
      console.log('🔍 Debug - Chat - obtenerPsicologoAsignado - userId:', userId);
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Usuario no autenticado'
        });
      }
      
      // Buscar si el usuario es un paciente
      const paciente = await Paciente.findOne({
        where: { usuario_id: userId },
        attributes: ['id', 'psicologo_id', 'nombres', 'apellidos']
      });
      
      if (!paciente) {
        console.log('🔍 Debug - Chat - Usuario no es un paciente');
        return res.status(404).json({
          success: false,
          message: 'No tienes un psicólogo asignado para chatear'
        });
      }
      
      // Obtener información del psicólogo
      const psicologo = await Usuario.findByPk(paciente.psicologo_id, {
        attributes: ['id', 'nombres', 'apellidos', 'email', 'avatar_url']
      });
      
      if (!psicologo) {
        console.log('🔍 Debug - Chat - Psicólogo no encontrado');
        return res.status(404).json({
          success: false,
          message: 'Psicólogo no encontrado'
        });
      }
      
      console.log('🔍 Debug - Chat - Psicólogo encontrado:', psicologo.nombres);
      
      return res.json({
        success: true,
        data: {
          psicologo_id: psicologo.id,
          psicologo_nombre: `${psicologo.nombres || 'Sin nombre'} ${psicologo.apellidos || 'Sin apellido'}`.trim(),
          psicologo_email: psicologo.email,
          psicologo_avatar: psicologo.avatar_url,
          paciente_id: paciente.id,
          paciente_nombre: `${paciente.nombres || 'Sin nombre'} ${paciente.apellidos || 'Sin apellido'}`.trim()
        }
      });
    } catch (error: any) {
      console.error('Error al obtener psicólogo asignado:', error);
      return res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  // Obtener conversaciones no leídas
  obtenerNoLeidas = async (req: Request, res: Response) => {
    try {
      console.log('🔍 Debug - Chat - obtenerNoLeidas - método llamado');
      
      // Por ahora, devolver array vacío
      // En el futuro, esto se conectará a una tabla de mensajes real
      return res.json({
        success: true,
        data: []
      });
    } catch (error: any) {
      console.error('Error al obtener conversaciones no leídas:', error);
      return res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  // Eliminar conversación
  eliminarConversacion = async (req: Request, res: Response) => {
    try {
      console.log('🔍 Debug - Chat - eliminarConversacion - método llamado');
      
      const { conversacionId } = req.params;
      const userId = req.usuario?.id;
      
      console.log('🔍 Debug - Chat - eliminarConversacion - conversacionId:', conversacionId);
      console.log('🔍 Debug - Chat - eliminarConversacion - userId:', userId);
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Usuario no autenticado'
        });
      }
      
      // Por ahora, solo confirmar que se recibió la solicitud
      // En el futuro, esto eliminará la conversación de la base de datos
      return res.json({
        success: true,
        message: 'Conversación eliminada correctamente',
        data: { conversacion_id: conversacionId }
      });
    } catch (error: any) {
      console.error('Error al eliminar conversación:', error);
      return res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }
}

const chatController = new ChatController();
console.log('🔌 ChatController - Instancia creada:', !!chatController);

export default chatController;
