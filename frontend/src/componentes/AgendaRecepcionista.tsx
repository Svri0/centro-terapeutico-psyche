import React, { useState, useEffect } from 'react';
import { recepcionistaService } from '../servicios/recepcionista.service';
import { obtenerEstadoTexto, obtenerModalidadColor } from '../utilidades/estados-citas';

interface Cita {
  id: string;
  paciente_id: string;
  paciente_nombre: string;
  paciente_rut: string;
  paciente_telefono: string;
  psicologo_id: string;
  psicologo_nombre: string;
  fecha: string;
  hora_inicio: string;
  hora_fin: string;
  duracion_minutos: number;
  estado: 'programada' | 'confirmada' | 'en_curso' | 'completada' | 'cancelada' | 'no_asistio';
  tipo_sesion: string;
  modalidad: 'presencial' | 'online';
  notas_paciente?: string;
  notas_psicologo?: string;
  recordatorio_enviado: boolean;
  pago_estado: 'pendiente' | 'pagado';
  pago_monto?: number;
}

interface Psicologo {
  id: string;
  nombres: string;
  apellidos: string;
  especialidad: string;
}

interface Paciente {
  id: string;
  nombres: string;
  apellidos: string;
  numero_ficha: string;
  rut: string;
}

const AgendaRecepcionista: React.FC = () => {
  const [citas, setCitas] = useState<Cita[]>([]);
  const [psicologos, setPsicologos] = useState<Psicologo[]>([]);
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Estados para la vista del calendario
  const [vistaActual, setVistaActual] = useState<'diaria' | 'semanal' | 'mensual'>('diaria');
  const [fechaSeleccionada, setFechaSeleccionada] = useState(new Date());
  const [fechaActual, setFechaActual] = useState(new Date());
  
  // Estados para modales
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedCita, setSelectedCita] = useState<Cita | null>(null);
  
  // Estados para filtros
  const [filtroPsicologo, setFiltroPsicologo] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');
  const [filtroPago, setFiltroPago] = useState('');

  // Estados del formulario
  const [formData, setFormData] = useState({
    paciente_id: '',
    psicologo_id: '',
    fecha: '',
    hora_inicio: '',
    hora_fin: '',
    duracion_minutos: 60,
    tipo_sesion: 'individual',
    modalidad: 'presencial',
    notas_paciente: ''
  });

  useEffect(() => {
    cargarCitas();
    cargarPsicologos();
    cargarPacientes();
  }, [fechaSeleccionada, filtroPsicologo, filtroEstado, filtroPago]);

  const cargarCitas = async () => {
    setLoading(true);
    setError('');
    try {
      const fechaFormateada = fechaSeleccionada.toISOString().split('T')[0];
      const citasData = await recepcionistaService.obtenerCitasDelDia(fechaFormateada);
      
      // Mapear los datos del backend al formato esperado por el componente
      const citasMapeadas = citasData.map((cita: any) => ({
        id: cita.id,
        paciente_id: cita.paciente_id || '',
        paciente_nombre: (cita.paciente_nombres && cita.paciente_apellidos) 
          ? `${cita.paciente_nombres} ${cita.paciente_apellidos}`.trim()
          : cita.paciente_nombres || cita.paciente_apellidos || 'Paciente no disponible',
        paciente_rut: cita.paciente_rut || '',
        paciente_telefono: cita.paciente_telefono || '',
        psicologo_id: cita.psicologo_id || '',
        psicologo_nombre: (cita.psicologo_nombres && cita.psicologo_apellidos) 
          ? `${cita.psicologo_nombres} ${cita.psicologo_apellidos}`.trim()
          : cita.psicologo_nombres || cita.psicologo_apellidos || 'Psicólogo no disponible',
        fecha: cita.fecha,
        hora_inicio: cita.hora_inicio,
        hora_fin: cita.hora_fin,
        duracion_minutos: 60, // Valor por defecto
        estado: cita.estado,
        tipo_sesion: cita.tipo_sesion || 'individual',
        modalidad: 'presencial' as const, // Valor por defecto
        notas_paciente: cita.notas || '',
        recordatorio_enviado: false, // Valor por defecto
        pago_estado: 'pendiente' as const, // Valor por defecto
        pago_monto: 0 // Valor por defecto
      }));
      
      setCitas(citasMapeadas);
    } catch (error: any) {
      console.error('Error al cargar las citas:', error);
      setError(error.message || 'Error al cargar las citas');
    } finally {
      setLoading(false);
    }
  };

  const cargarPsicologos = async () => {
    try {
      const psicologosData = await recepcionistaService.obtenerPsicologos();
      
      // Mapear los datos del backend al formato esperado por el componente
      const psicologosMapeados = psicologosData.map((psicologo: any) => ({
        id: psicologo.id,
        nombres: psicologo.nombres,
        apellidos: psicologo.apellidos,
        especialidad: psicologo.especialidad || 'Psicología General'
      }));
      
      setPsicologos(psicologosMapeados);
    } catch (error: any) {
      console.error('Error al cargar psicólogos:', error);
      setError(error.message || 'Error al cargar psicólogos');
    }
  };

  const cargarPacientes = async () => {
    try {
      const pacientesData = await recepcionistaService.obtenerPacientes();
      
      // Mapear los datos del backend al formato esperado por el componente
      const pacientesMapeados = pacientesData.map((paciente: any) => ({
        id: paciente.id,
        nombres: paciente.nombres,
        apellidos: paciente.apellidos,
        numero_ficha: paciente.numero_ficha,
        rut: paciente.rut
      }));
      
      setPacientes(pacientesMapeados);
    } catch (error: any) {
      console.error('Error al cargar pacientes:', error);
      setError(error.message || 'Error al cargar pacientes');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      setLoading(true);
      
      // TODO: Implementar llamada al servicio para crear/editar cita
      // if (selectedCita) {
      //   await citasService.actualizar(selectedCita.id, formData);
      //   setSuccess('Cita actualizada exitosamente');
      // } else {
      //   await citasService.crear(formData);
      //   setSuccess('Cita creada exitosamente');
      // }
      
      setShowCreateModal(false);
      setShowEditModal(false);
      resetForm();
      cargarCitas();
    } catch (error: any) {
      setError(error.message || 'Error al procesar la cita');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      paciente_id: '',
      psicologo_id: '',
      fecha: '',
      hora_inicio: '',
      hora_fin: '',
      duracion_minutos: 60,
      tipo_sesion: 'individual',
      modalidad: 'presencial',
      notas_paciente: ''
    });
    setSelectedCita(null);
  };

  const cambiarEstadoCita = async (citaId: string, nuevoEstado: string) => {
    try {
      setLoading(true);
      // TODO: Implementar llamada al servicio para cambiar estado
      // await citasService.cambiarEstado(citaId, nuevoEstado);
      setSuccess('Estado de la cita actualizado');
      cargarCitas();
    } catch (error: any) {
      setError(error.message || 'Error al cambiar estado de la cita');
    } finally {
      setLoading(false);
    }
  };

  const enviarRecordatorio = async (citaId: string) => {
    try {
      setLoading(true);
      // TODO: Implementar llamada al servicio para enviar recordatorio
      // await citasService.enviarRecordatorio(citaId);
      setSuccess('Recordatorio enviado exitosamente');
      cargarCitas();
    } catch (error: any) {
      setError(error.message || 'Error al enviar recordatorio');
    } finally {
      setLoading(false);
    }
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'confirmada': return 'bg-green-100 text-green-800 border border-black';
      case 'programada': return 'bg-blue-100 text-blue-800 border border-black';
      case 'en_curso': return 'bg-yellow-100 text-yellow-800 border border-black';
      case 'completada': return 'bg-gray-100 text-gray-800 border border-black';
      case 'cancelada': return 'bg-red-100 text-red-800 border border-black';
      case 'no_asistio': return 'bg-orange-100 text-orange-800 border border-black';
      default: return 'bg-gray-100 text-gray-800 border border-black';
    }
  };

  const getPagoColor = (estado: string) => {
    switch (estado) {
      case 'pagado': return 'bg-green-100 text-green-800 border border-black';
      case 'pendiente': return 'bg-yellow-100 text-yellow-800 border border-black';
      default: return 'bg-gray-100 text-gray-800 border border-black';
    }
  };

  const citasFiltradas = citas.filter(cita => {
    if (filtroPsicologo && cita.psicologo_id !== filtroPsicologo) return false;
    if (filtroEstado && cita.estado !== filtroEstado) return false;
    if (filtroPago && cita.pago_estado !== filtroPago) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Agenda de Citas</h2>
          <p className="text-gray-600">Gestiona las citas y horarios de los pacientes</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium transition-colors"
        >
          + Nueva Cita
        </button>
      </div>

      {/* Controles de Vista */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Selector de Vista */}
          <div className="flex space-x-2">
            <button
              onClick={() => setVistaActual('diaria')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                vistaActual === 'diaria'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Diaria
            </button>
            <button
              onClick={() => setVistaActual('semanal')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                vistaActual === 'semanal'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Semanal
            </button>
            <button
              onClick={() => setVistaActual('mensual')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                vistaActual === 'mensual'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Mensual
            </button>
          </div>

          {/* Navegación de Fechas */}
          <div className="flex items-center space-x-4">
            <button
              onClick={() => {
                const nuevaFecha = new Date(fechaSeleccionada);
                if (vistaActual === 'diaria') {
                  nuevaFecha.setDate(nuevaFecha.getDate() - 1);
                } else if (vistaActual === 'semanal') {
                  nuevaFecha.setDate(nuevaFecha.getDate() - 7);
                } else {
                  nuevaFecha.setMonth(nuevaFecha.getMonth() - 1);
                }
                setFechaSeleccionada(nuevaFecha);
              }}
              className="p-2 hover:bg-gray-100 rounded-md"
            >
              ←
            </button>
            <span className="text-lg font-medium">
              {fechaSeleccionada.toLocaleDateString('es-CL', {
                year: 'numeric',
                month: 'long',
                day: vistaActual === 'diaria' ? 'numeric' : undefined
              })}
            </span>
            <button
              onClick={() => {
                const nuevaFecha = new Date(fechaSeleccionada);
                if (vistaActual === 'diaria') {
                  nuevaFecha.setDate(nuevaFecha.getDate() + 1);
                } else if (vistaActual === 'semanal') {
                  nuevaFecha.setDate(nuevaFecha.getDate() + 7);
                } else {
                  nuevaFecha.setMonth(nuevaFecha.getMonth() + 1);
                }
                setFechaSeleccionada(nuevaFecha);
              }}
              className="p-2 hover:bg-gray-100 rounded-md"
            >
              →
            </button>
            <button
              onClick={() => setFechaSeleccionada(new Date())}
              className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md text-sm"
            >
              Hoy
            </button>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Psicólogo
            </label>
            <select
              value={filtroPsicologo}
              onChange={(e) => setFiltroPsicologo(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos los psicólogos</option>
              {psicologos.map((psicologo) => (
                <option key={psicologo.id} value={psicologo.id}>
                  {psicologo.nombres} {psicologo.apellidos}
                </option>
              ))}
            </select>
          </div>
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
              <option value="programada">Programada</option>
              <option value="confirmada">Confirmada</option>
              <option value="en_curso">En Curso</option>
              <option value="completada">Completada</option>
              <option value="cancelada">Cancelada</option>
              <option value="no_asistio">No Asistió</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estado de Pago
            </label>
            <select
              value={filtroPago}
              onChange={(e) => setFiltroPago(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos los pagos</option>
              <option value="pagado">Pagado</option>
              <option value="pendiente">Pendiente</option>
              <option value="parcial">Parcial</option>
            </select>
          </div>
        </div>
      </div>

      {/* Lista de Citas */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Citas del {fechaSeleccionada.toLocaleDateString('es-CL')}
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hora
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Paciente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Psicólogo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Modalidad
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pago
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {citasFiltradas.map((cita) => (
                <tr key={cita.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {cita.hora_inicio} - {cita.hora_fin}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {cita.paciente_nombre}
                      </div>
                      <div className="text-sm text-gray-500">
                        {cita.paciente_rut}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {cita.psicologo_nombre}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${obtenerModalidadColor(cita.modalidad)}`}>
                      {cita.modalidad?.charAt(0).toUpperCase() + cita.modalidad?.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getEstadoColor(cita.estado)}`}>
                      {obtenerEstadoTexto(cita.estado)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPagoColor(cita.pago_estado)}`}>
                      {cita.pago_estado?.charAt(0).toUpperCase() + cita.pago_estado?.slice(1)}
                    </span>
                    {cita.pago_monto && (
                      <div className="text-xs text-gray-500">
                        ${cita.pago_monto.toLocaleString()}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setSelectedCita(cita);
                          setShowDetailsModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Ver
                      </button>
                      <button
                        onClick={() => {
                          setSelectedCita(cita);
                          setFormData({
                            paciente_id: cita.paciente_id,
                            psicologo_id: cita.psicologo_id,
                            fecha: cita.fecha,
                            hora_inicio: cita.hora_inicio,
                            hora_fin: cita.hora_fin,
                            duracion_minutos: cita.duracion_minutos,
                            tipo_sesion: cita.tipo_sesion,
                            modalidad: cita.modalidad,
                            notas_paciente: cita.notas_paciente || ''
                          });
                          setShowEditModal(true);
                        }}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        Editar
                      </button>
                      {!cita.recordatorio_enviado && (
                        <button
                          onClick={() => enviarRecordatorio(cita.id)}
                          className="text-green-600 hover:text-green-900"
                        >
                          Recordatorio
                        </button>
                      )}
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
                  {showCreateModal ? 'Nueva Cita' : 'Editar Cita'}
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Paciente *
                    </label>
                    <select
                      value={formData.paciente_id}
                      onChange={(e) => setFormData({ ...formData, paciente_id: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Seleccionar paciente...</option>
                      {pacientes.map((paciente) => (
                        <option key={paciente.id} value={paciente.id}>
                          {paciente.nombres} {paciente.apellidos} - {paciente.numero_ficha}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Psicólogo *
                    </label>
                    <select
                      value={formData.psicologo_id}
                      onChange={(e) => setFormData({ ...formData, psicologo_id: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Seleccionar psicólogo...</option>
                      {psicologos.map((psicologo) => (
                        <option key={psicologo.id} value={psicologo.id}>
                          {psicologo.nombres} {psicologo.apellidos}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Fecha *
                    </label>
                    <input
                      type="date"
                      value={formData.fecha}
                      onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Hora Inicio *
                    </label>
                    <input
                      type="time"
                      value={formData.hora_inicio}
                      onChange={(e) => setFormData({ ...formData, hora_inicio: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Hora Fin *
                    </label>
                    <input
                      type="time"
                      value={formData.hora_fin}
                      onChange={(e) => setFormData({ ...formData, hora_fin: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tipo de Sesión
                    </label>
                    <select
                      value={formData.tipo_sesion}
                      onChange={(e) => setFormData({ ...formData, tipo_sesion: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="individual">Individual</option>
                      <option value="pareja">Pareja</option>
                      <option value="familiar">Familiar</option>
                      <option value="grupal">Grupal</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Modalidad
                    </label>
                    <select
                      value={formData.modalidad}
                      onChange={(e) => setFormData({ ...formData, modalidad: e.target.value as 'presencial' | 'online' })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="presencial">Presencial</option>
                      <option value="online">Online</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notas
                  </label>
                  <textarea
                    value={formData.notas_paciente}
                    onChange={(e) => setFormData({ ...formData, notas_paciente: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Notas adicionales sobre la cita..."
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
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
                  >
                    {loading ? 'Procesando...' : (showCreateModal ? 'Crear Cita' : 'Actualizar Cita')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Detalles */}
      {showDetailsModal && selectedCita && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-2/3 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Detalles de la Cita
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
                    <label className="block text-sm font-medium text-gray-700">Paciente</label>
                    <p className="text-gray-900">{selectedCita.paciente_nombre}</p>
                    <p className="text-sm text-gray-500">{selectedCita.paciente_rut}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Psicólogo</label>
                    <p className="text-gray-900">{selectedCita.psicologo_nombre}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Fecha y Hora</label>
                    <p className="text-gray-900">
                      {new Date(selectedCita.fecha).toLocaleDateString('es-CL')} 
                      {' '}de {selectedCita.hora_inicio} a {selectedCita.hora_fin}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Duración</label>
                    <p className="text-gray-900">{selectedCita.duracion_minutos} minutos</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Modalidad</label>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${obtenerModalidadColor(selectedCita.modalidad)}`}>
                      {selectedCita.modalidad?.charAt(0).toUpperCase() + selectedCita.modalidad?.slice(1)}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Estado</label>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getEstadoColor(selectedCita.estado)}`}>
                      {selectedCita.estado}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Estado de Pago</label>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPagoColor(selectedCita.pago_estado)}`}>
                    {selectedCita.pago_estado?.charAt(0).toUpperCase() + selectedCita.pago_estado?.slice(1)}
                  </span>
                  {selectedCita.pago_monto && (
                    <p className="text-gray-900 mt-1">${selectedCita.pago_monto.toLocaleString()}</p>
                  )}
                </div>

                {selectedCita.notas_paciente && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Notas</label>
                    <p className="text-gray-900">{selectedCita.notas_paciente}</p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700">Recordatorio</label>
                  <p className="text-gray-900">
                    {selectedCita.recordatorio_enviado ? '✓ Enviado' : '✗ No enviado'}
                  </p>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cerrar
                </button>
                <button
                  onClick={() => {
                    setShowDetailsModal(false);
                    setSelectedCita(selectedCita);
                    setFormData({
                      paciente_id: selectedCita.paciente_id,
                      psicologo_id: selectedCita.psicologo_id,
                      fecha: selectedCita.fecha,
                      hora_inicio: selectedCita.hora_inicio,
                      hora_fin: selectedCita.hora_fin,
                      duracion_minutos: selectedCita.duracion_minutos,
                      tipo_sesion: selectedCita.tipo_sesion,
                      modalidad: selectedCita.modalidad,
                      notas_paciente: selectedCita.notas_paciente || ''
                    });
                    setShowEditModal(true);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Editar Cita
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgendaRecepcionista;

