import React, { useState, useEffect } from 'react';
import { Cita, citasService } from '../servicios/citas.service';
import { obtenerEstadoTexto, obtenerEstadoColor } from '../utilidades/estados-citas';
import { authService } from '../servicios/auth.service';

interface MisCitasProps {
  // No necesitamos props ya que el backend obtiene el paciente del token
}

const MisCitas: React.FC<MisCitasProps> = () => {
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
      
      // Obtener el usuario actual del contexto de autenticación
      const currentUser = authService.getCurrentUser();
      console.log('🔍 MisCitas - Usuario actual:', currentUser);
      
      if (!currentUser || !currentUser.id) {
        setError('Usuario no autenticado');
        setLoading(false);
        return;
      }
      
      console.log('🔍 MisCitas - Obteniendo citas para paciente ID:', currentUser.id);
      
      const citasData = await citasService.obtenerCitasPaciente();
      
      console.log('🔍 MisCitas - Respuesta del servicio:', citasData);
      
      if (Array.isArray(citasData)) {
        setCitas(citasData);
        console.log('✅ MisCitas - Citas cargadas:', citasData);
      } else {
        console.log('⚠️ MisCitas - Respuesta no es array:', citasData);
        setError('Error al cargar las citas');
      }
    } catch (err: any) {
      console.error('❌ MisCitas - Error al cargar citas:', err);
      setError('Error al cargar las citas: ' + (err.response?.data?.mensaje || err.message));
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

  const formatearFecha = (fecha: string | undefined) => {
    if (!fecha) return 'Fecha no disponible';
    try {
      return new Date(fecha).toLocaleDateString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return 'Fecha inválida';
    }
  };

  const formatearHora = (hora: string | undefined) => {
    if (!hora) return '--:--';
    return hora.substring(0, 5); // Formato HH:MM
  };

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto"></div>
        <p className="mt-4 text-gray-600">Cargando tus citas...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <div className="text-red-500 text-6xl mb-4">⚠️</div>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Error al cargar las citas</h3>
        <p className="text-gray-600 mb-4">{error}</p>
        <button
          onClick={cargarCitas}
          className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg transition-colors"
        >
          Intentar de nuevo
        </button>
      </div>
    );
  }

  if (citas.length === 0) {
    return (
      <div className="p-8 text-center">
        <div className="text-amber-500 text-6xl mb-4">📅</div>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">No tienes citas programadas</h3>
        <p className="text-gray-600 mb-4">
          Cuando agendes una cita, aparecerá aquí para que puedas gestionarla.
        </p>
        <div className="inline-flex items-center px-4 py-2 bg-amber-50 border border-amber-200 rounded-lg">
          <span className="text-amber-700 text-sm">
            💡 Ve a la pestaña "Agendar Cita" para programar tu próxima sesión
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">MIS CITAS</h2>
          <p className="text-gray-600">Gestiona tus citas y sesiones programadas</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">Total de citas</p>
          <p className="text-2xl font-bold text-amber-600">{citas.length}</p>
        </div>
      </div>

      <div className="space-y-4">
        {citas.map((cita) => (
          <div
            key={cita.id}
            className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`px-3 py-1 rounded-full text-xs font-semibold ${obtenerEstadoColor(cita.estado)}`}>
                    {obtenerEstadoTexto(cita.estado)}
                  </div>
                  <span className="text-sm text-gray-500">
                    ID: {cita.id.substring(0, 8)}...
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">📅 Información de la Cita</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500">Fecha:</span>
                        <span className="font-medium">{formatearFecha(cita.fecha)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500">Hora:</span>
                        <span className="font-medium">{formatearHora(cita.hora_inicio)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500">Tipo:</span>
                        <span className="font-medium capitalize">{cita.tipo_sesion}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500">Modalidad:</span>
                        <span className="font-medium capitalize">{cita.modalidad}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">👨‍⚕️ Psicólogo</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500">Nombre:</span>
                        <span className="font-medium">
                          {cita.psicologo_nombres} {cita.psicologo_apellidos}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500">Email:</span>
                        <span className="font-medium">
                          {cita.psicologo_email || 'No disponible'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {cita.notas_paciente && (
                  <div className="mb-4">
                    <h4 className="font-semibold text-gray-800 mb-2">📝 Observaciones</h4>
                    <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                      {cita.notas_paciente}
                    </p>
                  </div>
                )}
              </div>

              <div className="ml-4 flex flex-col gap-2">
                {cita.estado === 'programada' && (
                  <button
                    onClick={() => handleCancelarCita(cita.id)}
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    🚫 Cancelar Cita
                  </button>
                )}
                
                <div className="text-right">
                  <p className="text-xs text-gray-400">
                    Creada: {new Date(cita.created_at).toLocaleDateString('es-ES')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 p-4 bg-amber-50 border border-amber-200 rounded-lg">
        <h4 className="font-semibold text-amber-800 mb-2">💡 Información Importante</h4>
        <ul className="text-sm text-amber-700 space-y-1">
          <li>• Las citas se pueden cancelar hasta 24 horas antes de la sesión</li>
          <li>• Recibirás un email de confirmación cuando se programe tu cita</li>
          <li>• Si necesitas reprogramar, contacta a tu psicólogo</li>
          <li>• Llega 10 minutos antes de tu hora programada</li>
          <li>• <strong>Las citas canceladas se eliminarán automáticamente después de 24 horas</strong></li>
        </ul>
      </div>
    </div>
  );
};

export default MisCitas;
