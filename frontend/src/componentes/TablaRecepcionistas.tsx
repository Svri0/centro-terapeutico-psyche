import React, { useState } from 'react';
import DetallesRecepcionista from './DetallesRecepcionista';
import ModalEditarRecepcionista from './ModalEditarRecepcionista';
import ModalConfirmarDesactivar from './ModalConfirmarDesactivar';

interface Recepcionista {
  id: string;
  nombres: string;
  apellidos: string;
  email: string;
  telefono?: string;
  activo: boolean;
  fecha_creacion: string;
  avatar_url?: string;
}

interface TablaRecepcionistasProps {
  recepcionistas: Recepcionista[];
  onEditar: (recepcionista: Recepcionista) => void;
  onDesactivar: (id: string) => void;
  onReactivar: (id: string) => void;
  onEliminar: (id: string) => void;
}

const TablaRecepcionistas: React.FC<TablaRecepcionistasProps> = ({
  recepcionistas,
  onEditar,
  onDesactivar,
  onReactivar,
  onEliminar
}) => {
  const [selectedRecepcionista, setSelectedRecepcionista] = useState<Recepcionista | null>(null);
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

  // Filtrar recepcionistas
  const recepcionistasFiltrados = recepcionistas.filter(recepcionista => {
    const matchesSearch = searchTerm === '' ||
      recepcionista.nombres.toLowerCase().includes(searchTerm.toLowerCase()) ||
      recepcionista.apellidos.toLowerCase().includes(searchTerm.toLowerCase()) ||
      recepcionista.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (recepcionista.telefono && recepcionista.telefono.includes(searchTerm));
    
    const matchesEstado = filterEstado === 'todos' || 
      (filterEstado === 'activo' && recepcionista.activo) ||
      (filterEstado === 'inactivo' && !recepcionista.activo);
    
    return matchesSearch && matchesEstado;
  });

  const handleEditar = (recepcionista: Recepcionista) => {
    setSelectedRecepcionista(recepcionista);
    setShowEditar(true);
  };

  const handleDesactivar = (recepcionista: Recepcionista) => {
    setSelectedRecepcionista(recepcionista);
    setAccionConfirmar('desactivar');
    setShowConfirmar(true);
  };

  const handleReactivar = (recepcionista: Recepcionista) => {
    setSelectedRecepcionista(recepcionista);
    setAccionConfirmar('reactivar');
    setShowConfirmar(true);
  };

  const handleEliminar = (recepcionista: Recepcionista) => {
    setSelectedRecepcionista(recepcionista);
    setAccionConfirmar('eliminar');
    setShowConfirmar(true);
  };

  const handleConfirmarAccion = () => {
    if (!selectedRecepcionista) return;

    switch (accionConfirmar) {
      case 'desactivar':
        onDesactivar(selectedRecepcionista.id);
        break;
      case 'reactivar':
        onReactivar(selectedRecepcionista.id);
        break;
      case 'eliminar':
        onEliminar(selectedRecepcionista.id);
        break;
    }
  };

  const handleGuardarEdicion = (recepcionistaActualizado: Recepcionista) => {
    onEditar(recepcionistaActualizado);
    setShowEditar(false);
    setSelectedRecepcionista(null);
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
              placeholder="Nombre, email o teléfono..."
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
                Recepcionista
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
            {recepcionistasFiltrados.map((recepcionista) => (
              <tr key={recepcionista.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      {recepcionista.avatar_url ? (
                        <img className="h-10 w-10 rounded-full" src={recepcionista.avatar_url} alt="" />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                          <span className="text-sm font-medium text-gray-700">
                            {recepcionista.nombres.charAt(0)}{recepcionista.apellidos.charAt(0)}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {recepcionista.nombres} {recepcionista.apellidos}
                      </div>
                      <div className="text-sm text-gray-500">
                        Sin RUT
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{recepcionista.email}</div>
                  <div className="text-sm text-gray-500">{recepcionista.telefono || 'Sin teléfono'}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getEstadoColor(recepcionista.activo)}`}>
                    {recepcionista.activo ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(recepcionista.fecha_creacion).toLocaleDateString('es-CL')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        setSelectedRecepcionista(recepcionista);
                        setShowDetalles(true);
                      }}
                      className="px-3 py-1 text-xs font-medium text-white bg-purple-500 hover:bg-purple-600 rounded-md transition-colors"
                    >
                      Detalles
                    </button>
                    <button
                      onClick={() => handleEditar(recepcionista)}
                      className="px-3 py-1 text-xs font-medium text-white bg-blue-500 hover:bg-blue-600 rounded-md transition-colors"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => recepcionista.activo ? handleDesactivar(recepcionista) : handleReactivar(recepcionista)}
                      className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                        recepcionista.activo 
                          ? 'text-white bg-red-500 hover:bg-red-600' 
                          : 'text-white bg-green-500 hover:bg-green-600'
                      }`}
                    >
                      {recepcionista.activo ? 'Desactivar' : 'Activar'}
                    </button>
                    <button
                      onClick={() => handleEliminar(recepcionista)}
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
    {selectedRecepcionista && (
      <DetallesRecepcionista
        recepcionista={selectedRecepcionista}
        isOpen={showDetalles}
        onClose={() => {
          setShowDetalles(false);
          setSelectedRecepcionista(null);
        }}
      />
    )}

    {/* Modal de Edición */}
    {selectedRecepcionista && (
      <ModalEditarRecepcionista
        recepcionista={selectedRecepcionista}
        isOpen={showEditar}
        onClose={() => {
          setShowEditar(false);
          setSelectedRecepcionista(null);
        }}
        onGuardar={handleGuardarEdicion}
      />
    )}

    {/* Modal de Confirmación */}
    {selectedRecepcionista && (
      <ModalConfirmarDesactivar
        isOpen={showConfirmar}
        onClose={() => {
          setShowConfirmar(false);
          setSelectedRecepcionista(null);
        }}
        onConfirmar={handleConfirmarAccion}
        tipoUsuario="recepcionista"
        nombreUsuario={`${selectedRecepcionista.nombres} ${selectedRecepcionista.apellidos}`}
        accion={accionConfirmar}
      />
    )}
  </div>
  );
};

export default TablaRecepcionistas;
