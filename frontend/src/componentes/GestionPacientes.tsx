import React, { useState, useEffect } from 'react';
import { pacientesService, Paciente, DatosPaciente, PacienteCreado } from '../servicios/pacientes.service';
import DetallesPaciente from './DetallesPaciente';
import EditarPaciente from './EditarPaciente';

interface GestionPacientesProps {
  onPacienteCreado?: (paciente: PacienteCreado) => void;
}

const GestionPacientes: React.FC<GestionPacientesProps> = ({ onPacienteCreado }) => {
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [pacientesFiltrados, setPacientesFiltrados] = useState<Paciente[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [totalPacientes, setTotalPacientes] = useState(0);
  const [pacientesActivos, setPacientesActivos] = useState(0);
  
  // Estados para modales de detalles y edición
  const [selectedPacienteId, setSelectedPacienteId] = useState<string | null>(null);
  const [showDetalles, setShowDetalles] = useState(false);
  const [showEditar, setShowEditar] = useState(false);

  // Formulario de creación
  const [formData, setFormData] = useState<DatosPaciente>({
    nombres: '',
    apellidos: '',
    email: '',
    telefono: '',
    fecha_nacimiento: '',
    genero: '',
    rut: '',
    direccion: '',
    contacto_emergencia_nombre: '',
    contacto_emergencia_telefono: '',
    contacto_emergencia_relacion: '',
    observaciones: ''
  });

  useEffect(() => {
    cargarPacientes();
  }, []);

  useEffect(() => {
    if (searchTerm.trim()) {
      buscarPacientes();
    } else {
      setPacientesFiltrados(pacientes);
    }
  }, [searchTerm, pacientes]);

  const cargarPacientes = async () => {
    setLoading(true);
    setError('');
    try {
      const resultado = await pacientesService.obtenerPacientes();
      setPacientes(resultado.pacientes);
      setPacientesFiltrados(resultado.pacientes);
      setTotalPacientes(resultado.total);
      setPacientesActivos(resultado.activos);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const buscarPacientes = async () => {
    if (!searchTerm.trim()) return;
    
    setLoading(true);
    setError('');
    try {
      const resultado = await pacientesService.buscarPacientes(searchTerm);
      setPacientesFiltrados(resultado.pacientes);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePaciente = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const pacienteCreado = await pacientesService.crearPaciente(formData);
      setSuccess(`Paciente creado exitosamente. Ficha: ${pacienteCreado.numero_ficha}. Contraseña temporal: ${pacienteCreado.password_temporal}`);
      setShowCreateForm(false);
      setFormData({
        nombres: '',
        apellidos: '',
        email: '',
        telefono: '',
        fecha_nacimiento: '',
        genero: '',
        rut: '',
        direccion: '',
        contacto_emergencia_nombre: '',
        contacto_emergencia_telefono: '',
        contacto_emergencia_relacion: '',
        observaciones: ''
      });
      
      // Recargar lista de pacientes
      await cargarPacientes();
      
      // Notificar al componente padre
      if (onPacienteCreado) {
        onPacienteCreado(pacienteCreado);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Funciones para manejar modales
  const handleVerDetalles = (pacienteId: string) => {
    setSelectedPacienteId(pacienteId);
    setShowDetalles(true);
  };

  const handleEditar = (pacienteId: string) => {
    setSelectedPacienteId(pacienteId);
    setShowEditar(true);
  };

  const handleCloseDetalles = () => {
    setShowDetalles(false);
    setSelectedPacienteId(null);
  };

  const handleCloseEditar = () => {
    setShowEditar(false);
    setSelectedPacienteId(null);
  };

  const handleSaveEditar = () => {
    setShowEditar(false);
    setShowDetalles(false);
    setSelectedPacienteId(null);
    cargarPacientes(); // Recargar la lista
  };

  const handleEditFromDetalles = () => {
    setShowDetalles(false);
    setShowEditar(true);
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'activo': return 'bg-green-100 text-green-800';
      case 'inactivo': return 'bg-red-100 text-red-800';
      case 'alta': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-CL');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestión de Pacientes</h2>
          <p className="text-gray-600">
            Total: {totalPacientes} | Activos: {pacientesActivos}
          </p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>Nuevo Paciente</span>
        </button>
      </div>

      {/* Mensajes */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
          {success}
        </div>
      )}

      {/* Búsqueda */}
      <div className="relative">
        <input
          type="text"
          placeholder="Buscar por ficha, RUT o nombre..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Lista de Pacientes */}
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          {pacientesFiltrados.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {searchTerm ? 'No se encontraron pacientes con ese criterio' : 'No hay pacientes registrados'}
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {pacientesFiltrados.map((paciente) => (
                <li key={paciente.id} className="px-6 py-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <span className="text-blue-600 font-semibold">
                            {paciente.nombres.charAt(0)}{paciente.apellidos.charAt(0)}
                          </span>
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="text-sm font-medium text-gray-900">
                            {paciente.nombres} {paciente.apellidos}
                          </h3>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getEstadoColor(paciente.estado)}`}>
                            {paciente.estado}
                          </span>
                        </div>
                        <div className="text-sm text-gray-500 space-y-1">
                          <p>Ficha: {paciente.numero_ficha}</p>
                          <p>Email: {paciente.email}</p>
                          {paciente.rut && <p>RUT: {paciente.rut}</p>}
                          <p>Ingreso: {formatDate(paciente.fecha_ingreso)}</p>
                          <p>Puntos: {paciente.puntos_acumulados}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => handleVerDetalles(paciente.id)}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        Ver Detalles
                      </button>
                      <button 
                        onClick={() => handleEditar(paciente.id)}
                        className="text-gray-600 hover:text-gray-800 text-sm font-medium"
                      >
                        Editar
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Modal de Creación */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Crear Nuevo Paciente</h3>
              <button
                onClick={() => setShowCreateForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleCreatePaciente} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nombres *</label>
                  <input
                    type="text"
                    name="nombres"
                    value={formData.nombres}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Apellidos *</label>
                  <input
                    type="text"
                    name="apellidos"
                    value={formData.apellidos}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Teléfono</label>
                  <input
                    type="tel"
                    name="telefono"
                    value={formData.telefono}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">RUT</label>
                  <input
                    type="text"
                    name="rut"
                    value={formData.rut}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Fecha de Nacimiento</label>
                  <input
                    type="date"
                    name="fecha_nacimiento"
                    value={formData.fecha_nacimiento}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Género</label>
                  <select
                    name="genero"
                    value={formData.genero}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Seleccionar...</option>
                    <option value="masculino">Masculino</option>
                    <option value="femenino">Femenino</option>
                    <option value="otro">Otro</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Dirección</label>
                <input
                  type="text"
                  name="direccion"
                  value={formData.direccion}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Contacto de Emergencia - Nombre</label>
                  <input
                    type="text"
                    name="contacto_emergencia_nombre"
                    value={formData.contacto_emergencia_nombre}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Contacto de Emergencia - Teléfono</label>
                  <input
                    type="tel"
                    name="contacto_emergencia_telefono"
                    value={formData.contacto_emergencia_telefono}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Contacto de Emergencia - Relación</label>
                  <input
                    type="text"
                    name="contacto_emergencia_relacion"
                    value={formData.contacto_emergencia_relacion}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Observaciones</label>
                <textarea
                  name="observaciones"
                  value={formData.observaciones}
                  onChange={handleInputChange}
                  rows={3}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Creando...' : 'Crear Paciente'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Detalles */}
      {showDetalles && selectedPacienteId && (
        <DetallesPaciente
          pacienteId={selectedPacienteId}
          onClose={handleCloseDetalles}
          onEdit={handleEditFromDetalles}
        />
      )}

      {/* Modal de Edición */}
      {showEditar && selectedPacienteId && (
        <EditarPaciente
          pacienteId={selectedPacienteId}
          onClose={handleCloseEditar}
          onSave={handleSaveEditar}
        />
      )}
    </div>
  );
};

export default GestionPacientes; 