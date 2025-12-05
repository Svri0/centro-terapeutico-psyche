import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { tareasService } from '../servicios/tareas.service';
import { pacientesService } from '../servicios/pacientes.service';
import Notificacion from './Notificacion';
import InputFecha from './InputFecha';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

interface Paciente {
  id: string;
  nombres: string;
  apellidos: string;
  numero_ficha?: string;
}

interface ReporteAdherencia {
  resumen: {
    total_tareas: number;
    tareas_cumplidas: number;
    tareas_incumplidas: number;
    tareas_vencidas: number;
    tareas_pendientes_vencidas: number;
    tareas_pendientes: number;
    tareas_en_progreso: number;
    tareas_canceladas: number;
    porcentaje_adherencia: number;
    dias_promedio_retraso: string | null;
  };
  por_paciente: Array<{
    paciente_id: string;
    paciente_nombres: string;
    paciente_apellidos: string;
    numero_ficha: string;
    total_tareas: number;
    tareas_cumplidas: number;
    tareas_vencidas: number;
    tareas_pendientes_vencidas: number;
    tareas_incumplidas: number;
    tareas_pendientes: number;
    tareas_en_progreso: number;
    porcentaje_adherencia: number;
    dias_promedio_retraso: string | null;
  }>;
  tareas_incumplidas: Array<{
    id: string;
    titulo: string;
    descripcion: string;
    prioridad: string;
    fecha_asignacion: string;
    fecha_vencimiento: string;
    estado: string;
    paciente_nombres: string;
    paciente_apellidos: string;
    numero_ficha: string;
    tipo_incumplimiento: string;
    dias_vencida: number;
  }>;
  tareas_cumplidas_recientes: Array<{
    id: string;
    titulo: string;
    descripcion: string;
    prioridad: string;
    fecha_asignacion: string;
    fecha_vencimiento: string;
    fecha_completada: string;
    estado: string;
    paciente_nombres: string;
    paciente_apellidos: string;
    numero_ficha: string;
    cumplimiento_tipo: string;
    dias_retraso: number;
  }>;
  filtros_aplicados: {
    paciente_id: string | null;
    fecha_inicio: string | null;
    fecha_fin: string | null;
  };
  fecha_generacion: string;
}

