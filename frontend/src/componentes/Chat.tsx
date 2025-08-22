import React, { useState, useEffect, useRef, useMemo } from 'react';
import { authService } from '../servicios/auth.service';
import { chatService } from '../servicios/chat.service';
import { webSocketService } from '../servicios/websocket.service';
import Notificacion from './Notificacion';

interface Mensaje {
  id: string;
  contenido: string;
  emisor_id: string;
  receptor_id: string;
  emisor_nombre: string;
  emisor_rol: string;
  timestamp: string;
  leido: boolean;
}

interface Conversacion {
  id: string;
  participante_id: string;
  participante_nombre: string;
  participante_rol: string;
  ultimo_mensaje?: string;
  timestamp_ultimo?: string;
  no_leidos: number;
  avatar_url?: string;
}

interface ChatProps {
  psicologoId?: string;
}

const Chat: React.FC<ChatProps> = ({ psicologoId }) => {
  const [conversaciones, setConversaciones] = useState<Conversacion[]>([]);
  const [conversacionActiva, setConversacionActiva] = useState<string | null>(null);
  const [mensajes, setMensajes] = useState<Mensaje[]>([]);
  const [nuevoMensaje, setNuevoMensaje] = useState('');
  const [loading, setLoading] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [filtroRol, setFiltroRol] = useState<'todos' | 'pacientes' | 'psicologos' | 'admin'>('todos');
  
  const [notificacion, setNotificacion] = useState({
    visible: false,
    mensaje: '',
    tipo: 'info' as 'exito' | 'error' | 'advertencia' | 'info'
  });

  const [wsConnected, setWsConnected] = useState(false);
  const user = useMemo(() => authService.getUser(), []);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Función para mostrar notificaciones
  const mostrarNotificacion = (mensaje: string, tipo: 'exito' | 'error' | 'advertencia' | 'info') => {
    setNotificacion({
      visible: true,
      mensaje,
      tipo
    });
  };

  const cerrarNotificacion = () => {
    setNotificacion(prev => ({ ...prev, visible: false }));
  };

  useEffect(() => {
    console.log('🔍 Debug - Chat - useEffect [user] ejecutado - user:', user);
    if (user) {
      console.log('🔍 Debug - Chat - Llamando cargarConversaciones desde useEffect [user]');
      cargarConversaciones();
      
      // Conectar WebSocket
      webSocketService.connect();
      webSocketService.joinUser(user.id);
      
      // Escuchar eventos de WebSocket
      webSocketService.onConnect(() => {
        console.log('🔌 WebSocket conectado en Chat');
        setWsConnected(true);
      });
      
      webSocketService.onDisconnect(() => {
        console.log('🔌 WebSocket desconectado en Chat');
        setWsConnected(false);
      });
      
      webSocketService.onNewMessage((data) => {
        console.log('📨 Nuevo mensaje recibido via WebSocket:', data);
        // TODO: Agregar mensaje a la conversación activa
      });
    }
    
    // Cleanup: desconectar WebSocket cuando el componente se desmonte
    return () => {
      if (user) {
        webSocketService.disconnect();
      }
    };
  }, [user]); // Solo cargar cuando cambie el usuario, no cuando cambie el filtro

  useEffect(() => {
    if (conversacionActiva) {
      cargarMensajes(conversacionActiva);
      // Marcar mensajes como leídos
      marcarComoLeidos(conversacionActiva);
    }
  }, [conversacionActiva]);

  useEffect(() => {
    // Scroll automático al último mensaje
    scrollToBottom();
  }, [mensajes]);

  // WebSocket reemplaza el polling - no necesitamos intervalos
  // Los mensajes llegan en tiempo real via WebSocket

  const cargarConversaciones = async () => {
    console.log('🔍 Debug - Chat - cargarConversaciones INICIADO');
    try {
      setLoading(true);
      console.log('🔍 Debug - Chat - Loading establecido en TRUE');
      
      const response = await chatService.obtenerConversaciones(filtroRol);
      
      // Debug: ver qué está devolviendo la API
      console.log('🔍 Debug - Chat - API Response:', response);
      console.log('🔍 Debug - Chat - response.data:', response.data);
      
      // Validar que response.data sea un array
      if (Array.isArray(response.data)) {
        console.log('🔍 Debug - Chat - response.data es array directo, estableciendo conversaciones');
        setConversaciones(response.data);
      } else if (response.data && response.data.success && Array.isArray(response.data.data)) {
        // Si la respuesta está anidada en .data.data (formato estándar)
        console.log('🔍 Debug - Chat - response.data.data es array, estableciendo conversaciones');
        setConversaciones(response.data.data);
      } else {
        console.error('🔍 Debug - Chat - response.data no es un array, estableciendo array vacío');
        setConversaciones([]);
      }
    } catch (error: any) {
      console.error('Error al cargar conversaciones:', error);
      mostrarNotificacion('Error al cargar conversaciones', 'error');
      setConversaciones([]);
    } finally {
      console.log('🔍 Debug - Chat - Loading establecido en FALSE');
      setLoading(false);
    }
  };

  const cargarMensajes = async (conversacionId: string) => {
    try {
      const response = await chatService.obtenerMensajes(conversacionId);
      setMensajes(response.data);
    } catch (error: any) {
      console.error('Error al cargar mensajes:', error);
      mostrarNotificacion('Error al cargar mensajes', 'error');
    }
  };

  const marcarComoLeidos = async (conversacionId: string) => {
    try {
      await chatService.marcarComoLeidos(conversacionId);
    } catch (error: any) {
      console.error('Error al marcar como leídos:', error);
    }
  };

  const enviarMensaje = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoMensaje.trim() || !conversacionActiva) return;

    try {
      setEnviando(true);
      
      // Enviar mensaje via WebSocket (tiempo real)
      if (wsConnected) {
        webSocketService.sendMessage(conversacionActiva, nuevoMensaje.trim(), user?.id || '');
        
        // Agregar mensaje localmente inmediatamente
        const nuevoMensajeObj = {
          id: `temp_${Date.now()}`,
          contenido: nuevoMensaje.trim(),
          emisor_id: user?.id || '',
          receptor_id: conversacionActiva,
          emisor_nombre: `${user?.nombres} ${user?.apellidos}`,
          emisor_rol: user?.rol || 'psicologo',
          timestamp: new Date().toISOString(),
          leido: false
        };
        
        setMensajes(prev => [...prev, nuevoMensajeObj]);
        setNuevoMensaje('');
        
        mostrarNotificacion('Mensaje enviado', 'exito');
      } else {
        // Fallback a API si WebSocket no está conectado
        const mensajeData = {
          contenido: nuevoMensaje.trim(),
          receptor_id: conversacionActiva
        };

        const response = await chatService.enviarMensaje(mensajeData);
        setMensajes(prev => [...prev, response.data]);
        setNuevoMensaje('');
        mostrarNotificacion('Mensaje enviado (modo fallback)', 'exito');
      }
    } catch (error: any) {
      console.error('Error al enviar mensaje:', error);
      mostrarNotificacion('Error al enviar mensaje', 'error');
    } finally {
      setEnviando(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const iniciarConversacion = async (participanteId: string, participanteNombre: string, participanteRol: string) => {
    try {
      const response = await chatService.iniciarConversacion({
        participante_id: participanteId,
        participante_nombre: participanteNombre,
        participante_rol: participanteRol
      });
      
      setConversacionActiva(participanteId);
      setMensajes([]);
      
      // Agregar la nueva conversación a la lista si no existe
      const conversacionExistente = conversaciones.find(c => c.participante_id === participanteId);
      if (!conversacionExistente) {
        setConversaciones(prev => [...prev, {
          id: participanteId,
          participante_id: participanteId,
          participante_nombre: participanteNombre,
          participante_rol: participanteRol,
          no_leidos: 0
        }]);
      }
    } catch (error: any) {
      console.error('Error al iniciar conversación:', error);
      mostrarNotificacion('Error al iniciar conversación', 'error');
    }
  };

  const obtenerConversacionActiva = () => {
    return conversaciones.find(c => c.participante_id === conversacionActiva);
  };

  const formatearTimestamp = (timestamp: string) => {
    const fecha = new Date(timestamp);
    const ahora = new Date();
    const diffMs = ahora.getTime() - fecha.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Ahora';
    if (diffMins < 60) return `Hace ${diffMins} min`;
    if (diffHours < 24) return `Hace ${diffHours}h`;
    if (diffDays < 7) return `Hace ${diffDays}d`;
    
    return fecha.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit'
    });
  };

  const filtrarConversaciones = () => {
    // Debug: ver el estado actual de conversaciones
    console.log('🔍 Debug - Chat - filtrarConversaciones - conversaciones:', conversaciones);
    console.log('🔍 Debug - Chat - filtrarConversaciones - filtroRol:', filtroRol);
    
    // Asegurar que conversaciones sea un array
    if (!Array.isArray(conversaciones)) {
      console.error('🔍 Debug - Chat - conversaciones no es un array:', conversaciones);
      return [];
    }
    
    if (filtroRol === 'todos') return conversaciones;
    return conversaciones.filter(c => c.participante_rol === filtroRol);
  };

  return (
    <div className="h-full flex flex-col bg-white rounded-lg shadow-sm border border-amber-100">
             {/* Header del Chat */}
       <div className="px-4 py-3 border-b border-amber-200 bg-amber-50">
         <div className="flex items-center justify-between">
           <h3 className="text-lg font-semibold text-gray-900">Chat</h3>
           <div className="flex items-center space-x-2">
             {/* Indicador de estado WebSocket */}
             <div className="flex items-center space-x-2">
               <div className={`w-2 h-2 rounded-full ${wsConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
               <span className="text-xs text-gray-600">
                 {wsConnected ? 'Conectado' : 'Desconectado'}
               </span>
             </div>
             
             <select
               value={filtroRol}
               onChange={(e) => setFiltroRol(e.target.value as any)}
               className="text-xs px-2 py-1 border border-amber-200 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
             >
               <option value="todos">Todos</option>
               <option value="pacientes">Pacientes</option>
               <option value="psicologos">Psicólogos</option>
               <option value="admin">Administrador</option>
             </select>
           </div>
         </div>
       </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Lista de Conversaciones */}
        <div className="w-1/3 border-r border-amber-200 flex flex-col">
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-gray-500">Cargando conversaciones...</div>
            ) : filtrarConversaciones().length === 0 ? (
              <div className="p-4 text-center text-gray-500">No hay conversaciones</div>
            ) : (
              filtrarConversaciones().map((conversacion) => (
                <div
                  key={conversacion.id}
                  onClick={() => setConversacionActiva(conversacion.participante_id)}
                  className={`p-3 border-b border-amber-100 cursor-pointer hover:bg-amber-50 transition-colors ${
                    conversacionActiva === conversacion.participante_id ? 'bg-amber-100' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      {/* Foto de perfil */}
                      <div className="flex-shrink-0">
                        {conversacion.avatar_url ? (
                          <img
                            src={conversacion.avatar_url}
                            alt={`Avatar de ${conversacion.participante_nombre}`}
                            className="w-10 h-10 rounded-full object-cover border-2 border-amber-200"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-amber-200 flex items-center justify-center border-2 border-amber-300">
                            <span className="text-amber-700 font-semibold text-sm">
                              {conversacion.participante_nombre.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 truncate">
                          {conversacion.participante_nombre}
                        </h4>
                        <p className="text-xs text-gray-500 capitalize">
                          {conversacion.participante_rol}
                        </p>
                        {conversacion.ultimo_mensaje && (
                          <p className="text-xs text-gray-600 truncate mt-1">
                            {conversacion.ultimo_mensaje}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-end space-y-1">
                      {conversacion.timestamp_ultimo && (
                        <span className="text-xs text-gray-400">
                          {formatearTimestamp(conversacion.timestamp_ultimo)}
                        </span>
                      )}
                      {conversacion.no_leidos > 0 && (
                        <span className="bg-amber-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                          {conversacion.no_leidos}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Área de Mensajes */}
        <div className="flex-1 flex flex-col">
          {conversacionActiva ? (
            <>
              {/* Header de la conversación */}
              <div className="px-4 py-3 border-b border-amber-200 bg-amber-50">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">
                      {obtenerConversacionActiva()?.participante_nombre}
                    </h4>
                    <p className="text-xs text-gray-500 capitalize">
                      {obtenerConversacionActiva()?.participante_rol}
                    </p>
                  </div>
                  <button
                    onClick={() => setConversacionActiva(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Mensajes */}
              <div 
                ref={chatContainerRef}
                className="flex-1 overflow-y-auto p-4 space-y-3"
              >
                {mensajes.map((mensaje) => (
                  <div
                    key={mensaje.id}
                    className={`flex ${mensaje.emisor_id === user?.id ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-3 py-2 rounded-lg ${
                        mensaje.emisor_id === user?.id
                          ? 'bg-amber-500 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      <p className="text-sm">{mensaje.contenido}</p>
                      <p className={`text-xs mt-1 ${
                        mensaje.emisor_id === user?.id ? 'text-amber-100' : 'text-gray-500'
                      }`}>
                        {formatearTimestamp(mensaje.timestamp)}
                        {mensaje.emisor_id !== user?.id && !mensaje.leido && (
                          <span className="ml-2">●</span>
                        )}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Formulario de envío */}
              <form onSubmit={enviarMensaje} className="p-4 border-t border-amber-200">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={nuevoMensaje}
                    onChange={(e) => setNuevoMensaje(e.target.value)}
                    placeholder="Escribe un mensaje..."
                    className="flex-1 px-3 py-2 border border-amber-200 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                    disabled={enviando}
                  />
                  <button
                    type="submit"
                    disabled={!nuevoMensaje.trim() || enviando}
                    className="px-4 py-2 bg-amber-500 text-white rounded-md hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {enviando ? 'Enviando...' : 'Enviar'}
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <p className="text-lg font-medium">Selecciona una conversación</p>
                <p className="text-sm">Elige con quién quieres chatear</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Notificación */}
      <Notificacion
        visible={notificacion.visible}
        mensaje={notificacion.mensaje}
        tipo={notificacion.tipo}
        onCerrar={cerrarNotificacion}
      />
    </div>
  );
};

export default Chat;
