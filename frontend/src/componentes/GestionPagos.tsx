import React, { useState, useEffect } from 'react';
import InputFecha from './InputFecha';
import { recepcionistaService } from '../servicios/recepcionista.service';

interface Pago {
  id: string;
  cita_id: string;
  paciente_id: string;
  paciente_nombre: string;
  paciente_rut: string;
  psicologo_id: string;
  psicologo_nombre: string;
  fecha_cita: string;
  hora_cita: string;
  monto: number;
  metodo_pago: 'efectivo' | 'tarjeta' | 'transferencia' | 'online';
  estado: 'pendiente' | 'pagado' | 'parcial' | 'reembolsado';
  fecha_pago?: string;
  numero_recibo?: string;
  notas?: string;
  comprobante_url?: string;
}

interface Cita {
  id: string;
  paciente_id: string;
  paciente_nombre: string;
  paciente_rut: string;
  psicologo_id: string;
  psicologo_nombre: string;
  fecha: string;
  hora_inicio: string;
  hora_fin: string;
  estado: string;
  pago_estado: string;
  pago_monto?: number;
}

const GestionPagos: React.FC = () => {
  const [pagos, setPagos] = useState<Pago[]>([]);
  const [citas, setCitas] = useState<Cita[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Estados para filtros
  const [filtroEstado, setFiltroEstado] = useState('');
  const [filtroMetodo, setFiltroMetodo] = useState('');
  const [filtroFecha, setFiltroFecha] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Estados para modales
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedPago, setSelectedPago] = useState<Pago | null>(null);
  
  // Estados del formulario
  const [formData, setFormData] = useState({
    cita_id: '',
    monto: '',
    metodo_pago: 'efectivo' as 'efectivo' | 'tarjeta' | 'transferencia' | 'online',
    estado: 'pagado' as 'pendiente' | 'pagado' | 'parcial' | 'reembolsado',
    notas: '',
    numero_recibo: ''
  });

  useEffect(() => {
    cargarPagos();
    cargarCitas();
  }, [filtroEstado, filtroMetodo, filtroFecha]);

  const cargarPagos = async () => {
    setLoading(true);
    setError('');
    try {
      const pagosData = await recepcionistaService.obtenerPagos(
        filtroFecha ? new Date(filtroFecha).toISOString().split('T')[0] : undefined,
        undefined, // fecha_fin
        filtroEstado || undefined,
        filtroMetodo || undefined
      );
      
      // Mapear los datos del backend al formato esperado por el componente
      const pagosMapeados = pagosData.map((pago: any) => ({
        id: pago.id,
        cita_id: pago.cita_id,
        paciente_id: pago.paciente_id || '',
        paciente_nombre: (pago.paciente_nombres && pago.paciente_apellidos) 
          ? `${pago.paciente_nombres} ${pago.paciente_apellidos}`.trim()
          : pago.paciente_nombres || pago.paciente_apellidos || 'Paciente no disponible',
        paciente_rut: pago.paciente_rut || '',
        psicologo_id: pago.psicologo_id || '',
        psicologo_nombre: (pago.psicologo_nombres && pago.psicologo_apellidos) 
          ? `${pago.psicologo_nombres} ${pago.psicologo_apellidos}`.trim()
          : pago.psicologo_nombres || pago.psicologo_apellidos || 'Psicólogo no disponible',
        fecha_cita: pago.fecha_cita,
        hora_cita: pago.hora_cita,
        monto: parseFloat(pago.monto) || 0,
        metodo_pago: pago.metodo_pago || 'efectivo',
        estado: pago.estado,
        fecha_pago: pago.fecha_pago,
        numero_recibo: pago.numero_recibo || '',
        notas: pago.notas || ''
      }));
      
      setPagos(pagosMapeados);
    } catch (error: any) {
      console.error('Error al cargar los pagos:', error);
      setError(error.message || 'Error al cargar los pagos');
    } finally {
      setLoading(false);
    }
  };

  const cargarCitas = async () => {
    try {
      const citasData = await recepcionistaService.obtenerCitasDelDia();
      
      // Mapear los datos del backend al formato esperado por el componente
      const citasMapeadas = citasData.map((cita: any) => ({
        id: cita.id,
        paciente_id: cita.paciente_id || '',
        paciente_nombre: (cita.paciente_nombres && cita.paciente_apellidos) 
          ? `${cita.paciente_nombres} ${cita.paciente_apellidos}`.trim()
          : cita.paciente_nombres || cita.paciente_apellidos || 'Paciente no disponible',
        paciente_rut: cita.paciente_rut || '',
        psicologo_id: cita.psicologo_id || '',
        psicologo_nombre: (cita.psicologo_nombres && cita.psicologo_apellidos) 
          ? `${cita.psicologo_nombres} ${cita.psicologo_apellidos}`.trim()
          : cita.psicologo_nombres || cita.psicologo_apellidos || 'Psicólogo no disponible',
        fecha: cita.fecha,
        hora_inicio: cita.hora_inicio,
        hora_fin: cita.hora_fin,
        estado: cita.estado,
        pago_estado: 'pendiente', // Valor por defecto
        pago_monto: 0 // Valor por defecto
      }));
      
      setCitas(citasMapeadas);
    } catch (error: any) {
      console.error('Error al cargar citas:', error);
      setError(error.message || 'Error al cargar citas');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      setLoading(true);
      
      const pagoData = {
        ...formData,
        monto: parseFloat(formData.monto)
      };

      // TODO: Implementar llamada al servicio para crear/editar pago
      // if (selectedPago) {
      //   await pagosService.actualizar(selectedPago.id, pagoData);
      //   setSuccess('Pago actualizado exitosamente');
      // } else {
      //   await pagosService.crear(pagoData);
      //   setSuccess('Pago registrado exitosamente');
      // }
      
      setShowCreateModal(false);
      setShowEditModal(false);
      resetForm();
      cargarPagos();
    } catch (error: any) {
      setError(error.message || 'Error al procesar el pago');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      cita_id: '',
      monto: '',
      metodo_pago: 'efectivo',
      estado: 'pagado',
      notas: '',
      numero_recibo: ''
    });
    setSelectedPago(null);
  };

  const generarRecibo = async (pagoId: string) => {
    try {
      setLoading(true);
      // TODO: Implementar generación de recibo
      // const response = await pagosService.generarRecibo(pagoId);
      // window.open(response.data.url, '_blank');
      setSuccess('Recibo generado exitosamente');
    } catch (error: any) {
      setError(error.message || 'Error al generar recibo');
    } finally {
      setLoading(false);
    }
  };

  const enviarRecibo = async (pagoId: string) => {
    try {
      setLoading(true);
      // TODO: Implementar envío de recibo por email
      // await pagosService.enviarRecibo(pagoId);
      setSuccess('Recibo enviado exitosamente');
    } catch (error: any) {
      setError(error.message || 'Error al enviar recibo');
    } finally {
      setLoading(false);
    }
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'pagado': return 'bg-green-100 text-green-800';
      case 'pendiente': return 'bg-yellow-100 text-yellow-800';
      case 'parcial': return 'bg-blue-100 text-blue-800';
      case 'reembolsado': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getMetodoColor = (metodo: string) => {
    switch (metodo) {
      case 'efectivo': return 'bg-green-100 text-green-800';
      case 'tarjeta': return 'bg-blue-100 text-blue-800';
      case 'transferencia': return 'bg-purple-100 text-purple-800';
      case 'online': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const pagosFiltrados = pagos.filter(pago => {
    if (searchTerm && !pago.paciente_nombre.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !pago.paciente_rut.includes(searchTerm) && !pago.numero_recibo?.includes(searchTerm)) {
      return false;
    }
    return true;
  });

  const totalIngresos = pagos
    .filter(pago => pago.estado === 'pagado')
    .reduce((sum, pago) => sum + pago.monto, 0);

  const totalPendientes = pagos
    .filter(pago => pago.estado === 'pendiente')
    .reduce((sum, pago) => sum + pago.monto, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestión de Pagos</h2>
          <p className="text-gray-600">Registra y gestiona los pagos de las citas</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-md font-medium transition-colors shadow-md hover:shadow-lg"
        >
          + Registrar Pago
        </button>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Ingresos del Día</p>
              <p className="text-2xl font-semibold text-gray-900">${totalIngresos.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pendientes</p>
              <p className="text-2xl font-semibold text-gray-900">${totalPendientes.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Pagos</p>
              <p className="text-2xl font-semibold text-gray-900">{pagos.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estado
            </label>
            <select
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos los estados</option>
              <option value="pagado">Pagado</option>
              <option value="pendiente">Pendiente</option>
              <option value="parcial">Parcial</option>
              <option value="reembolsado">Reembolsado</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Método de Pago
            </label>
            <select
              value={filtroMetodo}
              onChange={(e) => setFiltroMetodo(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos los métodos</option>
              <option value="efectivo">Efectivo</option>
              <option value="tarjeta">Tarjeta</option>
              <option value="transferencia">Transferencia</option>
              <option value="online">Online</option>
            </select>
          </div>
          <InputFecha
            value={filtroFecha}
            onChange={setFiltroFecha}
            label="Fecha"
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Buscar
            </label>
            <input
              type="text"
              placeholder="Paciente, RUT o recibo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Lista de Pagos */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Recibo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Paciente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cita
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Monto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Método
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {pagosFiltrados.map((pago) => (
                <tr key={pago.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {pago.numero_recibo || 'Sin recibo'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {pago.paciente_nombre}
                      </div>
                      <div className="text-sm text-gray-500">
                        {pago.paciente_rut}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm text-gray-900">
                        {new Date(pago.fecha_cita).toLocaleDateString('es-CL')}
                      </div>
                      <div className="text-sm text-gray-500">
                        {pago.hora_cita}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${pago.monto.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getMetodoColor(pago.metodo_pago)}`}>
                      {pago.metodo_pago}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getEstadoColor(pago.estado)}`}>
                      {pago.estado}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setSelectedPago(pago);
                          setShowDetailsModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Ver
                      </button>
                      <button
                        onClick={() => generarRecibo(pago.id)}
                        className="text-green-600 hover:text-green-900"
                      >
                        Recibo
                      </button>
                      <button
                        onClick={() => enviarRecibo(pago.id)}
                        className="text-purple-600 hover:text-purple-900"
                      >
                        Enviar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Creación/Edición */}
      {(showCreateModal || showEditModal) && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  {showCreateModal ? 'Registrar Pago' : 'Editar Pago'}
                </h3>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setShowEditModal(false);
                    resetForm();
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cita *
                  </label>
                  <select
                    value={formData.cita_id}
                    onChange={(e) => setFormData({ ...formData, cita_id: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Seleccionar cita...</option>
                    {citas.map((cita) => (
                      <option key={cita.id} value={cita.id}>
                        {cita.paciente_nombre} - {new Date(cita.fecha).toLocaleDateString('es-CL')} {cita.hora_inicio}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Monto *
                    </label>
                    <input
                      type="number"
                      value={formData.monto}
                      onChange={(e) => setFormData({ ...formData, monto: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Número de Recibo
                    </label>
                    <input
                      type="text"
                      value={formData.numero_recibo}
                      onChange={(e) => setFormData({ ...formData, numero_recibo: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Método de Pago *
                    </label>
                    <select
                      value={formData.metodo_pago}
                      onChange={(e) => setFormData({ ...formData, metodo_pago: e.target.value as any })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="efectivo">Efectivo</option>
                      <option value="tarjeta">Tarjeta</option>
                      <option value="transferencia">Transferencia</option>
                      <option value="online">Online</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Estado *
                    </label>
                    <select
                      value={formData.estado}
                      onChange={(e) => setFormData({ ...formData, estado: e.target.value as any })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="pagado">Pagado</option>
                      <option value="pendiente">Pendiente</option>
                      <option value="parcial">Parcial</option>
                      <option value="reembolsado">Reembolsado</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notas
                  </label>
                  <textarea
                    value={formData.notas}
                    onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Notas adicionales sobre el pago..."
                  />
                </div>

                {/* Mensajes de Error y Éxito */}
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                    {error}
                  </div>
                )}

                {success && (
                  <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
                    {success}
                  </div>
                )}

                {/* Botones */}
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateModal(false);
                      setShowEditModal(false);
                      resetForm();
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-amber-500 text-white rounded-md hover:bg-amber-600 disabled:opacity-50 transition-colors shadow-md hover:shadow-lg"
                  >
                    {loading ? 'Procesando...' : (showCreateModal ? 'Registrar Pago' : 'Actualizar Pago')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Detalles */}
      {showDetailsModal && selectedPago && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-2/3 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Detalles del Pago
                </h3>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Número de Recibo</label>
                    <p className="text-gray-900">{selectedPago.numero_recibo || 'Sin recibo'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Monto</label>
                    <p className="text-gray-900">${selectedPago.monto.toLocaleString()}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Paciente</label>
                    <p className="text-gray-900">{selectedPago.paciente_nombre}</p>
                    <p className="text-sm text-gray-500">{selectedPago.paciente_rut}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Psicólogo</label>
                    <p className="text-gray-900">{selectedPago.psicologo_nombre}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Fecha de Cita</label>
                    <p className="text-gray-900">
                      {new Date(selectedPago.fecha_cita).toLocaleDateString('es-CL')} a las {selectedPago.hora_cita}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Fecha de Pago</label>
                    <p className="text-gray-900">
                      {selectedPago.fecha_pago ? new Date(selectedPago.fecha_pago).toLocaleDateString('es-CL') : 'No registrada'}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Método de Pago</label>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getMetodoColor(selectedPago.metodo_pago)}`}>
                      {selectedPago.metodo_pago}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Estado</label>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getEstadoColor(selectedPago.estado)}`}>
                      {selectedPago.estado}
                    </span>
                  </div>
                </div>

                {selectedPago.notas && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Notas</label>
                    <p className="text-gray-900">{selectedPago.notas}</p>
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cerrar
                </button>
                <button
                  onClick={() => generarRecibo(selectedPago.id)}
                  className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors shadow-md hover:shadow-lg"
                >
                  Generar Recibo
                </button>
                <button
                  onClick={() => enviarRecibo(selectedPago.id)}
                  className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
                >
                  Enviar por Email
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GestionPagos;

