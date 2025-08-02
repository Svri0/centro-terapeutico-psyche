import React, { useState, useEffect } from 'react';
import { disponibilidadSemanalService, DisponibilidadSemanal } from '../servicios/disponibilidad-semanal.service';

interface Horario {
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
  { id: 'lunes', nombre: 'Lunes' },
  { id: 'martes', nombre: 'Martes' },
  { id: 'miercoles', nombre: 'Miércoles' },
  { id: 'jueves', nombre: 'Jueves' },
  { id: 'viernes', nombre: 'Viernes' },
  { id: 'sabado', nombre: 'Sábado' }
];

export const EditarDisponibilidad: React.FC<EditarDisponibilidadProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [disponibilidad, setDisponibilidad] = useState<DisponibilidadSemanal | null>(null);
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
      setError(null);
      
      const response = await disponibilidadSemanalService.obtenerDisponibilidadSemanal();
      setDisponibilidad(response.disponibilidad);
    } catch (error) {
      console.error('Error al cargar disponibilidad:', error);
      setError('Error al cargar la disponibilidad');
    } finally {
      setLoading(false);
    }
  };

  // Función para validar si un horario se superpone con otros
  const validarSuperposicion = (nuevoHorario: Horario, horariosExistentes: Horario[]): boolean => {
    const nuevoInicio = new Date(`2000-01-01T${nuevoHorario.hora_inicio}`);
    const nuevoFin = new Date(`2000-01-01T${nuevoHorario.hora_fin}`);
    
    // Validar que hora_inicio < hora_fin
    if (nuevoInicio >= nuevoFin) {
      return false;
    }
    
    // Verificar superposición con horarios existentes
    for (const horario of horariosExistentes) {
      const existenteInicio = new Date(`2000-01-01T${horario.hora_inicio}`);
      const existenteFin = new Date(`2000-01-01T${horario.hora_fin}`);
      
      // Si hay superposición
      if (nuevoInicio < existenteFin && nuevoFin > existenteInicio) {
        return false;
      }
    }
    
    return true;
  };

  const agregarHorario = (dia: string) => {
    if (!disponibilidad) return;
    
    const nuevoHorario: Horario = {
      hora_inicio: '09:00',
      hora_fin: '10:00',
      activo: true
    };
    
    const horariosActuales = disponibilidad[`${dia}_horarios` as keyof DisponibilidadSemanal] as Horario[] || [];
    
    // Validar superposición
    if (!validarSuperposicion(nuevoHorario, horariosActuales)) {
      setError('No se puede agregar este horario porque se superpone con horarios existentes o es inválido');
      setTimeout(() => setError(null), 3000);
      return;
    }
    
    const nuevosHorarios = [...horariosActuales, nuevoHorario];
    
    const nuevaDisponibilidad = {
      ...disponibilidad,
      [`${dia}_horarios` as keyof DisponibilidadSemanal]: nuevosHorarios
    };
    
    setDisponibilidad(nuevaDisponibilidad);
    setError(null);
  };

  const eliminarHorario = (dia: string, index: number) => {
    if (!disponibilidad) return;
    
    const horariosActuales = disponibilidad[`${dia}_horarios` as keyof DisponibilidadSemanal] as Horario[] || [];
    const nuevosHorarios = horariosActuales.filter((_, i) => i !== index);
    
    setDisponibilidad({
      ...disponibilidad,
      [`${dia}_horarios` as keyof DisponibilidadSemanal]: nuevosHorarios
    });
  };

  const actualizarHorario = (dia: string, index: number, campo: keyof Horario, valor: any) => {
    if (!disponibilidad) return;
    
    const horariosActuales = disponibilidad[`${dia}_horarios` as keyof DisponibilidadSemanal] as Horario[] || [];
    const nuevosHorarios = [...horariosActuales];
    nuevosHorarios[index] = { ...nuevosHorarios[index], [campo]: valor };
    
    // Validar superposición después de actualizar
    const horarioActualizado = nuevosHorarios[index];
    const horariosSinActual = nuevosHorarios.filter((_, i) => i !== index);
    
    if (!validarSuperposicion(horarioActualizado, horariosSinActual)) {
      setError('No se puede actualizar este horario porque se superpone con horarios existentes o es inválido');
      setTimeout(() => setError(null), 3000);
      return;
    }
    
    setDisponibilidad({
      ...disponibilidad,
      [`${dia}_horarios` as keyof DisponibilidadSemanal]: nuevosHorarios
    });
    setError(null);
  };

  const guardarDisponibilidad = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!disponibilidad) {
        setError('No hay disponibilidad para guardar');
        return;
      }
      
      await disponibilidadSemanalService.actualizarDisponibilidadSemanal(disponibilidad);
      
      // Mostrar popup de éxito
      setSuccess('Disponibilidad editada correctamente');
      
      // Cerrar modal y actualizar después de 3 segundos
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 3000);
    } catch (error) {
      console.error('Error al guardar disponibilidad:', error);
      setError('Error al guardar la disponibilidad');
    } finally {
      setLoading(false);
    }
  };

  const obtenerHorariosPorDia = (dia: string) => {
    if (!disponibilidad) return [];
    const horarios = disponibilidad[`${dia}_horarios` as keyof DisponibilidadSemanal] as Horario[] || [];
    return horarios;
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
          <div className="mb-4 p-4 bg-gradient-to-r from-green-100 to-green-200 border border-green-400 text-green-800 rounded-lg animate-pulse">
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="font-medium">{success}</span>
            </div>
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
                    className="px-3 py-1 bg-gradient-to-r from-amber-100 to-amber-200 hover:from-amber-200 hover:to-amber-300 text-amber-800 rounded text-sm"
                  >
                    + Agregar Horario
                  </button>
                </div>

                {horariosDia.length === 0 ? (
                  <p className="text-gray-500 text-sm">No hay horarios configurados</p>
                ) : (
                  <div className="space-y-3">
                    {horariosDia.map((horario, index) => (
                      <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded">
                        <div className="flex items-center space-x-2">
                          <input
                            type="time"
                            value={horario.hora_inicio}
                            onChange={(e) => actualizarHorario(dia.id, index, 'hora_inicio', e.target.value)}
                            className="border rounded px-2 py-1"
                          />
                          <span className="text-gray-500">-</span>
                          <input
                            type="time"
                            value={horario.hora_fin}
                            onChange={(e) => actualizarHorario(dia.id, index, 'hora_fin', e.target.value)}
                            className="border rounded px-2 py-1"
                          />
                        </div>
                        
                        <label className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={horario.activo}
                            onChange={(e) => actualizarHorario(dia.id, index, 'activo', e.target.checked)}
                            className="rounded"
                          />
                          <span className="text-sm text-gray-600">Activo</span>
                        </label>
                        
                        <button
                          onClick={() => eliminarHorario(dia.id, index)}
                          className="px-2 py-1 bg-gradient-to-r from-red-100 to-red-200 hover:from-red-200 hover:to-red-300 text-red-800 rounded text-sm transition-colors"
                        >
                          Eliminar
                        </button>
                      </div>
                    ))}
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
            className="px-4 py-2 bg-gradient-to-r from-amber-100 to-amber-200 hover:from-amber-200 hover:to-amber-300 text-amber-800 rounded disabled:opacity-50"
          >
            {loading ? 'Guardando...' : 'Guardar Disponibilidad'}
          </button>
        </div>
      </div>
    </div>
  );
}; 