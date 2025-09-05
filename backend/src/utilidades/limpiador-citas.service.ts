import { log } from './logger';
import sequelize from '../configuracion/database';

export class LimpiadorCitasService {
  private static intervalo: NodeJS.Timeout | null = null;
  private static readonly INTERVALO_LIMPIEZA = 60 * 60 * 1000; // 1 hora
  private static readonly HORAS_ANTES_ELIMINAR = 24; // 24 horas

  // Iniciar el limpiador automático
  static iniciar() {
    if (this.intervalo) {
      log.info('🔄 Limpiador de citas ya está ejecutándose');
      return;
    }

    log.info('🚀 Iniciando limpiador automático de citas canceladas...');
    
    // Ejecutar limpieza inmediatamente
    this.limpiarCitasCanceladas();
    
    // Configurar limpieza automática cada hora
    this.intervalo = setInterval(() => {
      this.limpiarCitasCanceladas();
    }, this.INTERVALO_LIMPIEZA);

    log.info(`✅ Limpiador automático configurado - se ejecutará cada ${this.INTERVALO_LIMPIEZA / (60 * 60 * 1000)} hora(s)`);
  }

  // Detener el limpiador automático
  static detener() {
    if (this.intervalo) {
      clearInterval(this.intervalo);
      this.intervalo = null;
      log.info('⏹️ Limpiador automático de citas detenido');
    }
  }

  // Limpiar citas canceladas que tengan más de 24 horas
  static async limpiarCitasCanceladas(): Promise<void> {
    try {
      log.info('🧹 Iniciando limpieza de citas canceladas...');

      const [resultado] = await sequelize.query(
        `DELETE FROM citas 
         WHERE estado = 'cancelada' 
         AND updated_at < NOW() - INTERVAL '${this.HORAS_ANTES_ELIMINAR} hours'`,
        {
          type: 'DELETE'
        }
      ) as [any, unknown];

      const citasEliminadas = resultado?.rowCount || 0;
      
      if (citasEliminadas > 0) {
        log.info(`✅ Limpieza completada - ${citasEliminadas} citas canceladas eliminadas`);
      } else {
        log.info('✅ Limpieza completada - No hay citas canceladas para eliminar');
      }

    } catch (error) {
      log.error('❌ Error durante la limpieza automática de citas:', error);
    }
  }

  // Método manual para limpiar citas (útil para testing)
  static async limpiarManual(): Promise<number> {
    try {
      log.info('🧹 Ejecutando limpieza manual de citas canceladas...');
      
      const [resultado] = await sequelize.query(
        `DELETE FROM citas 
         WHERE estado = 'cancelada' 
         AND updated_at < NOW() - INTERVAL '${this.HORAS_ANTES_ELIMINAR} hours'`,
        {
          type: 'DELETE'
        }
      ) as [any, unknown];

      const citasEliminadas = resultado?.rowCount || 0;
      log.info(`✅ Limpieza manual completada - ${citasEliminadas} citas eliminadas`);
      
      return citasEliminadas;
    } catch (error) {
      log.error('❌ Error durante la limpieza manual:', error);
      throw error;
    }
  }

  // Obtener estadísticas de citas canceladas
  static async obtenerEstadisticas(): Promise<{
    totalCanceladas: number;
    canceladasRecientes: number;
    canceladasAntiguas: number;
  }> {
    try {
      const [totalCanceladas] = await sequelize.query(
        `SELECT COUNT(*) as total FROM citas WHERE estado = 'cancelada'`
      ) as [any[], unknown];

      const [canceladasRecientes] = await sequelize.query(
        `SELECT COUNT(*) as recientes 
         FROM citas 
         WHERE estado = 'cancelada' 
         AND updated_at >= NOW() - INTERVAL '${this.HORAS_ANTES_ELIMINAR} hours'`
      ) as [any[], unknown];

      const [canceladasAntiguas] = await sequelize.query(
        `SELECT COUNT(*) as antiguas 
         FROM citas 
         WHERE estado = 'cancelada' 
         AND updated_at < NOW() - INTERVAL '${this.HORAS_ANTES_ELIMINAR} hours'`
      ) as [any[], unknown];

      return {
        totalCanceladas: totalCanceladas[0]?.total || 0,
        canceladasRecientes: canceladasRecientes[0]?.recientes || 0,
        canceladasAntiguas: canceladasAntiguas[0]?.antiguas || 0
      };
    } catch (error) {
      log.error('❌ Error al obtener estadísticas:', error);
      return {
        totalCanceladas: 0,
        canceladasRecientes: 0,
        canceladasAntiguas: 0
      };
    }
  }
}
