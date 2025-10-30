import LogAuditoria from '../modelos/LogAuditoria';
import { Request } from 'express';

export interface AuditoriaData {
  usuario_id?: string | undefined;
  accion: string;
  tabla_afectada?: string;
  registro_id?: string;
  valores_anteriores?: any;
  valores_nuevos?: any;
  metadatos?: any;
  req?: Request;
}

export class AuditoriaService {
  /**
   * Crea un log de auditoría
   */
  static async crearLog(data: AuditoriaData): Promise<void> {
    try {
      const logData: any = {
        usuario_id: data.usuario_id,
        accion: data.accion,
        tabla_afectada: data.tabla_afectada,
        registro_id: data.registro_id,
        valores_anteriores: data.valores_anteriores,
        valores_nuevos: data.valores_nuevos,
        metadatos: {
          ...data.metadatos,
          timestamp: new Date().toISOString(),
        }
      };

      // Agregar información de la request si está disponible
      if (data.req) {
        logData.ip_address = data.req.ip || data.req.connection?.remoteAddress;
        logData.user_agent = data.req.get('User-Agent');
        logData.metadatos = {
          ...logData.metadatos,
          url: data.req.url,
          method: data.req.method,
          headers: {
            'content-type': data.req.get('Content-Type'),
            'authorization': data.req.get('Authorization') ? 'Bearer [HIDDEN]' : undefined
          }
        };
      }

      await LogAuditoria.create(logData);
    } catch (error) {
      console.error('Error al crear log de auditoría:', error);
      // No lanzamos el error para no interrumpir el flujo principal
    }
  }

  /**
   * Log para eliminación de psicólogos
   */
  static async logEliminacionPsicologo(
    psicologoId: string,
    psicologoNombre: string,
    usuarioId: string | undefined,
    req: Request,
    detalles?: any
  ): Promise<void> {
    await this.crearLog({
      usuario_id: usuarioId,
      accion: 'ELIMINACION_PSICOLOGO',
      tabla_afectada: 'usuarios',
      registro_id: psicologoId,
      valores_anteriores: { nombre: psicologoNombre },
      metadatos: {
        tipo: 'eliminacion_permanente',
        psicologo_nombre: psicologoNombre,
        detalles: detalles
      },
      req
    });
  }

  /**
   * Log para desactivación de psicólogos
   */
  static async logDesactivacionPsicologo(
    psicologoId: string,
    psicologoNombre: string,
    usuarioId: string | undefined,
    req: Request,
    motivo?: string
  ): Promise<void> {
    await this.crearLog({
      usuario_id: usuarioId,
      accion: 'DESACTIVACION_PSICOLOGO',
      tabla_afectada: 'usuarios',
      registro_id: psicologoId,
      valores_anteriores: { activo: true },
      valores_nuevos: { activo: false },
      metadatos: {
        tipo: 'desactivacion',
        psicologo_nombre: psicologoNombre,
        motivo: motivo
      },
      req
    });
  }

  /**
   * Log para reactivación de psicólogos
   */
  static async logReactivacionPsicologo(
    psicologoId: string,
    psicologoNombre: string,
    usuarioId: string | undefined,
    req: Request
  ): Promise<void> {
    await this.crearLog({
      usuario_id: usuarioId,
      accion: 'REACTIVACION_PSICOLOGO',
      tabla_afectada: 'usuarios',
      registro_id: psicologoId,
      valores_anteriores: { activo: false },
      valores_nuevos: { activo: true },
      metadatos: {
        tipo: 'reactivacion',
        psicologo_nombre: psicologoNombre
      },
      req
    });
  }

  /**
   * Log para eliminación de sesiones
   */
  static async logEliminacionSesion(
    sesionId: string,
    sesionData: any,
    usuarioId: string | undefined,
    req: Request
  ): Promise<void> {
    await this.crearLog({
      usuario_id: usuarioId,
      accion: 'ELIMINACION_SESION',
      tabla_afectada: 'sesiones',
      registro_id: sesionId,
      valores_anteriores: sesionData,
      metadatos: {
        tipo: 'eliminacion_sesion',
        paciente_id: sesionData.paciente_id,
        psicologo_id: sesionData.psicologo_id,
        fecha_sesion: sesionData.fecha_programada
      },
      req
    });
  }

  /**
   * Log para reasignación de pacientes
   */
  static async logReasignacionPaciente(
    pacienteId: string,
    pacienteData: any,
    psicologoAnteriorId: string,
    psicologoNuevoId: string,
    usuarioId: string | undefined,
    req: Request
  ): Promise<void> {
    await this.crearLog({
      usuario_id: usuarioId,
      accion: 'REASIGNACION_PACIENTE',
      tabla_afectada: 'pacientes',
      registro_id: pacienteId,
      valores_anteriores: { psicologo_id: psicologoAnteriorId },
      valores_nuevos: { psicologo_id: psicologoNuevoId },
      metadatos: {
        tipo: 'reasignacion_paciente',
        paciente_nombre: pacienteData.nombre,
        psicologo_anterior_id: psicologoAnteriorId,
        psicologo_nuevo_id: psicologoNuevoId
      },
      req
    });
  }

  /**
   * Log para intentos de eliminación fallidos
   */
  static async logIntentoEliminacionFallido(
    psicologoId: string,
    psicologoNombre: string,
    usuarioId: string | undefined,
    req: Request,
    motivo: string,
    detalles?: any
  ): Promise<void> {
    await this.crearLog({
      usuario_id: usuarioId,
      accion: 'INTENTO_ELIMINACION_FALLIDO',
      tabla_afectada: 'usuarios',
      registro_id: psicologoId,
      metadatos: {
        tipo: 'intento_fallido',
        psicologo_nombre: psicologoNombre,
        motivo: motivo,
        detalles: detalles
      },
      req
    });
  }
}

export default AuditoriaService; 