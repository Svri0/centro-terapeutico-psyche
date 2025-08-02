import React, { useState, useEffect } from 'react';
import { Cita, citasService } from '../servicios/citas.service';

const CitasPsicologo: React.FC = () => {
  const [citas, setCitas] = useState<Cita[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    cargarCitas();
  }, []);

  const cargarCitas = async () => {
    try {
      setLoading(true);
      setError(null);
      const citasData = await citasService.obtenerCitasPsicologo('');
      setCitas(citasData);
    } catch (err: any) {
      setError(err.response?.data?.mensaje || 'Error al cargar las citas');
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

  const obtenerEstadoColor = (estado: string) => {
    switch (estado) {
      case 'programada':
        return 'bg-blue-100 text-blue-800';
      case 'confirmada':
        return 'bg-green-100 text-green-800';
      case 'en_progreso':
        return 'bg-yellow-100 text-yellow-800';
      case 'completada':
        return 'bg-gray-100 text-gray-800';
      case 'cancelada':
        return 'bg-red-100 text-red-800';
      case 'no_show':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const obtenerEstadoTexto = (estado: string) => {
    switch (estado) {
      case 'programada':
        return 'Programada';
      case 'confirmada':
        return 'Confirmada';
      case 'en_progreso':
        return 'En Progreso';
      case 'completada':
        return 'Completada';
      case 'cancelada':
        return 'Cancelada';
      case 'no_show':
        return 'No Asistió';
      default:
        return estado;
    }
  };

  const handleActualizarEstado = async (citaId: string, nuevoEstado: string) => {
    try {
      await citasService.actualizarEstadoCita(citaId, nuevoEstado);
      await cargarCitas(); // Recargar citas
    } catch (err: any) {
      setError(err.response?.data?.mensaje || 'Error al actualizar el estado de la cita');
    }
  };

  const obtenerEstadosDisponibles = (estadoActual: string) => {
    switch (estadoActual) {
      case 'programada':
        return ['confirmada', 'cancelada'];
      case 'confirmada':
        return ['en_progreso', 'cancelada'];
      case 'en_progreso':
        return ['completada', 'no_show'];
      default:
        return [];
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
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Mis Citas</h1>
        <p className="text-gray-600 mt-2">Gestiona las citas de tus pacientes</p>
      </div>

      {/* Mensajes de error */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex">
            <div className="text-red-500">⚠️</div>
            <p className="ml-2 text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* Lista de citas */}
      <div className="space-y-8">
        {fechasOrdenadas.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📅</div>
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
                            {cita.paciente_nombres} {cita.paciente_apellidos}
                          </h3>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                            <div>
                              <span className="font-medium">Hora:</span> {formatearHora(cita.hora_inicio)} - {formatearHora(cita.hora_fin)}
                            </div>
                            <div>
                              <span className="font-medium">Duración:</span> {cita.duracion_minutos} minutos
                            </div>
                            <div>
                              <span className="font-medium">Ficha:</span> {cita.numero_ficha}
                            </div>
                            <div>
                              <span className="font-medium">Email:</span> {cita.paciente_email}
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
                                  className={`px-3 py-1 rounded text-xs transition-colors ${
                                    estado === 'confirmada' || estado === 'completada'
                                      ? 'bg-green-600 text-white hover:bg-green-700'
                                      : estado === 'cancelada' || estado === 'no_show'
                                      ? 'bg-red-600 text-white hover:bg-red-700'
                                      : 'bg-yellow-600 text-white hover:bg-yellow-700'
                                  }`}
                                >
                                  {estado === 'confirmada' ? 'Confirmar' :
                                   estado === 'en_progreso' ? 'Iniciar' :
                                   estado === 'completada' ? 'Completar' :
                                   estado === 'cancelada' ? 'Cancelar' :
                                   estado === 'no_show' ? 'No Asistió' : estado}
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

    </div>
  );
};

export default CitasPsicologo; 