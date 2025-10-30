import React, { useState, useEffect } from 'react';

interface Estadistica {
  titulo: string;
  valor: number;
  cambio?: number;
  icono: string;
  color: string;
}

interface Reporte {
  id: string;
  tipo: string;
  titulo: string;
  fecha_generacion: string;
  datos: any;
  formato: 'pdf' | 'excel';
  descripcion: string;
}

const ReportesRecepcionista: React.FC = () => {
  const [estadisticas, setEstadisticas] = useState<Estadistica[]>([]);
  const [reportes, setReportes] = useState<Reporte[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Estados para filtros de reportes
  const [filtroTipo, setFiltroTipo] = useState('');
  const [filtroFecha, setFiltroFecha] = useState('');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');

  useEffect(() => {
    cargarEstadisticas();
    cargarReportes();
  }, [filtroTipo, filtroFecha]);

  const cargarEstadisticas = async () => {
    try {
      // TODO: Implementar llamada al servicio de estadísticas
      // const response = await reportesService.obtenerEstadisticas({
      //   fecha_inicio: fechaInicio,
      //   fecha_fin: fechaFin
      // });
      // setEstadisticas(response.data);
      
      // Datos de ejemplo
      setEstadisticas([
        {
          titulo: 'Citas del Día',
          valor: 12,
          cambio: 2,
          icono: '📅',
          color: 'blue'
        },
        {
          titulo: 'Pacientes Atendidos',
          valor: 8,
          cambio: 1,
          icono: '👥',
          color: 'green'
        },
        {
          titulo: 'Ingresos del Día',
          valor: 480000,
          cambio: -5,
          icono: '💰',
          color: 'yellow'
        },
        {
          titulo: 'Pagos Pendientes',
          valor: 3,
          cambio: -1,
          icono: '⏰',
          color: 'red'
        }
      ]);
    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
    }
  };

  const cargarReportes = async () => {
    setLoading(true);
    try {
      // TODO: Implementar llamada al servicio de reportes
      // const response = await reportesService.obtenerReportes({
      //   tipo: filtroTipo,
      //   fecha: filtroFecha
      // });
      // setReportes(response.data);
      
      // Datos de ejemplo
      setReportes([
        {
          id: '1',
          tipo: 'citas_diarias',
          titulo: 'Reporte de Citas Diarias',
          fecha_generacion: '2024-01-20T10:00:00',
          datos: { citas: 12, completadas: 8, canceladas: 1 },
          formato: 'pdf',
          descripcion: 'Resumen de citas del día actual'
        },
        {
          id: '2',
          tipo: 'ingresos_mensuales',
          titulo: 'Reporte de Ingresos Mensuales',
          fecha_generacion: '2024-01-19T15:30:00',
          datos: { total: 1200000, pagos_efectivo: 800000, pagos_tarjeta: 400000 },
          formato: 'excel',
          descripcion: 'Análisis de ingresos del mes de enero'
        }
      ]);
    } catch (error) {
      setError('Error al cargar los reportes');
    } finally {
      setLoading(false);
    }
  };

  const generarReporte = async (tipo: string) => {
    try {
      setLoading(true);
      // TODO: Implementar generación de reporte
      // const response = await reportesService.generar({
      //   tipo,
      //   fecha_inicio: fechaInicio,
      //   fecha_fin: fechaFin
      // });
      setSuccess('Reporte generado exitosamente');
      cargarReportes();
    } catch (error: any) {
      setError(error.message || 'Error al generar reporte');
    } finally {
      setLoading(false);
    }
  };

  const descargarReporte = async (reporteId: string) => {
    try {
      setLoading(true);
      // TODO: Implementar descarga de reporte
      // const response = await reportesService.descargar(reporteId);
      // window.open(response.data.url, '_blank');
      setSuccess('Reporte descargado exitosamente');
    } catch (error: any) {
      setError(error.message || 'Error al descargar reporte');
    } finally {
      setLoading(false);
    }
  };

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'blue': return 'bg-blue-100 text-blue-600';
      case 'green': return 'bg-green-100 text-green-600';
      case 'yellow': return 'bg-yellow-100 text-yellow-600';
      case 'red': return 'bg-red-100 text-red-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const getFormatoIcon = (formato: string) => {
    switch (formato) {
      case 'pdf': return '📄';
      case 'excel': return '📊';
      default: return '📋';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Reportes y Estadísticas</h2>
          <p className="text-gray-600">Visualiza estadísticas y genera reportes del centro</p>
        </div>
      </div>

      {/* Estadísticas del Día */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {estadisticas.map((estadistica, index) => (
          <div key={index} className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className={`p-3 rounded-lg ${getColorClasses(estadistica.color)}`}>
                <span className="text-2xl">{estadistica.icono}</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{estadistica.titulo}</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {estadistica.titulo.includes('Ingresos') 
                    ? `$${estadistica.valor.toLocaleString()}` 
                    : estadistica.valor}
                </p>
                {estadistica.cambio !== undefined && (
                  <p className={`text-sm ${
                    estadistica.cambio > 0 ? 'text-green-600' : 
                    estadistica.cambio < 0 ? 'text-red-600' : 'text-gray-600'
                  }`}>
                    {estadistica.cambio > 0 ? '+' : ''}{estadistica.cambio}% vs ayer
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filtros para Reportes */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Generar Nuevo Reporte</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de Reporte
            </label>
            <select
              value={filtroTipo}
              onChange={(e) => setFiltroTipo(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Seleccionar tipo...</option>
              <option value="citas_diarias">Citas Diarias</option>
              <option value="citas_semanales">Citas Semanales</option>
              <option value="citas_mensuales">Citas Mensuales</option>
              <option value="ingresos_diarios">Ingresos Diarios</option>
              <option value="ingresos_mensuales">Ingresos Mensuales</option>
              <option value="pacientes_nuevos">Pacientes Nuevos</option>
              <option value="psicologos_actividad">Actividad de Psicólogos</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha Inicio
            </label>
            <input
              type="date"
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha Fin
            </label>
            <input
              type="date"
              value={fechaFin}
              onChange={(e) => setFechaFin(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={() => generarReporte(filtroTipo)}
              disabled={!filtroTipo || loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-md font-medium transition-colors"
            >
              {loading ? 'Generando...' : 'Generar Reporte'}
            </button>
          </div>
        </div>
      </div>

      {/* Reportes Generados */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Reportes Generados</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reporte
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tipo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Formato
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha Generación
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {reportes.map((reporte) => (
                <tr key={reporte.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {reporte.titulo}
                      </div>
                      <div className="text-sm text-gray-500">
                        {reporte.descripcion}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                      {reporte.tipo.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className="mr-2">{getFormatoIcon(reporte.formato)}</span>
                      <span className="text-sm text-gray-900 uppercase">{reporte.formato}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(reporte.fecha_generacion).toLocaleDateString('es-CL')} a las{' '}
                    {new Date(reporte.fecha_generacion).toLocaleTimeString('es-CL')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => descargarReporte(reporte.id)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Descargar
                      </button>
                      <button
                        onClick={() => {
                          // TODO: Implementar vista previa
                          console.log('Vista previa del reporte:', reporte.id);
                        }}
                        className="text-green-600 hover:text-green-900"
                      >
                        Vista Previa
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Gráficos y Visualizaciones */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Citas por Día */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Citas por Día (Última Semana)</h3>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
            <div className="text-center">
              <div className="text-4xl mb-2">📊</div>
              <p className="text-gray-500">Gráfico de citas por día</p>
              <p className="text-sm text-gray-400">(Implementar con librería de gráficos)</p>
            </div>
          </div>
        </div>

        {/* Gráfico de Ingresos por Método de Pago */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Ingresos por Método de Pago</h3>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
            <div className="text-center">
              <div className="text-4xl mb-2">💰</div>
              <p className="text-gray-500">Gráfico de ingresos</p>
              <p className="text-sm text-gray-400">(Implementar con librería de gráficos)</p>
            </div>
          </div>
        </div>
      </div>

      {/* Resumen de Actividad */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Resumen de Actividad</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">24</div>
            <p className="text-sm text-gray-600">Citas esta semana</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">18</div>
            <p className="text-sm text-gray-600">Citas completadas</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-yellow-600 mb-2">$1,200,000</div>
            <p className="text-sm text-gray-600">Ingresos esta semana</p>
          </div>
        </div>
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
    </div>
  );
};

export default ReportesRecepcionista;











