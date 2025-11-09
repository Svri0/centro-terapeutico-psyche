import React, { useState, useEffect } from 'react';
import { citasService } from '../servicios/citas.service';
import { sesionesTerapeuticasService } from '../servicios/sesiones-terapeuticas.service';
import { obtenerEstadoTexto, obtenerEstadoColor, obtenerModalidadColor } from '../utilidades/estados-citas';
import SesionTerapeutica from './SesionTerapeutica';
import '../styles/animations.css';

interface Cita {
  id: string;
  paciente_id: string;
  paciente_nombre: string;
  paciente_rut: string;
  paciente_telefono: string;
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

const AgendaPsicologo: React.FC = () => {
  const [citas, setCitas] = useState<Cita[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showSesionTerapeutica, setShowSesionTerapeutica] = useState(false);
  
  // Estados para notificaciones personalizadas
  const [notificacion, setNotificacion] = useState<{
    mensaje: string;
    tipo: 'success' | 'error' | 'warning' | 'info';
    visible: boolean;
  }>({
    mensaje: '',
    tipo: 'info',
    visible: false
  });
  
  // Estados para la vista del calendario
  const [vistaActual, setVistaActual] = useState<'diaria' | 'semanal' | 'mensual'>('semanal');
  const [fechaSeleccionada, setFechaSeleccionada] = useState(new Date());
  const [fechaActual, setFechaActual] = useState(new Date());
  
  // Estados para modales
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedCita, setSelectedCita] = useState<Cita | null>(null);
  
  // Estados para filtros
  const [filtroEstado, setFiltroEstado] = useState('');
  const [filtroPago, setFiltroPago] = useState('');

  useEffect(() => {
    cargarCitas();
  }, [vistaActual, fechaSeleccionada, filtroEstado, filtroPago]);

  // Función para mostrar notificaciones personalizadas
  const mostrarNotificacion = (mensaje: string, tipo: 'success' | 'error' | 'warning' | 'info') => {
    setNotificacion({
      mensaje,
      tipo,
      visible: true
    });

    // Sonido de notificaciones desactivado temporalmente
    
    // Auto-ocultar después de 4 segundos
    setTimeout(() => {
      setNotificacion(prev => ({ ...prev, visible: false }));
    }, 4000);
  };

  const cargarCitas = async () => {
    setLoading(true);
    setError('');
    try {
      let citasData;
      
      if (vistaActual === 'diaria') {
        const fechaFormateada = fechaSeleccionada.toISOString().split('T')[0];
        citasData = await citasService.obtenerCitasDelDia(fechaFormateada);
      } else if (vistaActual === 'semanal') {
        const inicioSemana = getInicioSemana(fechaSeleccionada);
        const finSemana = getFinSemana(fechaSeleccionada);
        citasData = await citasService.obtenerCitasPorRango(inicioSemana, finSemana);
      } else {
        const inicioMes = new Date(fechaSeleccionada.getFullYear(), fechaSeleccionada.getMonth(), 1);
        const finMes = new Date(fechaSeleccionada.getFullYear(), fechaSeleccionada.getMonth() + 1, 0);
        citasData = await citasService.obtenerCitasPorRango(
          inicioMes.toISOString().split('T')[0],
          finMes.toISOString().split('T')[0]
        );
      }
      
      // Mapear los datos del backend al formato esperado por el componente
      const citasMapeadas = citasData.map((cita: any) => ({
        id: cita.id,
        paciente_id: cita.paciente_id || '',
        paciente_nombre: `${cita.paciente_nombres} ${cita.paciente_apellidos}`,
        paciente_rut: cita.paciente_rut || '',
        paciente_telefono: cita.paciente_telefono || '',
        fecha: cita.fecha,
        hora_inicio: cita.hora_inicio,
        hora_fin: cita.hora_fin,
        duracion_minutos: cita.duracion_minutos || 60,
        estado: cita.estado,
        tipo_sesion: cita.tipo_sesion || 'individual',
        modalidad: cita.modalidad || 'presencial',
        notas_paciente: cita.notas || '',
        notas_psicologo: cita.notas_psicologo || '',
        recordatorio_enviado: cita.recordatorio_enviado || false,
        pago_estado: cita.pago_estado || 'pendiente',
        pago_monto: cita.pago_monto || 0
      }));
      
      setCitas(citasMapeadas);
    } catch (error: any) {
      console.error('Error al cargar las citas:', error);
      setError(error.message || 'Error al cargar las citas');
    } finally {
      setLoading(false);
    }
  };

