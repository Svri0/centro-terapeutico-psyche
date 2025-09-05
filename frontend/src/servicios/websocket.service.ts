import { io, Socket } from 'socket.io-client';

class WebSocketService {
  private socket: Socket | null = null;
  private isConnected = false;

  // Conectar al servidor WebSocket
  connect() {
    if (this.socket && this.isConnected) {
      console.log('🔌 WebSocket ya está conectado');
      return;
    }

    try {
      this.socket = io('http://localhost:3002', {
        transports: ['websocket'],
        autoConnect: true,
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5
      });

      this.socket.on('connect', () => {
        console.log('🔌 WebSocket conectado:', this.socket?.id);
        this.isConnected = true;
      });

      this.socket.on('disconnect', () => {
        console.log('🔌 WebSocket desconectado');
        this.isConnected = false;
      });

      this.socket.on('connect_error', (error) => {
        console.error('🔌 Error de conexión WebSocket:', error);
        this.isConnected = false;
      });

    } catch (error) {
      console.error('🔌 Error al conectar WebSocket:', error);
    }
  }

  // Desconectar WebSocket
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      console.log('🔌 WebSocket desconectado manualmente');
    }
  }

  // Unir usuario a sala personal
  joinUser(userId: string) {
    if (this.socket && this.isConnected) {
      this.socket.emit('join-user', userId);
      console.log(`👤 Usuario ${userId} unido a sala personal`);
    }
  }

  // Unir a sala de chat
  joinChat(chatId: string) {
    if (this.socket && this.isConnected) {
      this.socket.emit('join-chat', chatId);
      console.log(`💬 Unido al chat: ${chatId}`);
    }
  }

  // Enviar mensaje
  sendMessage(chatId: string, message: string, senderId: string) {
    if (this.socket && this.isConnected) {
      this.socket.emit('send-message', {
        chatId,
        message,
        senderId
      });
      console.log(`📨 Mensaje enviado en chat ${chatId}:`, message);
    }
  }

  // Escuchar nuevos mensajes
  onNewMessage(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on('new-message', callback);
    }
  }

  // Escuchar conexión
  onConnect(callback: () => void) {
    if (this.socket) {
      this.socket.on('connect', callback);
    }
  }

  // Escuchar desconexión
  onDisconnect(callback: () => void) {
    if (this.socket) {
      this.socket.on('disconnect', callback);
    }
  }

  // Verificar estado de conexión
  getConnectionStatus() {
    return this.isConnected;
  }

  // Obtener ID del socket
  getSocketId() {
    return this.socket?.id;
  }
}

export const webSocketService = new WebSocketService();
