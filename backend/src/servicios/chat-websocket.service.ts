import { Server as SocketIOServer, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import MensajeChat from '../modelos/MensajeChat';
import Usuario from '../modelos/Usuario';
import Paciente from '../modelos/Paciente';
import TokensMensajesPaciente from '../modelos/TokensMensajesPaciente';
import ConfiguracionSistema from '../modelos/ConfiguracionSistema';
import { Op } from 'sequelize';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  userRole?: string;
}

export class ChatWebSocketService {
  private io: SocketIOServer;
  private connectedUsers: Map<string, string> = new Map(); // userId -> socketId

  constructor(io: SocketIOServer) {
    this.io = io;
    this.setupSocketHandlers();
  }

  private setupSocketHandlers() {
    this.io.on('connection', (socket: AuthenticatedSocket) => {
      console.log('🔌 Usuario conectado al chat:', socket.id);

      // Middleware de autenticación
      socket.on('authenticate', async (data: { token: string }) => {
        try {
          const decoded = jwt.verify(
            data.token,
            process.env.JWT_SECRET || 'tu_secreto_super_seguro_para_jwt_tokens_2024'
          ) as any;
          console.log('🔍 Token decodificado:', decoded);
          socket.userId = decoded.id;
          
          // Mapear rol_id al nombre del rol
          const rolMap: { [key: number]: string } = {
            1: 'admin',
            2: 'psicologo', 
            3: 'recepcionista',
            4: 'paciente'
          };
          socket.userRole = rolMap[decoded.rol_id] || 'unknown';
          console.log('🔍 Rol asignado al socket:', socket.userRole);

          // Registrar usuario conectado
          this.connectedUsers.set(decoded.id, socket.id);
          
          console.log(`✅ Usuario autenticado: ${decoded.nombres} (${socket.userRole})`);
          
          // Enviar confirmación de autenticación
          socket.emit('authenticated', { 
            success: true, 
            userId: decoded.id,
            userRole: socket.userRole 
          });

          // Si es psicólogo, enviar lista de pacientes
          if (socket.userRole === 'psicologo') {
            await this.enviarPacientesDisponibles(socket);
          }

        } catch (error) {
          console.error('❌ Error de autenticación:', error);
          socket.emit('authentication_error', { message: 'Token inválido' });
        }
      });

      // Manejar envío de mensajes
      socket.on('enviar_mensaje', async (data: {
        contenido: string;
        remitente_id: string;
        destinatario_id: string;
        tipo: 'psicologo' | 'paciente' | 'admin' | 'recepcionista';
      }) => {
        try {
          if (!socket.userId) {
            socket.emit('error', { message: 'Usuario no autenticado' });
            return;
          }

          // Verificar que el remitente sea el usuario autenticado
          if (data.remitente_id !== socket.userId) {
            socket.emit('error', { message: 'No autorizado para enviar este mensaje' });
            return;
          }

          // Validaciones para pacientes
          if (data.tipo === 'paciente') {
            // Verificar si las respuestas de pacientes están desactivadas (tolerante a errores)
            let respuestasDesactivadasFlag = false;
            try {
              const cfg = await ConfiguracionSistema.findOne({
                where: { clave: 'chat.respuestas_pacientes_desactivadas', activo: true }
              });
              respuestasDesactivadasFlag = !!cfg && cfg.valor === 'true';
            } catch (e) {
              console.warn('⚠️ Configuración chat.respuestas_pacientes_desactivadas no disponible. Continuando por defecto (habilitado).');
            }

            if (respuestasDesactivadasFlag) {
              socket.emit('error', { message: 'Las respuestas de pacientes están desactivadas' });
              return;
            }

            // Verificar si el sistema de tokens está habilitado ANTES de tocar la tabla (tolerante a errores)
            let tokensHabilitadosFlag = false;
            try {
              const cfgTokens = await ConfiguracionSistema.findOne({
                where: { clave: 'chat.tokens_mensajes_habilitados', activo: true }
              });
              tokensHabilitadosFlag = !!cfgTokens && cfgTokens.valor === 'true';
            } catch (e) {
              console.warn('⚠️ Configuración chat.tokens_mensajes_habilitados no disponible. Continuando sin tokens.');
            }

            if (tokensHabilitadosFlag) {
              try {
                // Verificar tokens de mensajes
                const paciente = await Paciente.findOne({
                  where: { usuario_id: data.remitente_id }
                });

                if (paciente) {
                  let tokensMensajes = await TokensMensajesPaciente.findOne({
                    where: { paciente_id: paciente.id, activo: true }
                  });

                  // Crear registro si no existe
                  if (!tokensMensajes) {
                    const tokensPorDefectoCfg = await ConfiguracionSistema.findOne({
                      where: { clave: 'chat.tokens_mensajes_por_defecto', activo: true }
                    });
                    const parsedDefault = Number(tokensPorDefectoCfg?.valor);
                    const tokensDefault = Number.isFinite(parsedDefault) && parsedDefault >= 0 ? parsedDefault : 0;
                    
                    tokensMensajes = await TokensMensajesPaciente.create({
                      paciente_id: paciente.id,
                      tokens_disponibles: tokensDefault,
                      tokens_usados: 0,
                      periodo_reset: 'ilimitado',
                      activo: true
                    });
                  }

                // REGLA: si tokens_disponibles > 0, se limita por contador; 0 = ilimitado
                // Reset por periodo (opcional) solo si no es 'ilimitado'
                if (tokensMensajes.periodo_reset !== 'ilimitado') {
                  const ahora = new Date();
                  let necesitaReset = false;

                  if (tokensMensajes.fecha_ultimo_reset) {
                    const fechaReset = new Date(tokensMensajes.fecha_ultimo_reset);
                    const diffDias = Math.floor((ahora.getTime() - fechaReset.getTime()) / (1000 * 60 * 60 * 24));

                    switch (tokensMensajes.periodo_reset) {
                      case 'diario':
                        necesitaReset = diffDias >= 1;
                        break;
                      case 'semanal':
                        necesitaReset = diffDias >= 7;
                        break;
                      case 'mensual':
                        necesitaReset = diffDias >= 30;
                        break;
                    }
                  } else {
                    necesitaReset = true;
                  }

                  if (necesitaReset) {
                    tokensMensajes.tokens_usados = 0;
                    tokensMensajes.fecha_ultimo_reset = ahora;
                    await tokensMensajes.save();
                  }
                }

                // Enforzar límite fijo si tokens_disponibles > 0
                if (tokensMensajes.tokens_disponibles > 0) {
                  const tokensRestantes = tokensMensajes.tokens_disponibles - tokensMensajes.tokens_usados;
                  if (tokensRestantes <= 0) {
                    socket.emit('error', { message: 'No tienes tokens disponibles para enviar mensajes' });
                    return;
                  }
                }

                // Consumir token solo si hay límite (>0)
                if (tokensMensajes.tokens_disponibles > 0) {
                  tokensMensajes.tokens_usados += 1;
                  await tokensMensajes.save();
                }
                }
              } catch (tokenErr: any) {
                console.error('⚠️ Error en validación de tokens, se permite el mensaje:', tokenErr?.message || tokenErr);
                // Permitir el mensaje aunque falle la validación de tokens (tolerancia a migraciones/ausencias)
              }
            }
          }

          // Crear mensaje en la base de datos
          const mensaje = await MensajeChat.create({
            contenido: data.contenido,
            remitente_id: data.remitente_id,
            destinatario_id: data.destinatario_id,
            tipo: data.tipo,
            leido: false
          });

          // Obtener información del remitente
          const remitente = await Usuario.findByPk(data.remitente_id, {
            attributes: ['id', 'nombres', 'apellidos', 'avatar_url']
          });

          const mensajeCompleto = {
            ...mensaje.toJSON(),
            remitente: remitente
          };

          // Enviar confirmación al remitente
          socket.emit('mensaje_enviado', mensajeCompleto);

          // Enviar mensaje al destinatario si está conectado
          const destinatarioSocketId = this.connectedUsers.get(data.destinatario_id);
          if (destinatarioSocketId) {
            this.io.to(destinatarioSocketId).emit('mensaje_recibido', mensajeCompleto);
          }

          console.log(`📤 Mensaje enviado de ${data.remitente_id} a ${data.destinatario_id}`);

        } catch (error: any) {
          console.error('❌ Error al enviar mensaje:', error);
          socket.emit('error', { message: 'Error al enviar mensaje', detail: error?.message || String(error) });
        }
      });

      // Cargar mensajes de una conversación
      socket.on('cargar_mensajes', async (data: {
        paciente_id?: string;
        psicologo_id?: string;
        trabajador_id?: string;
        admin_id?: string;
        recepcionista_id?: string;
        persona_id?: string;
      }) => {
        try {
          console.log('🔍 EVENTO cargar_mensajes recibido:', data);
          console.log('🔍 Usuario autenticado:', socket.userId);
          console.log('🔍 Rol del usuario:', socket.userRole);
          
          if (!socket.userId) {
            console.log('❌ Usuario no autenticado');
            socket.emit('error', { message: 'Usuario no autenticado' });
            return;
          }

          let mensajes;

          console.log('🔍 Datos recibidos:', data);
          console.log('🔍 Usuario role:', socket.userRole);
          console.log('🔍 Usuario ID:', socket.userId);

          // Manejar diferentes tipos de conversaciones
          if (socket.userRole === 'admin' && data.trabajador_id && data.admin_id) {
            // Chat del administrador con trabajador
            console.log('🔍 Admin cargando mensajes:', data);
            if (data.admin_id !== socket.userId) {
              socket.emit('error', { message: 'No autorizado' });
              return;
            }

            mensajes = await MensajeChat.findAll({
              where: {
                [Op.or]: [
                  { remitente_id: data.admin_id, destinatario_id: data.trabajador_id },
                  { remitente_id: data.trabajador_id, destinatario_id: data.admin_id }
                ]
              },
              order: [['created_at', 'ASC']],
              limit: 100
            });
            console.log('📨 Mensajes encontrados para admin:', mensajes.length);
          } else if (socket.userRole === 'psicologo' && data.psicologo_id && data.paciente_id) {
            // Chat del psicólogo con paciente
            if (data.psicologo_id !== socket.userId) {
              socket.emit('error', { message: 'No autorizado' });
              return;
            }

            mensajes = await MensajeChat.findAll({
              where: {
                [Op.or]: [
                  { remitente_id: data.psicologo_id, destinatario_id: data.paciente_id },
                  { remitente_id: data.paciente_id, destinatario_id: data.psicologo_id }
                ]
              },
              order: [['created_at', 'ASC']],
              limit: 100
            });
          } else if (socket.userRole === 'paciente' && data.paciente_id) {
            // Chat del paciente
            if (data.paciente_id !== socket.userId) {
              socket.emit('error', { message: 'No autorizado' });
              return;
            }

            mensajes = await MensajeChat.findAll({
              where: {
                [Op.or]: [
                  { remitente_id: data.psicologo_id, destinatario_id: data.paciente_id },
                  { remitente_id: data.paciente_id, destinatario_id: data.psicologo_id }
                ]
              },
              order: [['created_at', 'ASC']],
              limit: 100
            });
          } else if (socket.userRole === 'recepcionista' && data.recepcionista_id && data.persona_id) {
            // Chat del recepcionista con personal (admin o psicólogo)
            if (data.recepcionista_id !== socket.userId) {
              socket.emit('error', { message: 'No autorizado' });
              return;
            }

            mensajes = await MensajeChat.findAll({
              where: {
                [Op.or]: [
                  { remitente_id: data.recepcionista_id, destinatario_id: data.persona_id },
                  { remitente_id: data.persona_id, destinatario_id: data.recepcionista_id }
                ]
              },
              order: [['created_at', 'ASC']],
              limit: 100
            });
          } else {
            socket.emit('error', { message: 'Parámetros inválidos' });
            return;
          }

          socket.emit('mensajes_cargados', mensajes);

        } catch (error) {
          console.error('❌ Error al cargar mensajes:', error);
          socket.emit('error', { message: 'Error al cargar mensajes' });
        }
      });

      // Marcar mensajes como leídos
      socket.on('marcar_como_leidos', async (data: {
        paciente_id?: string;
        psicologo_id?: string;
        trabajador_id?: string;
        admin_id?: string;
        recepcionista_id?: string;
        persona_id?: string;
      }) => {
        try {
          if (!socket.userId) {
            socket.emit('error', { message: 'No autorizado' });
            return;
          }

          // Manejar diferentes tipos de usuarios
          if (socket.userRole === 'admin' && data.trabajador_id && data.admin_id) {
            if (data.admin_id !== socket.userId) {
              socket.emit('error', { message: 'No autorizado' });
              return;
            }

            // Marcar mensajes del trabajador como leídos por el admin
            await MensajeChat.update(
              { leido: true },
              {
                where: {
                  remitente_id: data.trabajador_id,
                  destinatario_id: data.admin_id,
                  leido: false
                }
              }
            );
          } else if (socket.userRole === 'psicologo' && data.psicologo_id && data.paciente_id) {
            if (data.psicologo_id !== socket.userId) {
              socket.emit('error', { message: 'No autorizado' });
              return;
            }

            // Marcar mensajes del paciente como leídos por el psicólogo
            await MensajeChat.update(
              { leido: true },
              {
                where: {
                  remitente_id: data.paciente_id,
                  destinatario_id: data.psicologo_id,
                  leido: false
                }
              }
            );
          } else if (socket.userRole === 'recepcionista' && data.recepcionista_id && data.persona_id) {
            if (data.recepcionista_id !== socket.userId) {
              socket.emit('error', { message: 'No autorizado' });
              return;
            }

            // Marcar mensajes de la persona como leídos por el recepcionista
            await MensajeChat.update(
              { leido: true },
              {
                where: {
                  remitente_id: data.persona_id,
                  destinatario_id: data.recepcionista_id,
                  leido: false
                }
              }
            );
          } else if (socket.userRole === 'paciente' && data.paciente_id && data.psicologo_id) {
            // Chat del paciente - marcar mensajes del psicólogo como leídos
            if (data.paciente_id !== socket.userId) {
              socket.emit('error', { message: 'No autorizado' });
              return;
            }

            // Marcar mensajes del psicólogo como leídos por el paciente
            await MensajeChat.update(
              { leido: true },
              {
                where: {
                  remitente_id: data.psicologo_id,
                  destinatario_id: data.paciente_id,
                  leido: false
                }
              }
            );
          } else {
            socket.emit('error', { message: 'Parámetros inválidos' });
            return;
          }

          console.log(`✅ Mensajes marcados como leídos por ${socket.userId}`);

        } catch (error) {
          console.error('❌ Error al marcar mensajes como leídos:', error);
          socket.emit('error', { message: 'Error al marcar mensajes como leídos' });
        }
      });

      // Manejar desconexión
      socket.on('disconnect', () => {
        if (socket.userId) {
          this.connectedUsers.delete(socket.userId);
          console.log(`🔌 Usuario desconectado del chat: ${socket.userId}`);
        }
      });
    });
  }