  const getInicioSemana = (fecha: Date) => {
    const inicio = new Date(fecha);
    const dia = inicio.getDay();
    const diff = inicio.getDate() - dia + (dia === 0 ? -6 : 1); // Ajustar para que lunes sea el primer día
    inicio.setDate(diff);
    return inicio;
  };

  const getFinSemana = (fecha: Date) => {
    const inicio = getInicioSemana(fecha);
    const fin = new Date(inicio);
    fin.setDate(inicio.getDate() + 6);
    return fin;
  };

  const cambiarEstadoCita = async (citaId: string, nuevoEstado: string) => {
    try {
      setLoading(true);
      await citasService.actualizarEstado(citaId, { estado: nuevoEstado });
      setSuccess('Estado de la cita actualizado');
      cargarCitas();
    } catch (error: any) {
      setError(error.message || 'Error al cambiar estado de la cita');
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

  const getDiasSemana = () => {
    const inicio = getInicioSemana(fechaSeleccionada);
    const dias = [];
    for (let i = 0; i < 7; i++) {
      const dia = new Date(inicio);
      dia.setDate(inicio.getDate() + i);
      dias.push(dia);
    }
    return dias;
  };

  const getCitasDelDia = (fecha: Date) => {
    const fechaStr = fecha.toISOString().split('T')[0];
    return citas.filter(cita => cita.fecha === fechaStr);
  };

  const citasFiltradas = citas.filter(cita => {
    if (filtroEstado && cita.estado !== filtroEstado) return false;
    if (filtroPago && cita.pago_estado !== filtroPago) return false;
    return true;
  });

  const renderVistaSemanal = () => {
    const dias = getDiasSemana();
    
    return (
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Agenda Semanal - {getInicioSemana(fechaSeleccionada).toLocaleDateString('es-CL')} al {getFinSemana(fechaSeleccionada).toLocaleDateString('es-CL')}
          </h3>
        </div>
        
        <div className="grid grid-cols-7 gap-1">
          {/* Headers de días */}
          {dias.map((dia, index) => (
            <div key={index} className="bg-gray-50 p-3 text-center border-r border-gray-200">
              <div className="text-sm font-medium text-gray-900">
                {dia.toLocaleDateString('es-CL', { weekday: 'short' })}
              </div>
              <div className="text-lg font-bold text-gray-700">
                {dia.getDate()}
              </div>
            </div>
          ))}
          
          {/* Contenido de días */}
          {dias.map((dia, index) => {
            const citasDelDia = getCitasDelDia(dia);
            const esHoy = dia.toDateString() === new Date().toDateString();
            
            return (
              <div key={index} className={`min-h-32 p-2 border-r border-gray-200 ${esHoy ? 'bg-blue-50' : 'bg-white'}`}>
                {citasDelDia.map((cita) => (
                  <div
                    key={cita.id}
                    className={`mb-2 p-2 rounded-lg border cursor-pointer hover:shadow-md transition-shadow ${
                      cita.estado === 'completada' ? 'bg-gray-100 border-gray-300' :
                      cita.estado === 'cancelada' ? 'bg-red-100 border-red-300' :
                      cita.estado === 'en_curso' ? 'bg-yellow-100 border-yellow-300' :
                      cita.estado === 'confirmada' ? 'bg-green-100 border-green-300' :
                      'bg-blue-100 border-blue-300'
                    }`}
                    onClick={() => {
                      setSelectedCita(cita);
                      setShowDetailsModal(true);
                    }}
                  >
                    <div className="text-xs font-medium text-gray-900">
                      {cita.hora_inicio} - {cita.hora_fin}
                    </div>
                    <div className="text-sm font-semibold text-gray-800 truncate">
                      {cita.paciente_nombre}
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getEstadoColor(cita.estado)}`}>
                        {obtenerEstadoTexto(cita.estado)}
                      </span>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPagoColor(cita.pago_estado)}`}>
                        {cita.pago_estado?.charAt(0).toUpperCase() + cita.pago_estado?.slice(1)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderVistaDiaria = () => {
    const citasDelDia = getCitasDelDia(fechaSeleccionada);
    
    return (
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Citas del {fechaSeleccionada.toLocaleDateString('es-CL', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </h3>
        </div>
        
        {citasDelDia.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <div className="text-4xl mb-4">📅</div>
            <p>No hay citas programadas para este día</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {citasDelDia.map((cita) => (
              <div key={cita.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4">
                      <div className="text-lg font-medium text-gray-900">
                        {cita.hora_inicio} - {cita.hora_fin}
                      </div>
                      <div className="text-lg font-semibold text-gray-800">
                        {cita.paciente_nombre}
                      </div>
                      <div className="text-sm text-gray-500">
                        {cita.paciente_rut}
                      </div>
                    </div>
                    <div className="mt-2 flex items-center space-x-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getEstadoColor(cita.estado)}`}>
                        {obtenerEstadoTexto(cita.estado)}
                      </span>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPagoColor(cita.pago_estado)}`}>
                        {cita.pago_estado?.charAt(0).toUpperCase() + cita.pago_estado?.slice(1)}
                      </span>
                      <span className="text-sm text-gray-500">
                        {cita.modalidad?.charAt(0).toUpperCase() + cita.modalidad?.slice(1)}
                      </span>
                    </div>
                    {cita.notas_paciente && (
                      <div className="mt-2 text-sm text-gray-600">
                        <strong>Notas:</strong> {cita.notas_paciente}
                      </div>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        setSelectedCita(cita);
                        setShowDetailsModal(true);
                      }}
                      className="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-md hover:bg-blue-200"
                    >
                      Ver Detalles
                    </button>
                    {cita.estado === 'programada' && (
                      <button
                        onClick={() => cambiarEstadoCita(cita.id, 'confirmada')}
                        className="px-3 py-1 text-sm bg-green-100 text-green-800 rounded-md hover:bg-green-200"
                      >
                        Confirmar
                      </button>
                    )}
                    {cita.estado === 'confirmada' && (
                      <button
                        onClick={() => cambiarEstadoCita(cita.id, 'en_curso')}
                        className="px-3 py-1 text-sm bg-yellow-100 text-yellow-800 rounded-md hover:bg-yellow-200"
                      >
                        Iniciar
                      </button>
                    )}
                    {cita.estado === 'en_curso' && (
                      <button
                        onClick={() => cambiarEstadoCita(cita.id, 'completada')}
                        className="px-3 py-1 text-sm bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200"
                      >
                        Completar
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderVistaMensual = () => {
    const inicioMes = new Date(fechaSeleccionada.getFullYear(), fechaSeleccionada.getMonth(), 1);
    const finMes = new Date(fechaSeleccionada.getFullYear(), fechaSeleccionada.getMonth() + 1, 0);
    const diasDelMes = finMes.getDate();
    const primerDiaSemana = inicioMes.getDay();
    
    // Generar días del mes
    const dias = [];
    for (let i = 1; i <= diasDelMes; i++) {
      dias.push(i);
    }
    
    // Obtener citas del mes
    const citasDelMes = citas.filter(cita => {
      const fechaCita = new Date(cita.fecha);
      return fechaCita.getMonth() === fechaSeleccionada.getMonth() && 
             fechaCita.getFullYear() === fechaSeleccionada.getFullYear();
    });
    
    // Agrupar citas por día
    const citasPorDia: { [key: number]: Cita[] } = {};
    citasDelMes.forEach(cita => {
      const dia = new Date(cita.fecha).getDate();
      if (!citasPorDia[dia]) {
        citasPorDia[dia] = [];
      }
      citasPorDia[dia].push(cita);
    });
    
    const nombresDias = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    
    return (
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            {fechaSeleccionada.toLocaleDateString('es-CL', { 
              month: 'long', 
              year: 'numeric' 
            })}
          </h3>
        </div>
        
        <div className="p-6">
          {/* Días de la semana */}
          <div className="grid grid-cols-7 gap-1 mb-4">
            {nombresDias.map((dia) => (
              <div key={dia} className="p-2 text-center text-sm font-semibold text-gray-600">
                {dia}
              </div>
            ))}
          </div>
          
          {/* Calendario */}
          <div className="grid grid-cols-7 gap-1">
            {/* Días vacíos del mes anterior */}
            {Array.from({ length: primerDiaSemana }, (_, i) => (
              <div key={`empty-${i}`} className="h-24 p-1"></div>
            ))}
            
            {/* Días del mes */}
            {dias.map((dia) => {
              const esHoy = new Date().getDate() === dia && 
                           new Date().getMonth() === fechaSeleccionada.getMonth() && 
                           new Date().getFullYear() === fechaSeleccionada.getFullYear();
              const citasDelDia = citasPorDia[dia] || [];
              
              return (
                <div 
                  key={dia} 
                  className={`h-24 p-1 border border-gray-200 ${
                    esHoy ? 'bg-blue-50 border-blue-300' : 'bg-white hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-sm font-medium ${
                      esHoy ? 'text-blue-600' : 'text-gray-900'
                    }`}>
                      {dia}
                    </span>
                    {citasDelDia.length > 0 && (
                      <span className="text-xs bg-blue-100 text-blue-800 px-1 rounded">
                        {citasDelDia.length}
                      </span>
                    )}
                  </div>
                  
                  {/* Citas del día - Versión simplificada */}
                  <div className="space-y-1">
                    {citasDelDia.slice(0, 1).map((cita) => (
                      <div
                        key={cita.id}
                        className={`text-xs p-1 rounded cursor-pointer hover:shadow-sm transition-shadow ${
                          cita.estado === 'completada' ? 'bg-gray-100' :
                          cita.estado === 'cancelada' ? 'bg-red-100' :
                          (cita.estado === 'en_progreso' || cita.estado === 'en_curso') ? 'bg-yellow-100' :
                          cita.estado === 'confirmada' ? 'bg-green-100' :
                          'bg-blue-100'
                        }`}
                        onClick={() => {
                          setSelectedCita(cita);
                          setShowDetailsModal(true);
                        }}
                        title={`${cita.paciente_nombre} - ${cita.hora_inicio} - ${obtenerEstadoTexto(cita.estado)}`}
                      >
                        <div className="font-medium truncate text-gray-900">{cita.paciente_nombre}</div>
                        <div className="text-gray-600">{cita.hora_inicio}</div>
                      </div>
                    ))}
                    {citasDelDia.length > 1 && (
                      <div className="text-xs text-gray-500 text-center">
                        +{citasDelDia.length - 1} más
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Mi Agenda</h2>
          <p className="text-gray-600">Gestiona tus sesiones y citas programadas</p>
        </div>
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

      {/* Contenido de la Agenda */}
      {loading ? (
        <div className="bg-white p-8 rounded-lg shadow text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando agenda...</p>
        </div>
      ) : (
        <>
          {vistaActual === 'semanal' && renderVistaSemanal()}
          {vistaActual === 'diaria' && renderVistaDiaria()}
          {vistaActual === 'mensual' && renderVistaMensual()}
        </>
      )}

      {/* Modal de Detalles */}
      {showDetailsModal && selectedCita && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 backdrop-blur-sm">
          <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-gray-100">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Detalles de la Cita</h3>
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${obtenerEstadoColor(selectedCita.estado)}`}>
                    {obtenerEstadoTexto(selectedCita.estado)}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${obtenerModalidadColor(selectedCita.modalidad)}`}>
                    {selectedCita.modalidad}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors duration-200 p-2 hover:bg-gray-100 rounded-full"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-6">
              {/* Información del Paciente */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
                <h4 className="text-lg font-semibold text-blue-800 mb-4 flex items-center gap-2">
                  <span className="text-xl">👤</span>
                  Información del Paciente
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-blue-700 mb-1">Nombre</label>
                    <p className="text-blue-900 font-semibold text-lg">{selectedCita.paciente_nombre}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-blue-700 mb-1">RUT</label>
                    <p className="text-blue-900 font-mono">{selectedCita.paciente_rut}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-blue-700 mb-1">Teléfono</label>
                    <p className="text-blue-900 font-mono">{selectedCita.paciente_telefono}</p>
                  </div>
                </div>
              </div>

              {/* Información de la Cita */}
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl p-6">
                <h4 className="text-lg font-semibold text-emerald-800 mb-4 flex items-center gap-2">
                  <span className="text-xl">📅</span>
                  Información de la Cita
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-emerald-700 mb-1">Fecha y Hora</label>
                    <p className="text-emerald-900 font-semibold">{selectedCita.fecha} - {selectedCita.hora_inicio} a {selectedCita.hora_fin}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-emerald-700 mb-1">Duración</label>
                    <p className="text-emerald-900 font-semibold">{selectedCita.duracion_minutos} minutos</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-emerald-700 mb-1">Modalidad</label>
                    <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${obtenerModalidadColor(selectedCita.modalidad)}`}>
                      {selectedCita.modalidad?.charAt(0).toUpperCase() + selectedCita.modalidad?.slice(1)}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-emerald-700 mb-1">Tipo de Sesión</label>
                    <p className="text-emerald-900 font-semibold">{selectedCita.tipo_sesion}</p>
                  </div>
                </div>
              </div>

              {/* Estados */}
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-6">
                <h4 className="text-lg font-semibold text-purple-800 mb-4 flex items-center gap-2">
                  <span className="text-xl">🏷️</span>
                  Estados
                </h4>
                <div className="flex flex-wrap gap-3">
                  <div>
                    <label className="block text-sm font-medium text-amber-700">Estado de la Cita</label>
                    <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getEstadoColor(selectedCita.estado)}`}>
                      {obtenerEstadoTexto(selectedCita.estado)}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-amber-700">Estado de Pago</label>
                    <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getPagoColor(selectedCita.pago_estado)}`}>
                      {selectedCita.pago_estado?.charAt(0).toUpperCase() + selectedCita.pago_estado?.slice(1)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Notas */}
              {(selectedCita.notas_paciente || selectedCita.notas_psicologo) && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="text-lg font-semibold text-green-800 mb-3">Notas</h4>
                  {selectedCita.notas_paciente && (
                    <div className="mb-3">
                      <label className="block text-sm font-medium text-green-700">Notas del Paciente</label>
                      <p className="text-green-900">{selectedCita.notas_paciente}</p>
                    </div>
                  )}
                  {selectedCita.notas_psicologo && (
                    <div>
                      <label className="block text-sm font-medium text-green-700">Notas del Psicólogo</label>
                      <p className="text-green-900">{selectedCita.notas_psicologo}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Acciones */}
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="px-6 py-3 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 rounded-xl hover:from-gray-200 hover:to-gray-300 font-semibold shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center gap-2"
                >
                  <span className="text-lg">✕</span>
                  Cerrar
                </button>
                {selectedCita.estado === 'programada' && (
                  <button
                    onClick={() => {
                      cambiarEstadoCita(selectedCita.id, 'confirmada');
                      setShowDetailsModal(false);
                      mostrarNotificacion('Cita confirmada exitosamente', 'success');
                    }}
                    className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center gap-2"
                  >
                    <span className="text-xl">✓</span>
                    Confirmar Cita
                  </button>
                )}
                {/* Botón Iniciar Sesión Terapéutica */}
                {selectedCita.estado === 'confirmada' && (
                  <button
                    onClick={() => {
                      // Validar que la fecha sea hoy o futura
                      const fechaCita = new Date(selectedCita.fecha + 'T00:00:00');
                      const hoy = new Date();
                      hoy.setHours(0, 0, 0, 0);
                      
                      console.log('🔍 Debug fecha:', {
                        fechaCita: fechaCita.toISOString(),
                        hoy: hoy.toISOString(),
                        esFutura: fechaCita >= hoy
                      });
                      
                      if (fechaCita < hoy) {
                        mostrarNotificacion('No se puede iniciar una sesión terapéutica para una fecha pasada', 'warning');
                        return;
                      }
                      
                      // Cambiar estado a 'en_progreso' y abrir pantalla de sesión
                      cambiarEstadoCita(selectedCita.id, 'en_progreso');
                      setShowDetailsModal(false);
                      setShowSesionTerapeutica(true);
                    }}
                    className="px-6 py-3 bg-white text-amber-700 border border-amber-300 rounded-xl hover:bg-amber-50 font-semibold shadow-md hover:shadow-lg transform hover:scale-[1.02] transition-all duration-200 flex items-center gap-2"
                  >
                    <span className="text-xl">🧠</span>
                    Iniciar Sesión Terapéutica
                  </button>
                )}
                
                {/* Reanudar Sesión - Mostrar cuando la cita está en progreso */}
                {selectedCita.estado === 'en_progreso' && (
                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        // Abrir modal de sesión terapéutica para reanudar
                        setShowDetailsModal(false);
                        setShowSesionTerapeutica(true);
                      }}
                      className="px-6 py-3 bg-white text-teal-700 border border-teal-300 rounded-xl hover:bg-teal-50 font-semibold shadow-md hover:shadow-lg transform hover:scale-[1.02] transition-all duration-200 flex items-center gap-2"
                    >
                      <span className="text-xl">🔄</span>
                      Reanudar Sesión Terapéutica
                    </button>
                    <button
                      onClick={async () => {
                        try {
                          // Verificar si hay una sesión activa y finalizarla primero
                          try {
                            const estadoSesion = await sesionesTerapeuticasService.obtenerEstadoSesion(selectedCita.id);
                            if (estadoSesion && estadoSesion.sesionId) {
                              // Finalizar la sesión con resumen por defecto
                              await sesionesTerapeuticasService.finalizarSesion(estadoSesion.sesionId, {
                                resumenSesion: 'Sesión completada desde el botón de completar cita',
                                notasPsicologo: ''
                              });
                              mostrarNotificacion('Sesión finalizada y cita completada exitosamente', 'success');
                            }
                          } catch (error) {
                            // No hay sesión activa, continuar normalmente
                            console.log('No hay sesión activa para finalizar');
                          }
                          
                          // Cambiar estado de la cita
                          await cambiarEstadoCita(selectedCita.id, 'completada');
                          setShowDetailsModal(false);
                        } catch (error: any) {
                          console.error('Error al completar sesión:', error);
                          mostrarNotificacion('Error al completar la sesión: ' + error.message, 'error');
                        }
                      }}
                      className="px-6 py-3 bg-gradient-to-r from-slate-600 to-gray-700 text-white rounded-xl hover:from-slate-700 hover:to-gray-800 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center gap-2"
                    >
                      <span className="text-xl">✅</span>
                      Completar Sesión
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

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

      {/* Modal de Sesión Terapéutica */}
      {showSesionTerapeutica && selectedCita && (
        <SesionTerapeutica
          cita={selectedCita}
          onFinalizarSesion={(resumen, notas) => {
            // TODO: Implementar guardado en backend
            console.log('Resumen de sesión:', resumen);
            console.log('Notas:', notas);
            
            // Cambiar estado a 'completada' cuando se finaliza la sesión
            if (selectedCita) {
              cambiarEstadoCita(selectedCita.id, 'completada');
            }
            
            setShowSesionTerapeutica(false);
            mostrarNotificacion('Sesión completada exitosamente', 'success');
          }}
          onCerrar={() => setShowSesionTerapeutica(false)}
        />
      )}

      {/* Notificaciones Personalizadas */}
      {notificacion.visible && (
        <div className="fixed top-4 right-4 z-[60] animate-slide-in">
          <div className={`px-6 py-4 rounded-xl shadow-2xl border-l-4 flex items-center gap-3 min-w-[300px] max-w-[500px] transform transition-all duration-300 hover-lift ${
            notificacion.tipo === 'success' 
              ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-500 text-green-800 animate-pulse-success' 
              : notificacion.tipo === 'error'
              ? 'bg-gradient-to-r from-red-50 to-rose-50 border-red-500 text-red-800 animate-pulse-error'
              : notificacion.tipo === 'warning'
              ? 'bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-500 text-yellow-800 animate-pulse-warning'
              : 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-500 text-blue-800'
          }`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center animate-bounce-in ${
              notificacion.tipo === 'success' 
                ? 'bg-green-100' 
                : notificacion.tipo === 'error'
                ? 'bg-red-100'
                : notificacion.tipo === 'warning'
                ? 'bg-yellow-100'
                : 'bg-blue-100'
            }`}>
              {notificacion.tipo === 'success' && <span className="text-green-600 text-xl">✓</span>}
              {notificacion.tipo === 'error' && <span className="text-red-600 text-xl">✕</span>}
              {notificacion.tipo === 'warning' && <span className="text-yellow-600 text-xl">⚠</span>}
              {notificacion.tipo === 'info' && <span className="text-blue-600 text-xl">ℹ</span>}
            </div>
            <div className="flex-1">
              <p className="font-semibold text-sm">{notificacion.mensaje}</p>
            </div>
            <button
              onClick={() => setNotificacion(prev => ({ ...prev, visible: false }))}
              className="text-gray-400 hover:text-gray-600 transition-colors duration-200 p-1 hover:bg-gray-200 rounded-full"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      
    </div>
  );
};

export default AgendaPsicologo;
