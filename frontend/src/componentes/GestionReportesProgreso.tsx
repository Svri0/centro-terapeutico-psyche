import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { reportesService, ReporteProgreso, CrearReporteData } from '../servicios/reportes.service';
import { pacientesService } from '../servicios/pacientes.service';
import Notificacion from './Notificacion';

interface Paciente {
  id: string;
  nombres: string;
  apellidos: string;
  email: string;
  numero_ficha?: string;
}

interface GestionReportesProgresoProps {
  pacienteId?: string;
}

const GestionReportesProgreso: React.FC<GestionReportesProgresoProps> = ({ pacienteId }) => {
  const [reportes, setReportes] = useState<ReporteProgreso[]>([]);
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDetalleModal, setShowDetalleModal] = useState(false);
  const [showEditarModal, setShowEditarModal] = useState(false);
  const [selectedReporte, setSelectedReporte] = useState<ReporteProgreso | null>(null);
  
  const [formulario, setFormulario] = useState<CrearReporteData>({
    paciente_id: pacienteId || '',
    periodo_inicio: '',
    periodo_fin: '',
    resumen_evolucion: '',
    objetivos_cumplidos: [],
    objetivos_pendientes: [],
    areas_trabajadas: [],
    conductas_observadas: [],
    logros_importantes: [],
    desafios_identificados: [],
    sugerencias_terapeuticas: '',
    progreso_general: 'bueno',
    estado: 'borrador'
  });

  const [notificacion, setNotificacion] = useState({
    visible: false,
    mensaje: '',
    tipo: 'info' as 'exito' | 'error' | 'advertencia' | 'info'
  });

  useEffect(() => {
    cargarDatos();
  }, [pacienteId]);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const filtros: any = {};
      if (pacienteId) filtros.paciente_id = pacienteId;

      const [reportesData, pacientesData] = await Promise.all([
        reportesService.obtenerTodos(filtros),
        pacientesService.obtenerPacientes()
      ]);

      setReportes(Array.isArray(reportesData) ? reportesData : []);
      setPacientes(Array.isArray(pacientesData) ? pacientesData : []);
    } catch (err: any) {
      console.error('Error al cargar datos:', err);
      mostrarNotificacion('Error al cargar los reportes', 'error');
    } finally {
      setLoading(false);
    }
  };

  const mostrarNotificacion = (mensaje: string, tipo: 'exito' | 'error' | 'advertencia' | 'info') => {
    setNotificacion({ visible: true, mensaje, tipo });
  };

  const handleCrearReporte = async () => {
    try {
      if (!formulario.paciente_id || !formulario.resumen_evolucion) {
        mostrarNotificacion('Completa los campos requeridos', 'advertencia');
        return;
      }
      await reportesService.crear(formulario);
      await cargarDatos();
      setShowModal(false);
      limpiarFormulario();
      mostrarNotificacion('✅ Reporte creado exitosamente', 'exito');
    } catch (err: any) {
      mostrarNotificacion('Error al crear el reporte', 'error');
    }
  };

  const handleVerDetalle = async (id: string) => {
    try {
      const reporte = await reportesService.obtenerPorId(id);
      setSelectedReporte(reporte);
      setShowDetalleModal(true);
    } catch (err: any) {
      mostrarNotificacion('Error al cargar el reporte', 'error');
    }
  };

  const handleEditar = (reporte: ReporteProgreso) => {
    setFormulario({
      paciente_id: reporte.paciente_id,
      periodo_inicio: reporte.periodo_inicio,
      periodo_fin: reporte.periodo_fin,
      resumen_evolucion: reporte.resumen_evolucion,
      objetivos_cumplidos: reporte.objetivos_cumplidos,
      objetivos_pendientes: reporte.objetivos_pendientes,
      areas_trabajadas: reporte.areas_trabajadas,
      conductas_observadas: reporte.conductas_observadas,
      logros_importantes: reporte.logros_importantes,
      desafios_identificados: reporte.desafios_identificados,
      sugerencias_terapeuticas: reporte.sugerencias_terapeuticas,
      progreso_general: reporte.progreso_general,
      estado: reporte.estado
    });
    setSelectedReporte(reporte);
    setShowEditarModal(true);
  };

  const handleActualizar = async () => {
    if (!selectedReporte) return;
    
    try {
      await reportesService.actualizar(selectedReporte.id, formulario);
      await cargarDatos();
      setShowEditarModal(false);
      limpiarFormulario();
      mostrarNotificacion('✅ Reporte actualizado exitosamente', 'exito');
    } catch (err: any) {
      mostrarNotificacion('Error al actualizar el reporte', 'error');
    }
  };

  const handleEliminar = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este reporte?')) return;
    
    try {
      await reportesService.eliminar(id);
      await cargarDatos();
      mostrarNotificacion('✅ Reporte eliminado exitosamente', 'exito');
    } catch (err: any) {
      mostrarNotificacion('Error al eliminar el reporte', 'error');
    }
  };

  const limpiarFormulario = () => {
    setFormulario({
      paciente_id: pacienteId || '',
      periodo_inicio: '',
      periodo_fin: '',
      resumen_evolucion: '',
      objetivos_cumplidos: [],
      objetivos_pendientes: [],
      areas_trabajadas: [],
      conductas_observadas: [],
      logros_importantes: [],
      desafios_identificados: [],
      sugerencias_terapeuticas: '',
      progreso_general: 'bueno',
      estado: 'borrador'
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
        <span className="ml-2 text-amber-600 text-sm">Cargando reportes...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Reportes de Progreso</h2>
          <p className="text-gray-600 mt-1">
            {pacienteId ? 'Seguimiento del paciente' : 'Todos los reportes'}
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg font-semibold"
        >
          ➕ Nuevo Reporte
        </button>
      </div>

      {reportes.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <div className="text-6xl mb-4">📊</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-4">No hay reportes registrados</h3>
          <button
            onClick={() => setShowModal(true)}
            className="bg-amber-500 hover:bg-amber-600 text-white px-6 py-2 rounded-lg font-semibold mt-4"
          >
            Crear Primer Reporte
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {reportes.map((reporte) => (
            <div key={reporte.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {!pacienteId && reporte.paciente && 
                      `${reporte.paciente.nombres} ${reporte.paciente.apellidos}`
                    }
                  </h3>
                  <p className="text-sm text-gray-500 mb-3">
                    📅 {format(new Date(reporte.periodo_inicio), 'dd/MM/yyyy')} - {format(new Date(reporte.periodo_fin), 'dd/MM/yyyy')}
                  </p>
                  <p className="text-gray-700 mb-4 line-clamp-2">
                    {reporte.resumen_evolucion}
                  </p>
                </div>
                <div className="flex flex-col gap-2 ml-4">
                  <button
                    onClick={() => handleVerDetalle(reporte.id)}
                    className="text-amber-600 hover:text-amber-700 px-3 py-1 text-sm"
                  >
                    👁️ Ver
                  </button>
                  <button
                    onClick={() => handleEditar(reporte)}
                    className="text-blue-600 hover:text-blue-700 px-3 py-1 text-sm"
                  >
                    ✏️ Editar
                  </button>
                  <button
                    onClick={() => handleEliminar(reporte.id)}
                    className="text-red-600 hover:text-red-700 px-3 py-1 text-sm"
                  >
                    🗑️ Eliminar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {(showModal || showEditarModal) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">
              {showEditarModal ? 'Editar Reporte' : 'Nuevo Reporte'}
            </h3>
            <div className="space-y-4">
              {!pacienteId && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Paciente *
                  </label>
                  <select
                    value={formulario.paciente_id}
                    onChange={(e) => setFormulario({ ...formulario, paciente_id: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  >
                    <option value="">Selecciona un paciente</option>
                    {pacientes.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.nombres} {p.apellidos} - {p.numero_ficha}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Período Inicio *
                  </label>
                  <input
                    type="date"
                    value={formulario.periodo_inicio}
                    onChange={(e) => setFormulario({ ...formulario, periodo_inicio: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Período Fin *
                  </label>
                  <input
                    type="date"
                    value={formulario.periodo_fin}
                    onChange={(e) => setFormulario({ ...formulario, periodo_fin: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Resumen de Evolución *
                </label>
                <textarea
                  value={formulario.resumen_evolucion}
                  onChange={(e) => setFormulario({ ...formulario, resumen_evolucion: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Describe la evolución del paciente..."
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Progreso General
                </label>
                <select
                  value={formulario.progreso_general}
                  onChange={(e) => setFormulario({ ...formulario, progreso_general: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="excelente">Excelente</option>
                  <option value="muy_bueno">Muy Bueno</option>
                  <option value="bueno">Bueno</option>
                  <option value="regular">Regular</option>
                  <option value="necesita_atencion">Necesita Atención</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowModal(false);
                  setShowEditarModal(false);
                  limpiarFormulario();
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={showEditarModal ? handleActualizar : handleCrearReporte}
                className="px-4 py-2 bg-amber-500 text-white rounded-md hover:bg-amber-600"
              >
                {showEditarModal ? 'Actualizar' : 'Crear'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showDetalleModal && selectedReporte && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">Detalle del Reporte</h3>
            <div className="space-y-4">
              <p className="text-gray-900"><strong>Paciente:</strong> {selectedReporte.paciente?.nombres} {selectedReporte.paciente?.apellidos}</p>
              <p className="text-gray-900"><strong>Período:</strong> {format(new Date(selectedReporte.periodo_inicio), 'dd/MM/yyyy')} - {format(new Date(selectedReporte.periodo_fin), 'dd/MM/yyyy')}</p>
              <div>
                <strong className="text-gray-700">Resumen:</strong>
                <p className="text-gray-900 mt-1">{selectedReporte.resumen_evolucion}</p>
              </div>
            </div>
            <button
              onClick={() => setShowDetalleModal(false)}
              className="mt-6 px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      {notificacion.visible && (
        <Notificacion
          mensaje={notificacion.mensaje}
          tipo={notificacion.tipo}
          onCerrar={() => setNotificacion({ ...notificacion, visible: false })}
        />
      )}
    </div>
  );
};

export default GestionReportesProgreso;

