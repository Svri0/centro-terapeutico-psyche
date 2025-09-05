import React, { useState, useEffect } from 'react';
import { Cita, citasService } from '../servicios/citas.service';
import { authService } from '../servicios/auth.service';
import { obtenerEstadoTexto, obtenerEstadoColor } from '../utilidades/estados-citas';

const PerfilPaciente: React.FC = () => {
  const [citas, setCitas] = useState<Cita[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    const user = authService.getCurrentUser();
    if (user) {
      setUserData(user);
      cargarCitas();
    }
  }, []);

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

  const handleCancelarCita = async (citaId: string) => {
    if (!window.confirm('¿Estás seguro de que quieres cancelar esta cita?')) {
      return;
    }

    try {
      await citasService.cancelarCita(citaId);
      await cargarCitas(); // Recargar citas
      alert('Cita cancelada exitosamente');
    } catch (err: any) {
      alert('Error al cancelar la cita: ' + (err.response?.data?.mensaje || err.message));
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

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Cargando perfil...</span>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header del Perfil */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
            {userData?.avatar_url ? (
              <img 
                src={userData.avatar_url} 
                alt="Avatar" 
                className="w-16 h-16 rounded-full object-cover"
              />
            ) : (
              <span className="text-2xl font-bold text-blue-600">
                {userData?.nombres?.charAt(0)}{userData?.apellidos?.charAt(0)}
              </span>
            )}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {userData?.nombres} {userData?.apellidos}
            </h1>
            <p className="text-gray-600">{userData?.email}</p>
            <p className="text-sm text-gray-500">Paciente</p>
          </div>
        </div>
      </div>

      {/* Sección de Mis Citas */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Mis Citas</h2>
          <span className="text-sm text-gray-500">
            {citas.length} cita{citas.length !== 1 ? 's' : ''} programada{citas.length !== 1 ? 's' : ''}
          </span>
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
        <div className="space-y-4">
          {citas.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <div className="text-4xl mb-2">📅</div>
              <p>No tienes citas programadas</p>
              <p className="text-sm">Agenda una cita desde el calendario</p>
            </div>
          ) : (
            citas.map((cita) => (
              <div
                key={cita.id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${obtenerEstadoColor(cita.estado)}`}>
                        {obtenerEstadoTexto(cita.estado)}
                      </span>
                      <span className="text-sm text-gray-500">
                        {formatearFecha(cita.fecha)} a las {formatearHora(cita.hora_inicio)}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                      <div>
                        <p className="text-sm font-medium text-gray-700">Psicólogo</p>
                        <p className="text-gray-900">
                          {cita.psicologo_nombres} {cita.psicologo_apellidos}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">Tipo de Sesión</p>
                        <p className="text-gray-900 capitalize">{cita.tipo_sesion}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">Modalidad</p>
                        <p className="text-gray-900 capitalize">{cita.modalidad}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">Duración</p>
                        <p className="text-gray-900">{cita.duracion_minutos} minutos</p>
                      </div>
                    </div>

                    {cita.notas_paciente && (
                      <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                        <span className="font-medium text-blue-900">Notas:</span>
                        <p className="text-blue-800 mt-1">{cita.notas_paciente}</p>
                      </div>
                    )}

                    {cita.notas_psicologo && (
                      <div className="mt-3 p-3 bg-green-50 rounded-lg">
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
                        🚫 Cancelar
                      </button>
                    )}
                    
                    {cita.estado === 'cancelada' && (
                      <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                        Cancelada
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Información de Contacto */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mt-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Información de Contacto</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-gray-700">Email</p>
            <p className="text-gray-900">{userData?.email}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700">Teléfono</p>
            <p className="text-gray-900">{userData?.telefono || 'No especificado'}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700">Fecha de Nacimiento</p>
            <p className="text-gray-900">
              {userData?.fecha_nacimiento 
                ? new Date(userData.fecha_nacimiento).toLocaleDateString('es-CL')
                : 'No especificada'
              }
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700">Género</p>
            <p className="text-gray-900 capitalize">
              {userData?.genero || 'No especificado'}
            </p>
          </div>
        </div>
      </div>

      {/* Mensaje sobre cancelación */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-6">
        <div className="flex items-start space-x-3">
          <div className="text-yellow-500 text-lg">⚠️</div>
          <div className="text-sm text-yellow-700">
            <p className="font-medium mb-1">Importante sobre la cancelación de citas</p>
            <p className="text-xs">
              Solo puedes cancelar citas que estén en estado "programada". 
              Las citas canceladas no se pueden reactivar. 
              Si necesitas reagendar, contacta a tu psicólogo.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerfilPaciente;
