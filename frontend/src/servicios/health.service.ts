import api from './api';

export interface HealthStatus {
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  uptime: number;
  responseTime: number;
  services: {
    database: {
      status: 'ok' | 'error';
      responseTime: number;
      message: string;
    };
    api: {
      status: 'ok' | 'error';
      responseTime: number;
      message: string;
    };
    server: {
      status: 'ok' | 'error';
      uptime: number;
      message: string;
    };
  };
}

class HealthService {
  private cache: { data: HealthStatus | null; timestamp: number } = {
    data: null,
    timestamp: 0
  };
  
  private readonly CACHE_DURATION = 5000; // 5 segundos de cache

  async checkHealth(): Promise<HealthStatus> {
    const now = Date.now();
    
    // Usar cache si está disponible y no ha expirado
    if (this.cache.data && (now - this.cache.timestamp) < this.CACHE_DURATION) {
      return this.cache.data;
    }

    try {
      // Hacer llamada al endpoint de health check
      const response = await fetch('/health', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        // Timeout de 5 segundos
        signal: AbortSignal.timeout(5000)
      });

      if (!response.ok) {
        throw new Error(`Health check failed with status: ${response.status}`);
      }

      const result = await response.json();
      const healthData: HealthStatus = result.data;

      // Actualizar cache
      this.cache = {
        data: healthData,
        timestamp: now
      };

      return healthData;
    } catch (error) {
      console.error('Error en health check:', error);
      
      // Retornar estado de error
      const errorStatus: HealthStatus = {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        uptime: 0,
        responseTime: 0,
        services: {
          database: {
            status: 'error',
            responseTime: 0,
            message: 'No disponible'
          },
          api: {
            status: 'error',
            responseTime: 0,
            message: 'No disponible'
          },
          server: {
            status: 'error',
            uptime: 0,
            message: 'No disponible'
          }
        }
      };

      // Actualizar cache con estado de error
      this.cache = {
        data: errorStatus,
        timestamp: now
      };

      return errorStatus;
    }
  }

  // Limpiar cache
  clearCache(): void {
    this.cache = { data: null, timestamp: 0 };
  }
}

export const healthService = new HealthService();

