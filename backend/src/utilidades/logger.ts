// Sistema de logging profesional para Centro Terapéutico Psyche
// Reemplaza console.log con un logger más avanzado

export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3
}

export class Logger {
  private static instance: Logger;
  private logLevel: LogLevel;

  private constructor() {
    // En desarrollo mostramos todo, en producción solo errores y warnings
    this.logLevel = process.env.NODE_ENV === 'production' ? LogLevel.WARN : LogLevel.DEBUG;
  }

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  private log(level: LogLevel, message: string, ...args: any[]): void {
    if (level <= this.logLevel) {
      const timestamp = new Date().toLocaleString('es-CL');
      const levelText = LogLevel[level];

      switch (level) {
        case LogLevel.ERROR:
          console.error(`[${timestamp}] [ERROR]`, message, ...args);
          break;
        case LogLevel.WARN:
          console.warn(`[${timestamp}] [WARN]`, message, ...args);
          break;
        case LogLevel.INFO:
          console.info(`[${timestamp}] [INFO]`, message, ...args);
          break;
        case LogLevel.DEBUG:
          console.log(`[${timestamp}] [DEBUG]`, message, ...args);
          break;
      }
    }
  }

  error(message: string, ...args: any[]): void {
    this.log(LogLevel.ERROR, message, ...args);
  }

  warn(message: string, ...args: any[]): void {
    this.log(LogLevel.WARN, message, ...args);
  }

  info(message: string, ...args: any[]): void {
    this.log(LogLevel.INFO, message, ...args);
  }

  debug(message: string, ...args: any[]): void {
    this.log(LogLevel.DEBUG, message, ...args);
  }

  // Métodos especiales para mensajes del servidor
  servidor(mensaje: string): void {
    this.info(`🚀 ${mensaje}`);
  }

  exito(mensaje: string): void {
    this.info(`✅ ${mensaje}`);
  }

  problema(mensaje: string): void {
    this.warn(`⚠️  ${mensaje}`);
  }

  critico(mensaje: string): void {
    this.error(`🚨 ${mensaje}`);
  }

  separador(): void {
    this.info('═══════════════════════════════════════════════════════');
  }
}

// Instancia global del logger
export const logger = Logger.getInstance();

// Funciones de conveniencia
export const log = {
  error: (message: string, ...args: any[]) => logger.error(message, ...args),
  warn: (message: string, ...args: any[]) => logger.warn(message, ...args),
  info: (message: string, ...args: any[]) => logger.info(message, ...args),
  debug: (message: string, ...args: any[]) => logger.debug(message, ...args),

  // Funciones especiales para el servidor
  servidor: (mensaje: string) => logger.servidor(mensaje),
  exito: (mensaje: string) => logger.exito(mensaje),
  problema: (mensaje: string) => logger.problema(mensaje),
  critico: (mensaje: string) => logger.critico(mensaje),
  separador: () => logger.separador()
};