const ReporteAdherenciaTerapeutica: React.FC = () => {
  const [reporte, setReporte] = useState<ReporteAdherencia | null>(null);
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtros, setFiltros] = useState({
    paciente_id: '',
    fecha_inicio: '',
    fecha_fin: ''
  });

  const [notificacion, setNotificacion] = useState({
    visible: false,
    mensaje: '',
    tipo: 'info' as 'exito' | 'error' | 'advertencia' | 'info'
  });

  useEffect(() => {
    cargarPacientes();
    generarReporte();
  }, []);

  const cargarPacientes = async () => {
    try {
      console.log('📋 Cargando pacientes...');
      const pacientesData = await pacientesService.obtenerPacientes();
      console.log('✅ Pacientes cargados:', pacientesData);
      setPacientes(Array.isArray(pacientesData) ? pacientesData : []);
      if (!Array.isArray(pacientesData) || pacientesData.length === 0) {
        console.warn('⚠️ No se encontraron pacientes');
      }
    } catch (error: any) {
      console.error('❌ Error al cargar pacientes:', error);
      mostrarNotificacion('Error al cargar pacientes: ' + (error?.message || 'Error desconocido'), 'error');
    }
  };

  const generarReporte = async () => {
    try {
      setLoading(true);
      console.log('🔄 Generando reporte con filtros:', filtros);
      
      const filtrosParams: any = {};
      if (filtros.paciente_id) filtrosParams.paciente_id = filtros.paciente_id;
      if (filtros.fecha_inicio) filtrosParams.fecha_inicio = filtros.fecha_inicio;
      if (filtros.fecha_fin) filtrosParams.fecha_fin = filtros.fecha_fin;

      console.log('📤 Enviando request con params:', filtrosParams);
      const reporteData = await tareasService.obtenerReporteAdherencia(filtrosParams);
      console.log('✅ Reporte recibido:', reporteData);
      
      if (!reporteData) {
        throw new Error('El reporte está vacío');
      }
      
      setReporte(reporteData);
      mostrarNotificacion('Reporte generado exitosamente', 'exito');
    } catch (error: any) {
      console.error('❌ Error al generar reporte:', error);
      const mensajeError = error?.message || 'Error al generar el reporte de adherencia';
      console.error('Mensaje de error:', mensajeError);
      mostrarNotificacion(mensajeError, 'error');
      setReporte(null);
    } finally {
      setLoading(false);
    }
  };

  const mostrarNotificacion = (mensaje: string, tipo: 'exito' | 'error' | 'advertencia' | 'info') => {
    setNotificacion({ visible: true, mensaje, tipo });
  };

  const COLORS = {
    cumplidas: '#10b981',
    incumplidas: '#ef4444',
    pendientes: '#f59e0b',
    en_progreso: '#3b82f6',
    canceladas: '#6b7280'
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
        <span className="ml-2 text-amber-600 text-sm">Generando reporte...</span>
      </div>
    );
  }

  if (!reporte) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
        <div className="text-6xl mb-4">📊</div>
        <h3 className="text-xl font-semibold text-gray-900 mb-4">No hay datos disponibles</h3>
        <p className="text-gray-600 mb-4">
          {pacientes.length === 0 
            ? 'No hay pacientes registrados. Crea algunos pacientes primero.'
            : 'Haz clic en el botón para generar el reporte de adherencia terapéutica.'}
        </p>
        <button
          onClick={generarReporte}
          disabled={loading}
          className="bg-amber-500 hover:bg-amber-600 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg font-semibold mt-4"
        >
          {loading ? 'Generando...' : '🔄 Generar Reporte'}
        </button>
        {pacientes.length > 0 && (
          <div className="mt-4 text-sm text-gray-500">
            <p>Pacientes disponibles: {pacientes.length}</p>
          </div>
        )}
      </div>
    );
  }

  // Datos para gráfico de pie
  const datosPie = [
    { name: 'Cumplidas', value: reporte.resumen.tareas_cumplidas, color: COLORS.cumplidas },
    { name: 'Incumplidas', value: reporte.resumen.tareas_incumplidas, color: COLORS.incumplidas },
    { name: 'Pendientes', value: reporte.resumen.tareas_pendientes, color: COLORS.pendientes },
    { name: 'En Progreso', value: reporte.resumen.tareas_en_progreso, color: COLORS.en_progreso },
    { name: 'Canceladas', value: reporte.resumen.tareas_canceladas, color: COLORS.canceladas }
  ].filter(item => item.value > 0);

  // Datos para gráfico de barras por paciente
  const datosBarras = reporte.por_paciente.map(p => ({
    nombre: `${p.paciente_nombres} ${p.paciente_apellidos}`,
    cumplidas: p.tareas_cumplidas,
    incumplidas: p.tareas_incumplidas,
    total: p.total_tareas
  }));

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Filtros</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Paciente
            </label>
            <select
              value={filtros.paciente_id}
              onChange={(e) => setFiltros({ ...filtros, paciente_id: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="">Todos los pacientes</option>
              {pacientes.map(p => (
                <option key={p.id} value={p.id}>
                  {p.nombres} {p.apellidos} {p.numero_ficha ? `- ${p.numero_ficha}` : ''}
                </option>
              ))}
            </select>
          </div>
          <InputFecha
            value={filtros.fecha_inicio}
            onChange={(value) => setFiltros({ ...filtros, fecha_inicio: value })}
            label="Fecha Inicio"
          />
          <InputFecha
            value={filtros.fecha_fin}
            onChange={(value) => setFiltros({ ...filtros, fecha_fin: value })}
            label="Fecha Fin"
          />
          <div className="flex items-end">
            <button
              onClick={generarReporte}
              className="w-full bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-md font-semibold"
            >
              🔄 Generar Reporte
            </button>
          </div>
        </div>
      </div>

      {/* Resumen General */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Tareas</p>
              <p className="text-2xl font-bold text-gray-900">{reporte.resumen.total_tareas}</p>
            </div>
            <div className="text-4xl">📋</div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Tareas Cumplidas</p>
              <p className="text-2xl font-bold text-green-600">{reporte.resumen.tareas_cumplidas}</p>
            </div>
            <div className="text-4xl">✅</div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Tareas Incumplidas</p>
              <p className="text-2xl font-bold text-red-600">{reporte.resumen.tareas_incumplidas}</p>
            </div>
            <div className="text-4xl">❌</div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Adherencia</p>
              <p className="text-2xl font-bold text-amber-600">{reporte.resumen.porcentaje_adherencia}%</p>
            </div>
            <div className="text-4xl">📊</div>
          </div>
        </div>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Gráfico de Pie */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Distribución de Tareas</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={datosPie}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {datosPie.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Gráfico de Barras por Paciente */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Adherencia por Paciente</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={datosBarras}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="nombre" angle={-45} textAnchor="end" height={100} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="cumplidas" fill={COLORS.cumplidas} name="Cumplidas" />
              <Bar dataKey="incumplidas" fill={COLORS.incumplidas} name="Incumplidas" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tabla por Paciente */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Estadísticas por Paciente</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Paciente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cumplidas
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Incumplidas
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Adherencia
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Días Retraso Prom.
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {reporte.por_paciente.map((paciente) => (
                <tr key={paciente.paciente_id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {paciente.paciente_nombres} {paciente.paciente_apellidos}
                    </div>
                    {paciente.numero_ficha && (
                      <div className="text-sm text-gray-500">Ficha: {paciente.numero_ficha}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {paciente.total_tareas}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-semibold">
                    {paciente.tareas_cumplidas}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-semibold">
                    {paciente.tareas_incumplidas}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                        <div
                          className={`h-2 rounded-full ${
                            paciente.porcentaje_adherencia >= 80
                              ? 'bg-green-500'
                              : paciente.porcentaje_adherencia >= 60
                              ? 'bg-yellow-500'
                              : 'bg-red-500'
                          }`}
                          style={{ width: `${paciente.porcentaje_adherencia}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-semibold text-gray-900">
                        {paciente.porcentaje_adherencia.toFixed(1)}%
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {paciente.dias_promedio_retraso ? `${parseFloat(paciente.dias_promedio_retraso).toFixed(1)} días` : 'N/A'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tareas Incumplidas */}
      {reporte.tareas_incumplidas.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Tareas Incumplidas ({reporte.tareas_incumplidas.length})
          </h3>
          <div className="space-y-3">
            {reporte.tareas_incumplidas.map((tarea) => (
              <div
                key={tarea.id}
                className="border border-red-200 rounded-lg p-4 bg-red-50"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">{tarea.titulo}</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      {tarea.paciente_nombres} {tarea.paciente_apellidos}
                      {tarea.numero_ficha && ` - Ficha: ${tarea.numero_ficha}`}
                    </p>
                    <p className="text-sm text-gray-700 mt-2">{tarea.descripcion}</p>
                    <div className="flex gap-4 mt-2 text-xs text-gray-500">
                      <span>
                        📅 Asignada: {format(new Date(tarea.fecha_asignacion), 'dd/MM/yyyy', { locale: es })}
                      </span>
                      {tarea.fecha_vencimiento && (
                        <span>
                          ⏰ Vencida: {format(new Date(tarea.fecha_vencimiento), 'dd/MM/yyyy', { locale: es })}
                        </span>
                      )}
                      {tarea.dias_vencida && (
                        <span className="text-red-600 font-semibold">
                          ⚠️ {Math.round(tarea.dias_vencida)} días vencida
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="ml-4">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      tarea.prioridad === 'urgente' ? 'bg-red-100 text-red-800' :
                      tarea.prioridad === 'alta' ? 'bg-orange-100 text-orange-800' :
                      tarea.prioridad === 'media' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {tarea.prioridad}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tareas Cumplidas Recientes */}
      {reporte.tareas_cumplidas_recientes.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Tareas Cumplidas Recientes ({reporte.tareas_cumplidas_recientes.length})
          </h3>
          <div className="space-y-3">
            {reporte.tareas_cumplidas_recientes.slice(0, 10).map((tarea) => (
              <div
                key={tarea.id}
                className="border border-green-200 rounded-lg p-4 bg-green-50"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">{tarea.titulo}</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      {tarea.paciente_nombres} {tarea.paciente_apellidos}
                      {tarea.numero_ficha && ` - Ficha: ${tarea.numero_ficha}`}
                    </p>
                    <div className="flex gap-4 mt-2 text-xs text-gray-500">
                      <span>
                        ✅ Completada: {format(new Date(tarea.fecha_completada), 'dd/MM/yyyy', { locale: es })}
                      </span>
                      <span className={
                        tarea.cumplimiento_tipo === 'A tiempo' ? 'text-green-600 font-semibold' :
                        tarea.cumplimiento_tipo === 'Con retraso' ? 'text-orange-600 font-semibold' :
                        'text-gray-600'
                      }>
                        {tarea.cumplimiento_tipo}
                        {tarea.dias_retraso && tarea.dias_retraso > 0 && (
                          <span> ({Math.round(tarea.dias_retraso)} días)</span>
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Información del Reporte */}
      <div className="bg-gray-50 rounded-lg border border-gray-200 p-4 text-sm text-gray-600">
        <p>
          <strong>Reporte generado:</strong> {format(new Date(reporte.fecha_generacion), 'dd/MM/yyyy HH:mm', { locale: es })}
        </p>
        {reporte.filtros_aplicados.paciente_id && (
          <p>
            <strong>Paciente filtrado:</strong> {reporte.por_paciente.find(p => p.paciente_id === reporte.filtros_aplicados.paciente_id)?.paciente_nombres} {reporte.por_paciente.find(p => p.paciente_id === reporte.filtros_aplicados.paciente_id)?.paciente_apellidos}
          </p>
        )}
        {reporte.filtros_aplicados.fecha_inicio && (
          <p>
            <strong>Período:</strong> {format(new Date(reporte.filtros_aplicados.fecha_inicio), 'dd/MM/yyyy', { locale: es })} - {reporte.filtros_aplicados.fecha_fin ? format(new Date(reporte.filtros_aplicados.fecha_fin), 'dd/MM/yyyy', { locale: es }) : 'Actual'}
          </p>
        )}
      </div>

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

export default ReporteAdherenciaTerapeutica;

