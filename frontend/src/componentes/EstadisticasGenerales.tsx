import React, { useState, useEffect } from 'react';
import { adminService, EstadisticasGenerales as EstadisticasGeneralesType } from '../servicios/admin.service';

const EstadisticasGenerales: React.FC = () => {
  const [estadisticas, setEstadisticas] = useState<EstadisticasGeneralesType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    cargarEstadisticas();
  }, []);

  const cargarEstadisticas = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminService.obtenerEstadisticasGenerales();
      setEstadisticas(data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar las estadísticas');
    } finally {
      setLoading(false);
    }
  };

  const formatearNumero = (numero: number) => {
    return numero.toLocaleString('es-CL');
  };

  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-CL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error al cargar estadísticas</h3>
            <div className="mt-2 text-sm text-red-700">
              <p>{error}</p>
            </div>
            <div className="mt-4">
              <button
                onClick={cargarEstadisticas}
                className="bg-red-100 px-3 py-2 rounded-md text-sm font-medium text-red-800 hover:bg-red-200"
              >
                Reintentar
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!estadisticas) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">📊 Estadísticas Generales</h2>
            <p className="text-gray-600 mt-1">Resumen completo del centro terapéutico</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Última actualización</p>
            <p className="text-sm font-medium text-gray-900">
              {formatearFecha(estadisticas.fecha_consulta)}
            </p>
          </div>
        </div>
      </div>

      {/* Resumen Principal */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-blue-600 text-lg">👥</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Usuarios</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatearNumero(estadisticas.resumen.total_usuarios)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-green-600 text-lg">🏥</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Pacientes Activos</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatearNumero(estadisticas.resumen.pacientes_activos)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <span className="text-purple-600 text-lg">📅</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Sesiones Programadas</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatearNumero(estadisticas.resumen.sesiones_programadas)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                <span className="text-orange-600 text-lg">✅</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Tareas Pendientes</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatearNumero(estadisticas.resumen.tareas_pendientes)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Estadísticas Detalladas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Usuarios por Rol */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">👤 Usuarios por Rol</h3>
          <div className="space-y-3">
            {estadisticas.usuarios_por_rol.map((rol, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="text-sm font-medium text-gray-700 capitalize">
                    {rol.rol === 'psicologo' ? '👨‍⚕️' : 
                     rol.rol === 'paciente' ? '🏥' : 
                     rol.rol === 'recepcionista' ? '👤' : 
                     rol.rol === 'admin' ? '👑' : '👤'} {rol.rol}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold text-gray-900">
                    {formatearNumero(rol.activos)}/{formatearNumero(rol.total)}
                  </span>
                  <span className="text-xs text-gray-500 ml-1">activos</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Estado de Pacientes */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">🏥 Estado de Pacientes</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Activos</span>
              <span className="text-sm font-bold text-green-600">
                {formatearNumero(estadisticas.pacientes.pacientes_activos)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Inactivos</span>
              <span className="text-sm font-bold text-gray-600">
                {formatearNumero(estadisticas.pacientes.pacientes_inactivos)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Alta</span>
              <span className="text-sm font-bold text-blue-600">
                {formatearNumero(estadisticas.pacientes.pacientes_alta)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Derivados</span>
              <span className="text-sm font-bold text-orange-600">
                {formatearNumero(estadisticas.pacientes.pacientes_derivados)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Nuevos este mes</span>
              <span className="text-sm font-bold text-purple-600">
                {formatearNumero(estadisticas.pacientes.pacientes_nuevos_mes)}
              </span>
            </div>
          </div>
        </div>

        {/* Estado de Sesiones */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">📅 Estado de Sesiones</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Programadas</span>
              <span className="text-sm font-bold text-blue-600">
                {formatearNumero(estadisticas.sesiones.sesiones_programadas)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Confirmadas</span>
              <span className="text-sm font-bold text-green-600">
                {formatearNumero(estadisticas.sesiones.sesiones_confirmadas)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">En Curso</span>
              <span className="text-sm font-bold text-yellow-600">
                {formatearNumero(estadisticas.sesiones.sesiones_en_curso)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Completadas</span>
              <span className="text-sm font-bold text-green-600">
                {formatearNumero(estadisticas.sesiones.sesiones_completadas)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Canceladas</span>
              <span className="text-sm font-bold text-red-600">
                {formatearNumero(estadisticas.sesiones.sesiones_canceladas)}
              </span>
            </div>
          </div>
        </div>

        {/* Estado de Tareas */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">✅ Estado de Tareas</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Pendientes</span>
              <span className="text-sm font-bold text-orange-600">
                {formatearNumero(estadisticas.tareas.tareas_pendientes)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">En Progreso</span>
              <span className="text-sm font-bold text-yellow-600">
                {formatearNumero(estadisticas.tareas.tareas_en_progreso)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Completadas</span>
              <span className="text-sm font-bold text-green-600">
                {formatearNumero(estadisticas.tareas.tareas_completadas)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Vencidas</span>
              <span className="text-sm font-bold text-red-600">
                {formatearNumero(estadisticas.tareas.tareas_vencidas)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Esta semana</span>
              <span className="text-sm font-bold text-purple-600">
                {formatearNumero(estadisticas.tareas.tareas_semana)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Psicólogos Más Activos */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">⭐ Psicólogos Más Activos</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Psicólogo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Sesiones
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sesiones Completadas
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pacientes Asignados
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {estadisticas.psicologos_mas_activos.map((psicologo, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center">
                          <span className="text-amber-600 font-medium">
                            {psicologo.nombres.charAt(0)}{psicologo.apellidos.charAt(0)}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {psicologo.nombres} {psicologo.apellidos}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatearNumero(psicologo.total_sesiones)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatearNumero(psicologo.sesiones_completadas)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatearNumero(psicologo.total_pacientes)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tipos de Sesiones y Tareas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tipos de Sesiones */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">📋 Tipos de Sesiones</h3>
          <div className="space-y-3">
            {estadisticas.sesiones_por_tipo.map((tipo, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm text-gray-700 capitalize">
                  {tipo.tipo_sesion === 'presencial' ? '🏢' : 
                   tipo.tipo_sesion === 'virtual' ? '💻' : 
                   tipo.tipo_sesion === 'telefonica' ? '📞' : '📋'} {tipo.tipo_sesion}
                </span>
                <span className="text-sm font-bold text-gray-900">
                  {formatearNumero(tipo.total)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Tipos de Tareas */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">📝 Tipos de Tareas</h3>
          <div className="space-y-3">
            {estadisticas.tareas_por_tipo.slice(0, 5).map((tipo, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm text-gray-700 capitalize">
                  {tipo.tipo_tarea.replace('_', ' ')}
                </span>
                <span className="text-sm font-bold text-gray-900">
                  {formatearNumero(tipo.total)}
                </span>
              </div>
            ))}
            {estadisticas.tareas_por_tipo.length > 5 && (
              <div className="text-sm text-gray-500 text-center pt-2">
                +{estadisticas.tareas_por_tipo.length - 5} tipos más
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Botón de Actualización */}
      <div className="flex justify-center">
        <button
          onClick={cargarEstadisticas}
          className="bg-amber-500 hover:bg-amber-600 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center space-x-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span>Actualizar Estadísticas</span>
        </button>
      </div>
    </div>
  );
};

export default EstadisticasGenerales;
