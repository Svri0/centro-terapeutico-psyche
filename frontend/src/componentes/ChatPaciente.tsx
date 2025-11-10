import React, { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { authService } from '../servicios/auth.service';
import { chatService, MensajeChat, PacienteChat } from '../servicios/chat.service';

interface ChatPacienteProps {
  pacienteId: string;
  onMensajesNoLeidosChange?: (tieneMensajesNoLeidos: boolean) => void;
}

const ChatPaciente: React.FC<ChatPacienteProps> = ({ pacienteId, onMensajesNoLeidosChange }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [psicologo, setPsicologo] = useState<PacienteChat | null>(null);
  const [mensajes, setMensajes] = useState<MensajeChat[]>([]);
  const [nuevoMensaje, setNuevoMensaje] = useState('');
  const [conectado, setConectado] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [autenticado, setAutenticado] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mensajesEndRef = useRef<HTMLDivElement>(null);
  const psicologoRef = useRef<PacienteChat | null>(null);
  const mensajesCargadosRef = useRef<string | null>(null); // Para evitar cargas repetidas
  const socketRef = useRef<Socket | null>(null);
  const autenticadoRef = useRef<boolean>(false);

  const scrollToBottom = () => {
    mensajesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [mensajes]);

  useEffect(() => {
    const token = authService.getToken();
    if (!token) {
      setError('No hay token de autenticación');
      setCargando(false);
      return;
    }

    console.log('🔄 Iniciando conexión WebSocket para paciente...');
    
    const newSocket = io(import.meta.env.VITE_API_URL || 'http://localhost:3002', {
      auth: {
        token: token
      },
      transports: ['websocket']
    });

    setSocket(newSocket);
    socketRef.current = newSocket;

    newSocket.on('connect', () => {
      console.log('Conectado al chat como paciente');
      setConectado(true);
      setCargando(false);
      console.log('🔐 Enviando token de autenticación:', token);
      newSocket.emit('authenticate', { token });
    });

    newSocket.on('authenticated', (data: any) => {
      console.log('✅ Autenticación exitosa:', data);
      setError(null);
      setAutenticado(true);
      autenticadoRef.current = true;
      
      // Cargar mensajes cuando se autentica si ya tenemos el psicólogo
      const psicologoActual = psicologoRef.current;
      if (psicologoActual && psicologoActual.id && mensajesCargadosRef.current !== psicologoActual.id) {
        console.log('🔍 Cargando mensajes después de autenticación...');
        mensajesCargadosRef.current = psicologoActual.id;
        newSocket.emit('cargar_mensajes', { 
          paciente_id: pacienteId, 
          psicologo_id: psicologoActual.id 
        });
      }
    });

    newSocket.on('authentication_error', (error: any) => {
      const errorMessage = error?.message || error?.error || (typeof error === 'string' ? error : 'Error de autenticación');
      console.error('❌ Error de autenticación:', errorMessage, error);
      setError(errorMessage);
      setCargando(false);
    });

    newSocket.on('disconnect', () => {
      console.log('Desconectado del chat');
      setConectado(false);
    });

    newSocket.on('error', (error: any) => {
      const errorMessage = error?.message || error?.error || (typeof error === 'string' ? error : 'Error de conexión');
      console.error('Error en WebSocket:', errorMessage, error);
      setError(errorMessage);
    });

    newSocket.on('connect_error', (error: any) => {
      const errorMessage = error?.message || error?.error || (typeof error === 'string' ? error : 'Error al conectar');
      console.error('Error de conexión WebSocket:', errorMessage, error);
      setError(errorMessage);
      setCargando(false);
    });

    newSocket.on('mensaje_recibido', (mensaje: MensajeChat) => {
      console.log('📥 Mensaje recibido:', mensaje);
      setMensajes(prev => {
        // Evitar duplicados
        const existe = prev.some(m => m.id === mensaje.id);
        if (existe) return prev;
        return [...prev, mensaje];
      });
      
      // Si el mensaje es del psicólogo, actualizar contador y notificar al padre
      if (mensaje.remitente_id !== pacienteId && mensaje.tipo === 'psicologo') {
        setPsicologo(prev => {
          if (prev) {
            const actualizado = { ...prev, mensajes_no_leidos: (prev.mensajes_no_leidos || 0) + 1 };
            psicologoRef.current = actualizado;
            
            // Notificar al padre sobre mensajes no leídos
            if (onMensajesNoLeidosChange) {
              onMensajesNoLeidosChange(actualizado.mensajes_no_leidos > 0);
            }
            
            return actualizado;
          }
          return null;
        });
      }
    });

    newSocket.on('mensaje_enviado', (mensaje: MensajeChat) => {
      console.log('📤 Mensaje enviado:', mensaje);
      setMensajes(prev => {
        // Evitar duplicados
        const existe = prev.some(m => m.id === mensaje.id);
        if (existe) return prev;
        return [...prev, mensaje];
      });
    });

    newSocket.on('mensajes_cargados', (mensajesData: MensajeChat[]) => {
      console.log('📨 Mensajes cargados:', mensajesData.length);
      setMensajes(mensajesData);
      
      // Marcar mensajes como leídos y actualizar contador a 0 INMEDIATAMENTE
      const psicologoActual = psicologoRef.current;
      if (psicologoActual) {
        // SIEMPRE actualizar contador a 0 cuando se cargan los mensajes (el usuario está viendo el chat)
        setPsicologo(prev => {
          if (prev && prev.id === psicologoActual.id) {
            const actualizado = { ...prev, mensajes_no_leidos: 0 };
            psicologoRef.current = actualizado;
            
            // Notificar al padre que ya no hay mensajes no leídos
            if (onMensajesNoLeidosChange) {
              onMensajesNoLeidosChange(false);
            }
            
            return actualizado;
          }
          return prev;
        });
        
        // Luego marcar como leídos en el backend
        newSocket.emit('marcar_como_leidos', { 
          paciente_id: pacienteId, 
          psicologo_id: psicologoActual.id 
        });
      }
    });

    // Cargar datos iniciales
    cargarDatosIniciales();

    return () => {
      newSocket.off('mensajes_cargados');
      newSocket.disconnect();
      mensajesCargadosRef.current = null; // Resetear al desmontar
      socketRef.current = null;
      autenticadoRef.current = false;
    };
  }, [pacienteId]);

  const cargarDatosIniciales = async () => {
    try {
      console.log('🔄 Cargando datos iniciales...');
      
      // Obtener información del psicólogo asignado
      const psicologoData = await chatService.obtenerPsicologoAsignado();
      setPsicologo(psicologoData);
      psicologoRef.current = psicologoData;
      
      console.log('👨‍⚕️ Psicólogo asignado:', psicologoData);
    } catch (error) {
      console.error('Error al cargar datos iniciales:', error);
      setError('Error al cargar los datos del chat');
    }
  };

  // Actualizar refs cuando cambian
  useEffect(() => {
    psicologoRef.current = psicologo;
    // Resetear el flag de mensajes cargados cuando cambia el psicólogo
    if (psicologo?.id !== mensajesCargadosRef.current) {
      mensajesCargadosRef.current = null;
    }
    
    // Notificar al padre sobre mensajes no leídos (solo si hay mensajes y no estamos en el chat)
    if (onMensajesNoLeidosChange) {
      const tieneMensajesNoLeidos = psicologo?.mensajes_no_leidos ? psicologo.mensajes_no_leidos > 0 : false;
      onMensajesNoLeidosChange(tieneMensajesNoLeidos);
    }
  }, [psicologo, onMensajesNoLeidosChange]);

  useEffect(() => {
    socketRef.current = socket;
  }, [socket]);

  useEffect(() => {
    autenticadoRef.current = autenticado;
  }, [autenticado]);

  const enviarMensaje = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!nuevoMensaje.trim() || !socket || !psicologo) {
      return;
    }

    const mensajeData = {
      contenido: nuevoMensaje.trim(),
      remitente_id: pacienteId,
      destinatario_id: psicologo.id,
      tipo: 'paciente' as const
    };

    try {
      socket.emit('enviar_mensaje', mensajeData);
      setNuevoMensaje('');
    } catch (error) {
      console.error('Error al enviar mensaje:', error);
      setError('Error al enviar el mensaje');
    }
  };

  // Cargar mensajes cuando se selecciona el psicólogo
  useEffect(() => {
    // Usar el ID del psicólogo como clave para evitar cargas repetidas
    const psicologoId = psicologo?.id;
    const socketActual = socketRef.current;
    const estaAutenticado = autenticadoRef.current;
    
    if (!psicologoId || !socketActual || !estaAutenticado) {
      return;
    }

    // Evitar cargar si ya se cargaron los mensajes para este psicólogo
    if (mensajesCargadosRef.current === psicologoId) {
      return;
    }
    
    console.log('🔍 Cargando mensajes para psicólogo:', psicologoId);
    mensajesCargadosRef.current = psicologoId;
    setMensajes([]); // Limpiar mensajes anteriores
    
    // Actualizar contador a 0 inmediatamente al entrar al chat (feedback visual inmediato)
    // El handler 'mensajes_cargados' también lo actualizará cuando lleguen los mensajes
    if (psicologo && psicologo.mensajes_no_leidos > 0) {
      setPsicologo(prev => {
        if (prev && prev.id === psicologoId) {
          const actualizado = { ...prev, mensajes_no_leidos: 0 };
          psicologoRef.current = actualizado;
          
          // Notificar al padre que ya no hay mensajes no leídos
          if (onMensajesNoLeidosChange) {
            onMensajesNoLeidosChange(false);
          }
          
          return actualizado;
        }
        return prev;
      });
    }
    
    socketActual.emit('cargar_mensajes', { 
      paciente_id: pacienteId, 
      psicologo_id: psicologoId 
    });
  }, [psicologo?.id, pacienteId]); // Solo depender del ID del psicólogo y pacienteId

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

  if (!psicologo) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-gray-400 text-4xl mb-4">👨‍⚕️</div>
          <p className="text-gray-600 mb-2">No tienes un psicólogo asignado</p>
          <p className="text-gray-500 text-sm">Contacta al administrador para que te asigne un psicólogo</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white rounded-lg border border-gray-200">
      {/* Header del chat */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-amber-300">
            <img
              src={psicologo.avatar_url || 'https://api.dicebear.com/7.x/bottts/svg?seed=doctor&backgroundColor=ffdfbf&scale=80'}
              alt={psicologo.nombres}
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">
              Dr. {psicologo.nombres} {psicologo.apellidos}
            </h3>
            <p className="text-sm text-gray-500">
              {conectado ? '🟢 En línea' : '🔴 Desconectado'}
            </p>
          </div>
        </div>
      </div>

      {/* Área de mensajes */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ maxHeight: '400px' }}>
        {mensajes.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-400 text-4xl mb-4">💬</div>
            <p className="text-gray-500">No hay mensajes aún</p>
            <p className="text-gray-400 text-sm">Envía un mensaje para comenzar la conversación</p>
          </div>
        ) : (
          mensajes.map((mensaje) => (
            <div
              key={mensaje.id}
              className={`flex ${mensaje.remitente_id === pacienteId ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  mensaje.remitente_id === pacienteId
                    ? 'bg-amber-100 text-amber-900'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                <p className="text-sm">{mensaje.contenido}</p>
                <p className="text-xs opacity-70 mt-1">
                  {new Date(mensaje.created_at).toLocaleTimeString('es-CL', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={mensajesEndRef} />
      </div>

      {/* Input de mensaje */}
      <form onSubmit={enviarMensaje} className="p-4 border-t border-gray-200">
        <div className="flex space-x-2">
          <input
            type="text"
            value={nuevoMensaje}
            onChange={(e) => setNuevoMensaje(e.target.value)}
            placeholder="Escribe tu mensaje..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
            disabled={!conectado}
          />
          <button
            type="submit"
            disabled={!nuevoMensaje.trim() || !conectado}
            className="px-4 py-2 bg-amber-100 text-amber-800 rounded-md hover:bg-amber-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Enviar
          </button>
        </div>
        
        {!conectado && (
          <p className="text-red-500 text-xs mt-2">⚠️ Sin conexión. Reintentando...</p>
        )}
      </form>
    </div>
  );
};

export default ChatPaciente;
