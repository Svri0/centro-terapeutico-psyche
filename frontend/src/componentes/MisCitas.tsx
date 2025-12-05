import React, { useState, useEffect } from 'react';
import { Cita, citasService } from '../servicios/citas.service';
import { obtenerEstadoTexto, obtenerEstadoColor } from '../utilidades/estados-citas';
import { authService } from '../servicios/auth.service';
import ModalReagendarCita from './ModalReagendarCita';
import ModalConfirmarCancelarCita from './ModalConfirmarCancelarCita';
import { useNotificaciones } from '../hooks/useNotificaciones';

interface MisCitasProps {
  // No necesitamos props ya que el backend obtiene el paciente del token
}

const MisCitas: React.FC<MisCitasProps> = () => {
  const [citas, setCitas] = useState<Cita[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [citaReagendar, setCitaReagendar] = useState<Cita | null>(null);
  const [mostrarModalReagendar, setMostrarModalReagendar] = useState(false);
  const [citaCancelar, setCitaCancelar] = useState<Cita | null>(null);
  const [mostrarModalCancelar, setMostrarModalCancelar] = useState(false);

  const {
    mostrarExito,
    mostrarError
  } = useNotificaciones();

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

  const handleAbrirModalCancelar = (cita: Cita) => {
    setCitaCancelar(cita);
    setMostrarModalCancelar(true);
  };

  const handleConfirmarCancelar = async () => {
    if (!citaCancelar) return;

    try {
      await citasService.cancelarCita(citaCancelar.id);
      await cargarCitas(); // Recargar citas
      mostrarExito('Cita Cancelada', 'Tu cita ha sido cancelada exitosamente');
      setMostrarModalCancelar(false);
      setCitaCancelar(null);
    } catch (err: any) {
      mostrarError('Error al Cancelar', err.response?.data?.mensaje || err.message);
    }
  };

  const handleCerrarModalCancelar = () => {
    setMostrarModalCancelar(false);
    setCitaCancelar(null);
  };

  const handleReagendarCita = (cita: Cita) => {
    setCitaReagendar(cita);
    setMostrarModalReagendar(true);
  };

  const handleConfirmarReagendar = async (nuevaFecha: string, nuevoHorario: string) => {
    if (!citaReagendar) return;

    try {
      // Calcular hora de fin (asumiendo 60 minutos por defecto)
      const horaInicio = new Date(`2000-01-01T${nuevoHorario}:00`);
      const horaFin = new Date(horaInicio.getTime() + 60 * 60 * 1000); // +60 minutos
      const horaFinStr = horaFin.toTimeString().slice(0, 5);

      await citasService.actualizarCita(citaReagendar.id, {
        fecha: nuevaFecha,
        hora_inicio: nuevoHorario,
        hora_fin: horaFinStr,
        notas_paciente: `Cita reagendada desde ${citaReagendar.fecha} ${citaReagendar.hora_inicio}`
      });

      await cargarCitas(); // Recargar citas
    } catch (err: any) {
      throw new Error(err.response?.data?.mensaje || err.message);
    }
  };

  const cerrarModalReagendar = () => {
    setMostrarModalReagendar(false);
    setCitaReagendar(null);
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
        <div className="text-red-500 text-6xl mb-4">⚠</div>
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
        <div className="text-amber-500 text-6xl mb-4"></div>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">No tienes citas programadas</h3>
        <p className="text-gray-600 mb-4">
          Cuando agendes una cita, aparecerá aquí para que puedas gestionarla.
        </p>
        <div className="inline-flex items-center px-4 py-2 bg-amber-50 border border-amber-200 rounded-lg">
          <span className="text-amber-700 text-sm">
            Ve a la pestaña "Agendar Cita" para programar tu próxima sesión
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
                    <h4 className="font-semibold text-gray-800 mb-2">Información de la Cita</h4>
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
                    <h4 className="font-semibold text-gray-800 mb-2">Observaciones</h4>
                    <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                      {cita.notas_paciente}
                    </p>
                  </div>
                )}
              </div>

              <div className="ml-4 flex flex-col gap-2">
                {cita.estado === 'programada' && (
                  <>
                    <button
                      onClick={() => handleReagendarCita(cita)}
                      className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-md hover:shadow-lg"
                    >
                      Reagendar Cita
                    </button>
                    <button
                      onClick={() => handleAbrirModalCancelar(cita)}
                      className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                      Cancelar Cita
                    </button>
                  </>
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
        <h4 className="font-semibold text-amber-800 mb-2">Información Importante</h4>
        <ul className="text-sm text-amber-700 space-y-1">
          <li>• Las citas se pueden cancelar hasta 24 horas antes de la sesión</li>
          <li>• Puedes reagendar tu cita usando el botón "Reagendar Cita"</li>
          <li>• Recibirás un email de confirmación cuando se programe tu cita</li>
          <li>• Llega 10 minutos antes de tu hora programada</li>
          <li>• <strong>Las citas canceladas se eliminarán automáticamente después de 24 horas</strong></li>
        </ul>
      </div>

      {/* Modal para reagendar cita */}
      {citaReagendar && (
        <ModalReagendarCita
          cita={citaReagendar}
          isOpen={mostrarModalReagendar}
          onClose={cerrarModalReagendar}
          onReagendar={handleConfirmarReagendar}
        />
      )}

      {/* Modal para cancelar cita */}
      {citaCancelar && (
        <ModalConfirmarCancelarCita
          isOpen={mostrarModalCancelar}
          onClose={handleCerrarModalCancelar}
          onConfirmar={handleConfirmarCancelar}
          citaInfo={{
            fecha: formatearFecha(citaCancelar.fecha),
            hora: formatearHora(citaCancelar.hora_inicio),
            paciente: `${citaCancelar.psicologo_nombres} ${citaCancelar.psicologo_apellidos}`
          }}
        />
      )}
    </div>
  );
};

export default MisCitas;
