import React, { useState, useEffect } from 'react';
import { psicologoDashboardService, DashboardPsicologo, DashboardFilters } from '../servicios/psicologo-dashboard.service';
import { authService } from '../servicios/auth.service';
import { pacientesService } from '../servicios/pacientes.service';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import ExportarDashboardPDF from './ExportarDashboardPDF';
import InputFecha from './InputFecha';

interface EstadisticasPsicologoProps {
  psicologoId: string;
}

interface Paciente {
  id: string;
  nombres: string;
  apellidos: string;
}

const EstadisticasPsicologo: React.FC<EstadisticasPsicologoProps> = ({ psicologoId }) => {
  const [dashboard, setDashboard] = useState<DashboardPsicologo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  
  // Filtros
  const [filtros, setFiltros] = useState<DashboardFilters>({});
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [pacienteId, setPacienteId] = useState('');

  useEffect(() => {
    cargarPacientes();
  }, []);

  useEffect(() => {
    cargarDashboard();
  }, [filtros]);

  const cargarPacientes = async () => {
    try {
      const pacientesData = await pacientesService.obtenerPacientes();
      setPacientes(pacientesData);
    } catch (error) {
      console.error('Error al cargar pacientes:', error);
    }
  };

  const cargarDashboard = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const filtrosActuales: DashboardFilters = {};
      if (fechaInicio) filtrosActuales.fecha_inicio = fechaInicio;
      if (fechaFin) filtrosActuales.fecha_fin = fechaFin;
      if (pacienteId) filtrosActuales.paciente_id = pacienteId;

      const data = await psicologoDashboardService.obtenerDashboard(filtrosActuales);
      setDashboard(data);
    } catch (err: any) {
      console.error('Error al cargar dashboard:', err);
      setError(err.message || 'Error al cargar el dashboard');
    } finally {
      setLoading(false);
    }
  };

  const aplicarFiltros = () => {
    const nuevosFiltros: DashboardFilters = {};
    if (fechaInicio) nuevosFiltros.fecha_inicio = fechaInicio;
    if (fechaFin) nuevosFiltros.fecha_fin = fechaFin;
    if (pacienteId) nuevosFiltros.paciente_id = pacienteId;
    setFiltros(nuevosFiltros);
  };

  const limpiarFiltros = () => {
    setFechaInicio('');
    setFechaFin('');
    setPacienteId('');
    setFiltros({});
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
        <span className="ml-3 text-gray-600">Cargando dashboard...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <div className="flex">
          <div className="text-red-500">⚠️</div>
          <p className="ml-2 text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  if (!dashboard) {
    return null;
  }

  const user = authService.getUser();

  // Formatear datos para gráficas
  const datosSesionesPorMes = dashboard.graficas.sesiones_por_mes.map(item => ({
    mes: new Date(item.mes + '-01').toLocaleDateString('es-ES', { month: 'short', year: 'numeric' }),
    Total: item.total,
    Completadas: item.completadas
  }));

  const datosHorasPorMes = dashboard.graficas.horas_trabajadas_por_mes.map(item => ({
    mes: new Date(item.mes + '-01').toLocaleDateString('es-ES', { month: 'short', year: 'numeric' }),
    Horas: item.horas
  }));

  const datosEvolucionPacientes = dashboard.graficas.evolucion_pacientes.map(item => ({
    paciente: item.paciente_nombre.substring(0, 15) + (item.paciente_nombre.length > 15 ? '...' : ''),
    'Total Sesiones': item.total_sesiones,
    'Sesiones Completadas': item.sesiones_completadas
  }));

  // Datos placeholder para mostrar estructura cuando no hay datos
  const tieneDatosSesiones = datosSesionesPorMes.length > 0;
  const tieneDatosHoras = datosHorasPorMes.length > 0;
  const tieneDatosEvolucion = datosEvolucionPacientes.length > 0;

  // Crear datos placeholder para mantener la estructura del gráfico (solo para renderizar ejes)
  // Usamos un punto de datos mínimo para que Recharts renderice la estructura
  const datosSesionesPlaceholder = tieneDatosSesiones ? datosSesionesPorMes : [
    { mes: 'Sin datos', Total: 0, Completadas: 0 }
  ];

  const datosHorasPlaceholder = tieneDatosHoras ? datosHorasPorMes : [
    { mes: 'Sin datos', Horas: 0 }
  ];

  const datosEvolucionPlaceholder = tieneDatosEvolucion ? datosEvolucionPacientes : [
    { paciente: 'Sin datos', 'Total Sesiones': 0, 'Sesiones Completadas': 0 }
  ];

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <div className="bg-white rounded-lg shadow-sm border border-amber-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Filtros</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <InputFecha
            value={fechaInicio}
            onChange={setFechaInicio}
            label="Fecha Inicio"
          />
          <InputFecha
            value={fechaFin}
            onChange={setFechaFin}
            label="Fecha Fin"
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Paciente
            </label>
            <select
              value={pacienteId}
              onChange={(e) => setPacienteId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="">Todos los pacientes</option>
              {pacientes.map((paciente) => (
                <option key={paciente.id} value={paciente.id}>
                  {paciente.nombres} {paciente.apellidos}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end gap-2">
            <button
              onClick={aplicarFiltros}
              className="px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 transition-colors"
            >
              Aplicar
            </button>
            <button
              onClick={limpiarFiltros}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
            >
              Limpiar
            </button>
          </div>
        </div>
      </div>

      {/* Botón de exportar PDF */}
      <ExportarDashboardPDF 
        estadisticas={{
          totalCitas: dashboard.kpis.total_sesiones_mes,
          citasHoy: 0,
          citasEstaSemana: 0,
          citasEsteMes: dashboard.kpis.total_sesiones_mes,
          pacientesActivos: dashboard.kpis.pacientes_activos,
          citasCompletadas: 0,
          citasCanceladas: 0,
          citasNoShow: 0,
          promedioDuracion: dashboard.kpis.promedio_duracion_sesiones
        }}
        nombrePsicologo={`${user?.nombres} ${user?.apellidos}`}
      />
      
      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-amber-100 p-4">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Sesiones Este Mes</p>
              <p className="text-2xl font-bold text-gray-900">{dashboard.kpis.total_sesiones_mes}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-amber-100 p-4">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Horas Trabajadas</p>
              <p className="text-2xl font-bold text-gray-900">{dashboard.kpis.horas_trabajadas_acumuladas}h</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-amber-100 p-4">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Tareas Completadas</p>
              <p className="text-2xl font-bold text-gray-900">
                {dashboard.kpis.tareas_completadas}/{dashboard.kpis.tareas_asignadas} ({dashboard.kpis.porcentaje_tareas_completadas}%)
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-amber-100 p-4">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pacientes Activos</p>
              <p className="text-2xl font-bold text-gray-900">{dashboard.kpis.pacientes_activos}</p>
            </div>
          </div>
        </div>
      </div>

      {/* KPIs Adicionales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-amber-100 p-4">
          <div className="flex items-center">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Promedio Duración Sesiones</p>
              <p className="text-2xl font-bold text-gray-900">{dashboard.kpis.promedio_duracion_sesiones} min</p>
            </div>
          </div>
        </div>
      </div>

      {/* Gráficas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfica de Sesiones por Mes */}
        <div className="bg-white rounded-lg shadow-sm border border-amber-100 p-6 relative">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Sesiones por Mes</h3>
          <div className="relative" style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={datosSesionesPlaceholder}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="mes" 
                  tick={{ fill: '#6b7280', fontSize: 12 }}
                  axisLine={{ stroke: '#d1d5db' }}
                  tickFormatter={(value) => tieneDatosSesiones ? value : (value === 'Sin datos' ? '' : value)}
                />
                <YAxis 
                  domain={[0, tieneDatosSesiones ? 'auto' : 10]}
                  tick={{ fill: '#6b7280', fontSize: 12 }}
                  axisLine={{ stroke: '#d1d5db' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px'
                  }}
                />
                <Legend 
                  wrapperStyle={{ paddingTop: '20px' }}
                />
                {tieneDatosSesiones ? (
                  <>
                    <Bar dataKey="Total" fill="#f59e0b" />
                    <Bar dataKey="Completadas" fill="#10b981" />
                  </>
                ) : (
                  <>
                    <Bar dataKey="Total" fill="transparent" stroke="transparent" />
                    <Bar dataKey="Completadas" fill="transparent" stroke="transparent" />
                  </>
                )}
              </BarChart>
            </ResponsiveContainer>
            {!tieneDatosSesiones && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                <div className="bg-white bg-opacity-95 px-4 py-2 rounded-lg border border-amber-200 shadow-sm">
                  <p className="text-gray-600 text-sm font-medium">No hay datos disponibles</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Gráfica de Horas Trabajadas */}
        <div className="bg-white rounded-lg shadow-sm border border-amber-100 p-6 relative">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Horas Trabajadas por Mes</h3>
          <div className="relative" style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={datosHorasPlaceholder}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="mes" 
                  tick={{ fill: '#6b7280', fontSize: 12 }}
                  axisLine={{ stroke: '#d1d5db' }}
                  tickFormatter={(value) => tieneDatosHoras ? value : (value === 'Sin datos' ? '' : value)}
                />
                <YAxis 
                  domain={[0, tieneDatosHoras ? 'auto' : 10]}
                  tick={{ fill: '#6b7280', fontSize: 12 }}
                  axisLine={{ stroke: '#d1d5db' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px'
                  }}
                />
                <Legend 
                  wrapperStyle={{ paddingTop: '20px' }}
                />
                {tieneDatosHoras ? (
                  <Line type="monotone" dataKey="Horas" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} />
                ) : (
                  <Line 
                    type="monotone" 
                    dataKey="Horas" 
                    stroke="transparent" 
                    strokeWidth={2} 
                    dot={false}
                    activeDot={false}
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
            {!tieneDatosHoras && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                <div className="bg-white bg-opacity-95 px-4 py-2 rounded-lg border border-amber-200 shadow-sm">
                  <p className="text-gray-600 text-sm font-medium">No hay datos disponibles</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Evolución de Pacientes */}
      <div className="bg-white rounded-lg shadow-sm border border-amber-100 p-6 relative">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Evolución de Pacientes</h3>
        <div className="relative" style={{ height: '400px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart 
              data={datosEvolucionPlaceholder} 
              layout="vertical"
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                type="number" 
                domain={[0, tieneDatosEvolucion ? 'auto' : 10]}
                tick={{ fill: '#6b7280', fontSize: 12 }}
                axisLine={{ stroke: '#d1d5db' }}
              />
              <YAxis 
                dataKey="paciente" 
                type="category" 
                width={150}
                tick={{ fill: '#6b7280', fontSize: 12 }}
                axisLine={{ stroke: '#d1d5db' }}
                tickFormatter={(value) => tieneDatosEvolucion ? value : (value === 'Sin datos' ? '' : value)}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px'
                }}
              />
              <Legend 
                wrapperStyle={{ paddingTop: '20px' }}
              />
              {tieneDatosEvolucion ? (
                <>
                  <Bar dataKey="Total Sesiones" fill="#8b5cf6" />
                  <Bar dataKey="Sesiones Completadas" fill="#10b981" />
                </>
              ) : (
                <>
                  <Bar dataKey="Total Sesiones" fill="transparent" stroke="transparent" />
                  <Bar dataKey="Sesiones Completadas" fill="transparent" stroke="transparent" />
                </>
              )}
            </BarChart>
          </ResponsiveContainer>
          {!tieneDatosEvolucion && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
              <div className="bg-white bg-opacity-95 px-4 py-2 rounded-lg border border-amber-200 shadow-sm">
                <p className="text-gray-600 text-sm font-medium">No hay datos disponibles</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EstadisticasPsicologo;
