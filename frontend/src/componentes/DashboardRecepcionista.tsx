import React, { useState, useEffect } from 'react';
import { recepcionistaService } from '../servicios/recepcionista.service';

interface Estadisticas {
  citas_hoy: number;
  citas_completadas: number;
  pacientes_activos: number;
  pagos_hoy: number;
  ingresos_hoy: number;
}

const DashboardRecepcionista: React.FC = () => {
  const [estadisticas, setEstadisticas] = useState<Estadisticas>({
    citas_hoy: 0,
    citas_completadas: 0,
    pacientes_activos: 0,
    pagos_hoy: 0,
    ingresos_hoy: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    cargarEstadisticas();
  }, []);

  const cargarEstadisticas = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await recepcionistaService.obtenerEstadisticasDashboard();
      setEstadisticas(data);
    } catch (error: any) {
      console.error('Error al cargar estadísticas:', error);
      setError(error.message || 'Error al cargar estadísticas');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP'
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
        <p className="text-gray-600">Resumen del día de hoy</p>
      </div>

      {/* Estadísticas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Citas del día */}
        <div className="bg-white overflow-hidden shadow rounded-lg border border-amber-100">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-amber-500 rounded-md flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Citas del día
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {estadisticas.citas_hoy}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Citas completadas */}
        <div className="bg-white overflow-hidden shadow rounded-lg border border-amber-100">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Citas completadas
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {estadisticas.citas_completadas}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Pacientes activos */}
        <div className="bg-white overflow-hidden shadow rounded-lg border border-amber-100">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Pacientes activos
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {estadisticas.pacientes_activos}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Ingresos del día */}
        <div className="bg-white overflow-hidden shadow rounded-lg border border-amber-100">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-yellow-500 rounded-md flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Ingresos del día
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {formatCurrency(estadisticas.ingresos_hoy)}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Información adicional */}
      <div className="bg-white shadow rounded-lg p-6 border border-amber-100">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Resumen del día</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-sm font-medium text-gray-500 mb-2">Citas</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Total programadas:</span>
                <span className="text-sm font-medium">{estadisticas.citas_hoy}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Completadas:</span>
                <span className="text-sm font-medium text-green-600">{estadisticas.citas_completadas}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Pendientes:</span>
                <span className="text-sm font-medium text-yellow-600">
                  {estadisticas.citas_hoy - estadisticas.citas_completadas}
                </span>
              </div>
            </div>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-500 mb-2">Pagos</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Pagos procesados:</span>
                <span className="text-sm font-medium">{estadisticas.pagos_hoy}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Ingresos totales:</span>
                <span className="text-sm font-medium text-green-600">
                  {formatCurrency(estadisticas.ingresos_hoy)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Botón de actualizar */}
      <div className="flex justify-end">
        <button
          onClick={cargarEstadisticas}
          className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors shadow-sm"
        >
          Actualizar estadísticas
        </button>
      </div>
    </div>
  );
};

export default DashboardRecepcionista;
