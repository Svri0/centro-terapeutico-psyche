import React, { useState, useEffect } from 'react';
import { citasService } from '../servicios/citas.service';

interface HorarioDisponible {
  hora_inicio: string;
  hora_fin: string;
  disponible: boolean;
}

interface AgendarCitaProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  psicologoId: string;
  psicologoNombre: string;
}

const tiposSesion = [
  { value: 'individual', label: 'Individual' },
  { value: 'grupal', label: 'Grupal' },
  { value: 'familiar', label: 'Familiar' },
  { value: 'evaluacion', label: 'Evaluación' },
  { value: 'seguimiento', label: 'Seguimiento' }
];

const modalidades = [
  { value: 'presencial', label: 'Presencial' },
  { value: 'virtual', label: 'Virtual' },
  { value: 'telefonica', label: 'Telefónica' }
];

export const AgendarCita: React.FC<AgendarCitaProps> = ({
  isOpen,
  onClose,
  onSuccess,
  psicologoId,
  psicologoNombre
}) => {
  const [fecha, setFecha] = useState('');
  const [horariosDisponibles, setHorariosDisponibles] = useState<HorarioDisponible[]>([]);
  const [horarioSeleccionado, setHorarioSeleccionado] = useState<string>('');
  const [tipoSesion, setTipoSesion] = useState('individual');
  const [modalidad, setModalidad] = useState('presencial');
  const [notas, setNotas] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      // Establecer fecha por defecto (mañana)
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      setFecha(tomorrow.toISOString().split('T')[0]);
    }
  }, [isOpen]);

  useEffect(() => {
    if (fecha && psicologoId) {
      cargarDisponibilidad();
    }
  }, [fecha, psicologoId]);

  const cargarDisponibilidad = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await citasService.obtenerDisponibilidad(psicologoId, fecha);
      setHorariosDisponibles(response.data.horarios || []);
      setHorarioSeleccionado('');
    } catch (error) {
      console.error('Error al cargar disponibilidad:', error);
      setError('Error al cargar la disponibilidad');
      setHorariosDisponibles([]);
    } finally {
      setLoading(false);
    }
  };

  const agendarCita = async () => {
    if (!horarioSeleccionado) {
      setError('Por favor selecciona un horario');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      await citasService.crearCita({
        psicologo_id: psicologoId,
        fecha,
        hora_inicio: horarioSeleccionado,
        tipo_sesion: tipoSesion,
        modalidad: modalidad,
        notas_paciente: notas || undefined
      });

      setSuccess('Cita agendada exitosamente');
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1500);
    } catch (error) {
      console.error('Error al agendar cita:', error);
      setError('Error al agendar la cita');
    } finally {
      setLoading(false);
    }
  };

  const formatearHora = (hora: string) => {
    const [horas, minutos] = hora.split(':');
    const horaNum = parseInt(horas);
    const ampm = horaNum >= 12 ? 'PM' : 'AM';
    const hora12 = horaNum % 12 || 12;
    return `${hora12}:${minutos} ${ampm}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Agendar Cita</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-xl"
          >
            ×
          </button>
        </div>

        <div className="mb-4">
          <p className="text-gray-600">
            Psicólogo: <span className="font-semibold">{psicologoNombre}</span>
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
            {success}
          </div>
        )}

        <div className="space-y-4">
          {/* Fecha */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fecha
            </label>
            <input
              type="date"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Horarios disponibles */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Horarios Disponibles
            </label>
            {loading ? (
              <div className="text-center py-4">
                <p className="text-gray-500">Cargando horarios...</p>
              </div>
            ) : horariosDisponibles.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-gray-500">No hay horarios disponibles para esta fecha</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2 max-h-40 overflow-y-auto">
                {horariosDisponibles.map((horario, index) => (
                  <button
                    key={index}
                    onClick={() => setHorarioSeleccionado(horario.hora_inicio)}
                    className={`p-2 border rounded text-sm transition-colors ${
                      horarioSeleccionado === horario.hora_inicio
                        ? 'bg-blue-500 text-white border-blue-500'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {formatearHora(horario.hora_inicio)}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Tipo de sesión */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Sesión
            </label>
            <select
              value={tipoSesion}
              onChange={(e) => setTipoSesion(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {tiposSesion.map((tipo) => (
                <option key={tipo.value} value={tipo.value}>
                  {tipo.label}
                </option>
              ))}
            </select>
          </div>

          {/* Modalidad */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Modalidad
            </label>
            <select
              value={modalidad}
              onChange={(e) => setModalidad(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {modalidades.map((mod) => (
                <option key={mod.value} value={mod.value}>
                  {mod.label}
                </option>
              ))}
            </select>
          </div>

          {/* Notas */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notas (opcional)
            </label>
            <textarea
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              rows={3}
              placeholder="Agrega alguna nota o comentario para tu psicólogo..."
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="flex justify-end space-x-3 mt-6 pt-4 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            onClick={agendarCita}
            disabled={loading || !horarioSeleccionado}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? 'Agendando...' : 'Agendar Cita'}
          </button>
        </div>
      </div>
    </div>
  );
}; 