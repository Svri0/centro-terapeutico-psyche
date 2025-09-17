import React, { useState } from 'react';
import DetallesPaciente from './DetallesPaciente';
import ModalEditarPaciente from './ModalEditarPaciente';
import ModalConfirmarDesactivar from './ModalConfirmarDesactivar';

interface Paciente {
  id: string;
  nombres: string;
  apellidos: string;
  email: string;
  telefono?: string;
  rut?: string;
  activo: boolean;
  fecha_creacion: string;
  avatar_url?: string;
  direccion?: string;
  contacto_emergencia_nombre?: string;
  contacto_emergencia_telefono?: string;
  contacto_emergencia_relacion?: string;
  observaciones?: string;
  psicologo_asignado?: string;
}

interface TablaPacientesProps {
  pacientes: Paciente[];
  onEditar: (paciente: Paciente) => void;
  onDesactivar: (id: string) => void;
  onReactivar: (id: string) => void;
  onEliminar: (id: string) => void;
}

const TablaPacientes: React.FC<TablaPacientesProps> = ({
  pacientes,
  onEditar,
  onDesactivar,
  onReactivar,
  onEliminar
}) => {
  const [selectedPaciente, setSelectedPaciente] = useState<Paciente | null>(null);
  const [showDetalles, setShowDetalles] = useState(false);
  const [showEditar, setShowEditar] = useState(false);
  const [showConfirmar, setShowConfirmar] = useState(false);
  const [accionConfirmar, setAccionConfirmar] = useState<'desactivar' | 'reactivar' | 'eliminar'>('desactivar');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEstado, setFilterEstado] = useState('todos');

  const getEstadoColor = (activo: boolean) => {
    return activo 
      ? 'bg-green-100 text-green-800' 
      : 'bg-red-100 text-red-800';
  };

  // Filtrar pacientes
  const pacientesFiltrados = pacientes.filter(paciente => {
    const matchesSearch = searchTerm === '' ||
      paciente.nombres.toLowerCase().includes(searchTerm.toLowerCase()) ||
      paciente.apellidos.toLowerCase().includes(searchTerm.toLowerCase()) ||
      paciente.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (paciente.telefono && paciente.telefono.includes(searchTerm)) ||
      (paciente.rut && paciente.rut.includes(searchTerm));
    
    const matchesEstado = filterEstado === 'todos' || 
      (filterEstado === 'activo' && paciente.activo) ||
      (filterEstado === 'inactivo' && !paciente.activo);
    
    return matchesSearch && matchesEstado;
  });

  const handleEditar = (paciente: Paciente) => {
    setSelectedPaciente(paciente);
    setShowEditar(true);
  };

  const handleDesactivar = (paciente: Paciente) => {
    setSelectedPaciente(paciente);
    setAccionConfirmar('desactivar');
    setShowConfirmar(true);
  };

  const handleReactivar = (paciente: Paciente) => {
    setSelectedPaciente(paciente);
    setAccionConfirmar('reactivar');
    setShowConfirmar(true);
  };

  const handleEliminar = (paciente: Paciente) => {
    setSelectedPaciente(paciente);
    setAccionConfirmar('eliminar');
    setShowConfirmar(true);
  };

  const handleConfirmarAccion = () => {
    if (!selectedPaciente) return;

    switch (accionConfirmar) {
      case 'desactivar':
        onDesactivar(selectedPaciente.id);
        break;
      case 'reactivar':
        onReactivar(selectedPaciente.id);
        break;
      case 'eliminar':
        onEliminar(selectedPaciente.id);
        break;
    }
  };

  const handleGuardarEdicion = (pacienteActualizado: Paciente) => {
    onEditar(pacienteActualizado);
    setShowEditar(false);
    setSelectedPaciente(null);
  };

  return (
    <div className="space-y-4">
      {/* Filtros */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Buscar
            </label>
            <input
              type="text"
              placeholder="Nombre, email, teléfono o RUT..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estado
            </label>
            <select
              value={filterEstado}
              onChange={(e) => setFilterEstado(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="todos">Todos los estados</option>
              <option value="activo">Activo</option>
              <option value="inactivo">Inactivo</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => {
                setSearchTerm('');
                setFilterEstado('todos');
              }}
              className="w-full bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md transition-colors"
            >
              Limpiar Filtros
            </button>
          </div>
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                Paciente
              </th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                Contacto
              </th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                Fecha Creación
              </th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {pacientesFiltrados.map((paciente) => (
              <tr key={paciente.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      {paciente.avatar_url ? (
                        <img className="h-10 w-10 rounded-full" src={paciente.avatar_url} alt="" />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                          <span className="text-sm font-medium text-gray-700">
                            {paciente.nombres.charAt(0)}{paciente.apellidos.charAt(0)}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {paciente.nombres} {paciente.apellidos}
                      </div>
                      <div className="text-sm text-gray-500">
                        {paciente.rut || 'Sin RUT'}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{paciente.email}</div>
                  <div className="text-sm text-gray-500">{paciente.telefono || 'Sin teléfono'}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getEstadoColor(paciente.activo)}`}>
                    {paciente.activo ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(paciente.fecha_creacion).toLocaleDateString('es-CL')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        setSelectedPaciente(paciente);
                        setShowDetalles(true);
                      }}
                      className="px-3 py-1 text-xs font-medium text-white bg-purple-500 hover:bg-purple-600 rounded-md transition-colors"
                    >
                      Detalles
                    </button>
                    <button
                      onClick={() => handleEditar(paciente)}
                      className="px-3 py-1 text-xs font-medium text-white bg-blue-500 hover:bg-blue-600 rounded-md transition-colors"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => paciente.activo ? handleDesactivar(paciente) : handleReactivar(paciente)}
                      className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                        paciente.activo 
                          ? 'text-white bg-red-500 hover:bg-red-600' 
                          : 'text-white bg-green-500 hover:bg-green-600'
                      }`}
                    >
                      {paciente.activo ? 'Desactivar' : 'Activar'}
                    </button>
                    <button
                      onClick={() => handleEliminar(paciente)}
                      className="px-3 py-1 text-xs font-medium text-gray-700 bg-gray-300 hover:bg-gray-400 rounded-md transition-colors"
                    >
                      Eliminar
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>

    {/* Modal de Detalles */}
    {selectedPaciente && (
      <DetallesPaciente
        paciente={selectedPaciente}
        isOpen={showDetalles}
        onClose={() => {
          setShowDetalles(false);
          setSelectedPaciente(null);
        }}
      />
    )}

    {/* Modal de Edición */}
    {selectedPaciente && (
      <ModalEditarPaciente
        paciente={selectedPaciente}
        isOpen={showEditar}
        onClose={() => {
          setShowEditar(false);
          setSelectedPaciente(null);
        }}
        onGuardar={handleGuardarEdicion}
      />
    )}

    {/* Modal de Confirmación */}
    {selectedPaciente && (
      <ModalConfirmarDesactivar
        isOpen={showConfirmar}
        onClose={() => {
          setShowConfirmar(false);
          setSelectedPaciente(null);
        }}
        onConfirmar={handleConfirmarAccion}
        tipoUsuario="paciente"
        nombreUsuario={`${selectedPaciente.nombres} ${selectedPaciente.apellidos}`}
        accion={accionConfirmar}
      />
    )}
  </div>
  );
};

export default TablaPacientes;
