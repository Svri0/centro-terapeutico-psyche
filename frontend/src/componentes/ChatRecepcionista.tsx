import React, { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { authService } from '../servicios/auth.service';
import { chatService, PacienteChat, MensajeChat } from '../servicios/chat.service';

interface ChatRecepcionistaProps {
  recepcionistaId: string;
}

const ChatRecepcionista: React.FC<ChatRecepcionistaProps> = ({ recepcionistaId }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [personal, setPersonal] = useState<PacienteChat[]>([]);
  const [personaSeleccionada, setPersonaSeleccionada] = useState<PacienteChat | null>(null);
  const [mensajes, setMensajes] = useState<MensajeChat[]>([]);
  const [nuevoMensaje, setNuevoMensaje] = useState('');
  const [conectado, setConectado] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mensajesEndRef = useRef<HTMLDivElement>(null);

  const user = authService.getUser();

  // Scroll automático a los mensajes más recientes
  const scrollToBottom = () => {
    setTimeout(() => {
      mensajesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  useEffect(() => {
    scrollToBottom();
  }, [mensajes]);

  // Conectar WebSocket
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    const newSocket = io(import.meta.env.VITE_API_URL || 'http://localhost:3002', {
      auth: {
        token: token
      },
      transports: ['websocket']
    });

    newSocket.on('connect', () => {
      console.log('Conectado al chat como recepcionista');
      setConectado(true);
      setCargando(false);
      console.log('🔐 Enviando token de autenticación:', token);
      newSocket.emit('authenticate', { token });
    });

    newSocket.on('disconnect', () => {
      console.log('Desconectado del chat');
      setConectado(false);
    });

    newSocket.on('authenticated', (data: any) => {
      console.log('✅ Autenticación exitosa:', data);
    });

    newSocket.on('authentication_error', (error: any) => {
      console.error('❌ Error de autenticación:', error);
      setError('Error de autenticación en el chat');
    });

    newSocket.on('mensaje_recibido', (mensaje: MensajeChat) => {
      console.log('📨 Mensaje recibido:', mensaje);
      setMensajes(prev => {
        // Evitar duplicados
        const exists = prev.some(m => m.id === mensaje.id);
        if (exists) return prev;
        return [...prev, mensaje];
      });
      setPersonal(prev => prev.map(p =>
        p.id === mensaje.remitente_id
          ? {
              ...p,
              ultimo_mensaje: mensaje.contenido,
              ultimo_mensaje_timestamp: mensaje.created_at,
              mensajes_no_leidos: mensaje.tipo !== 'recepcionista' ? p.mensajes_no_leidos + 1 : p.mensajes_no_leidos
            }
          : p
      ));
    });

    newSocket.on('mensaje_enviado', (mensaje: MensajeChat) => {
      console.log('📤 Mensaje enviado:', mensaje);
      setMensajes(prev => {
        const exists = prev.some(m => m.id === mensaje.id);
        if (exists) return prev;
        return [...prev, mensaje];
      });
    });

    newSocket.on('mensajes_cargados', (mensajesData: MensajeChat[]) => {
      console.log('📋 Mensajes cargados:', mensajesData);
      setMensajes(mensajesData);
    });

    newSocket.on('error', (error: any) => {
      console.error('Error en WebSocket:', error);
      setError('Error en la conexión del chat');
    });

    // Cargar datos iniciales
    cargarDatosIniciales();

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  // Cargar datos iniciales
  const cargarDatosIniciales = async () => {
    try {
      console.log('🔄 Cargando datos iniciales del chat...');
      const personalData = await chatService.obtenerPersonalRecepcionista();
      console.log('👥 Personal cargado:', personalData);
      setPersonal(personalData);
    } catch (error) {
      console.error('Error al cargar personal:', error);
      setError('Error al cargar los contactos del chat');
    }
  };

  // Cargar mensajes cuando se selecciona una persona
  useEffect(() => {
    if (personaSeleccionada && socket) {
      console.log('🔍 Cargando mensajes para:', personaSeleccionada.id);
      setMensajes([]); // Limpiar mensajes anteriores
      socket.emit('cargar_mensajes', {
        recepcionista_id: recepcionistaId,
        persona_id: personaSeleccionada.id
      });
    }
  }, [personaSeleccionada, socket, recepcionistaId]);

  const enviarMensaje = () => {
    if (!nuevoMensaje.trim() || !socket || !personaSeleccionada) return;

    const mensaje = {
      contenido: nuevoMensaje.trim(),
      remitente_id: recepcionistaId,
      destinatario_id: personaSeleccionada.id,
      tipo: 'recepcionista' as const
    };

    socket.emit('enviar_mensaje', mensaje);
    setNuevoMensaje('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      enviarMensaje();
    }
  };

  const formatearTiempo = (timestamp: string) => {
    const fecha = new Date(timestamp);
    const ahora = new Date();
    const diffMs = ahora.getTime() - fecha.getTime();
    const diffMinutos = Math.floor(diffMs / (1000 * 60));
    const diffHoras = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDias = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMinutos < 1) return 'Ahora';
    if (diffMinutos < 60) return `Hace ${diffMinutos}m`;
    if (diffHoras < 24) return `Hace ${diffHoras}h`;
    if (diffDias < 7) return `Hace ${diffDias}d`;
    return fecha.toLocaleDateString('es-ES');
  };

  const obtenerIniciales = (nombres: string, apellidos: string) => {
    return `${nombres.charAt(0)}${apellidos.charAt(0)}`.toUpperCase();
  };

  if (cargando) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Conectando al chat...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-amber-100 text-amber-800 rounded-md hover:bg-amber-200 transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header del chat */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center">
          <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
          <h3 className="text-lg font-semibold text-gray-800">Chat con Personal</h3>
        </div>
        <div className="text-sm text-gray-500">
          {conectado ? 'Conectado' : 'Desconectado'}
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Lista de contactos */}
        <div className="w-1/3 border-r border-gray-200 bg-gray-50 flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <h4 className="font-medium text-gray-700 mb-2">Personal del Centro</h4>
            <p className="text-sm text-gray-500">Administradores y Psicólogos</p>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {personal.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                <p>No hay personal disponible</p>
              </div>
            ) : (
              personal.map((persona) => (
                <div
                  key={persona.id}
                  onClick={() => setPersonaSeleccionada(persona)}
                  className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-100 transition-colors ${
                    personaSeleccionada?.id === persona.id ? 'bg-blue-50 border-blue-200' : ''
                  }`}
                >
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-medium mr-3">
                      {persona.avatar_url ? (
                        <img 
                          src={persona.avatar_url} 
                          alt={`${persona.nombres} ${persona.apellidos}`}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        obtenerIniciales(persona.nombres, persona.apellidos)
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {persona.nombres} {persona.apellidos}
                        </p>
                        {persona.mensajes_no_leidos > 0 && (
                          <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                            {persona.mensajes_no_leidos}
                          </span>
                        )}
                      </div>
                      {persona.ultimo_mensaje && (
                        <p className="text-xs text-gray-500 truncate mt-1">
                          {persona.ultimo_mensaje}
                        </p>
                      )}
                      {persona.ultimo_mensaje_timestamp && (
                        <p className="text-xs text-gray-400 mt-1">
                          {formatearTiempo(persona.ultimo_mensaje_timestamp)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Área de mensajes */}
        <div className="flex-1 flex flex-col">
          {personaSeleccionada ? (
            <>
              {/* Header de la conversación */}
              <div className="p-4 border-b border-gray-200 bg-white">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-medium mr-3">
                    {personaSeleccionada.avatar_url ? (
                      <img 
                        src={personaSeleccionada.avatar_url} 
                        alt={`${personaSeleccionada.nombres} ${personaSeleccionada.apellidos}`}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      obtenerIniciales(personaSeleccionada.nombres, personaSeleccionada.apellidos)
                    )}
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">
                      {personaSeleccionada.nombres} {personaSeleccionada.apellidos}
                    </h4>
                    <p className="text-sm text-gray-500">En línea</p>
                  </div>
                </div>
              </div>

              {/* Mensajes */}
              <div 
                className="flex-1 overflow-y-auto p-4 space-y-4" 
                style={{ 
                  maxHeight: '400px',
                  scrollBehavior: 'smooth'
                }}
              >
                {mensajes.map((mensaje) => (
                  <div
                    key={mensaje.id}
                    className={`flex ${mensaje.tipo === 'recepcionista' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        mensaje.tipo === 'recepcionista'
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-200 text-gray-800'
                      }`}
                    >
                      <p className="text-sm">{mensaje.contenido}</p>
                      <p className={`text-xs mt-1 ${
                        mensaje.tipo === 'recepcionista' ? 'text-blue-100' : 'text-gray-500'
                      }`}>
                        {formatearTiempo(mensaje.created_at)}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={mensajesEndRef} />
              </div>

              {/* Input de mensaje */}
              <div className="p-4 border-t border-gray-200 bg-white">
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={nuevoMensaje}
                    onChange={(e) => setNuevoMensaje(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Escribe tu mensaje..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    onClick={enviarMensaje}
                    disabled={!nuevoMensaje.trim()}
                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Enviar
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <div className="text-gray-400 text-4xl mb-4">💬</div>
                <h3 className="text-lg font-medium text-gray-600 mb-2">Selecciona una conversación</h3>
                <p className="text-gray-500">Elige un miembro del personal para comenzar a chatear</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatRecepcionista;
