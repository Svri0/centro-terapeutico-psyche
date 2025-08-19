import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { verificarToken } from '../middleware/auth.middleware';

interface UsuarioConectado {
  socketId: string;
  usuarioId: string;
  tipoUsuario: 'psicologo' | 'paciente';
}

export class ChatSocketService {
  private io: SocketIOServer;
  private usuariosConectados: Map<string, UsuarioConectado> = new Map();

  constructor(server: HTTPServer) {
    this.io = new SocketIOServer(server, {
      cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"]
      }
    });

    this.configurarSocket();
  }

  private configurarSocket() {
    this.io.use((socket, next) => {
      // Middleware de autenticación para WebSockets
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization;
      
      if (!token) {
        return next(new Error('Token requerido'));
      }

      try {
        // Verificar token (simplificado para WebSocket)
        const tokenClean = token.replace('Bearer ', '');
        // Aquí podrías usar JWT.verify si quieres verificar el token
        // Por ahora, solo verificamos que exista
        if (tokenClean) {
          next();
        } else {
          next(new Error('Token inválido'));
        }
      } catch (error) {
        next(new Error('Token inválido'));
      }
    });

    this.io.on('connection', (socket: Socket) => {
      console.log('🔌 Usuario conectado:', socket.id);

      // Unirse a sala de chat
      socket.on('unirse-chat', (data: { chatId: string; usuarioId: string; tipoUsuario: 'psicologo' | 'paciente' }) => {
        const { chatId, usuarioId, tipoUsuario } = data;
        
        // Guardar información del usuario conectado
        this.usuariosConectados.set(socket.id, {
          socketId: socket.id,
          usuarioId,
          tipoUsuario
        });

        // Unirse a la sala del chat
        socket.join(`chat:${chatId}`);
        console.log(`🔌 Usuario ${usuarioId} (${tipoUsuario}) se unió al chat ${chatId}`);
      });

      // Manejar mensaje nuevo
      socket.on('mensaje-nuevo', (data: { chatId: string; mensaje: any }) => {
        const { chatId, mensaje } = data;
        
        // Emitir mensaje a todos los usuarios en el chat
        this.io.to(`chat:${chatId}`).emit('mensaje-recibido', {
          chatId,
          mensaje
        });
        
        console.log(`📨 Mensaje enviado al chat ${chatId}:`, mensaje.contenido);
      });

      // Manejar escritura
      socket.on('escribiendo', (data: { chatId: string; usuarioId: string; escribiendo: boolean }) => {
        const { chatId, usuarioId, escribiendo } = data;
        
        // Emitir estado de escritura a otros usuarios en el chat
        socket.to(`chat:${chatId}`).emit('usuario-escribiendo', {
          chatId,
          usuarioId,
          escribiendo
        });
      });

      // Manejar desconexión
      socket.on('disconnect', () => {
        const usuario = this.usuariosConectados.get(socket.id);
        if (usuario) {
          console.log(`🔌 Usuario ${usuario.usuarioId} desconectado del chat`);
          this.usuariosConectados.delete(socket.id);
        }
        console.log('🔌 Usuario desconectado:', socket.id);
      });
    });
  }

  // Método para emitir mensaje desde el controlador
  public emitirMensajeNuevo(chatId: string, mensaje: any) {
    console.log('🔌 WebSocket: Emitiendo mensaje al chat:', chatId);
    console.log('🔌 WebSocket: Mensaje completo:', JSON.stringify(mensaje, null, 2));
    console.log('🔌 WebSocket: Usuarios en sala:', this.io.sockets.adapter.rooms.get(`chat:${chatId}`)?.size || 0);
    
    // Emitir a TODOS los usuarios conectados para debugging
    this.io.emit('mensaje-recibido', {
      chatId,
      mensaje
    });
    
    // También emitir solo a la sala específica
    this.io.to(`chat:${chatId}`).emit('mensaje-recibido', {
      chatId,
      mensaje
    });
    
    console.log('🔌 WebSocket: Mensaje emitido correctamente');
  }

  // Método para emitir actualización de chat
  public emitirChatActualizado(chatId: string, datosChat: any) {
    this.io.to(`chat:${chatId}`).emit('chat-actualizado', {
      chatId,
      datosChat
    });
  }

  // Obtener instancia de Socket.IO
  public getIO() {
    return this.io;
  }
}
