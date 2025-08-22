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

interface ChatPacienteProps {
  psicologoId?: string;
}

const ChatPaciente: React.FC<ChatPacienteProps> = ({ psicologoId }) => {
  const [mensajes, setMensajes] = useState<Mensaje[]>([]);
  const [nuevoMensaje, setNuevoMensaje] = useState('');
  const [loading, setLoading] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [psicologoInfo, setPsicologoInfo] = useState<any>(null);
  
  const [notificacion, setNotificacion] = useState({
    visible: false,
    mensaje: '',
    tipo: 'info' as 'exito' | 'error' | 'advertencia' | 'info'
  });

  const [wsConnected, setWsConnected] = useState(false);
  const user = useMemo(() => authService.getUser(), []);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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

  // Cargar información del psicólogo
  const cargarInfoPsicologo = async () => {
    if (!psicologoId) return;
    
    try {
      setLoading(true);
      // Aquí podrías hacer una llamada a la API para obtener info del psicólogo
      // Por ahora usamos datos básicos
      setPsicologoInfo({
        id: psicologoId,
        nombre: 'Tu Psicólogo',
        avatar_url: null
      });
    } catch (error) {
      console.error('Error al cargar información del psicólogo:', error);
    } finally {
      setLoading(false);
    }
  };

  // Cargar mensajes
  const cargarMensajes = async () => {
    if (!psicologoId) return;
    
    try {
      setLoading(true);
      // Por ahora cargamos mensajes vacíos
      setMensajes([]);
    } catch (error) {
      console.error('Error al cargar mensajes:', error);
    } finally {
      setLoading(false);
    }
  };

  // Enviar mensaje
  const enviarMensaje = async () => {
    if (!nuevoMensaje.trim() || !psicologoId || !user) return;
    
    setMensajeError('');
    try {
      setEnviando(true);
      
      // Enviar mensaje via WebSocket (tiempo real)
      if (wsConnected) {
        webSocketService.sendMessage(`chat_${psicologoId}`, nuevoMensaje.trim(), user?.id || '');
        
        // Agregar mensaje localmente inmediatamente
        const nuevoMensajeObj = {
          id: `temp_${Date.now()}`,
          contenido: nuevoMensaje.trim(),
          emisor_id: user?.id || '',
          receptor_id: psicologoId,
          emisor_nombre: `${user?.nombres} ${user?.apellidos}`,
          emisor_rol: 'paciente',
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
          receptor_id: psicologoId
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

  useEffect(() => {
    if (psicologoId) {
      cargarInfoPsicologo();
      cargarMensajes();
    }
  }, [psicologoId]);

  useEffect(() => {
    if (user) {
      // Conectar WebSocket
      webSocketService.connect();
      webSocketService.joinUser(user.id);
      
      // Escuchar eventos de WebSocket
      webSocketService.onConnect(() => {
        console.log('🔌 WebSocket conectado en ChatPaciente');
        setWsConnected(true);
      });
      
      webSocketService.onDisconnect(() => {
        console.log('🔌 WebSocket desconectado en ChatPaciente');
        setWsConnected(false);
      });
      
      webSocketService.onNewMessage((data) => {
        console.log('📨 Nuevo mensaje recibido via WebSocket:', data);
        // TODO: Agregar mensaje a la conversación
      });
    }
    
    // Cleanup: desconectar WebSocket cuando el componente se desmonte
    return () => {
      if (user) {
        webSocketService.disconnect();
      }
    };
  }, [user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mensajes]);

  const formatearTimestamp = (timestamp: string) => {
    const fecha = new Date(timestamp);
    const ahora = new Date();
    const diffMs = ahora.getTime() - fecha.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Ahora';
    if (diffMins < 60) return `Hace ${diffMins} min`;
    if (diffMins < 1440) return `Hace ${Math.floor(diffMins / 60)}h`;
    return fecha.toLocaleDateString();
  };

  if (!psicologoId) {
    return (
      <div className="p-6 text-center text-gray-500">
        <div className="text-6xl mb-4">💬</div>
        <h3 className="text-lg font-semibold mb-2">Chat no disponible</h3>
        <p>No tienes un psicólogo asignado para chatear.</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header del Chat */}
      <div className="px-4 py-3 border-b border-amber-200 bg-amber-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {/* Foto de perfil del psicólogo */}
            <div className="flex-shrink-0">
              {psicologoInfo?.avatar_url ? (
                <img
                  src={psicologoInfo.avatar_url}
                  alt={`Avatar de ${psicologoInfo.nombre}`}
                  className="w-10 h-10 rounded-full object-cover border-2 border-amber-200"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-amber-200 flex items-center justify-center border-2 border-amber-300">
                  <span className="text-amber-700 font-semibold text-sm">P</span>
                </div>
              )}
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {psicologoInfo?.nombre || 'Tu Psicólogo'}
              </h3>
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${wsConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="text-xs text-gray-600">
                  {wsConnected ? 'Conectado' : 'Desconectado'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Área de Mensajes */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {loading ? (
          <div className="text-center text-gray-500">Cargando mensajes...</div>
        ) : mensajes.length === 0 ? (
          <div className="text-center text-gray-500">
            <div className="text-4xl mb-2">💬</div>
            <p>Inicia una conversación con tu psicólogo</p>
          </div>
        ) : (
          mensajes.map((mensaje) => (
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
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input para enviar mensaje */}
      <div className="px-4 py-3 border-t border-amber-200 bg-white">
        <div className="flex space-x-2">
          <input
            type="text"
            value={nuevoMensaje}
            onChange={(e) => setNuevoMensaje(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && enviarMensaje()}
            placeholder="Escribe tu mensaje..."
            className="flex-1 px-3 py-2 border border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            disabled={enviando}
          />
          <button
            onClick={enviarMensaje}
            disabled={!nuevoMensaje.trim() || enviando}
            className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {enviando ? 'Enviando...' : 'Enviar'}
          </button>
        </div>
      </div>

      {/* Notificación */}
      {notificacion.visible && (
        <Notificacion
          mensaje={notificacion.mensaje}
          tipo={notificacion.tipo}
          onCerrar={cerrarNotificacion}
        />
      )}
    </div>
  );
};

export default ChatPaciente;
