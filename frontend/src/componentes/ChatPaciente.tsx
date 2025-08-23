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
  const [mensajeError, setMensajeError] = useState('');
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
    try {
      setLoading(true);
      
      // Obtener información del psicólogo asignado desde la API
      const response = await chatService.obtenerPsicologoAsignado();
      
      if (response.data && response.data.success && response.data.data) {
        const psicologoData = response.data.data;
        setPsicologoInfo({
          id: psicologoData.psicologo_id,
          nombre: psicologoData.psicologo_nombre,
          avatar_url: psicologoData.psicologo_avatar,
          email: psicologoData.psicologo_email
        });
        
        // Cargar mensajes después de obtener la info del psicólogo
        await cargarMensajes(psicologoData.psicologo_id);
      } else {
        console.error('Error: No se pudo obtener información del psicólogo');
        mostrarNotificacion('No se pudo obtener información del psicólogo', 'error');
      }
    } catch (error: any) {
      console.error('Error al cargar información del psicólogo:', error);
      
      if (error.response?.status === 404) {
        mostrarNotificacion('No tienes un psicólogo asignado para chatear', 'advertencia');
      } else {
        mostrarNotificacion('Error al cargar información del psicólogo', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  // Cargar mensajes
  const cargarMensajes = async (psicologoId: string) => {
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
      
      // SIEMPRE usar API (que incluye WebSocket automáticamente)
      const mensajeData = {
        contenido: nuevoMensaje.trim(),
        receptor_id: psicologoId
      };

      console.log('🔍 ChatPaciente - Enviando mensaje via API:', mensajeData);
      const response = await chatService.enviarMensaje(mensajeData);
      console.log('🔍 ChatPaciente - Respuesta del backend:', response);
      console.log('🔍 ChatPaciente - Mensaje recibido:', response.data.data);
      
      setMensajes(prev => [...prev, response.data.data]);
      setNuevoMensaje('');
      mostrarNotificacion('Mensaje enviado', 'exito');
    } catch (error: any) {
      console.error('Error al enviar mensaje:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Error al enviar mensaje';
      setMensajeError(errorMessage);
      mostrarNotificacion('Error al enviar mensaje', 'error');
    } finally {
      setEnviando(false);
    }
  };

  useEffect(() => {
    // Cargar información del psicólogo cuando el componente se monte
    cargarInfoPsicologo();
  }, []); // Solo ejecutar una vez al montar

  useEffect(() => {
    if (user) {
      // Conectar WebSocket
      console.log('🔍 ChatPaciente - Conectando WebSocket...');
      webSocketService.connect();
      
      // Esperar un poco para que se conecte antes de unirse a la sala
      setTimeout(() => {
        console.log('🔍 ChatPaciente - Uniendo usuario a sala:', user.id);
        webSocketService.joinUser(user.id);
      }, 1000);
      
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
        
        // Agregar mensaje a la conversación
        if (data.mensajeCompleto) {
          setMensajes(prev => [...prev, data.mensajeCompleto]);
        } else {
          // Fallback si no viene mensajeCompleto
          const nuevoMensaje = {
            id: `ws_${Date.now()}`,
            contenido: data.message,
            emisor_id: data.senderId,
            receptor_id: user?.id || '',
            emisor_nombre: 'Psicólogo',
            emisor_rol: 'psicologo',
            timestamp: data.timestamp,
            leido: false
          };
          setMensajes(prev => [...prev, nuevoMensaje]);
        }
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
    <div className="h-full flex flex-col bg-white rounded-lg shadow-sm border border-amber-100" style={{ height: '500px', maxHeight: '500px' }}>
      {/* Header del Chat */}
      <div className="px-4 py-3 border-b border-amber-200 bg-amber-50 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {/* Avatar del psicólogo */}
            {psicologoInfo?.avatar_url ? (
              <img
                src={psicologoInfo.avatar_url}
                alt={`Avatar de ${psicologoInfo.nombre}`}
                className="w-10 h-10 rounded-full object-cover border-2 border-amber-200"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-amber-200 flex items-center justify-center border-2 border-amber-300">
                <span className="text-amber-700 font-semibold text-sm">
                  {(psicologoInfo?.nombre || 'P').charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            
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

      {/* Área de Mensajes - Scrollable con altura fija */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ height: 'calc(500px - 140px)', maxHeight: 'calc(500px - 140px)' }}>
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

      {/* Input para enviar mensaje - Fijo */}
      <div className="px-4 py-3 border-t border-amber-200 bg-white flex-shrink-0">
        <div className="flex space-x-2">
          <input
            type="text"
            value={nuevoMensaje}
            onChange={(e) => {
              setNuevoMensaje(e.target.value);
              if (mensajeError) setMensajeError('');
            }}
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
        
        {/* Mostrar error si existe */}
        {mensajeError && (
          <div className="mt-2 text-red-500 text-sm">
            {mensajeError}
          </div>
        )}
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