  private async enviarPacientesDisponibles(socket: AuthenticatedSocket) {
    try {
      if (!socket.userId || socket.userRole !== 'psicologo') return;

      // Obtener pacientes del psicólogo
      const pacientes = await Paciente.findAll({
        where: {
          psicologo_id: socket.userId,
          estado: 'activo'
        },
        attributes: ['id', 'usuario_id', 'psicologo_id']
      });

      // Obtener información de mensajes para cada paciente
      const pacientesConMensajes = await Promise.all(
        pacientes.map(async (paciente) => {
          // Obtener información del usuario
          const usuario = await Usuario.findByPk(paciente.usuario_id, {
            attributes: ['id', 'nombres', 'apellidos', 'avatar_url']
          });

          // Obtener último mensaje
          const ultimoMensaje = await MensajeChat.findOne({
            where: {
              [Op.or]: [
                { remitente_id: socket.userId, destinatario_id: paciente.usuario_id },
                { remitente_id: paciente.usuario_id, destinatario_id: socket.userId }
              ]
            },
            order: [['created_at', 'DESC']]
          });

          // Contar mensajes no leídos del paciente hacia el psicólogo
          const mensajesNoLeidos = await MensajeChat.count({
            where: {
              remitente_id: paciente.usuario_id,
              destinatario_id: socket.userId,
              leido: false
            }
          });

          return {
            id: paciente.usuario_id,
            nombres: usuario?.nombres || '',
            apellidos: usuario?.apellidos || '',
            avatar_url: usuario?.avatar_url,
            ultimo_mensaje: ultimoMensaje?.contenido,
            ultimo_mensaje_timestamp: ultimoMensaje?.created_at,
            mensajes_no_leidos: mensajesNoLeidos
          };
        })
      );

      socket.emit('pacientes_disponibles', pacientesConMensajes);

    } catch (error) {
      console.error('❌ Error al enviar pacientes disponibles:', error);
    }
  }

  // Método para enviar notificación a un usuario específico
  public enviarNotificacion(userId: string, evento: string, datos: any) {
    const socketId = this.connectedUsers.get(userId);
    if (socketId) {
      this.io.to(socketId).emit(evento, datos);
    }
  }

  // Método para obtener usuarios conectados
  public getUsuariosConectados(): string[] {
    return Array.from(this.connectedUsers.keys());
  }

  // Método para verificar si un usuario está conectado
  public isUsuarioConectado(userId: string): boolean {
    return this.connectedUsers.has(userId);
  }
}
