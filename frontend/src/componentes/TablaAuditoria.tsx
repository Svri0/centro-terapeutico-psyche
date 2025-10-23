import React, { useState, useEffect } from 'react';
import { adminService, LogAuditoria, EstadisticasAuditoria } from '../servicios/admin.service';

interface TablaAuditoriaProps {
  // Props opcionales si necesitas pasar datos desde el componente padre
}

const TablaAuditoria: React.FC<TablaAuditoriaProps> = () => {
  const [logs, setLogs] = useState<LogAuditoria[]>([]);
  const [estadisticas, setEstadisticas] = useState<EstadisticasAuditoria | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filtros, setFiltros] = useState({
    accion: '',
    fecha_inicio: '',
    fecha_fin: ''
  });
  const [paginacion, setPaginacion] = useState({
    limit: 20,
    offset: 0,
    total: 0
  });

  const cargarLogs = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {
        limit: paginacion.limit,
        offset: paginacion.offset,
        ...(filtros.accion && { accion: filtros.accion }),
        ...(filtros.fecha_inicio && { fecha_inicio: filtros.fecha_inicio }),
        ...(filtros.fecha_fin && { fecha_fin: filtros.fecha_fin })
      };

      const [logsData, estadisticasData] = await Promise.all([
        adminService.obtenerLogsAuditoria(params),
        adminService.obtenerEstadisticasAuditoria({
          fecha_inicio: filtros.fecha_inicio,
          fecha_fin: filtros.fecha_fin
        })
      ]);

      setLogs(logsData.logs);
      setPaginacion(prev => ({ ...prev, total: logsData.total }));
      setEstadisticas(estadisticasData);
    } catch (err) {
      setError('Error al cargar los logs de auditoría');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarLogs();
  }, [paginacion.offset, filtros]);

  const handleFiltroChange = (campo: string, valor: string) => {
    setFiltros(prev => ({ ...prev, [campo]: valor }));
    setPaginacion(prev => ({ ...prev, offset: 0 }));
  };

  const handlePaginaAnterior = () => {
    if (paginacion.offset > 0) {
      setPaginacion(prev => ({ ...prev, offset: prev.offset - prev.limit }));
    }
  };

  const handlePaginaSiguiente = () => {
    if (paginacion.offset + paginacion.limit < paginacion.total) {
      setPaginacion(prev => ({ ...prev, offset: prev.offset + prev.limit }));
    }
  };

  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const obtenerColorAccion = (accion: string) => {
    switch (accion) {
      case 'LOGIN':
        return 'text-green-600 bg-green-50';
      case 'LOGOUT':
        return 'text-blue-600 bg-blue-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const obtenerIconoAccion = (accion: string) => {
    switch (accion) {
      case 'LOGIN':
        return '✅';
      case 'LOGOUT':
        return '🚪';
      default:
        return '📝';
    }
  };

  if (loading && logs.length === 0) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
        <span className="ml-2 text-amber-600 text-sm tracking-wide">Cargando logs de auditoría...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Estadísticas */}
      {estadisticas && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Total de Acciones</h3>
            <p className="text-2xl font-bold text-gray-900">{estadisticas.total_acciones}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Acciones Hoy</h3>
            <p className="text-2xl font-bold text-gray-900">
              {estadisticas.estadisticas_diarias[0]?.total || 0}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Tipos de Acción</h3>
            <p className="text-2xl font-bold text-gray-900">{estadisticas.estadisticas_por_accion.length}</p>
          </div>
        </div>
      )}

      {/* Filtros */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Filtros</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Acción</label>
            <select
              value={filtros.accion}
              onChange={(e) => handleFiltroChange('accion', e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            >
              <option value="">Todas las acciones</option>
              <option value="LOGIN">Inicio de Sesión</option>
              <option value="LOGOUT">Cierre de Sesión</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Inicio</label>
            <input
              type="date"
              value={filtros.fecha_inicio}
              onChange={(e) => handleFiltroChange('fecha_inicio', e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Fin</label>
            <input
              type="date"
              value={filtros.fecha_fin}
              onChange={(e) => handleFiltroChange('fecha_fin', e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={() => setFiltros({ accion: '', fecha_inicio: '', fecha_fin: '' })}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Limpiar Filtros
            </button>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Tabla de Logs */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200">
        <div className="px-4 py-3 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Registro de Accesos</h3>
          <p className="text-sm text-gray-500">
            Historial de inicios y cierres de sesión - Mostrando {logs.length} de {paginacion.total} registros
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha/Hora
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acción
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Usuario
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  IP
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Detalles
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {formatearFecha(log.created_at)}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${obtenerColorAccion(log.accion)}`}>
                      {obtenerIconoAccion(log.accion)} {log.accion.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {log.metadatos?.nombres && log.metadatos?.apellidos ? (
                      `${log.metadatos.nombres} ${log.metadatos.apellidos}`
                    ) : (
                      log.metadatos?.email || 'Usuario no identificado'
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {log.ip_address || '-'}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {log.metadatos?.rol && (
                      <span className="text-blue-600">({log.metadatos.rol})</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Mostrando {paginacion.offset + 1} a {Math.min(paginacion.offset + paginacion.limit, paginacion.total)} de {paginacion.total} resultados
          </div>
          <div className="flex space-x-2">
            <button
              onClick={handlePaginaAnterior}
              disabled={paginacion.offset === 0}
              className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Anterior
            </button>
            <button
              onClick={handlePaginaSiguiente}
              disabled={paginacion.offset + paginacion.limit >= paginacion.total}
              className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Siguiente
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TablaAuditoria;
