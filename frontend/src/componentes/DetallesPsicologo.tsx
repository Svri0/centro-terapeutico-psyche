import React, { useState, useEffect } from 'react';
import { Psicologo, adminService } from '../servicios/admin.service';
import Notificacion from './Notificacion';

interface Paciente {
  id: string;
  nombres: string;
  apellidos: string;
  email: string;
  telefono?: string;
  activo: boolean;
}

interface Cita {
  id: string;
  paciente_id: string;
  paciente_nombres: string;
  paciente_apellidos: string;
  fecha: string;
  hora_inicio: string;
  hora_fin: string;
  estado: string;
  tipo_sesion: string;
  modalidad: string;
}

interface DetallesPsicologoProps {
  psicologo: Psicologo;
  isOpen: boolean;
  onClose: () => void;
  onEliminarCita: (citaId: string) => Promise<void>;
  onReasignarPaciente: (pacienteId: string, nuevoPsicologoId: string) => Promise<void>;
}

const DetallesPsicologo: React.FC<DetallesPsicologoProps> = ({
  psicologo,
  isOpen,
  onClose,
  onEliminarCita,
  onReasignarPaciente
}) => {
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [citas, setCitas] = useState<Cita[]>([]);
  const [psicologosDisponibles, setPsicologosDisponibles] = useState<Psicologo[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedPaciente, setSelectedPaciente] = useState<string>('');
  const [selectedNuevoPsicologo, setSelectedNuevoPsicologo] = useState<string>('');
  const [showReasignarModal, setShowReasignarModal] = useState(false);
  const [pacientesReasignando, setPacientesReasignando] = useState<Set<string>>(new Set());
  const [notificacion, setNotificacion] = useState<{
    mensaje: string;
    tipo: 'exito' | 'error' | 'info';
    isVisible: boolean;
  }>({
    mensaje: '',
    tipo: 'info',
    isVisible: false
  });

  useEffect(() => {
    if (isOpen) {
      cargarDetalles();
    }
  }, [isOpen, psicologo.id]);

  const cargarDetalles = async () => {
    setLoading(true);
    try {
      // Obtener pacientes del psicólogo
      const pacientesData = await adminService.obtenerPacientesPsicologo(psicologo.id);
      setPacientes(pacientesData);

      // Obtener citas del psicólogo
      const citasData = await adminService.obtenerCitasPsicologo(psicologo.id);
      setCitas(citasData);

      // Obtener psicólogos disponibles para reasignación (excluyendo el actual)
      const psicologosData = await adminService.obtenerPsicologosDisponibles(psicologo.id);
      setPsicologosDisponibles(psicologosData);
    } catch (error) {
      console.error('Error al cargar detalles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEliminarCita = async (citaId: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar esta cita?')) {
      try {
        await adminService.eliminarCita(citaId);
        // Recargar citas después de eliminar
        cargarDetalles();
        setNotificacion({
          mensaje: 'Cita eliminada exitosamente',
          tipo: 'exito',
          isVisible: true
        });
      } catch (error) {
        console.error('Error al eliminar cita:', error);
        setNotificacion({
          mensaje: 'Error al eliminar la cita: ' + (error as Error).message,
          tipo: 'error',
          isVisible: true
        });
      }
    }
  };

  const handleReasignarPaciente = async () => {
    if (!selectedPaciente || !selectedNuevoPsicologo) {
      setNotificacion({
        mensaje: 'Por favor selecciona un paciente y un nuevo psicólogo',
        tipo: 'error',
        isVisible: true
      });
      return;
    }

    try {
      // Agregar el paciente a la lista de reasignando para la animación
      setPacientesReasignando(prev => new Set(prev).add(selectedPaciente));

      await adminService.reasignarPaciente(selectedPaciente, selectedNuevoPsicologo);
      
      // Cerrar modal inmediatamente (más rápido)
      setShowReasignarModal(false);
      setSelectedPaciente('');
      setSelectedNuevoPsicologo('');
      
             // Esperar más tiempo para que el modal se cierre completamente antes de que el paciente desaparezca
       setTimeout(() => {
         setPacientesReasignando(new Set());
         // Recargar detalles después de reasignar
         cargarDetalles();
       }, 1200); // Ajustado a 1200ms para que el paciente permanezca visible 1.2 segundos

      setNotificacion({
        mensaje: 'Paciente reasignado exitosamente',
        tipo: 'exito',
        isVisible: true
      });
    } catch (error) {
      console.error('Error al reasignar paciente:', error);
      setPacientesReasignando(new Set()); // Limpiar en caso de error
      setNotificacion({
        mensaje: 'Error al reasignar paciente: ' + (error as Error).message,
        tipo: 'error',
        isVisible: true
      });
    }
  };

  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-CL');
  };

  const formatearEstado = (estado: string) => {
    const estados = {
      programada: 'Programada',
      confirmada: 'Confirmada',
      en_progreso: 'En Progreso',
      completada: 'Completada',
      cancelada: 'Cancelada',
      no_show: 'No Asistió'
    };
    return estados[estado as keyof typeof estados] || estado;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              Detalles de {psicologo.nombres} {psicologo.apellidos}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
              <span className="ml-2 text-amber-600">Cargando detalles...</span>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Pacientes */}
              <div>
                <h4 className="text-md font-semibold text-gray-900 mb-3">
                  Pacientes Asignados ({pacientes.filter(p => !pacientesReasignando.has(p.id)).length})
                </h4>
                <div className="bg-gray-50 rounded-lg p-4">
                  {pacientes.length === 0 ? (
                    <p className="text-gray-500 text-sm">No hay pacientes asignados</p>
                  ) : (
                    <div className="space-y-3">
                      {pacientes.map((paciente) => (
                        <div 
                          key={paciente.id} 
                                                                                                           className={`
                             flex justify-between items-center bg-white p-3 rounded-md border
                             transform transition-all duration-8 ease-in-out
                             ${pacientesReasignando.has(paciente.id) 
                               ? 'opacity-0 scale-95' 
                               : 'opacity-100 scale-100'
                             }
                           `}
                        >
                          <div>
                            <div className="font-medium text-gray-900">
                              {paciente.nombres} {paciente.apellidos}
                            </div>
                            <div className="text-sm text-gray-600">{paciente.email}</div>
                            <div className="text-sm text-gray-500">{paciente.telefono}</div>
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => {
                                setSelectedPaciente(paciente.id);
                                setShowReasignarModal(true);
                              }}
                              disabled={pacientesReasignando.has(paciente.id)}
                              className={`
                                px-3 py-1 text-xs font-semibold rounded-md transition-colors
                                ${pacientesReasignando.has(paciente.id)
                                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                  : 'bg-blue-100 hover:bg-blue-200 text-blue-700'
                                }
                              `}
                            >
                              {pacientesReasignando.has(paciente.id) ? 'Reasignando...' : 'Reasignar'}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Citas */}
              <div>
                <h4 className="text-md font-semibold text-gray-900 mb-3">
                  Citas Pendientes ({citas.length})
                </h4>
                <div className="bg-gray-50 rounded-lg p-4">
                  {citas.length === 0 ? (
                    <p className="text-gray-500 text-sm">No hay citas pendientes</p>
                  ) : (
                    <div className="space-y-3">
                      {citas.map((cita) => (
                        <div key={cita.id} className="flex justify-between items-center bg-white p-3 rounded-md border">
                          <div>
                            <div className="font-medium text-gray-900">
                              {cita.paciente_nombres} {cita.paciente_apellidos}
                            </div>
                            <div className="text-sm text-gray-600">
                              {formatearFecha(cita.fecha)} - {cita.hora_inicio} a {cita.hora_fin}
                            </div>
                            <div className="text-sm text-gray-500">
                              {cita.tipo_sesion} • {cita.modalidad} • {formatearEstado(cita.estado)}
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleEliminarCita(cita.id)}
                              className="px-3 py-1 text-xs font-semibold bg-red-100 hover:bg-red-200 text-red-700 rounded-md transition-colors"
                            >
                              Eliminar Cita
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal de Reasignación */}
      {showReasignarModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 transition-opacity duration-200">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white transform transition-all duration-200 ease-out">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Reasignar Paciente</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nuevo Psicólogo
                  </label>
                  <select
                    value={selectedNuevoPsicologo}
                    onChange={(e) => setSelectedNuevoPsicologo(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500"
                  >
                    <option value="">Seleccionar psicólogo</option>
                    {psicologosDisponibles.map((psicologo) => (
                      <option key={psicologo.id} value={psicologo.id}>
                        {psicologo.nombres} {psicologo.apellidos}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowReasignarModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleReasignarPaciente}
                  disabled={!selectedNuevoPsicologo}
                  className="px-4 py-2 text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 rounded-md disabled:opacity-50"
                >
                  Reasignar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Componente de notificación */}
      <Notificacion
        mensaje={notificacion.mensaje}
        tipo={notificacion.tipo}
        isVisible={notificacion.isVisible}
        onClose={() => setNotificacion(prev => ({ ...prev, isVisible: false }))}
        duracion={3000}
      />
    </div>
  );
};

export default DetallesPsicologo; 