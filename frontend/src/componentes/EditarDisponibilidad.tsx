import React, { useState, useEffect } from 'react';
import { disponibilidadService } from '../servicios/disponibilidad.service';

interface Disponibilidad {
  id?: string;
  dia_semana: number;
  hora_inicio: string;
  hora_fin: string;
  activo: boolean;
}

interface EditarDisponibilidadProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const diasSemana = [
  { id: 0, nombre: 'Domingo' },
  { id: 1, nombre: 'Lunes' },
  { id: 2, nombre: 'Martes' },
  { id: 3, nombre: 'Miércoles' },
  { id: 4, nombre: 'Jueves' },
  { id: 5, nombre: 'Viernes' },
  { id: 6, nombre: 'Sábado' }
];

export const EditarDisponibilidad: React.FC<EditarDisponibilidadProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [disponibilidad, setDisponibilidad] = useState<Disponibilidad[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      cargarDisponibilidad();
    }
  }, [isOpen]);

  const cargarDisponibilidad = async () => {
    try {
      setLoading(true);
      const response = await disponibilidadService.obtenerDisponibilidad();
      setDisponibilidad(response.data.disponibilidad || []);
    } catch (error) {
      console.error('Error al cargar disponibilidad:', error);
      setError('Error al cargar la disponibilidad');
    } finally {
      setLoading(false);
    }
  };

  const agregarHorario = (diaSemana: number) => {
    const nuevoHorario: Disponibilidad = {
      dia_semana: diaSemana,
      hora_inicio: '09:00',
      hora_fin: '10:00',
      activo: true
    };
    setDisponibilidad([...disponibilidad, nuevoHorario]);
  };

  const eliminarHorario = (index: number) => {
    const nuevaDisponibilidad = disponibilidad.filter((_, i) => i !== index);
    setDisponibilidad(nuevaDisponibilidad);
  };

  const actualizarHorario = (index: number, campo: keyof Disponibilidad, valor: any) => {
    const nuevaDisponibilidad = [...disponibilidad];
    nuevaDisponibilidad[index] = { ...nuevaDisponibilidad[index], [campo]: valor };
    setDisponibilidad(nuevaDisponibilidad);
  };

  const guardarDisponibilidad = async () => {
    try {
      setLoading(true);
      setError(null);
      await disponibilidadService.actualizarDisponibilidad(disponibilidad);
      setSuccess('Disponibilidad actualizada exitosamente');
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1500);
    } catch (error) {
      console.error('Error al guardar disponibilidad:', error);
      setError('Error al guardar la disponibilidad');
    } finally {
      setLoading(false);
    }
  };

  const obtenerHorariosPorDia = (diaSemana: number) => {
    return disponibilidad.filter(d => d.dia_semana === diaSemana);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Editar Disponibilidad</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-xl"
          >
            ×
          </button>
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

        <div className="space-y-6">
          {diasSemana.map((dia) => {
            const horariosDia = obtenerHorariosPorDia(dia.id);
            
            return (
              <div key={dia.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-lg font-semibold text-gray-700">{dia.nombre}</h3>
                  <button
                    onClick={() => agregarHorario(dia.id)}
                    className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                  >
                    + Agregar Horario
                  </button>
                </div>

                {horariosDia.length === 0 ? (
                  <p className="text-gray-500 text-sm">No hay horarios configurados</p>
                ) : (
                  <div className="space-y-3">
                    {horariosDia.map((horario, index) => {
                      const globalIndex = disponibilidad.findIndex(d => d === horario);
                      return (
                        <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded">
                          <div className="flex items-center space-x-2">
                            <input
                              type="time"
                              value={horario.hora_inicio}
                              onChange={(e) => actualizarHorario(globalIndex, 'hora_inicio', e.target.value)}
                              className="border rounded px-2 py-1"
                            />
                            <span className="text-gray-500">-</span>
                            <input
                              type="time"
                              value={horario.hora_fin}
                              onChange={(e) => actualizarHorario(globalIndex, 'hora_fin', e.target.value)}
                              className="border rounded px-2 py-1"
                            />
                          </div>
                          
                          <label className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={horario.activo}
                              onChange={(e) => actualizarHorario(globalIndex, 'activo', e.target.checked)}
                              className="rounded"
                            />
                            <span className="text-sm text-gray-600">Activo</span>
                          </label>

                          <button
                            onClick={() => eliminarHorario(globalIndex)}
                            className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                          >
                            Eliminar
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
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
            onClick={guardarDisponibilidad}
            disabled={loading}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? 'Guardando...' : 'Guardar Disponibilidad'}
          </button>
        </div>
      </div>
    </div>
  );
}; 