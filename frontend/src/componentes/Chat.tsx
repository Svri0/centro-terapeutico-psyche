import React, { useState, useEffect, useRef, useMemo } from 'react';
import { authService } from '../servicios/auth.service';
import { chatService } from '../servicios/chat.service';
import { webSocketService } from '../servicios/websocket.service';
import { chatConfigService } from '../servicios/chatConfig.service';
import Notificacion from './Notificacion';
import ConfiguracionChat from './ConfiguracionChat';

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
  // psicologoId ya no se usa, lo eliminamos
}

const Chat: React.FC<ChatProps> = () => {
  const [conversaciones, setConversaciones] = useState<Conversacion[]>([]);
  const [conversacionActiva, setConversacionActiva] = useState<string | null>(null);
  const [mensajes, setMensajes] = useState<Mensaje[]>([]);
  const [nuevoMensaje, setNuevoMensaje] = useState('');
  const [loading, setLoading] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [filtroRol, setFiltroRol] = useState<'todos' | 'pacientes' | 'psicologos' | 'admin'>('todos');
  
  // Estado para configuración del chat
  const [configuracionChatAbierta, setConfiguracionChatAbierta] = useState(false);
  const [temaChatActual, setTemaChatActual] = useState('default');
  const [pacienteConfiguracion, setPacienteConfiguracion] = useState<Conversacion | null>(null);
  
  // Cargar tema guardado del localStorage al montar el componente
  useEffect(() => {
    if (conversacionActiva) {
      const temaGuardado = localStorage.getItem(`chat_tema_${conversacionActiva}`);
      if (temaGuardado && temaGuardado !== 'default') {
        setTemaChatActual(temaGuardado);
        // Aplicar el tema visualmente
        aplicarTemaVisual(temaGuardado);
      } else {
        // Si no hay tema guardado o es el por defecto, limpiar tema visual
        setTemaChatActual('default');
        limpiarTemaVisual();
      }
    } else {
      // Si no hay conversación activa, limpiar tema
      setTemaChatActual('default');
      limpiarTemaVisual();
    }
  }, [conversacionActiva]);

  // Limpiar tema cuando se deselecciona una conversación
  useEffect(() => {
    if (!conversacionActiva) {
      limpiarTemaVisual();
    }
  }, [conversacionActiva]);
  
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
      
      // Esperar un momento para que la conexión se establezca antes de unirse a la sala
      setTimeout(() => {
        console.log('🔍 Chat - Uniendo usuario a sala:', user.id);
        webSocketService.joinUser(user.id);
      }, 1000);
      
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
        
        // Para el psicólogo: recibir mensajes del paciente activo
        if (data.senderId) {
          console.log('🔍 Debug - Chat - data.senderId:', data.senderId);
          console.log('🔍 Debug - Chat - conversacionActiva:', conversacionActiva);
          console.log('🔍 Debug - Chat - data.chatId:', data.chatId);
          
          // Verificar si el mensaje es del usuario actual
          const esDelUsuarioActual = data.senderId === user?.id;
          
          console.log('🔍 Debug - Chat - esDelUsuarioActual:', esDelUsuarioActual);
          
          if (!esDelUsuarioActual) {
            console.log('🔍 Debug - Chat - Agregando mensaje entrante del paciente');
            
            // Crear mensaje entrante con ID único
            const nuevoMensaje: Mensaje = {
              id: `ws_${data.senderId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              contenido: data.message || data.mensajeCompleto?.contenido || 'Mensaje recibido',
              emisor_id: data.senderId,
              receptor_id: user?.id || '',
              emisor_nombre: data.mensajeCompleto?.emisor_nombre || 'Paciente',
              emisor_rol: data.mensajeCompleto?.emisor_rol || 'paciente',
              timestamp: data.timestamp || new Date().toISOString(),
              leido: false
            };
            
            // Agregar mensaje directamente al estado actual
            setMensajes(prev => {
              console.log('🔍 Debug - Chat - Agregando mensaje WebSocket, total previo:', prev.length);
              
              // Verificar si ya existe un mensaje similar para evitar duplicados
              const mensajeDuplicado = prev.find(msg => 
                msg.contenido === nuevoMensaje.contenido && 
                msg.emisor_id === nuevoMensaje.emisor_id &&
                Math.abs(new Date(msg.timestamp).getTime() - new Date(nuevoMensaje.timestamp).getTime()) < 3000
              );
              
              if (mensajeDuplicado) {
                console.log('🔍 Debug - Chat - Mensaje duplicado detectado, ignorando');
                return prev;
              }
              
              const nuevosMensajes = [...prev, nuevoMensaje];
              console.log('🔍 Debug - Chat - Mensaje agregado, nuevo total:', nuevosMensajes.length);
              return nuevosMensajes;
            });
            
            // Marcar como leído si hay conversación activa
            if (conversacionActiva) {
              marcarComoLeidos(conversacionActiva);
            }
          } else {
            console.log('🔍 Debug - Chat - Mensaje es del usuario actual, ignorando');
          }
        } else {
          console.log('🔍 Debug - Chat - Mensaje WebSocket ignorado - senderId no disponible');
        }
      });
    }
    
    // Cleanup: desconectar WebSocket cuando el componente se desmonte
    return () => {
      if (user) {
        webSocketService.disconnect();
      }
    };
  }, [user]); // Solo cargar cuando cambie el usuario, no cuando cambie el filtro

  // Cargar mensajes cuando cambia la conversación activa
  useEffect(() => {
    if (conversacionActiva) {
      console.log('🔍 Debug - Chat - Conversación activa cambiada a:', conversacionActiva);
      console.log('🔍 Debug - Chat - Mensajes actuales antes de cargar:', mensajes.length);
      
      // IMPORTANTE: Limpiar mensajes ANTES de cargar los nuevos
      setMensajes([]);
      console.log('🔍 Debug - Chat - Mensajes limpiados, cargando nuevos para conversación:', conversacionActiva);
      
      // Cargar mensajes de la nueva conversación
      cargarMensajes(conversacionActiva);
      
      // Marcar mensajes como leídos
      marcarComoLeidos(conversacionActiva);
    } else {
      console.log('🔍 Debug - Chat - No hay conversación activa, limpiando mensajes');
      // Solo limpiar mensajes si no hay conversación activa
      setMensajes([]);
    }
  }, [conversacionActiva]);

  // Cargar mensajes cuando se selecciona una conversación
  useEffect(() => {
    if (conversacionActiva && user && mensajes.length === 0) {
      console.log('🔍 Debug - Chat - Conversación seleccionada sin mensajes, cargando desde BD...');
      cargarMensajes(conversacionActiva);
    }
  }, [conversacionActiva, user, mensajes.length]);

  useEffect(() => {
    // Scroll automático al último mensaje
    if (Array.isArray(mensajes) && mensajes.length > 0) {
      scrollToBottom();
    }
  }, [mensajes]);

  // Validación adicional de seguridad para mensajes
  useEffect(() => {
    // Asegurar que mensajes siempre sea un array válido
    if (!Array.isArray(mensajes)) {
      console.error('🔍 Debug - Chat - ERROR CRÍTICO: mensajes no es un array, forzando array vacío');
      setMensajes([]);
      return;
    }
    
    // Verificar que no haya mensajes duplicados por ID
    const idsUnicos = new Set();
    const mensajesSinDuplicados = mensajes.filter(mensaje => {
      if (idsUnicos.has(mensaje.id)) {
        console.warn('🔍 Debug - Chat - Mensaje duplicado por ID en useEffect, filtrando:', mensaje.id);
        return false;
      }
      idsUnicos.add(mensaje.id);
      return true;
    });
    
    // Solo actualizar si hay diferencias para evitar loops infinitos
    if (mensajesSinDuplicados.length !== mensajes.length) {
      console.log('🔍 Debug - Chat - Mensajes duplicados filtrados, actualizando estado');
      setMensajes(mensajesSinDuplicados);
    }
    
    console.log('🔍 Debug - Chat - Estado de mensajes validado:', mensajesSinDuplicados.length);
  }, [mensajes]);

  // Cargar mensajes iniciales cuando se monta el componente
  useEffect(() => {
    if (conversacionActiva && user) {
      console.log('🔍 Debug - Chat - Cargando mensajes iniciales para conversación:', conversacionActiva);
      cargarMensajes(conversacionActiva);
    }
  }, [conversacionActiva, user]); // Agregar conversacionActiva como dependencia

  // Sincronización automática de mensajes cada 30 segundos
  useEffect(() => {
    if (conversacionActiva && wsConnected) {
      const intervalId = setInterval(() => {
        console.log('🔍 Debug - Chat - Sincronización automática de mensajes...');
        cargarMensajes(conversacionActiva);
      }, 30000); // 30 segundos
      
      return () => clearInterval(intervalId);
    }
  }, [conversacionActiva, wsConnected]);

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
      console.log('🔍 Debug - Chat - cargarMensajes iniciado para conversación:', conversacionId);
      console.log('🔍 Debug - Chat - Usuario actual:', user?.id);
      console.log('🔍 Debug - Chat - Conversación activa:', conversacionActiva);
      console.log('🔍 Debug - Chat - Tipo de conversacionId:', typeof conversacionId);
      console.log('🔍 Debug - Chat - conversacionId completo:', conversacionId);
      
      // Verificar qué conversación se está seleccionando
      const conversacionSeleccionada = conversaciones.find(c => c.participante_id === conversacionId);
      console.log('🔍 Debug - Chat - Conversación seleccionada:', conversacionSeleccionada);
      
      const response = await chatService.obtenerMensajes(conversacionId);
      console.log('🔍 Debug - Chat - Respuesta de mensajes:', response);
      console.log('🔍 Debug - Chat - response.data:', response.data);
      console.log('🔍 Debug - Chat - response.data es array?', Array.isArray(response.data));
      console.log('🔍 Debug - Chat - response.status:', response.status);
      console.log('🔍 Debug - Chat - response.headers:', response.headers);
      
      // Validar y extraer mensajes de la respuesta
      let mensajesExtraidos: Mensaje[] = [];
      
      if (response.data && response.data.success && Array.isArray(response.data.data)) {
        // Formato estándar: { success: true, data: [...] }
        mensajesExtraidos = response.data.data;
        console.log('🔍 Debug - Chat - Mensajes extraídos del formato estándar:', mensajesExtraidos.length);
      } else if (Array.isArray(response.data)) {
        // Formato directo: [...]
        mensajesExtraidos = response.data;
        console.log('🔍 Debug - Chat - Mensajes extraídos del formato directo:', mensajesExtraidos.length);
      } else {
        // No hay mensajes o formato desconocido
        console.log('🔍 Debug - Chat - No se encontraron mensajes, estableciendo array vacío');
        console.log('🔍 Debug - Chat - response.data tipo:', typeof response.data);
        console.log('🔍 Debug - Chat - response.data valor:', response.data);
        mensajesExtraidos = [];
      }
      
      // Asegurar que siempre sea un array válido
      if (!Array.isArray(mensajesExtraidos)) {
        console.error('🔍 Debug - Chat - ERROR: mensajesExtraidos no es un array, forzando array vacío');
        mensajesExtraidos = [];
      }
      
      console.log('🔍 Debug - Chat - Mensajes extraídos finales:', mensajesExtraidos);
      
      // FUSIONAR mensajes existentes con nuevos de la base de datos
      setMensajes(prev => {
        console.log('🔍 Debug - Chat - Mensajes previos antes de fusionar:', prev.length);
        console.log('🔍 Debug - Chat - Mensajes nuevos de la API:', mensajesExtraidos.length);
        
        // Crear un Map para evitar duplicados por ID
        const mensajesMap = new Map();
        
        // Agregar mensajes existentes (WebSocket) primero
        prev.forEach(msg => {
          if (msg.id && !mensajesMap.has(msg.id)) {
            mensajesMap.set(msg.id, msg);
          }
        });
        
        // Agregar mensajes nuevos de la base de datos
        mensajesExtraidos.forEach(msg => {
          if (msg.id && !mensajesMap.has(msg.id)) {
            mensajesMap.set(msg.id, msg);
          }
        });
        
        // Convertir Map a array y ordenar por timestamp
        const mensajesFusionados = Array.from(mensajesMap.values()).sort((a, b) => 
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        );
        
        console.log('🔍 Debug - Chat - Mensajes fusionados totales:', mensajesFusionados.length);
        console.log('🔍 Debug - Chat - Mensajes de WebSocket preservados:', prev.length);
        console.log('🔍 Debug - Chat - Mensajes de BD agregados:', mensajesExtraidos.length);
        
        return mensajesFusionados;
      });
      
      console.log('🔍 Debug - Chat - Mensajes establecidos correctamente después de fusión');
    } catch (error: any) {
      console.error('Error al cargar mensajes:', error);
      console.error('🔍 Debug - Chat - Error completo:', error);
      console.error('🔍 Debug - Chat - Error message:', error.message);
      console.error('🔍 Debug - Chat - Error stack:', error.stack);
      mostrarNotificacion('Error al cargar mensajes', 'error');
      // NO limpiar mensajes existentes si hay error
      console.log('🔍 Debug - Chat - Error en API, manteniendo mensajes existentes');
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

    const mensajeTexto = nuevoMensaje.trim();

    try {
      setEnviando(true);
      
      // Crear mensaje local inmediatamente para feedback visual
      const mensajeLocal = {
        id: `temp_${Date.now()}`,
        contenido: mensajeTexto,
        emisor_id: user?.id || '',
        receptor_id: conversacionActiva,
        emisor_nombre: `${user?.nombres} ${user?.apellidos}`,
        emisor_rol: user?.rol || 'psicologo',
        timestamp: new Date().toISOString(),
        leido: false
      };
      
      // Agregar mensaje localmente inmediatamente
      setMensajes(prev => [...prev, mensajeLocal]);
      
      // Limpiar input inmediatamente
      setNuevoMensaje('');
      
      // SIEMPRE usar API (que incluye WebSocket automáticamente)
      try {
        const mensajeData = {
          contenido: mensajeTexto,
          receptor_id: conversacionActiva
        };

        console.log('🔍 Chat - Enviando mensaje via API:', mensajeData);
        const response = await chatService.enviarMensaje(mensajeData);
        console.log('🔍 Chat - Respuesta del backend:', response);
        
        // Reemplazar mensaje temporal con el real del servidor
        if (response.data && response.data.success && response.data.data) {
          console.log('🔍 Debug - Chat - mensajeLocal.id:', mensajeLocal.id);
          console.log('🔍 Debug - Chat - response.data.data.id:', response.data.data.id);
          
          setMensajes(prev => {
            console.log('🔍 Debug - Chat - prev antes del map:', prev.length);
            
            // Buscar si el mensaje temporal existe
            const mensajeTemporal = prev.find(msg => msg.id === mensajeLocal.id);
            
            if (mensajeTemporal) {
              console.log('🔍 Debug - Chat - Reemplazando mensaje temporal con real');
              const nuevosMensajes = prev.map(msg => 
                msg.id === mensajeLocal.id ? response.data.data : msg
              );
              console.log('🔍 Debug - Chat - nuevosMensajes después del map:', nuevosMensajes.length);
              return nuevosMensajes;
            } else {
              console.log('🔍 Debug - Chat - Mensaje temporal no encontrado, agregando mensaje real');
              const nuevosMensajes = [...prev, response.data.data];
              console.log('🔍 Debug - Chat - nuevosMensajes después de agregar:', nuevosMensajes.length);
              return nuevosMensajes;
            }
          });
          mostrarNotificacion('Mensaje enviado', 'exito');
        }
      } catch (apiError: any) {
        console.error('Error al enviar mensaje via API:', apiError);
        // Mantener mensaje local si falla la API
        mostrarNotificacion('Error al enviar mensaje', 'error');
      }
    } catch (error: any) {
      console.error('Error al enviar mensaje:', error);
      mostrarNotificacion('Error al enviar mensaje', 'error');
      
      // Revertir mensaje local si hay error
      setMensajes(prev => prev.filter(msg => msg.id !== `temp_${Date.now()}`));
      setNuevoMensaje(mensajeTexto); // Restaurar texto del mensaje
    } finally {
      setEnviando(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const obtenerConversacionActiva = () => {
    return conversaciones.find(c => c.participante_id === conversacionActiva);
  };

  // Función para formatear timestamp
  const formatearTimestamp = (timestamp: string) => {
    const fecha = new Date(timestamp);
    const ahora = new Date();
    const diffMs = ahora.getTime() - fecha.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'Ahora';
    if (diffMins < 60) return `Hace ${diffMins}m`;
    if (diffHours < 24) return `Hace ${diffHours}h`;
    if (diffDays < 7) return `Hace ${diffDays}d`;
    
    return fecha.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit'
    });
  };

  // Funciones para configuración del chat
  const abrirConfiguracionChat = (paciente: Conversacion) => {
    setPacienteConfiguracion(paciente);
    setConfiguracionChatAbierta(true);
    // Cargar configuración actual del chat
    cargarConfiguracionChat(paciente.participante_id);
  };

  const cargarConfiguracionChat = async (pacienteId: string) => {
    try {
      const config = await chatConfigService.obtenerConfiguracion(pacienteId);
      setTemaChatActual(config.tema);
    } catch (error) {
      console.error('Error al cargar configuración del chat:', error);
      setTemaChatActual('default');
    }
  };

  // Función para aplicar tema visualmente
  const aplicarTemaVisual = (tema: string) => {
    if (!chatContainerRef.current) return;
    
    const temas = chatConfigService.obtenerTemasDisponibles();
    const temaSeleccionado = temas.find(t => t.id === tema);
    if (temaSeleccionado) {
      // Limpiar clases anteriores de manera más segura
      const clasesABorrar = [
        'bg-white', 'bg-gray-50', 'bg-blue-50', 'bg-green-50', 'bg-purple-50', 'bg-orange-50',
        'border-gray-200', 'border-blue-200', 'border-green-200', 'border-purple-200', 'border-orange-200'
      ];
      
      clasesABorrar.forEach(clase => {
        chatContainerRef.current!.classList.remove(clase);
      });
      
      // Agregar nuevas clases una por una
      const nuevasClases = temaSeleccionado.estilos.fondo.split(' ');
      nuevasClases.forEach(clase => {
        if (clase.trim()) {
          chatContainerRef.current!.classList.add(clase.trim());
        }
      });
      
      // Aplicar bordes si existen
      if (temaSeleccionado.estilos.bordes) {
        const clasesBorde = temaSeleccionado.estilos.bordes.split(' ');
        clasesBorde.forEach(clase => {
          if (clase.trim()) {
            chatContainerRef.current!.classList.add(clase.trim());
          }
        });
      }
    }
  };

  // Función para limpiar tema visual (volver al tema por defecto)
  const limpiarTemaVisual = () => {
    if (!chatContainerRef.current) return;
    
    // Limpiar todas las clases de tema
    const clasesABorrar = [
      'bg-white', 'bg-gray-50', 'bg-blue-50', 'bg-green-50', 'bg-purple-50', 'bg-orange-50',
      'border-gray-200', 'border-blue-200', 'border-green-200', 'border-purple-200', 'border-orange-200'
    ];
    
    clasesABorrar.forEach(clase => {
      chatContainerRef.current!.classList.remove(clase);
    });
    
    // Restaurar tema por defecto
    chatContainerRef.current.classList.add('bg-white');
    chatContainerRef.current.classList.add('border', 'border-gray-200');
  };

  const cambiarTemaChat = async (nuevoTema: string) => {
    if (!pacienteConfiguracion) return;
    
    try {
      const exito = await chatConfigService.cambiarTema(pacienteConfiguracion.participante_id, nuevoTema);
      if (exito) {
        setTemaChatActual(nuevoTema);
        
        // Guardar tema en localStorage para persistencia
        if (conversacionActiva) {
          localStorage.setItem(`chat_tema_${conversacionActiva}`, nuevoTema);
        }
        
        // Aplicar el tema visualmente
        aplicarTemaVisual(nuevoTema);
        
        mostrarNotificacion('Tema del chat cambiado correctamente', 'exito');
      } else {
        mostrarNotificacion('Error al cambiar el tema del chat', 'error');
      }
    } catch (error) {
      console.error('Error al cambiar tema del chat:', error);
      mostrarNotificacion('Error al cambiar el tema del chat', 'error');
    }
  };

  const borrarChatCompleto = async () => {
    if (!pacienteConfiguracion) return;
    
    try {
      const exito = await chatConfigService.borrarChat(pacienteConfiguracion.participante_id);
      if (exito) {
        mostrarNotificacion('Chat borrado completamente', 'exito');
        
        // Limpiar mensajes y conversación activa
        setMensajes([]);
        setConversacionActiva(null);
        
        // Recargar conversaciones para actualizar la lista
        cargarConversaciones();
      } else {
        mostrarNotificacion('Error al borrar el chat', 'error');
      }
    } catch (error) {
      console.error('Error al borrar chat:', error);
      mostrarNotificacion('Error al borrar el chat', 'error');
    }
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
    <div className="h-full flex flex-col bg-white rounded-lg shadow-sm border border-amber-100" style={{ height: '500px', maxHeight: '500px' }}>
      {/* Header del Chat */}
      <div className="px-4 py-3 border-b border-amber-200 bg-amber-50 flex-shrink-0">
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

      <div className="flex-1 flex overflow-hidden" style={{ height: 'calc(500px - 80px)', maxHeight: 'calc(500px - 80px)' }}>
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
                  onClick={() => {
                    console.log('🔍 Debug - Chat - Click en conversación:', conversacion);
                    console.log('🔍 Debug - Chat - ID de conversación:', conversacion.participante_id);
                    console.log('🔍 Debug - Chat - Nombre de conversación:', conversacion.participante_nombre);
                    setConversacionActiva(conversacion.participante_id);
                  }}
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
              <div className="px-4 py-3 border-b border-amber-200 bg-amber-50 flex-shrink-0">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">
                      {obtenerConversacionActiva()?.participante_nombre}
                    </h4>
                    <p className="text-xs text-gray-500 capitalize">
                      {obtenerConversacionActiva()?.participante_rol}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {/* Botón de configuración del chat */}
                    <button
                      onClick={() => {
                        const conversacion = obtenerConversacionActiva();
                        if (conversacion) {
                          abrirConfiguracionChat(conversacion);
                        }
                      }}
                      className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors"
                      title="Configuración del chat"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </button>
                    {/* Botón de cerrar */}
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
              </div>

              {/* Mensajes - Área scrollable con altura fija */}
              <div 
                ref={chatContainerRef}
                className="flex-1 overflow-y-auto p-4 space-y-3"
                style={{ height: 'calc(500px - 200px)', maxHeight: 'calc(500px - 200px)' }}
              >
                {/* Validación adicional de seguridad */}
                {Array.isArray(mensajes) && mensajes.length > 0 ? (
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
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    <div className="text-4xl mb-2">💬</div>
                    <p>No hay mensajes en esta conversación</p>
                    <p className="text-sm">Inicia el chat enviando un mensaje</p>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Formulario de envío */}
              <form onSubmit={enviarMensaje} className="p-4 border-t border-amber-200 flex-shrink-0">
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

      {/* Configuración del Chat */}
      <ConfiguracionChat
        isOpen={configuracionChatAbierta}
        onClose={() => setConfiguracionChatAbierta(false)}
        pacienteNombre={pacienteConfiguracion?.participante_nombre || ''}
        pacienteId={pacienteConfiguracion?.participante_id || ''}
        onCambiarTema={cambiarTemaChat}
        onBorrarChat={borrarChatCompleto}
        temaActual={temaChatActual}
      />
    </div>
  );
};

export default Chat;