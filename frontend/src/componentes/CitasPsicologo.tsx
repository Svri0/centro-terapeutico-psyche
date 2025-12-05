import React, { useState, useEffect } from 'react';
import { Cita, citasService } from '../servicios/citas.service';
import CalendarioCitas from './CalendarioCitas';
import { authService } from '../servicios/auth.service';
import { 
  obtenerEstadoTexto, 
  obtenerEstadoColor, 
  obtenerEstadosDisponibles, 
  obtenerTextoAccion 
} from '../utilidades/estados-citas';

const CitasPsicologo: React.FC = () => {
  const [citas, setCitas] = useState<Cita[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('calendar');
  const [psicologoId, setPsicologoId] = useState<string>('');

  useEffect(() => {
    const user = authService.getCurrentUser();
    if (user?.id) {
      setPsicologoId(user.id);
    }
  }, []);

  useEffect(() => {
    if (psicologoId) {
      cargarCitas();
    }
  }, [psicologoId]);

  const cargarCitas = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔍 Cargando citas para psicólogo:', psicologoId);
      const citasData = await citasService.obtenerCitas();
      console.log('✅ Citas cargadas exitosamente:', citasData);
      
      // Debug: verificar que los datos del paciente estén presentes
      if (citasData && citasData.length > 0) {
        console.log('🔍 Primera cita con datos del paciente:', {
          id: citasData[0].id,
          paciente_nombres: citasData[0].paciente_nombres,
          paciente_apellidos: citasData[0].paciente_apellidos,
          paciente_email: citasData[0].paciente_email,
          numero_ficha: citasData[0].numero_ficha
        });
      }
      
      setCitas(citasData || []);
    } catch (err: any) {
      console.error('❌ Error al cargar citas:', err);
      setError(err.response?.data?.mensaje || 'Error al cargar las citas');
      setCitas([]); // Asegurar que citas esté vacío en caso de error
    } finally {
      setLoading(false);
    }
  };

  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-CL', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatearHora = (hora: string) => {
    return hora.slice(0, 5);
  };



  const handleActualizarEstado = async (citaId: string, nuevoEstado: string) => {
    try {
      await citasService.actualizarEstadoCita(citaId, nuevoEstado);
      await cargarCitas(); // Recargar citas
    } catch (err: any) {
      setError(err.response?.data?.mensaje || 'Error al actualizar el estado de la cita');
    }
  };



  // Agrupar citas por fecha
  const citasPorFecha = citas.reduce((acc, cita) => {
    const fecha = cita.fecha;
    if (!acc[fecha]) {
      acc[fecha] = [];
    }
    acc[fecha].push(cita);
    return acc;
  }, {} as Record<string, Cita[]>);

  // Ordenar fechas
  const fechasOrdenadas = Object.keys(citasPorFecha).sort();

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Cargando citas...</span>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header con selector de vista */}
      <div className="mb-8 p-6 bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Mis Citas</h1>
            <p className="text-gray-600 mt-2">Gestiona las citas de tus pacientes</p>
          </div>
          
          {/* Selector de vista */}
          <div className="flex space-x-2">
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                viewMode === 'calendar' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Vista Calendario
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                viewMode === 'list' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
              Vista Lista
            </button>
          </div>
        </div>
      </div>

      {/* Mensajes de error */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex">
            <div className="text-red-500">⚠</div>
            <p className="ml-2 text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* Contenido según el modo de vista */}
      {viewMode === 'calendar' ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <CalendarioCitas psicologoId={psicologoId} />
        </div>
      ) : (
        /* Vista de Lista */
        <div className="space-y-8">
          {fechasOrdenadas.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4"></div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No tienes citas programadas
              </h3>
              <p className="text-gray-600">
                Los pacientes podrán agendar citas cuando estén disponibles
              </p>
            </div>
          ) : (
            fechasOrdenadas.map((fecha) => (
              <div key={fecha} className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">
                    {formatearFecha(fecha)}
                  </h2>
                  <p className="text-gray-600 text-sm">
                    {citasPorFecha[fecha].length} cita{citasPorFecha[fecha].length !== 1 ? 's' : ''}
                  </p>
                </div>
                
                <div className="divide-y divide-gray-200">
                  {citasPorFecha[fecha]
                    .sort((a, b) => a.hora_inicio.localeCompare(b.hora_inicio))
                    .map((cita) => (
                      <div key={cita.id} className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-3">
                              <span className={`px-3 py-1 rounded-full text-sm font-medium ${obtenerEstadoColor(cita.estado)}`}>
                                {obtenerEstadoTexto(cita.estado)}
                              </span>
                              <span className="text-gray-500">•</span>
                              <span className="text-gray-600 capitalize">{cita.tipo_sesion}</span>
                              <span className="text-gray-500">•</span>
                              <span className="text-gray-600 capitalize">{cita.modalidad}</span>
                            </div>

                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                              {cita.paciente_nombres && cita.paciente_apellidos 
                                ? `${cita.paciente_nombres} ${cita.paciente_apellidos}`
                                : 'Paciente no identificado'
                              }
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                              <div>
                                <span className="font-medium">Hora:</span> {formatearHora(cita.hora_inicio)} - {formatearHora(cita.hora_fin)}
                              </div>
                              <div>
                                <span className="font-medium">Duración:</span> {cita.duracion_minutos} minutos
                              </div>
                              <div>
                                <span className="font-medium">Ficha:</span> {cita.numero_ficha || 'No disponible'}
                              </div>
                              <div>
                                <span className="font-medium">Email:</span> {cita.paciente_email || 'No disponible'}
                              </div>
                            </div>

                            {cita.notas_paciente && (
                              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                                <span className="font-medium text-blue-900">Notas del Paciente:</span>
                                <p className="text-blue-800 mt-1">{cita.notas_paciente}</p>
                              </div>
                            )}

                            {cita.notas_psicologo && (
                              <div className="mt-4 p-3 bg-green-50 rounded-lg">
                                <span className="font-medium text-green-900">Mis Notas:</span>
                                <p className="text-green-800 mt-1">{cita.notas_psicologo}</p>
                              </div>
                            )}
                          </div>

                          <div className="flex flex-col space-y-2 ml-4">
                            {obtenerEstadosDisponibles(cita.estado).length > 0 && (
                              <div className="flex flex-col space-y-1">
                                {obtenerEstadosDisponibles(cita.estado).map((estado) => (
                                  <button
                                    key={estado}
                                    onClick={() => handleActualizarEstado(cita.id, estado)}
                                    className={`px-3 py-1 rounded text-xs transition-colors shadow-sm ${
                                      estado === 'confirmada' || estado === 'completada'
                                        ? 'bg-amber-500 text-white hover:bg-amber-600'
                                        : estado === 'cancelada' || estado === 'no_show' || estado === 'no_asistio'
                                        ? 'bg-red-600 text-white hover:bg-red-700'
                                        : 'bg-amber-400 text-white hover:bg-amber-500'
                                    }`}
                                  >
                                    {obtenerTextoAccion(estado)}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default CitasPsicologo; 