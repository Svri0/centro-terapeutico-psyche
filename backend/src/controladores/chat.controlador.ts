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
                
                // OBTENER EL ÚLTIMO MENSAJE REAL de esta conversación
                const ultimoMensaje = await Mensaje.findOne({
                  where: {
                    [Op.or]: [
                      { remitente_id: userId, destinatario_id: paciente.usuario_id },
                      { remitente_id: paciente.usuario_id, destinatario_id: userId }
                    ]
                  },
                  order: [['created_at', 'DESC']]
                });
                
                // Usar información del usuario si está disponible, sino usar datos del paciente
                const nombre = usuario?.nombres || paciente.nombres || 'Sin nombre';
                const apellido = usuario?.apellidos || paciente.apellidos || 'Sin apellido';
                const avatarUrl = usuario?.avatar_url || null;
                
                // Determinar el texto del último mensaje
                let ultimoMensajeTexto = 'Inicia una conversación';
                let timestampUltimo = new Date().toISOString();
                
                if (ultimoMensaje) {
                  ultimoMensajeTexto = ultimoMensaje.contenido;
                  timestampUltimo = ultimoMensaje.created_at.toISOString();
                  console.log('🔍 Debug - Chat - Último mensaje para', nombre, ':', ultimoMensajeTexto);
                }
                
                return {
                  id: `paciente_${paciente.id}`,
                  participante_id: paciente.id,
                  participante_nombre: `${nombre} ${apellido}`.trim(),
                  participante_rol: 'paciente',
                  ultimo_mensaje: ultimoMensajeTexto,
                  timestamp_ultimo: timestampUltimo,
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
          
          conversaciones = await Promise.all(pacientesFallback.map(async (paciente) => {
            // OBTENER EL ÚLTIMO MENSAJE REAL de esta conversación
            const ultimoMensaje = await Mensaje.findOne({
              where: {
                [Op.or]: [
                  { remitente_id: userId, destinatario_id: paciente.usuario_id },
                  { remitente_id: paciente.usuario_id, destinatario_id: userId }
                ]
              },
              order: [['created_at', 'DESC']]
            });
            
            let ultimoMensajeTexto = 'Inicia una conversación';
            let timestampUltimo = new Date().toISOString();
            
            if (ultimoMensaje) {
              ultimoMensajeTexto = ultimoMensaje.contenido;
              timestampUltimo = ultimoMensaje.created_at.toISOString();
            }
            
            return {
              id: `paciente_${paciente.id}`,
              participante_id: paciente.id,
              participante_nombre: `${paciente.nombres || 'Sin nombre'} ${paciente.apellidos || 'Sin apellido'}`.trim(),
              participante_rol: 'paciente',
              ultimo_mensaje: ultimoMensajeTexto,
              timestamp_ultimo: timestampUltimo,
              no_leidos: 0,
              avatar_url: null
            };
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
        
        conversaciones = await Promise.all(psicologos.map(async (psicologo) => {
          // OBTENER EL ÚLTIMO MENSAJE REAL de esta conversación
          const ultimoMensaje = await Mensaje.findOne({
            where: {
              [Op.or]: [
                { remitente_id: userId, destinatario_id: psicologo.id },
                { remitente_id: psicologo.id, destinatario_id: userId }
              ]
            },
            order: [['created_at', 'DESC']]
          });
          
          let ultimoMensajeTexto = 'Inicia una conversación';
          let timestampUltimo = new Date().toISOString();
          
          if (ultimoMensaje) {
            ultimoMensajeTexto = ultimoMensaje.contenido;
            timestampUltimo = ultimoMensaje.created_at.toISOString();
          }
          
          return {
            id: `psicologo_${psicologo.id}`,
            participante_id: psicologo.id,
            participante_nombre: `${psicologo.nombres || 'Sin nombre'} ${psicologo.apellidos || 'Sin apellido'}`.trim(),
            participante_rol: 'psicologo',
            ultimo_mensaje: ultimoMensajeTexto,
            timestamp_ultimo: timestampUltimo,
            no_leidos: 0,
            avatar_url: psicologo.avatar_url
          };
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
      
      // CONVERTIR conversacionId a usuario_id si es necesario
      let usuarioDestinatario = conversacionId;
      
      // Si conversacionId parece ser un ID de paciente, obtener su usuario_id
      try {
        const paciente = await Paciente.findByPk(conversacionId);
        if (paciente) {
          usuarioDestinatario = paciente.usuario_id;
          console.log('🔍 Debug - Chat - Paciente encontrado, usando usuario_id:', usuarioDestinatario);
        } else {
          console.log('🔍 Debug - Chat - conversacionId no es un paciente, usando como usuario directo');
        }
      } catch (error) {
        console.log('🔍 Debug - Chat - Error al buscar paciente, usando conversacionId como usuario directo');
      }
      
      console.log('🔍 Debug - Chat - usuarioDestinatario final:', usuarioDestinatario);
      
      // Obtener mensajes reales de la base de datos
      const mensajes = await Mensaje.findAll({
        where: {
          [Op.or]: [
            { remitente_id: userId, destinatario_id: usuarioDestinatario },
            { remitente_id: usuarioDestinatario, destinatario_id: userId }
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
      console.log('🔍 Debug - Chat - Query ejecutada para userId:', userId, 'y usuarioDestinatario:', usuarioDestinatario);
      
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

  // Obtener configuración del chat para un paciente específico
  obtenerConfiguracionChat = async (req: Request, res: Response) => {
    try {
      console.log('🔍 Debug - Chat - obtenerConfiguracionChat - método llamado');
      
      const { pacienteId } = req.params;
      const userId = req.usuario?.id;
      
      console.log('🔍 Debug - Chat - obtenerConfiguracionChat - pacienteId:', pacienteId);
      console.log('🔍 Debug - Chat - obtenerConfiguracionChat - userId:', userId);
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Usuario no autenticado'
        });
      }

      // Por ahora, retornar configuración por defecto
      // En el futuro, esto se conectará a una tabla de configuración
      const configuracion = {
        pacienteId,
        tema: 'default',
        ultimaModificacion: new Date().toISOString()
      };
      
      console.log('🔍 Debug - Chat - Configuración retornada:', configuracion);
      
      return res.json({
        success: true,
        data: configuracion
      });
    } catch (error: any) {
      console.error('Error al obtener configuración del chat:', error);
      return res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  // Cambiar tema del chat para un paciente específico
  cambiarTemaChat = async (req: Request, res: Response) => {
    try {
      console.log('🔍 Debug - Chat - cambiarTemaChat - método llamado');
      
      const { pacienteId } = req.params;
      const { tema } = req.body;
      const userId = req.usuario?.id;
      
      console.log('🔍 Debug - Chat - cambiarTemaChat - pacienteId:', pacienteId);
      console.log('🔍 Debug - Chat - cambiarTemaChat - tema:', tema);
      console.log('🔍 Debug - Chat - cambiarTemaChat - userId:', userId);
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Usuario no autenticado'
        });
      }

      if (!tema) {
        return res.status(400).json({
          success: false,
          message: 'Tema es requerido'
        });
      }

      // Por ahora, solo confirmar que se recibió la solicitud
      // En el futuro, esto se guardará en una tabla de configuración
      console.log('🔍 Debug - Chat - Tema cambiado a:', tema, 'para paciente:', pacienteId);
      
      return res.json({
        success: true,
        message: 'Tema del chat cambiado correctamente',
        data: {
          pacienteId,
          tema,
          ultimaModificacion: new Date().toISOString()
        }
      });
    } catch (error: any) {
      console.error('Error al cambiar tema del chat:', error);
      return res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  // Borrar completamente el chat de un paciente
  borrarChatCompleto = async (req: Request, res: Response) => {
    try {
      console.log('🔍 Debug - Chat - borrarChatCompleto - método llamado');
      
      const { pacienteId } = req.params;
      const userId = req.usuario?.id;
      
      console.log('🔍 Debug - Chat - borrarChatCompleto - pacienteId:', pacienteId);
      console.log('🔍 Debug - Chat - borrarChatCompleto - userId:', userId);
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Usuario no autenticado'
        });
      }

      // Verificar que el usuario sea psicólogo o admin
      const userRole = req.usuario?.rol_id === 1 ? 'admin' : 'psicologo';
      if (userRole !== 'psicologo' && userRole !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'No tienes permisos para borrar chats'
        });
      }

      // Obtener el usuario_id del paciente
      let usuarioDestinatario = pacienteId;
      try {
        const paciente = await Paciente.findByPk(pacienteId);
        if (paciente) {
          usuarioDestinatario = paciente.usuario_id;
          console.log('🔍 Debug - Chat - Paciente encontrado, usando usuario_id:', usuarioDestinatario);
        }
      } catch (error) {
        console.log('🔍 Debug - Chat - Error al buscar paciente, usando pacienteId como usuario directo');
      }

      // BORRAR TODOS LOS MENSAJES de esta conversación
      const mensajesBorrados = await Mensaje.destroy({
        where: {
          [Op.or]: [
            { remitente_id: userId, destinatario_id: usuarioDestinatario },
            { remitente_id: usuarioDestinatario, destinatario_id: userId }
          ]
        }
      });

      console.log('🔍 Debug - Chat - Mensajes borrados:', mensajesBorrados);
      
      // Emitir evento WebSocket para notificar al otro usuario que el chat fue borrado
      if (this.io) {
        this.io.to(`user_${usuarioDestinatario}`).emit('chat-borrado', {
          mensaje: 'El chat ha sido borrado por el psicólogo',
          timestamp: new Date().toISOString()
        });
        console.log('🔌 WebSocket - Evento chat-borrado emitido a usuario:', usuarioDestinatario);
      }

      return res.json({
        success: true,
        message: 'Chat borrado completamente',
        data: {
          pacienteId,
          mensajesBorrados,
          timestamp: new Date().toISOString()
        }
      });
    } catch (error: any) {
      console.error('Error al borrar chat completo:', error);
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
