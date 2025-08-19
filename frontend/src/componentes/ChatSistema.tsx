import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeftIcon,
  XMarkIcon,
  ArrowsPointingOutIcon,
  FaceSmileIcon,
  PhotoIcon,
  MicrophoneIcon,
  PaperAirplaneIcon,
  ChatBubbleLeftIcon
} from '@heroicons/react/24/outline';
import { useChatSocket } from '../hooks/useChatSocket';

interface Chat {
  id: string;
  nombre: string;
  avatar: string;
  ultimoMensaje: string;
  timestamp: Date;
  noLeidos: number;
  online: boolean;
}

interface Mensaje {
  id: string;
  contenido: string;
  remitente: string;
  timestamp: Date;
  tipo: 'texto' | 'imagen' | 'audio' | 'documento';
}

interface ChatSistemaProps {
  tipoUsuario: 'psicologo' | 'paciente';
  usuarioId: string;
}

const ChatSistema: React.FC<ChatSistemaProps> = ({ tipoUsuario, usuarioId }) => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [chatActivo, setChatActivo] = useState<string | null>(null);
  const [mensajes, setMensajes] = useState<Mensaje[]>([]);
  const [nuevoMensaje, setNuevoMensaje] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [mostrarChat, setMostrarChat] = useState(false);
  const [usuariosEscribiendo, setUsuariosEscribiendo] = useState<Set<string>>(new Set());
  const mensajesEndRef = useRef<HTMLDivElement>(null);

  // Callbacks para WebSocket
  const handleMensajeRecibido = (mensaje: any) => {
    console.log('📨 ChatSistema: Mensaje recibido en tiempo real:', mensaje);
    console.log('📨 ChatSistema: Chat activo:', chatActivo);
    
    // Verificar si el mensaje ya existe para evitar duplicados
    setMensajes(prev => {
      const mensajeExiste = prev.some(msg => 
        msg.id === mensaje.id || 
        (msg.contenido === mensaje.contenido && 
         Math.abs(new Date(msg.timestamp).getTime() - new Date(mensaje.timestamp).getTime()) < 5000) // 5 segundos de tolerancia
      );
      
      if (mensajeExiste) {
        console.log('📨 ChatSistema: Mensaje ya existe, no se agrega duplicado');
        return prev;
      }
      
      console.log('📨 ChatSistema: Agregando mensaje nuevo a la lista');
      return [...prev, mensaje];
    });
    
    // Actualizar el chat en la lista
    setChats(prev => prev.map(chat => 
      chat.id === chatActivo 
        ? { ...chat, ultimoMensaje: mensaje.contenido, timestamp: mensaje.timestamp }
        : chat
    ));
    
    console.log('📨 ChatSistema: Mensaje procesado correctamente');
  };

  const handleChatActualizado = (datosChat: any) => {
    console.log('🔄 Chat actualizado en tiempo real:', datosChat);
    // Aquí puedes actualizar el estado del chat si es necesario
  };

  const handleUsuarioEscribiendo = (usuarioId: string, escribiendo: boolean) => {
    console.log('✍️ Usuario escribiendo:', usuarioId, escribiendo);
    setUsuariosEscribiendo(prev => {
      const nuevo = new Set(prev);
      if (escribiendo) {
        nuevo.add(usuarioId);
      } else {
        nuevo.delete(usuarioId);
      }
      return nuevo;
    });
  };

    // Hook de WebSocket
  const { 
    enviarMensaje: enviarMensajeSocket, 
    indicarEscritura, 
    estaConectado 
  } = useChatSocket({
    chatId: chatActivo,
    usuarioId,
    tipoUsuario,
    onMensajeRecibido: handleMensajeRecibido,
    onChatActualizado: handleChatActualizado,
    onUsuarioEscribiendo: handleUsuarioEscribiendo
  });
    
  // Log del estado de conexión WebSocket
  useEffect(() => {
    console.log('🔌 Estado WebSocket:', estaConectado ? 'Conectado' : 'Desconectado');
  }, [estaConectado]);

  // Cargar chats reales del backend
  useEffect(() => {
    const cargarChats = async () => {
      try {
        console.log('🔍 ChatSistema - Cargando chats para:', { tipoUsuario, usuarioId });
        
        // TEMPORAL: Usar endpoint de prueba sin autenticación
        // TEMPORAL: Usar ID fijo para Miguel Román (psicólogo) o Salomón (paciente)
        const idTemporal = tipoUsuario === 'psicologo' 
          ? 'e57db227-a6b7-4e1a-ae8d-08a7cf4d5b7b'  // Miguel Román
          : '03a7db0e-6e57-4095-a717-5b49e6669161'; // Salomón Rodriguez
        
        console.log('🔍 ChatSistema - Usando ID temporal:', idTemporal);
        const url = `/api/v1/chat/test/chats-simple/${tipoUsuario}/${idTemporal}`;
        console.log('🔍 ChatSistema - URL completa:', url);
        const response = await fetch(url);
        if (response.ok) {
          const data = await response.json();
          console.log('🔍 ChatSistema - Chats cargados:', data);
          setChats(data.chats || []);
        } else {
          console.error('Error al cargar chats:', response.statusText);
          setChats([]);
        }
      } catch (error) {
        console.error('Error al cargar chats:', error);
        setChats([]);
      }
    };
    if (usuarioId) {
      cargarChats();
    } else {
      console.log('🔍 ChatSistema - No hay usuarioId:', usuarioId);
    }
  }, [tipoUsuario, usuarioId]);

  // Cargar mensajes reales del chat activo
  useEffect(() => {
    const cargarMensajes = async () => {
      if (chatActivo) {
        try {
          const response = await fetch(`/api/v1/chat/mensajes/${chatActivo}`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
              'Content-Type': 'application/json'
            }
          });
          if (response.ok) {
            const data = await response.json();
            setMensajes(data.mensajes || []);
          } else {
            console.error('Error al cargar mensajes:', response.statusText);
            setMensajes([]);
          }
        } catch (error) {
          console.error('Error al cargar mensajes:', error);
          setMensajes([]);
        }
      }
    };
    cargarMensajes();
  }, [chatActivo]);

  // Scroll automático al final de los mensajes
  useEffect(() => {
    mensajesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mensajes]);

  const enviarMensaje = async () => {
    if (nuevoMensaje.trim() && chatActivo) {
      try {
        // Crear mensaje local inmediatamente para UI responsiva
        const mensajeLocal = {
          id: `temp-${Date.now()}`,
          contenido: nuevoMensaje,
          remitente: tipoUsuario,
          timestamp: new Date(),
          tipo: 'texto' as const,
          leido: false
        };

        // Agregar mensaje local inmediatamente
        setMensajes(prev => [...prev, mensajeLocal]);
        setNuevoMensaje('');

        // Enviar mensaje al backend
        const response = await fetch(`/api/v1/chat/mensajes/${chatActivo}`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            contenido: mensajeLocal.contenido,
            tipo: 'texto',
            remitente_id: usuarioId
          })
        });

        if (response.ok) {
          const mensajeEnviado = await response.json();
          
          // Reemplazar mensaje temporal con el real
          setMensajes(prev => prev.map(msg => 
            msg.id === mensajeLocal.id ? mensajeEnviado : msg
          ));

          // Actualizar el chat en la lista
          setChats(prev => prev.map(chat => 
            chat.id === chatActivo 
              ? { ...chat, ultimoMensaje: mensajeEnviado.contenido, timestamp: mensajeEnviado.timestamp }
              : chat
          ));

          // Enviar también via WebSocket para tiempo real
          if (estaConectado) {
            enviarMensajeSocket(chatActivo, mensajeEnviado);
          }
        } else {
          console.error('Error al enviar mensaje:', response.statusText);
          // Remover mensaje temporal si falló
          setMensajes(prev => prev.filter(msg => msg.id !== mensajeLocal.id));
        }
      } catch (error) {
        console.error('Error al enviar mensaje:', error);
        // Remover mensaje temporal si falló
        setMensajes(prev => prev.filter(msg => msg.id !== `temp-${Date.now()}`));
      }
    }
  };

  const formatearTiempo = (fecha: Date | string | undefined) => {
    if (!fecha) return 'Ahora';
    
    // Convertir a Date si es string
    const fechaObj = typeof fecha === 'string' ? new Date(fecha) : fecha;
    
    // Verificar que sea una fecha válida
    if (isNaN(fechaObj.getTime())) {
      return 'Ahora';
    }
    
    const ahora = new Date();
    const diff = ahora.getTime() - fechaObj.getTime();
    const minutos = Math.floor(diff / (1000 * 60));
    const horas = Math.floor(diff / (1000 * 60 * 60));
    const dias = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutos < 60) return `${minutos}m`;
    if (horas < 24) return `${horas}h`;
    if (dias < 7) return `${dias}d`;
    return fechaObj.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' });
  };

  const chatSeleccionado = chats.find(chat => chat.id === chatActivo);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Lista de chats - Panel izquierdo */}
      <div className={`${mostrarChat ? 'hidden md:flex' : 'flex'} flex-col w-full md:w-80 bg-white border-r border-gray-200`}>
        {/* Header */}
        <div className="p-4 border-b border-gray-200 bg-white">
          <h2 className="text-xl font-semibold text-gray-800">
            {tipoUsuario === 'psicologo' ? 'Mis Pacientes' : 'Mis Psicólogos'}
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {tipoUsuario === 'psicologo' ? 'Gestiona la comunicación con tus pacientes' : 'Comunícate con tu equipo terapéutico'}
          </p>
        </div>

        {/* Barra de búsqueda */}
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar conversaciones..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Lista de chats */}
        <div className="flex-1 overflow-y-auto">
          {chats
            .filter(chat => 
              chat.nombre.toLowerCase().includes(busqueda.toLowerCase())
            )
            .map((chat) => (
              <div
                key={chat.id}
                onClick={() => {
                  setChatActivo(chat.id);
                  setMostrarChat(true);
                }}
                className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                  chatActivo === chat.id ? 'bg-primary-50 border-l-4 border-l-primary-500' : ''
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <img
                      src={chat.avatar}
                      alt={chat.nombre}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    {chat.online && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-medium text-gray-900 truncate">
                        {chat.nombre}
                      </h3>
                      <span className="text-xs text-gray-500">
                        {formatearTiempo(chat.timestamp)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 truncate mt-1">
                      {chat.ultimoMensaje}
                    </p>
                  </div>
                  {chat.noLeidos > 0 && (
                    <div className="ml-2">
                      <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-primary-500 rounded-full">
                        {chat.noLeidos}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Chat activo - Panel derecho */}
      {mostrarChat && chatSeleccionado && (
        <div className="flex-1 flex flex-col bg-white">
          {/* Header del chat */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setMostrarChat(false)}
                className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeftIcon className="h-5 w-5 text-gray-600" />
              </button>
              <img
                src={chatSeleccionado.avatar}
                alt={chatSeleccionado.nombre}
                className="w-10 h-10 rounded-full object-cover"
              />
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {chatSeleccionado.nombre}
                </h3>
                <div className="text-sm text-gray-500">
                  {chatSeleccionado.online ? 'En línea' : 'Desconectado'}
                  {estaConectado && (
                    <span className="ml-2 inline-flex items-center">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                      Tiempo real
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <ArrowsPointingOutIcon className="h-5 w-5 text-gray-600" />
              </button>
              <button 
                onClick={() => setMostrarChat(false)}
                className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <XMarkIcon className="h-5 w-5 text-gray-600" />
              </button>
            </div>
          </div>

          {/* Área de mensajes */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {mensajes.map((mensaje) => (
              <div
                key={mensaje.id}
                className={`flex ${mensaje.remitente === tipoUsuario ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    mensaje.remitente === tipoUsuario
                      ? 'bg-primary-500 text-white'
                      : 'bg-white text-gray-900 border border-gray-200'
                  }`}
                >
                  <p className="text-sm">{mensaje.contenido}</p>
                  <p className={`text-xs mt-1 ${
                    mensaje.remitente === tipoUsuario ? 'text-primary-100' : 'text-gray-500'
                  }`}>
                    {(() => {
                      try {
                        const timestamp = typeof mensaje.timestamp === 'string' 
                          ? new Date(mensaje.timestamp) 
                          : mensaje.timestamp;
                        return timestamp.toLocaleTimeString('es-ES', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        });
                      } catch (error) {
                        return 'Ahora';
                      }
                    })()}
                  </p>
                </div>
              </div>
            ))}
            
            {/* Indicador de "escribiendo" */}
            {usuariosEscribiendo.size > 0 && (
              <div className="flex justify-start">
                <div className="bg-gray-100 text-gray-600 px-4 py-2 rounded-lg text-sm italic">
                  ✍️ {Array.from(usuariosEscribiendo).length === 1 ? 'Alguien está escribiendo...' : 'Varias personas están escribiendo...'}
                </div>
              </div>
            )}
            
            <div ref={mensajesEndRef} />
          </div>

          {/* Input de mensaje */}
          <div className="p-4 border-t border-gray-200 bg-white">
            <div className="flex items-center space-x-2">
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <FaceSmileIcon className="h-5 w-5 text-gray-600" />
              </button>
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={nuevoMensaje}
                  onChange={(e) => {
                    setNuevoMensaje(e.target.value);
                    // Indicar que está escribiendo
                    if (chatActivo && estaConectado) {
                      indicarEscritura(chatActivo, e.target.value.length > 0);
                    }
                  }}
                  onKeyPress={(e) => e.key === 'Enter' && enviarMensaje()}
                  placeholder="Escribe un mensaje..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <PhotoIcon className="h-5 w-5 text-gray-600" />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <MicrophoneIcon className="h-5 w-5 text-gray-600" />
              </button>
              <button
                onClick={enviarMensaje}
                disabled={!nuevoMensaje.trim()}
                className="p-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <PaperAirplaneIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Estado vacío cuando no hay chat seleccionado */}
      {!mostrarChat && (
        <div className="hidden md:flex flex-1 items-center justify-center bg-gray-50">
          <div className="text-center">
            <ChatBubbleLeftIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Selecciona una conversación
            </h3>
            <p className="text-gray-500">
              {tipoUsuario === 'psicologo' 
                ? 'Elige un paciente para comenzar a chatear' 
                : 'Elige tu psicólogo para comenzar a chatear'
              }
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatSistema;
