import React, { useState, useEffect } from 'react';
import { Cita, citasService } from '../servicios/citas.service';
import { authService } from '../servicios/auth.service';
import { AgendarCita } from './AgendarCita';
import { obtenerEstadoTexto, obtenerEstadoColor } from '../utilidades/estados-citas';

const FeedPaciente: React.FC = () => {
  const [citas, setCitas] = useState<Cita[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAgendar, setShowAgendar] = useState(false);
  const [psicologoId, setPsicologoId] = useState<string>('');
  const [psicologoNombre, setPsicologoNombre] = useState<string>('');

  useEffect(() => {
    cargarCitas();
    obtenerPsicologoPaciente();
  }, []);

  const obtenerPsicologoPaciente = async () => {
    try {
      // Obtener el psicólogo del paciente desde la primera cita o desde el perfil del paciente
      const citasData = await citasService.obtenerCitasPaciente();
      if (citasData.length > 0) {
        // Si hay citas, obtener el psicólogo de la primera cita
        setPsicologoId(citasData[0].psicologo_id);
        setPsicologoNombre(`${citasData[0].psicologo_nombres} ${citasData[0].psicologo_apellidos}`);
      } else {
        // Si no hay citas, necesitaríamos obtener el psicólogo desde el perfil del paciente
        // Por ahora, usaremos valores por defecto o podríamos hacer una llamada adicional
        setPsicologoId(''); // Esto necesitaría ser implementado
        setPsicologoNombre('Mi Psicólogo');
      }
    } catch (error) {
      console.error('Error al obtener psicólogo:', error);
    }
  };

  const cargarCitas = async () => {
    try {
      setLoading(true);
      setError(null);
      const citasData = await citasService.obtenerCitasPaciente();
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



  const handleCancelarCita = async (citaId: string) => {
    if (!window.confirm('¿Estás seguro de que quieres cancelar esta cita?')) {
      return;
    }

    try {
      await citasService.cancelarCita(citaId);
      await cargarCitas(); // Recargar citas
    } catch (err: any) {
      setError(err.response?.data?.mensaje || 'Error al cancelar la cita');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Cargando citas...</span>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mis Citas</h1>
          <p className="text-gray-600 mt-2">Gestiona tus citas y sesiones de terapia</p>
        </div>
        <button
          onClick={() => setShowAgendar(true)}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Agendar Nueva Cita
        </button>
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
      <div className="space-y-6">
        {citas.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📅</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No tienes citas programadas</h3>
            <p className="text-gray-600 mb-6">Agenda tu primera cita para comenzar tu proceso terapéutico</p>
            <button
              onClick={() => setShowAgendar(true)}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Agendar Cita
            </button>
          </div>
        ) : (
          citas.map((cita) => (
            <div
              key={cita.id}
              className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow"
            >
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
                    {cita.psicologo_nombres} {cita.psicologo_apellidos}
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                    <div>
                      <span className="font-medium">Fecha:</span> {formatearFecha(cita.fecha)}
                    </div>
                    <div>
                      <span className="font-medium">Hora:</span> {formatearHora(cita.hora_inicio)} - {formatearHora(cita.hora_fin)}
                    </div>
                    <div>
                      <span className="font-medium">Duración:</span> {cita.duracion_minutos} minutos
                    </div>
                    <div>
                      <span className="font-medium">Email:</span> {cita.psicologo_email}
                    </div>
                  </div>

                  {cita.notas_paciente && (
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                      <span className="font-medium text-blue-900">Notas:</span>
                      <p className="text-blue-800 mt-1">{cita.notas_paciente}</p>
                    </div>
                  )}

                  {cita.notas_psicologo && (
                    <div className="mt-4 p-3 bg-green-50 rounded-lg">
                      <span className="font-medium text-green-900">Notas del Psicólogo:</span>
                      <p className="text-green-800 mt-1">{cita.notas_psicologo}</p>
                    </div>
                  )}
                </div>

                <div className="flex flex-col space-y-2 ml-4">
                  {cita.estado === 'programada' && (
                    <button
                      onClick={() => handleCancelarCita(cita.id)}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                    >
                      Cancelar
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal de Agendar Cita */}
      <AgendarCita
        isOpen={showAgendar}
        onClose={() => setShowAgendar(false)}
        onSuccess={() => {
          setShowAgendar(false);
          cargarCitas();
        }}
        psicologoId={psicologoId}
        psicologoNombre={psicologoNombre}
      />
    </div>
  );
};

export default FeedPaciente; 