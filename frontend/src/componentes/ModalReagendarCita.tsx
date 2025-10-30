import React, { useState, useEffect } from 'react';
import { Cita } from '../servicios/citas.service';
import disponibilidadMensualService from '../servicios/disponibilidadMensual.service';
import { useNotificaciones } from '../hooks/useNotificaciones';

interface ModalReagendarCitaProps {
  cita: Cita;
  isOpen: boolean;
  onClose: () => void;
  onReagendar: (nuevaFecha: string, nuevoHorario: string) => Promise<void>;
}

const ModalReagendarCita: React.FC<ModalReagendarCitaProps> = ({
  cita,
  isOpen,
  onClose,
  onReagendar
}) => {
  const [fechaSeleccionada, setFechaSeleccionada] = useState<string>('');
  const [horarioSeleccionado, setHorarioSeleccionado] = useState<string>('');
  const [disponibilidad, setDisponibilidad] = useState<{
    diasDisponibles: string[];
    horariosPorDia: Record<string, { inicio: string; fin: string }>;
  }>({ diasDisponibles: [], horariosPorDia: {} });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    mostrarExito,
    mostrarError
  } = useNotificaciones();

  useEffect(() => {
    if (isOpen && cita.psicologo_id) {
      cargarDisponibilidad();
    }
  }, [isOpen, cita.psicologo_id]);

  const cargarDisponibilidad = async () => {
    try {
      setLoading(true);
      setError(null);

      const fechaActual = new Date();
      const mesActual = fechaActual.getMonth() + 1;
      const añoActual = fechaActual.getFullYear();

      const disponibilidadData = await disponibilidadMensualService.obtenerDisponibilidadPaciente(
        cita.psicologo_id,
        mesActual,
        añoActual
      );

      // Filtrar solo fechas futuras
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      
      const diasFuturos = disponibilidadData.diasDisponibles.filter(fecha => {
        const fechaComparar = new Date(fecha);
        fechaComparar.setHours(0, 0, 0, 0);
        return fechaComparar >= hoy;
      });

      setDisponibilidad({
        diasDisponibles: diasFuturos,
        horariosPorDia: disponibilidadData.horariosPorDia
      });
    } catch (err: any) {
      console.error('Error al cargar disponibilidad:', err);
      setError('Error al cargar la disponibilidad del psicólogo');
    } finally {
      setLoading(false);
    }
  };

  const generarHorariosDisponibles = (fecha: string): string[] => {
    const horarioDia = disponibilidad.horariosPorDia[fecha];
    if (!horarioDia) return [];

    const horarios = [];
    const [horaInicio] = horarioDia.inicio.split(':').map(Number);
    const [horaFin] = horarioDia.fin.split(':').map(Number);

    for (let hora = horaInicio; hora < horaFin; hora++) {
      horarios.push(`${hora.toString().padStart(2, '0')}:00`);
    }

    return horarios;
  };

  const formatearFecha = (fecha: string): string => {
    try {
      return new Date(fecha).toLocaleDateString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return fecha;
    }
  };

  const handleReagendar = async () => {
    if (!fechaSeleccionada || !horarioSeleccionado) {
      mostrarError('Error', 'Por favor selecciona una fecha y horario');
      return;
    }

    try {
      await onReagendar(fechaSeleccionada, horarioSeleccionado);
      mostrarExito('Cita Reagendada', 'Tu cita ha sido reagendada correctamente');
      onClose();
    } catch (err: any) {
      mostrarError('Error al Reagendar', err.message || 'No se pudo reagendar la cita');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
                <span className="text-blue-600 text-xl">📅</span>
              </div>
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Reagendar Cita
                </h3>
                <div className="mt-2">
                  <p className="text-sm text-gray-500">
                    Cita actual: <strong>{formatearFecha(cita.fecha)}</strong> a las <strong>{cita.hora_inicio}</strong>
                  </p>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="mt-4 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                <p className="mt-2 text-sm text-gray-600">Cargando disponibilidad...</p>
              </div>
            ) : error ? (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
                <button
                  onClick={cargarDisponibilidad}
                  className="mt-2 text-sm text-red-700 hover:text-red-800 underline"
                >
                  Intentar de nuevo
                </button>
              </div>
            ) : (
              <div className="mt-4 space-y-4">
                {/* Selección de fecha */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Selecciona una nueva fecha:
                  </label>
                  <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                    {disponibilidad.diasDisponibles.map((fecha) => (
                      <button
                        key={fecha}
                        onClick={() => {
                          setFechaSeleccionada(fecha);
                          setHorarioSeleccionado(''); // Reset horario al cambiar fecha
                        }}
                        className={`p-2 text-sm rounded-lg border transition-colors ${
                          fechaSeleccionada === fecha
                            ? 'bg-blue-500 text-white border-blue-500'
                            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {formatearFecha(fecha)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Selección de horario */}
                {fechaSeleccionada && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Selecciona un horario:
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {generarHorariosDisponibles(fechaSeleccionada).map((horario) => (
                        <button
                          key={horario}
                          onClick={() => setHorarioSeleccionado(horario)}
                          className={`p-2 text-sm rounded-lg border transition-colors ${
                            horarioSeleccionado === horario
                              ? 'bg-blue-500 text-white border-blue-500'
                              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {horario}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {disponibilidad.diasDisponibles.length === 0 && (
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      No hay fechas disponibles para reagendar en este mes. 
                      Contacta directamente con tu psicólogo para coordinar una nueva fecha.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              onClick={handleReagendar}
              disabled={!fechaSeleccionada || !horarioSeleccionado || loading}
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Reagendar Cita
            </button>
            <button
              onClick={onClose}
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModalReagendarCita;
