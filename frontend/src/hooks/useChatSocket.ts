import { useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

interface UseChatSocketProps {
  chatId: string | null;
  usuarioId: string;
  tipoUsuario: 'psicologo' | 'paciente';
  onMensajeRecibido: (mensaje: any) => void;
  onChatActualizado: (datosChat: any) => void;
  onUsuarioEscribiendo: (usuarioId: string, escribiendo: boolean) => void;
}

export const useChatSocket = ({
  chatId,
  usuarioId,
  tipoUsuario,
  onMensajeRecibido,
  onChatActualizado,
  onUsuarioEscribiendo
}: UseChatSocketProps) => {
  const socketRef = useRef<Socket | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Conectar al WebSocket - SOLO UNA VEZ
  const conectar = useCallback(() => {
    if (socketRef.current?.connected) return;

    console.log('🔌 Conectando al WebSocket...');
    
    socketRef.current = io('http://localhost:3002', {
      auth: {
        token: localStorage.getItem('token') || 'temp-token'
      }
    });

    socketRef.current.on('connect', () => {
      console.log('🔌 WebSocket conectado:', socketRef.current?.id);
      console.log('🔌 WebSocket estado:', socketRef.current?.connected);
      console.log('🔌 WebSocket URL:', socketRef.current?.io.uri);
    });

    socketRef.current.on('disconnect', () => {
      console.log('🔌 WebSocket desconectado');
    });

    socketRef.current.on('connect_error', (error) => {
      console.error('🔌 Error de conexión WebSocket:', error);
    });

    // Escuchar mensajes nuevos
    socketRef.current.on('mensaje-recibido', (data) => {
      console.log('📨 Mensaje recibido en tiempo real:', data);
      console.log('📨 Chat activo actual:', chatId);
      console.log('📨 ¿Coincide el chat?', data.chatId === chatId);
      
      // Verificar si el mensaje es para el chat activo actual
      if (data.chatId === chatId) {
        console.log('📨 Aplicando mensaje al chat activo');
        onMensajeRecibido(data.mensaje);
      } else {
        console.log('📨 Mensaje ignorado - no es para este chat');
      }
    });

    // Escuchar actualizaciones de chat
    socketRef.current.on('chat-actualizado', (data) => {
      console.log('🔄 Chat actualizado en tiempo real:', data);
      // Verificar si la actualización es para el chat activo actual
      if (data.chatId === chatId) {
        onChatActualizado(data.datosChat);
      }
    });

    // Escuchar estado de escritura
    socketRef.current.on('usuario-escribiendo', (data) => {
      console.log('✍️ Usuario escribiendo:', data);
      // Verificar si la escritura es para el chat activo actual
      if (data.chatId === chatId && data.usuarioId !== usuarioId) {
        onUsuarioEscribiendo(data.usuarioId, data.escribiendo);
      }
    });
  }, []); // Sin dependencias para que no se recree

  // Desconectar WebSocket - SOLO UNA VEZ
  const desconectar = useCallback(() => {
    if (socketRef.current) {
      console.log('🔌 Desconectando WebSocket...');
      socketRef.current.disconnect();
      socketRef.current = null;
    }
  }, []); // Sin dependencias

  // Unirse a un chat - SOLO UNA VEZ
  const unirseChat = useCallback((chatId: string) => {
    console.log(`🔌 Intentando unirse al chat: ${chatId}`);
    console.log(`🔌 Socket conectado:`, socketRef.current?.connected);
    console.log(`🔌 Socket ID:`, socketRef.current?.id);
    
    if (socketRef.current?.connected) {
      console.log(`🔌 Uniéndose al chat: ${chatId}`);
      socketRef.current.emit('unirse-chat', {
        chatId,
        usuarioId,
        tipoUsuario
      });
      console.log(`🔌 Evento 'unirse-chat' emitido`);
    } else {
      console.log(`⚠️ No se puede unir al chat: Socket no conectado`);
    }
  }, []); // Sin dependencias

  // Enviar mensaje - SOLO UNA VEZ
  const enviarMensaje = useCallback((chatId: string, mensaje: any) => {
    if (socketRef.current?.connected) {
      console.log(`📨 Enviando mensaje al chat: ${chatId}`);
      socketRef.current.emit('mensaje-nuevo', {
        chatId,
        mensaje
      });
    }
  }, []); // Sin dependencias

  // Indicar que está escribiendo - SOLO UNA VEZ
  const indicarEscritura = useCallback((chatId: string, escribiendo: boolean) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('escribiendo', {
        chatId,
        usuarioId,
        escribiendo
      });
    }
  }, []); // Sin dependencias

  // Efecto para conectar/desconectar - SOLO UNA VEZ
  useEffect(() => {
    conectar();

    return () => {
      desconectar();
    };
  }, []); // Sin dependencias para que solo se ejecute una vez

  // Efecto para unirse al chat cuando cambie
  useEffect(() => {
    if (chatId && socketRef.current?.connected) {
      unirseChat(chatId);
    }
  }, [chatId]); // Solo depende de chatId, no de unirseChat

  return {
    conectar,
    desconectar,
    unirseChat,
    enviarMensaje,
    indicarEscritura,
    estaConectado: socketRef.current?.connected || false
  };
};
