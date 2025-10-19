import React, { useState, useEffect } from 'react';
import { healthService, HealthStatus } from '../servicios/health.service';

interface EstadoSistemaProps {
  mostrarDetalles?: boolean;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

const EstadoSistema: React.FC<EstadoSistemaProps> = ({ 
  mostrarDetalles = false,
  autoRefresh = true,
  refreshInterval = 10000 // 10 segundos por defecto
}) => {
  const [healthStatus, setHealthStatus] = useState<HealthStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const checkHealth = async () => {
    try {
      setError(null);
      const status = await healthService.checkHealth();
      setHealthStatus(status);
    } catch (err) {
      setError('Error al verificar el estado del sistema');
      console.error('Error en EstadoSistema:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkHealth();

    let interval: NodeJS.Timeout | null = null;
    
    if (autoRefresh) {
      interval = setInterval(checkHealth, refreshInterval);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [autoRefresh, refreshInterval]);

  const getStatusIcon = (status: 'ok' | 'error') => {
    return status === 'ok' ? '🟢' : '🔴';
  };

  const getStatusColor = (status: 'ok' | 'error') => {
    return status === 'ok' ? 'text-green-700' : 'text-red-700';
  };

  const getOverallStatusColor = (status: 'healthy' | 'unhealthy') => {
    return status === 'healthy' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200';
  };

  const getOverallStatusTextColor = (status: 'healthy' | 'unhealthy') => {
    return status === 'healthy' ? 'text-green-800' : 'text-red-800';
  };

  const getOverallStatusIcon = (status: 'healthy' | 'unhealthy') => {
    return status === 'healthy' ? '✅' : '❌';
  };

  if (loading) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-center mb-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
          <h3 className="text-sm font-medium text-gray-800">Verificando Estado del Sistema...</h3>
        </div>
      </div>
    );
  }

  if (error || !healthStatus) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center justify-center mb-2">
          <span className="text-red-600 text-lg mr-2">❌</span>
          <h3 className="text-sm font-medium text-red-800">Estado del Sistema</h3>
        </div>
        <div className="text-sm text-red-700 text-center">
          <p>No se pudo verificar el estado del sistema</p>
          <button 
            onClick={checkHealth}
            className="mt-2 text-xs text-red-600 hover:text-red-800 underline"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`border rounded-lg p-4 ${getOverallStatusColor(healthStatus.status)}`}>
      <div className="flex items-center justify-center mb-2">
        <span className="text-lg mr-2">{getOverallStatusIcon(healthStatus.status)}</span>
        <h3 className={`text-sm font-medium ${getOverallStatusTextColor(healthStatus.status)}`}>
          Estado del Sistema
        </h3>
      </div>
      
      <div className="text-sm text-center">
        <div className="space-y-1">
          <p className={getStatusColor(healthStatus.services.server.status)}>
            {getStatusIcon(healthStatus.services.server.status)} Servidor: {healthStatus.services.server.message}
          </p>
          <p className={getStatusColor(healthStatus.services.database.status)}>
            {getStatusIcon(healthStatus.services.database.status)} Base de Datos: {healthStatus.services.database.message}
          </p>
          <p className={getStatusColor(healthStatus.services.api.status)}>
            {getStatusIcon(healthStatus.services.api.status)} API: {healthStatus.services.api.message}
          </p>
        </div>

        {mostrarDetalles && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <p className="text-xs text-gray-600">
              Última verificación: {new Date(healthStatus.timestamp).toLocaleTimeString()}
            </p>
            <p className="text-xs text-gray-600">
              Tiempo de respuesta: {healthStatus.responseTime}ms
            </p>
            {healthStatus.status === 'healthy' && (
              <p className="text-xs text-green-600 mt-1">
                Todos los servicios funcionan correctamente
              </p>
            )}
            {healthStatus.status === 'unhealthy' && (
              <p className="text-xs text-red-600 mt-1">
                Algunos servicios presentan problemas
              </p>
            )}
          </div>
        )}

        {!autoRefresh && (
          <button 
            onClick={checkHealth}
            className="mt-2 text-xs text-gray-600 hover:text-gray-800 underline"
          >
            Actualizar Estado
          </button>
        )}
      </div>
    </div>
  );
};

export default EstadoSistema;

