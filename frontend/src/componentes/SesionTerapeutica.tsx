import React, { useState, useEffect, useRef } from 'react';
import { sesionesTerapeuticasService, InfoPaciente, HistorialSesion, EstadoSesion } from '../servicios/sesiones-terapeuticas.service';
import '../styles/animations.css';

// Usar las interfaces del servicio
type Paciente = InfoPaciente;
type SesionAnterior = HistorialSesion;

interface SesionTerapeuticaProps {
  cita: {
    id: string;
    paciente_id: string;
    paciente_nombre: string;
    paciente_rut: string;
    paciente_telefono: string;
    fecha: string;
    hora_inicio: string;
    hora_fin: string;
    duracion_minutos: number;
    estado: string;
    tipo_sesion: string;
    modalidad: string;
    notas_paciente?: string;
    notas_psicologo?: string;
  };
  onFinalizarSesion: (resumen: string, notas: string) => void;
  onCerrar: () => void;
}

const SesionTerapeutica: React.FC<SesionTerapeuticaProps> = ({
  cita,
  onFinalizarSesion,
  onCerrar
}) => {
  // Modo de prueba: sesiones de 30 segundos
  const TEST_MODE_30S = false;
  const DURACION_TEST_SEG = 30;
  const [paciente, setPaciente] = useState<Paciente | null>(null);
  const [sesionesAnteriores, setSesionesAnteriores] = useState<SesionAnterior[]>([]);
  const [tiempoRestante, setTiempoRestante] = useState((TEST_MODE_30S ? DURACION_TEST_SEG : 60 * 60));
  const [sesionIniciada, setSesionIniciada] = useState(false);
  const [notas, setNotas] = useState('');
  const [mostrarModalResumen, setMostrarModalResumen] = useState(false);
  const [resumenFinal, setResumenFinal] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sesionId, setSesionId] = useState<string | null>(null);
  const [mostrarModalCerrar, setMostrarModalCerrar] = useState(false);
  const [confirmacionCerrar, setConfirmacionCerrar] = useState('');
  const [esReanudacion, setEsReanudacion] = useState(false);
  const [tiempoTerminado, setTiempoTerminado] = useState(false);
  
  // Estados para notificaciones personalizadas
  const [notificacion, setNotificacion] = useState<{
    mensaje: string;
    tipo: 'success' | 'error' | 'warning' | 'info';
    visible: boolean;
  }>({
    mensaje: '',
    tipo: 'info',
    visible: false
  });
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Función para mostrar notificaciones personalizadas
  const mostrarNotificacion = (mensaje: string, tipo: 'success' | 'error' | 'warning' | 'info') => {
    setNotificacion({
      mensaje,
      tipo,
      visible: true
    });

    // Sonido de notificaciones desactivado temporalmente
    
    // Auto-ocultar después de 4 segundos
    setTimeout(() => {
      setNotificacion(prev => ({ ...prev, visible: false }));
    }, 4000);
  };

  useEffect(() => {
    cargarDatosPaciente();
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (sesionIniciada && tiempoRestante > 0) {
      intervalRef.current = setInterval(() => {
        setTiempoRestante(prev => {
          if (prev <= 1) {
            // Sesión terminada automáticamente
            setSesionIniciada(false);
            setTiempoTerminado(true);
            // No abrimos el modal automáticamente; el psicólogo decide cuándo finalizar
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [sesionIniciada, tiempoRestante]);

  // Avisos en tiempo restante
  useEffect(() => {
    if (sesionIniciada) {
      if (TEST_MODE_30S) {
        if (tiempoRestante === 10) {
          if (audioRef.current) {
            audioRef.current.play().catch(console.error);
          }
          mostrarNotificacion('⏳ Quedan 10 segundos para finalizar la sesión (modo prueba)', 'warning');
        }
      } else {
        const minutosRestantes = Math.floor(tiempoRestante / 60);
        if (minutosRestantes === 30 || minutosRestantes === 15 || minutosRestantes === 5) {
          if (audioRef.current) {
            audioRef.current.play().catch(console.error);
          }
          mostrarNotificacion(`⚠️ Quedan ${minutosRestantes} minutos para finalizar la sesión`, 'warning');
        }
      }
    }
  }, [tiempoRestante, sesionIniciada]);

  const cargarDatosPaciente = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Cargar información del paciente
      const pacienteData = await sesionesTerapeuticasService.obtenerInfoPaciente(cita.paciente_id);
      setPaciente(pacienteData);
      
      // Cargar historial de sesiones
      const sesionesData = await sesionesTerapeuticasService.obtenerHistorialSesiones(cita.paciente_id);
      setSesionesAnteriores(sesionesData);
      
      // Verificar si hay una sesión activa para esta cita
      try {
        const estadoSesion = await sesionesTerapeuticasService.obtenerEstadoSesion(cita.id);
        if (estadoSesion) {
          setSesionId(estadoSesion.sesionId);
          setSesionIniciada(true);
          setEsReanudacion(true);
              setTiempoTerminado(false);
          setNotas(estadoSesion.notasPsicologo || '');
          
          // Calcular tiempo restante basado en el tiempo transcurrido
          const tiempoTranscurridoSegundos = estadoSesion.tiempoTranscurrido * 60; // convertir a segundos
          const duracionTotalSegundos = TEST_MODE_30S ? DURACION_TEST_SEG : (estadoSesion.duracionMinutos * 60);
          const tiempoRestanteCalculado = Math.max(0, duracionTotalSegundos - tiempoTranscurridoSegundos);
          
          console.log('🕐 Carga inicial - Cálculo de tiempo:', {
            sesionId: estadoSesion.sesionId,
            tiempoTranscurrido: estadoSesion.tiempoTranscurrido,
            tiempoTranscurridoSegundos,
            duracionTotalSegundos,
            tiempoRestanteCalculado,
            fechaInicio: estadoSesion.fechaInicio
          });
          
          setTiempoRestante(tiempoRestanteCalculado);
          
          // Mostrar mensaje de reanudación automática
          if (tiempoRestanteCalculado > 0) {
            // Usar notificación personalizada en lugar de alert
            console.log('🔄 Se ha reanudado automáticamente una sesión existente. El tiempo se ha ajustado correctamente.');
          }
        }
      } catch (err) {
        // No hay sesión activa, continuar normalmente
        console.log('No hay sesión activa para esta cita:', err.message);
      }
      
    } catch (err: any) {
      console.error('Error al cargar datos del paciente:', err);
      setError('Error al cargar los datos del paciente: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const iniciarSesion = async () => {
    try {
      setLoading(true);
      const resultado = await sesionesTerapeuticasService.iniciarSesion(cita.id);
      
      setSesionId(resultado.sesionId);
      setSesionIniciada(true);
      
      if (resultado.esReanudacion && resultado.tiempoTranscurrido !== undefined) {
        // Calcular tiempo restante basado en el tiempo transcurrido
        const tiempoTranscurridoSegundos = resultado.tiempoTranscurrido * 60;
        const duracionTotalSegundos = TEST_MODE_30S ? DURACION_TEST_SEG : (resultado.duracionMinutos * 60);
        const tiempoRestanteCalculado = Math.max(0, duracionTotalSegundos - tiempoTranscurridoSegundos);
        
        console.log('🕐 Reanudando sesión - Cálculo de tiempo:', {
          tiempoTranscurrido: resultado.tiempoTranscurrido,
          tiempoTranscurridoSegundos,
          duracionTotalSegundos,
          tiempoRestanteCalculado
        });
        
        setTiempoRestante(tiempoRestanteCalculado);
        setEsReanudacion(true);
        mostrarNotificacion('⚠️ Se ha reanudado una sesión existente. El tiempo se ha ajustado automáticamente.', 'info');
      } else {
        // Nueva sesión
        setTiempoRestante(TEST_MODE_30S ? DURACION_TEST_SEG : (resultado.duracionMinutos * 60));
        setTiempoTerminado(false);
        setEsReanudacion(false);
      }
    } catch (err: any) {
      console.error('Error al iniciar sesión:', err);
      mostrarNotificacion('Error al iniciar la sesión: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const finalizarSesion = () => {
    setSesionIniciada(false);
    setMostrarModalResumen(true);
  };

  const formatearTiempo = (segundos: number) => {
    const minutos = Math.floor(segundos / 60);
    const segundosRestantes = segundos % 60;
    return `${minutos.toString().padStart(2, '0')}:${segundosRestantes.toString().padStart(2, '0')}`;
  };

  const handleFinalizarSesion = async () => {
    if (!resumenFinal.trim()) {
      mostrarNotificacion('Por favor, ingresa un resumen de la sesión', 'warning');
      return;
    }
    
    if (!sesionId) {
      mostrarNotificacion('Error: No se encontró el ID de la sesión', 'error');
      return;
    }
    
    try {
      setLoading(true);
      await sesionesTerapeuticasService.finalizarSesion(sesionId, {
        resumenSesion: resumenFinal,
        notasPsicologo: notas
      });
      
      onFinalizarSesion(resumenFinal, notas);
      setMostrarModalResumen(false);
      onCerrar();
    } catch (err: any) {
      console.error('Error al finalizar sesión:', err);
      mostrarNotificacion('Error al finalizar la sesión: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCerrarSesion = () => {
    if (sesionIniciada) {
      setMostrarModalCerrar(true);
    } else {
      onCerrar();
    }
  };

  const confirmarCerrar = () => {
    if (confirmacionCerrar.toLowerCase() === 'confirmo') {
      setMostrarModalCerrar(false);
      setConfirmacionCerrar('');
      onCerrar();
    } else {
      mostrarNotificacion('Por favor, escribe exactamente "confirmo" para cerrar la sesión', 'warning');
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex justify-center items-center z-50">
        <div className="bg-white p-8 rounded-lg shadow-xl">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando datos del paciente...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex justify-center items-center z-50">
        <div className="bg-white p-8 rounded-lg shadow-xl max-w-md">
          <div className="text-red-600 text-center">
            <h3 className="text-lg font-semibold mb-2">Error</h3>
            <p className="mb-4">{error}</p>
            <button
              onClick={onCerrar}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex justify-center items-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-y-auto border border-amber-100">
        {/* Header */}
        <div className="bg-amber-100 text-amber-900 p-6 rounded-t-2xl border-b border-amber-200">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">Sesión Terapéutica</h2>
              <p className="text-amber-700/70">Paciente: {paciente?.nombre}</p>
            </div>
            <button
              onClick={handleCerrarSesion}
              className="text-amber-700 hover:text-amber-900 text-2xl font-bold"
            >
              ×
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Columna izquierda: Ficha del paciente */}
            <div className="lg:col-span-1">
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
                <h3 className="text-lg font-semibold text-amber-800 mb-4">📋 Ficha del Paciente</h3>
                {paciente && (
                  <div className="space-y-3">
                    <div>
                      <span className="font-medium text-amber-700">Nombre:</span>
                      <p className="text-amber-900">{paciente.nombres} {paciente.apellidos}</p>
                    </div>
                    <div>
                      <span className="font-medium text-amber-700">RUT:</span>
                      <p className="text-amber-900">{paciente.rut || 'No especificado'}</p>
                    </div>
                    <div>
                      <span className="font-medium text-amber-700">Teléfono:</span>
                      <p className="text-amber-900">{paciente.telefono || 'No especificado'}</p>
                    </div>
                    <div>
                      <span className="font-medium text-amber-700">Email:</span>
                      <p className="text-amber-900">{paciente.email}</p>
                    </div>
                    {paciente.fecha_nacimiento && (
                      <div>
                        <span className="font-medium text-amber-700">Fecha de Nacimiento:</span>
                        <p className="text-amber-900">{new Date(paciente.fecha_nacimiento).toLocaleDateString('es-ES')}</p>
                      </div>
                    )}
                    {paciente.observaciones && (
                      <div>
                        <span className="font-medium text-amber-700">Observaciones:</span>
                        <p className="text-amber-900 text-sm">{paciente.observaciones}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Historial de sesiones */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-green-800 mb-4">📚 Historial de Sesiones</h3>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {sesionesAnteriores.length > 0 ? (
                    sesionesAnteriores.map((sesion) => (
                      <div key={sesion.id} className="bg-white p-3 rounded border">
                        <div className="text-sm text-gray-600 mb-2">
                          {new Date(sesion.fecha_sesion).toLocaleDateString('es-ES')} - {sesion.duracion_minutos} min
                        </div>
                        <div className="text-sm">
                          <span className="font-medium text-green-700">Resumen:</span>
                          <p className="text-green-900 text-xs mt-1">{sesion.resumen_sesion}</p>
                        </div>
                        {sesion.notas_psicologo && (
                          <div className="text-sm mt-2">
                            <span className="font-medium text-green-700">Notas:</span>
                            <p className="text-green-900 text-xs mt-1">{sesion.notas_psicologo}</p>
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-gray-500 py-4">
                      <p>No hay sesiones anteriores registradas</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Columna derecha: Temporizador y notas */}
            <div className="lg:col-span-2">
              {/* Temporizador */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 mb-6">
                <h3 className="text-lg font-semibold text-yellow-800 mb-4">⏱️ Temporizador de Sesión</h3>
                
                {!(sesionIniciada || tiempoTerminado) ? (
                  <div className="text-center">
                    <div className="text-4xl font-bold text-yellow-600 mb-4">
                      {formatearTiempo(tiempoRestante)}
                    </div>
                    <button
                      onClick={iniciarSesion}
                      className="px-6 py-3 bg-white text-amber-700 border border-amber-300 rounded-xl hover:bg-amber-50 font-semibold text-lg shadow-md hover:shadow-lg"
                    >
                      ▶️ Iniciar Sesión ({TEST_MODE_30S ? '30 seg' : '60 min'})
                    </button>
                  </div>
                ) : (
                  <div className="text-center">
                    {esReanudacion && (
                      <div className="bg-teal-50 border border-teal-200 text-teal-800 px-4 py-2 rounded-xl mb-4">
                        🔄 Sesión reanudada - Continuando desde donde se dejó
                      </div>
                    )}
                    {tiempoTerminado && (
                      <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-2 rounded-xl mb-4">
                        ⏱️ Tiempo finalizado. Puedes seguir escribiendo notas y finalizar cuando estés listo.
                      </div>
                    )}
                    <div className={`text-6xl font-bold mb-4 ${
                      tiempoRestante <= 300 ? 'text-red-600' : 
                      tiempoRestante <= 900 ? 'text-orange-600' : 'text-green-600'
                    }`}>
                      {formatearTiempo(tiempoRestante)}
                    </div>
                    <div className="text-sm text-gray-600 mb-4">
                      Sesión en curso - {Math.floor(tiempoRestante / 60)} minutos restantes
                    </div>
                    <button
                      onClick={finalizarSesion}
                      className="px-6 py-3 bg-white text-red-700 border border-red-300 rounded-xl hover:bg-red-50 font-semibold shadow-md hover:shadow-lg"
                    >
                      🛑 Finalizar Sesión
                    </button>
                  </div>
                )}
              </div>

              {/* Área de notas */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">📝 Notas de la Sesión</h3>
                <textarea
                  value={notas}
                  onChange={(e) => setNotas(e.target.value)}
                  placeholder="Escribe tus notas durante la sesión..."
                  className="w-full h-64 p-4 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={!(sesionIniciada || tiempoTerminado)}
                />
                <div className="text-sm text-gray-500 mt-2">
                  {(sesionIniciada || tiempoTerminado) ? 'Puedes escribir notas durante la sesión. Si el tiempo terminó, aún puedes completar tus notas antes de finalizar.' : 'Inicia la sesión para tomar notas'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal de resumen final */}
        {mostrarModalResumen && (
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex justify-center items-center z-60">
            <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-2xl">
              <h3 className="text-2xl font-bold text-gray-800 mb-6">📋 Resumen de la Sesión</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Resumen de la sesión terapéutica *
                  </label>
                  <textarea
                    value={resumenFinal}
                    onChange={(e) => setResumenFinal(e.target.value)}
                    placeholder="Describe los temas tratados, técnicas utilizadas, progreso del paciente, etc."
                    className="w-full h-32 p-4 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notas del psicólogo
                  </label>
                  <textarea
                    value={notas}
                    readOnly
                    className="w-full h-24 p-4 border border-gray-300 rounded-lg bg-gray-50"
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setMostrarModalResumen(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleFinalizarSesion}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Guardar y Finalizar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal de confirmación para cerrar sesión */}
        {mostrarModalCerrar && (
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex justify-center items-center z-60">
            <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
              <div className="text-center">
                <div className="text-6xl mb-4">⚠️</div>
                <h3 className="text-2xl font-bold text-red-600 mb-4">¡Advertencia!</h3>
                <p className="text-gray-700 mb-6">
                  Tienes una sesión en curso. Si cierras ahora, perderás el progreso del tiempo y las notas no guardadas.
                </p>
                <p className="text-sm text-gray-600 mb-6">
                  Para confirmar que deseas cerrar la sesión, escribe <strong>"confirmo"</strong> en el campo de abajo:
                </p>
                
                <input
                  type="text"
                  value={confirmacionCerrar}
                  onChange={(e) => setConfirmacionCerrar(e.target.value)}
                  placeholder="Escribe 'confirmo' aquí"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 mb-6"
                />
                
                <div className="flex space-x-3">
                  <button
                    onClick={() => {
                      setMostrarModalCerrar(false);
                      setConfirmacionCerrar('');
                    }}
                    className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={confirmarCerrar}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                    Cerrar Sesión
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Audio para avisos */}
        <audio ref={audioRef} preload="auto">
          <source src="/sounds/notification.mp3" type="audio/mpeg" />
        </audio>

        {/* Notificaciones Personalizadas */}
        {notificacion.visible && (
          <div className="fixed top-4 right-4 z-[60] animate-slide-in">
            <div className={`px-6 py-4 rounded-xl shadow-2xl border-l-4 flex items-center gap-3 min-w-[300px] max-w-[500px] transform transition-all duration-300 hover-lift ${
              notificacion.tipo === 'success' 
                ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-500 text-green-800 animate-pulse-success' 
                : notificacion.tipo === 'error'
                ? 'bg-gradient-to-r from-red-50 to-rose-50 border-red-500 text-red-800 animate-pulse-error'
                : notificacion.tipo === 'warning'
                ? 'bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-500 text-yellow-800 animate-pulse-warning'
                : 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-500 text-blue-800'
            }`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center animate-bounce-in ${
                notificacion.tipo === 'success' 
                  ? 'bg-green-100' 
                  : notificacion.tipo === 'error'
                  ? 'bg-red-100'
                  : notificacion.tipo === 'warning'
                  ? 'bg-yellow-100'
                  : 'bg-blue-100'
              }`}>
                {notificacion.tipo === 'success' && <span className="text-green-600 text-xl">✓</span>}
                {notificacion.tipo === 'error' && <span className="text-red-600 text-xl">✕</span>}
                {notificacion.tipo === 'warning' && <span className="text-yellow-600 text-xl">⚠</span>}
                {notificacion.tipo === 'info' && <span className="text-blue-600 text-xl">ℹ</span>}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-sm">{notificacion.mensaje}</p>
              </div>
              <button
                onClick={() => setNotificacion(prev => ({ ...prev, visible: false }))}
                className="text-gray-400 hover:text-gray-600 transition-colors duration-200 p-1 hover:bg-gray-200 rounded-full"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SesionTerapeutica;
