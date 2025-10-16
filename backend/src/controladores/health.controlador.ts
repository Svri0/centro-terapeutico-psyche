import { Request, Response } from 'express';
import sequelize from '../configuracion/database';
import { QueryTypes } from 'sequelize';

// Endpoint de health check
export const healthCheck = async (req: Request, res: Response) => {
  try {
    const startTime = Date.now();
    
    // Verificar conexión a la base de datos
    let dbStatus = 'error';
    let dbResponseTime = 0;
    
    try {
      const dbStartTime = Date.now();
      await sequelize.query('SELECT 1 as health_check', { type: QueryTypes.SELECT });
      dbResponseTime = Date.now() - dbStartTime;
      dbStatus = 'ok';
    } catch (error) {
      console.error('Error en health check de DB:', error);
      dbStatus = 'error';
    }

    // Calcular tiempo total de respuesta
    const totalResponseTime = Date.now() - startTime;

    // Determinar estado general
    const overallStatus = dbStatus === 'ok' ? 'healthy' : 'unhealthy';

    const healthData = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      responseTime: totalResponseTime,
      services: {
        database: {
          status: dbStatus,
          responseTime: dbResponseTime,
          message: dbStatus === 'ok' ? 'Conectada' : 'Error de conexión'
        },
        api: {
          status: 'ok',
          responseTime: totalResponseTime,
          message: 'Operativa'
        },
        server: {
          status: 'ok',
          uptime: process.uptime(),
          message: 'Funcionando correctamente'
        }
      }
    };

    // Retornar código de estado apropiado
    const httpStatus = overallStatus === 'healthy' ? 200 : 503;
    
    res.status(httpStatus).json({
      success: overallStatus === 'healthy',
      data: healthData
    });

  } catch (error) {
    console.error('Error en health check:', error);
    
    res.status(503).json({
      success: false,
      data: {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: 'Health check failed',
        services: {
          database: { status: 'error', message: 'No disponible' },
          api: { status: 'error', message: 'No disponible' },
          server: { status: 'error', message: 'No disponible' }
        }
      }
    });
  }
};

