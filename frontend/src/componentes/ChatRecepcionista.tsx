import React, { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { authService } from '../servicios/auth.service';
import { chatService, PacienteChat, MensajeChat } from '../servicios/chat.service';

interface ChatRecepcionistaProps {
  recepcionistaId: string;
  onMensajesNoLeidosChange?: (numeroMensajesNoLeidos: number) => void;
}

const ChatRecepcionista: React.FC<ChatRecepcionistaProps> = ({ recepcionistaId, onMensajesNoLeidosChange }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [personal, setPersonal] = useState<PacienteChat[]>([]);
  const [pacientes, setPacientes] = useState<PacienteChat[]>([]);
  const [personaSeleccionada, setPersonaSeleccionada] = useState<PacienteChat | null>(null);
  const personaSeleccionadaRef = useRef<PacienteChat | null>(null);
  const [mensajes, setMensajes] = useState<MensajeChat[]>([]);
  const [nuevoMensaje, setNuevoMensaje] = useState('');
  const [conectado, setConectado] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [filtroActivo, setFiltroActivo] = useState<'personal' | 'pacientes'>('personal');
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
      
      // Solo incrementar contador si el chat NO está abierto actualmente
      // Usar ref para obtener el valor actual sin depender de closures
      const esChatAbierto = personaSeleccionadaRef.current?.id === mensaje.remitente_id;
      
      // Actualizar personal
      setPersonal(prev => prev.map(p =>
        p.id === mensaje.remitente_id
          ? {
              ...p,
              ultimo_mensaje: mensaje.contenido,
              ultimo_mensaje_timestamp: mensaje.created_at,
              // Solo incrementar si es mensaje de personal Y el chat no está abierto
              mensajes_no_leidos: (mensaje.tipo !== 'recepcionista' && !esChatAbierto)
                ? p.mensajes_no_leidos + 1 
                : p.mensajes_no_leidos
            }
          : p
      ));
      
      // Actualizar pacientes
      setPacientes(prev => prev.map(p =>
        p.id === mensaje.remitente_id
          ? {
              ...p,
              ultimo_mensaje: mensaje.contenido,
              ultimo_mensaje_timestamp: mensaje.created_at,
              // Solo incrementar si es mensaje de paciente Y el chat no está abierto
              mensajes_no_leidos: (mensaje.tipo === 'paciente' && !esChatAbierto)
                ? p.mensajes_no_leidos + 1 
                : p.mensajes_no_leidos
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
      
      // Marcar mensajes como leídos y actualizar contador a 0 INMEDIATAMENTE
      const personaActual = personaSeleccionadaRef.current;
      if (personaActual) {
        // SIEMPRE actualizar contador a 0 cuando se cargan los mensajes (el usuario está viendo el chat)
        setPersonal(prev => prev.map(p =>
          p.id === personaActual.id
            ? { ...p, mensajes_no_leidos: 0 }
            : p
        ));
        setPacientes(prev => prev.map(p =>
          p.id === personaActual.id
            ? { ...p, mensajes_no_leidos: 0 }
            : p
        ));
      }
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
      const [personalData, pacientesData] = await Promise.all([
        chatService.obtenerPersonalRecepcionista(),
        chatService.obtenerPacientes()
      ]);
      console.log('👥 Personal cargado:', personalData);
      console.log('👥 Pacientes cargados:', pacientesData);
      setPersonal(personalData);
      setPacientes(pacientesData);
    } catch (error) {
      console.error('Error al cargar contactos:', error);
      setError('Error al cargar los contactos del chat');
    }
  };

  // Actualizar ref cuando cambia la persona seleccionada
  useEffect(() => {
    personaSeleccionadaRef.current = personaSeleccionada;
  }, [personaSeleccionada]);

  // Notificar al padre sobre mensajes no leídos
  useEffect(() => {
    if (onMensajesNoLeidosChange) {
      const totalMensajesNoLeidos = personal.reduce((sum, p) => sum + (p.mensajes_no_leidos || 0), 0) +
                                   pacientes.reduce((sum, p) => sum + (p.mensajes_no_leidos || 0), 0);
      onMensajesNoLeidosChange(totalMensajesNoLeidos);
    }
  }, [personal, pacientes, onMensajesNoLeidosChange]);

  // Cargar mensajes cuando se selecciona una persona
  useEffect(() => {
    if (personaSeleccionada && socket) {
      console.log('🔍 Cargando mensajes para:', personaSeleccionada.id);
      
      // Actualizar contador a 0 INMEDIATAMENTE cuando se selecciona un contacto
      setPersonal(prev => prev.map(p =>
        p.id === personaSeleccionada.id
          ? { ...p, mensajes_no_leidos: 0 }
          : p
      ));
      setPacientes(prev => prev.map(p =>
        p.id === personaSeleccionada.id
          ? { ...p, mensajes_no_leidos: 0 }
          : p
      ));
      
      setMensajes([]); // Limpiar mensajes anteriores
      socket.emit('cargar_mensajes', {
        recepcionista_id: recepcionistaId,
        persona_id: personaSeleccionada.id
      });
      
      // Marcar mensajes como leídos
      socket.emit('marcar_como_leidos', {
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

      <div className="flex flex-1 overflow-hidden">
        {/* Lista de contactos */}
        <div className="w-1/3 border-r border-gray-200 bg-gray-50 flex flex-col">
          <div className="p-4 border-b border-gray-200 bg-white">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-900">Contactos</h3>
              <div className="flex items-center">
                <div className={`w-2 h-2 rounded-full mr-2 ${conectado ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="text-sm text-gray-600">
                  {conectado ? 'Conectado' : 'Desconectado'}
                </span>
              </div>
            </div>
            
            {/* Dropdown para filtrar */}
            <div className="flex space-x-2">
              <button
                onClick={() => setFiltroActivo('personal')}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  filtroActivo === 'personal'
                    ? 'bg-amber-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Personal
              </button>
              <button
                onClick={() => setFiltroActivo('pacientes')}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  filtroActivo === 'pacientes'
                    ? 'bg-amber-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Pacientes
              </button>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {(() => {
              const listaActual = filtroActivo === 'personal' ? personal : pacientes;
              const tituloLista = filtroActivo === 'personal' ? 'personal' : 'pacientes';
              
              if (listaActual.length === 0) {
                return (
                  <div className="p-4 text-center text-gray-500">
                    <p>No hay {tituloLista} disponibles</p>
                  </div>
                );
              }

              return listaActual.map((persona) => (
                <div
                  key={persona.id}
                  onClick={() => setPersonaSeleccionada(persona)}
                  className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-100 transition-colors ${
                    personaSeleccionada?.id === persona.id 
                      ? 'bg-amber-100 border-l-4 border-l-amber-500' 
                      : ''
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-amber-200 flex items-center justify-center flex-shrink-0">
                      {persona.avatar_url ? (
                        <img
                          src={persona.avatar_url}
                          alt={`${persona.nombres} ${persona.apellidos}`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-amber-600 font-semibold">
                          {persona.nombres.charAt(0)}{persona.apellidos.charAt(0)}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-gray-900 truncate">
                          {persona.nombres} {persona.apellidos}
                        </h4>
                        {persona.mensajes_no_leidos > 0 && (
                          <span className="ml-2 flex items-center justify-center min-w-[20px] h-5 px-1.5 bg-red-500 text-white text-xs font-bold rounded-full flex-shrink-0">
                            {persona.mensajes_no_leidos > 99 ? '99+' : persona.mensajes_no_leidos}
                          </span>
                        )}
                      </div>
                      {persona.ultimo_mensaje && (
                        <p className="text-sm text-gray-600 truncate">
                          {persona.ultimo_mensaje}
                        </p>
                      )}
                      {persona.ultimo_mensaje_timestamp && (
                        <p className="text-xs text-gray-400">
                          {formatearTiempo(persona.ultimo_mensaje_timestamp)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ));
            })()}
          </div>
        </div>

        {/* Área de mensajes */}
        <div className="flex-1 flex flex-col">
          {personaSeleccionada ? (
            <>
              {/* Header de la conversación */}
              <div className="p-4 border-b border-gray-200 bg-white">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-amber-200 flex items-center justify-center">
                    {personaSeleccionada.avatar_url ? (
                      <img
                        src={personaSeleccionada.avatar_url}
                        alt={`${personaSeleccionada.nombres} ${personaSeleccionada.apellidos}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-amber-600 font-semibold">
                        {personaSeleccionada.nombres.charAt(0)}{personaSeleccionada.apellidos.charAt(0)}
                      </span>
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {personaSeleccionada.nombres} {personaSeleccionada.apellidos}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {conectado ? '🟢 En línea' : '🔴 Desconectado'}
                    </p>
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
                          ? 'bg-amber-500 text-white'
                          : 'bg-gray-200 text-gray-800'
                      }`}
                    >
                      <p className="text-sm">{mensaje.contenido}</p>
                      <p className={`text-xs mt-1 ${
                        mensaje.tipo === 'recepcionista' ? 'text-amber-100' : 'text-gray-500'
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
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  />
                  <button
                    onClick={enviarMensaje}
                    disabled={!nuevoMensaje.trim()}
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
                <div className="text-gray-400 text-4xl mb-4">💬</div>
                <h3 className="text-lg font-medium text-gray-600 mb-2">Selecciona una conversación</h3>
                <p className="text-gray-500">Elige un contacto de la lista para comenzar a chatear</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatRecepcionista;
