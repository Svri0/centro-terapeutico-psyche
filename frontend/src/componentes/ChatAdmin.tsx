import React, { useState, useEffect, useRef } from 'react';
import { authService } from '../servicios/auth.service';
import { chatService, PacienteChat, MensajeChat } from '../servicios/chat.service';
import io, { Socket } from 'socket.io-client';

interface ChatAdminProps {
  adminId: string;
}

const ChatAdmin: React.FC<ChatAdminProps> = ({ adminId }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [trabajadores, setTrabajadores] = useState<PacienteChat[]>([]);
  const [trabajadorSeleccionado, setTrabajadorSeleccionado] = useState<PacienteChat | null>(null);
  const [mensajes, setMensajes] = useState<MensajeChat[]>([]);
  const [nuevoMensaje, setNuevoMensaje] = useState('');
  const [conectado, setConectado] = useState(false);
  const [cargando, setCargando] = useState(true);
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
      console.log('Conectado al chat como administrador');
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
    });

    newSocket.on('mensaje_recibido', (mensaje: MensajeChat) => {
      console.log('📨 Mensaje recibido:', mensaje);
      setMensajes(prev => {
        // Evitar duplicados
        const exists = prev.some(m => m.id === mensaje.id);
        if (exists) return prev;
        return [...prev, mensaje];
      });
      setTrabajadores(prev => prev.map(t =>
        t.id === mensaje.remitente_id
          ? {
              ...t,
              ultimo_mensaje: mensaje.contenido,
              ultimo_mensaje_timestamp: mensaje.created_at,
              mensajes_no_leidos: mensaje.tipo === 'psicologo' || mensaje.tipo === 'recepcionista' ? t.mensajes_no_leidos + 1 : t.mensajes_no_leidos
            }
          : t
      ));
    });

    newSocket.on('mensaje_enviado', (mensaje: MensajeChat) => {
      console.log('📤 Mensaje enviado:', mensaje);
      setMensajes(prev => {
        // Evitar duplicados
        const exists = prev.some(m => m.id === mensaje.id);
        if (exists) return prev;
        return [...prev, mensaje];
      });
      setTrabajadores(prev => prev.map(t =>
        t.id === mensaje.destinatario_id
          ? {
              ...t,
              ultimo_mensaje: mensaje.contenido,
              ultimo_mensaje_timestamp: mensaje.created_at,
              mensajes_no_leidos: 0 // Los mensajes enviados por el admin no cuentan como no leídos
            }
          : t
      ));
    });

    newSocket.on('mensajes_cargados', (mensajesData: MensajeChat[]) => {
      console.log('📨 Mensajes cargados:', mensajesData);
      console.log('📨 Cantidad de mensajes:', mensajesData.length);
      console.log('📨 Trabajador seleccionado:', trabajadorSeleccionado?.id);
      
      setMensajes(mensajesData);
      
      // Marcar mensajes como leídos y actualizar contador
      if (trabajadorSeleccionado) {
        console.log('📨 Marcando mensajes como leídos para:', trabajadorSeleccionado.id);
        newSocket.emit('marcar_como_leidos', {
          trabajador_id: trabajadorSeleccionado.id,
          admin_id: adminId
        });
        
        // Actualizar contador de mensajes no leídos a 0
        setTrabajadores(prev => {
          const updated = prev.map(t =>
            t.id === trabajadorSeleccionado.id
              ? { ...t, mensajes_no_leidos: 0 }
              : t
          );
          console.log('📨 Trabajadores actualizados:', updated);
          return updated;
        });
      }
    });

    newSocket.on('trabajadores_disponibles', (trabajadoresData: PacienteChat[]) => {
      setTrabajadores(trabajadoresData);
    });

    newSocket.on('error', (error: any) => {
      console.error('Error en WebSocket:', error);
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
      console.log('🔄 Cargando datos iniciales...');
      const trabajadoresData = await chatService.obtenerTrabajadores();
      console.log('👥 Trabajadores cargados:', trabajadoresData);
      setTrabajadores(trabajadoresData);
    } catch (error) {
      console.error('Error al cargar trabajadores:', error);
    }
  };

  // Cargar mensajes cuando se selecciona un trabajador
  useEffect(() => {
    if (trabajadorSeleccionado && socket) {
      console.log('🔍 Cargando mensajes para trabajador:', trabajadorSeleccionado.id, 'admin:', adminId);
      // Limpiar mensajes anteriores
      setMensajes([]);
      socket.emit('cargar_mensajes', {
        trabajador_id: trabajadorSeleccionado.id,
        admin_id: adminId
      });
    } else {
      // Si no hay trabajador seleccionado, limpiar mensajes
      setMensajes([]);
    }
  }, [trabajadorSeleccionado, socket, adminId]);

  // Recargar datos cuando el componente se monta o se vuelve visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && socket && conectado) {
        console.log('🔄 Recargando datos por cambio de visibilidad');
        cargarDatosIniciales();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [socket, conectado]);

  // Enviar mensaje
  const enviarMensaje = () => {
    if (!nuevoMensaje.trim() || !socket || !trabajadorSeleccionado) return;

    const mensaje = {
      contenido: nuevoMensaje.trim(),
      remitente_id: adminId,
      destinatario_id: trabajadorSeleccionado.id,
      tipo: 'admin' as const
    };

    socket.emit('enviar_mensaje', mensaje);
    setNuevoMensaje('');
  };

  // Manejar Enter para enviar mensaje
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      enviarMensaje();
    }
  };

  // Formatear tiempo
  const formatearTiempo = (timestamp: string) => {
    const fecha = new Date(timestamp);
    const ahora = new Date();
    const diffMs = ahora.getTime() - fecha.getTime();
    const diffMinutos = Math.floor(diffMs / (1000 * 60));
    const diffHoras = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDias = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMinutos < 1) return 'Ahora';
    if (diffMinutos < 60) return `${diffMinutos}m`;
    if (diffHoras < 24) return `${diffHoras}h`;
    if (diffDias < 7) return `${diffDias}d`;
    return fecha.toLocaleDateString();
  };

  if (cargando) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
        <span className="ml-2 text-amber-600">Conectando al chat...</span>
      </div>
    );
  }

  return (
    <div className="flex h-[600px] bg-white rounded-lg shadow-sm border border-amber-100 overflow-hidden">
      {/* Lista de trabajadores */}
      <div className="w-1/3 border-r border-amber-200 bg-gray-50">
        <div className="p-4 border-b border-amber-200 bg-white">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-gray-900">Trabajadores</h3>
            <div className="flex items-center">
              <div className={`w-2 h-2 rounded-full mr-2 ${conectado ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-sm text-gray-600">
                {conectado ? 'Conectado' : 'Desconectado'}
              </span>
            </div>
          </div>
        </div>
        
        <div className="overflow-y-auto h-full">
          {trabajadores.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              <p>No hay trabajadores disponibles</p>
            </div>
          ) : (
            trabajadores.map((trabajador) => (
              <div
                key={trabajador.id}
                onClick={() => setTrabajadorSeleccionado(trabajador)}
                className={`p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors ${
                  trabajadorSeleccionado?.id === trabajador.id ? 'bg-amber-50 border-amber-200' : ''
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-amber-200 flex items-center justify-center">
                    {trabajador.avatar_url ? (
                      <img
                        src={trabajador.avatar_url}
                        alt={`${trabajador.nombres} ${trabajador.apellidos}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-amber-600 font-semibold">
                        {trabajador.nombres.charAt(0)}{trabajador.apellidos.charAt(0)}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-gray-900 truncate">
                        {trabajador.nombres} {trabajador.apellidos}
                      </h4>
                      {trabajador.mensajes_no_leidos > 0 && (
                        <div className="bg-amber-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                          {trabajador.mensajes_no_leidos}
                        </div>
                      )}
                    </div>
                    {(trabajador as any).rol && (
                      <p className="text-xs text-amber-600 font-medium">
                        {(trabajador as any).rol}
                      </p>
                    )}
                    {trabajador.ultimo_mensaje && (
                      <p className="text-sm text-gray-600 truncate">
                        {trabajador.ultimo_mensaje}
                      </p>
                    )}
                    {trabajador.ultimo_mensaje_timestamp && (
                      <p className="text-xs text-gray-400">
                        {formatearTiempo(trabajador.ultimo_mensaje_timestamp)}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Área de chat */}
      <div className="flex-1 flex flex-col">
        {trabajadorSeleccionado ? (
          <>
            {/* Header del chat */}
            <div className="p-4 border-b border-amber-200 bg-white">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-amber-200 flex items-center justify-center">
                  {trabajadorSeleccionado.avatar_url ? (
                    <img
                      src={trabajadorSeleccionado.avatar_url}
                      alt={`${trabajadorSeleccionado.nombres} ${trabajadorSeleccionado.apellidos}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-amber-600 font-semibold">
                      {trabajadorSeleccionado.nombres.charAt(0)}{trabajadorSeleccionado.apellidos.charAt(0)}
                    </span>
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {trabajadorSeleccionado.nombres} {trabajadorSeleccionado.apellidos}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {(trabajadorSeleccionado as any).rol || 'Trabajador'}
                  </p>
                </div>
              </div>
            </div>

            {/* Mensajes */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ maxHeight: '400px' }}>
              {(() => {
                console.log('🎨 Renderizando mensajes. Cantidad:', mensajes.length);
                console.log('🎨 Mensajes:', mensajes);
                console.log('🎨 Trabajador seleccionado:', trabajadorSeleccionado?.id);
                
                if (mensajes.length === 0) {
                  return (
                    <div className="flex items-center justify-center h-full text-gray-500">
                      <p>No hay mensajes aún</p>
                    </div>
                  );
                }
                
                return mensajes.map((mensaje) => (
                  <div
                    key={mensaje.id}
                    className={`flex ${mensaje.tipo === 'admin' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        mensaje.tipo === 'admin'
                          ? 'bg-amber-500 text-white'
                          : 'bg-gray-200 text-gray-800'
                      }`}
                    >
                      <p className="text-sm">{mensaje.contenido}</p>
                      <p className={`text-xs mt-1 ${
                        mensaje.tipo === 'admin' ? 'text-amber-100' : 'text-gray-500'
                      }`}>
                        {formatearTiempo(mensaje.created_at)}
                      </p>
                    </div>
                  </div>
                ));
              })()}
              <div ref={mensajesEndRef} />
            </div>

            {/* Input de mensaje */}
            <div className="p-4 border-t border-amber-200 bg-white">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={nuevoMensaje}
                  onChange={(e) => setNuevoMensaje(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Escribe un mensaje..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  disabled={!conectado}
                />
                <button
                  onClick={enviarMensaje}
                  disabled={!nuevoMensaje.trim() || !conectado}
                  className="px-4 py-2 bg-amber-500 text-white rounded-md hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Enviar
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-purple-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Selecciona un trabajador</h3>
              <p className="text-gray-600">Elige un trabajador de la lista para comenzar a chatear</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatAdmin;
