import React, { useState, useEffect, useRef } from 'react';
import { authService } from '../servicios/auth.service';
import { chatService, PacienteChat, MensajeChat } from '../servicios/chat.service';
import io, { Socket } from 'socket.io-client';
import ConfiguracionChat from './ConfiguracionChat';

interface ChatPsicologoProps {
  psicologoId: string;
  onMensajesNoLeidosChange?: (numeroMensajesNoLeidos: number) => void;
}

const ChatPsicologo: React.FC<ChatPsicologoProps> = ({ psicologoId, onMensajesNoLeidosChange }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [pacientes, setPacientes] = useState<PacienteChat[]>([]);
  const [personal, setPersonal] = useState<PacienteChat[]>([]);
  const [pacienteSeleccionado, setPacienteSeleccionado] = useState<PacienteChat | null>(null);
  const pacienteSeleccionadoRef = useRef<PacienteChat | null>(null);
  const [mensajes, setMensajes] = useState<MensajeChat[]>([]);
  const [nuevoMensaje, setNuevoMensaje] = useState('');
  const [conectado, setConectado] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [filtroActivo, setFiltroActivo] = useState<'pacientes' | 'personal'>('pacientes');
  const mensajesEndRef = useRef<HTMLDivElement>(null);
  const [mostrarConfig, setMostrarConfig] = useState(false);

  const user = authService.getUser();

  // Scroll automático a los mensajes más recientes
  const scrollToBottom = () => {
    mensajesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
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
      console.log('Conectado al chat');
      setConectado(true);
      setCargando(false);
      
      // Autenticar con el servidor
      newSocket.emit('authenticate', { token });
    });

    newSocket.on('disconnect', () => {
      console.log('Desconectado del chat');
      setConectado(false);
    });

    newSocket.on('authenticated', (data) => {
      console.log('Autenticado en WebSocket:', data);
    });

    newSocket.on('mensaje_recibido', (mensaje: MensajeChat) => {
      setMensajes(prev => [...prev, mensaje]);
      
      // Solo incrementar contador si el chat NO está abierto actualmente
      // Usar ref para obtener el valor actual sin depender de closures
      const esChatAbierto = pacienteSeleccionadoRef.current?.id === mensaje.remitente_id;
      
      // Actualizar lista de pacientes con último mensaje
      setPacientes(prev => prev.map(p => 
        p.id === mensaje.remitente_id 
          ? { 
              ...p, 
              ultimo_mensaje: mensaje.contenido,
              ultimo_mensaje_timestamp: mensaje.created_at,
              // Solo incrementar si es mensaje del paciente Y el chat no está abierto
              mensajes_no_leidos: (mensaje.tipo === 'paciente' && !esChatAbierto) 
                ? p.mensajes_no_leidos + 1 
                : p.mensajes_no_leidos
            }
          : p
      ));
    });

    newSocket.on('mensaje_enviado', (mensaje: MensajeChat) => {
      setMensajes(prev => [...prev, mensaje]);
    });

    newSocket.on('pacientes_disponibles', (pacientesData: PacienteChat[]) => {
      setPacientes(pacientesData);
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
      const [pacientesData, personalData] = await Promise.all([
        chatService.obtenerPacientes(),
        chatService.obtenerPersonal()
      ]);
      setPacientes(pacientesData);
      setPersonal(personalData);
    } catch (error) {
      console.error('Error al cargar datos iniciales:', error);
    }
  };

  // Actualizar ref cuando cambia el paciente seleccionado
  useEffect(() => {
    pacienteSeleccionadoRef.current = pacienteSeleccionado;
  }, [pacienteSeleccionado]);

  // Notificar al padre sobre mensajes no leídos
  useEffect(() => {
    if (onMensajesNoLeidosChange) {
      const totalMensajesNoLeidos = pacientes.reduce((sum, p) => sum + (p.mensajes_no_leidos || 0), 0) +
                                   personal.reduce((sum, p) => sum + (p.mensajes_no_leidos || 0), 0);
      onMensajesNoLeidosChange(totalMensajesNoLeidos);
    }
  }, [pacientes, personal, onMensajesNoLeidosChange]);

  // Cargar mensajes cuando se selecciona un paciente
  useEffect(() => {
    if (pacienteSeleccionado && socket) {
      // Actualizar contador a 0 INMEDIATAMENTE cuando se selecciona un contacto
      setPacientes(prev => prev.map(p => 
        p.id === pacienteSeleccionado.id
          ? { ...p, mensajes_no_leidos: 0 }
          : p
      ));
      setPersonal(prev => prev.map(p => 
        p.id === pacienteSeleccionado.id
          ? { ...p, mensajes_no_leidos: 0 }
          : p
      ));
      
      socket.emit('cargar_mensajes', {
        paciente_id: pacienteSeleccionado.id,
        psicologo_id: psicologoId
      });

      const handleMensajesCargados = (mensajesData: MensajeChat[]) => {
        setMensajes(mensajesData);
        
        // Marcar mensajes como leídos inmediatamente
        socket.emit('marcar_como_leidos', {
          paciente_id: pacienteSeleccionado.id,
          psicologo_id: psicologoId
        });
        
        // Asegurar que el contador esté en 0 (por si acaso)
        setPacientes(prev => prev.map(p => 
          p.id === pacienteSeleccionado.id
            ? { ...p, mensajes_no_leidos: 0 }
            : p
        ));
        setPersonal(prev => prev.map(p => 
          p.id === pacienteSeleccionado.id
            ? { ...p, mensajes_no_leidos: 0 }
            : p
        ));
      };

      socket.on('mensajes_cargados', handleMensajesCargados);

      return () => {
        socket.off('mensajes_cargados', handleMensajesCargados);
      };
    }
  }, [pacienteSeleccionado, socket, psicologoId]);

  const enviarMensaje = () => {
    if (!nuevoMensaje.trim() || !socket || !pacienteSeleccionado) return;

    const mensaje = {
      contenido: nuevoMensaje.trim(),
      remitente_id: psicologoId,
      destinatario_id: pacienteSeleccionado.id,
      tipo: 'psicologo' as const
    };

    socket.emit('enviar_mensaje', mensaje);
    setNuevoMensaje('');
  };

  const exportarChatPDF = async () => {
    try {
      if (!pacienteSeleccionado) return;
      await chatService.generarBackupChat(pacienteSeleccionado.id);
    } catch (error) {
      console.error('Error al exportar chat:', error);
      alert('No se pudo exportar el chat');
    }
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
    
    return fecha.toLocaleDateString('es-CL');
  };

  if (cargando) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Conectando al chat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[600px] bg-white rounded-lg shadow-sm border border-amber-100 overflow-hidden">
      {/* Lista de pacientes */}
      <div className="w-1/3 border-r border-amber-200 bg-gray-50 flex flex-col">
        <div className="p-4 border-b border-amber-200 bg-white">
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
              onClick={() => setFiltroActivo('pacientes')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                filtroActivo === 'pacientes'
                  ? 'bg-amber-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Pacientes
            </button>
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
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {(() => {
            const listaActual = filtroActivo === 'pacientes' ? pacientes : personal;
            const tituloLista = filtroActivo === 'pacientes' ? 'pacientes' : 'personal';
            
            if (listaActual.length === 0) {
              return (
                <div className="p-4 text-center text-gray-500">
                  <p>No hay {tituloLista} disponibles</p>
                </div>
              );
            }

            return listaActual.map((contacto) => (
              <div
                key={contacto.id}
                onClick={() => setPacienteSeleccionado(contacto)}
                className={`p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors ${
                  pacienteSeleccionado?.id === contacto.id 
                    ? 'bg-amber-100 border-l-4 border-l-amber-500' 
                    : ''
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-amber-200 flex items-center justify-center flex-shrink-0">
                    {contacto.avatar_url ? (
                      <img
                        src={contacto.avatar_url}
                        alt={`${contacto.nombres} ${contacto.apellidos}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-amber-600 font-semibold">
                        {contacto.nombres.charAt(0)}{contacto.apellidos.charAt(0)}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-gray-900 truncate">
                        {contacto.nombres} {contacto.apellidos}
                      </h4>
                      {contacto.mensajes_no_leidos > 0 && (
                        <span className="ml-2 flex items-center justify-center min-w-[20px] h-5 px-1.5 bg-red-500 text-white text-xs font-bold rounded-full flex-shrink-0">
                          {contacto.mensajes_no_leidos > 99 ? '99+' : contacto.mensajes_no_leidos}
                        </span>
                      )}
                    </div>
                    {filtroActivo === 'personal' && (contacto as any).rol && (
                      <p className="text-xs text-amber-600 font-medium">
                        {(contacto as any).rol}
                      </p>
                    )}
                    {contacto.ultimo_mensaje && (
                      <p className="text-sm text-gray-600 truncate">
                        {contacto.ultimo_mensaje}
                      </p>
                    )}
                    {contacto.ultimo_mensaje_timestamp && (
                      <p className="text-xs text-gray-400">
                        {formatearTiempo(contacto.ultimo_mensaje_timestamp)}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ));
          })()}
        </div>
      </div>

      {/* Área de chat */}
      <div className="flex-1 flex flex-col">
        {pacienteSeleccionado ? (
          <>
            {/* Header del chat */}
            <div className="p-4 border-b border-amber-200 bg-white flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-amber-200 flex items-center justify-center">
                  {pacienteSeleccionado.avatar_url ? (
                    <img
                      src={pacienteSeleccionado.avatar_url}
                      alt={`${pacienteSeleccionado.nombres} ${pacienteSeleccionado.apellidos}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-amber-600 font-semibold">
                      {pacienteSeleccionado.nombres.charAt(0)}{pacienteSeleccionado.apellidos.charAt(0)}
                    </span>
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {pacienteSeleccionado.nombres} {pacienteSeleccionado.apellidos}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {filtroActivo === 'pacientes' ? 'Paciente' : (pacienteSeleccionado as any).rol || 'Personal'}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={exportarChatPDF}
                  className="px-3 py-2 bg-amber-100 text-amber-700 rounded-md hover:bg-amber-200"
                  title="Exportar chat a PDF"
                >
                  Exportar PDF
                </button>
                <button
                  onClick={() => setMostrarConfig(true)}
                  className="p-2 rounded-md hover:bg-gray-100 text-gray-600"
                  title="Configuración de chat"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.89 3.31.877 2.42 2.42a1.724 1.724 0 001.065 2.572c1.757.426 1.757 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.89 1.543-.877 3.31-2.42 2.42a1.724 1.724 0 00-2.572 1.065c-.426 1.757-2.924 1.757-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.89-3.31-.877-2.42-2.42a1.724 1.724 0 00-1.065-2.572c-1.757-.426-1.757-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.89-1.543.877-3.31 2.42-2.42.996.574 2.247.146 2.573-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </button>
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
              {mensajes.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  <p>No hay mensajes aún</p>
                  <p className="text-sm">Inicia la conversación enviando un mensaje</p>
                </div>
              ) : (
                mensajes.map((mensaje) => (
                  <div
                    key={mensaje.id}
                    className={`flex ${mensaje.tipo === 'psicologo' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        mensaje.tipo === 'psicologo'
                          ? 'bg-amber-500 text-white'
                          : 'bg-gray-200 text-gray-900'
                      }`}
                    >
                      <p className="text-sm">{mensaje.contenido}</p>
                      <p className={`text-xs mt-1 ${
                        mensaje.tipo === 'psicologo' ? 'text-amber-100' : 'text-gray-500'
                      }`}>
                        {formatearTiempo(mensaje.created_at)}
                      </p>
                    </div>
                  </div>
                ))
              )}
              <div ref={mensajesEndRef} />
            </div>

            {/* Input de mensaje */}
            <div className="p-4 border-t border-amber-200 bg-white">
              <div className="flex space-x-2">
                <textarea
                  value={nuevoMensaje}
                  onChange={(e) => setNuevoMensaje(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Escribe tu mensaje..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
                  rows={1}
                />
                <button
                  onClick={enviarMensaje}
                  disabled={!nuevoMensaje.trim()}
                  className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-gray-500">
              <div className="text-6xl mb-4">💬</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Selecciona un paciente</h3>
              <p>Elige un paciente de la lista para comenzar a chatear</p>
            </div>
          </div>
        )}
      </div>

      {mostrarConfig && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-xl rounded-lg shadow-lg border border-gray-200">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-md font-semibold text-gray-800">Configuración de Chat</h3>
              <button
                onClick={() => setMostrarConfig(false)}
                className="p-2 rounded-md hover:bg-gray-100 text-gray-600"
                aria-label="Cerrar"
              >
                ✕
              </button>
            </div>
            <div className="p-4">
              <ConfiguracionChat />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatPsicologo;
