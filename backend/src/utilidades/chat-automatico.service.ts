import { Mensaje, Paciente, Usuario } from '../modelos';
import { log } from './logger';

// Variable global para el servidor io (se establecerá desde servidor.ts)
declare global {
  var io: any;
}

export class ChatAutomaticoService {
  private static io: any = null;

  // Método para configurar el servidor io
  static setIo(ioServer: any) {
    this.io = ioServer;
    log.info('🔌 ChatAutomaticoService - WebSocket configurado');
  }

  // Enviar mensaje automático de cancelación de cita
  static async enviarMensajeCancelacionCita(
    citaId: string,
    pacienteId: string,
    psicologoId: string,
    fecha: string,
    hora: string
  ): Promise<boolean> {
    try {
      log.info(`🔌 ChatAutomaticoService - Enviando mensaje de cancelación para cita: ${citaId}`);

      // Obtener información del paciente
      const paciente = await Paciente.findByPk(pacienteId);
      if (!paciente) {
        log.error(`❌ Paciente no encontrado: ${pacienteId}`);
        return false;
      }

      // Obtener información del psicólogo
      const psicologo = await Usuario.findByPk(psicologoId);
      if (!psicologo) {
        log.error(`❌ Psicólogo no encontrado: ${psicologoId}`);
        return false;
      }

      // Crear mensaje automático
      const mensajeContenido = `🚫 **CITA CANCELADA**\n\nLa cita programada para el **${fecha} a las ${hora}** ha sido cancelada por el paciente.\n\nSi tienes alguna pregunta, contacta directamente con el paciente.`;

      // Guardar mensaje en la base de datos
      const mensaje = await Mensaje.create({
        remitente_id: paciente.usuario_id, // El mensaje aparece como enviado por el paciente
        destinatario_id: psicologoId,
        contenido: mensajeContenido,
        tipo_mensaje: 'notificacion',
        prioridad: 'alta',
        leido: false,
        archivos_adjuntos: []
      });

      log.info(`✅ Mensaje de cancelación guardado en BD: ${mensaje.id}`);

      // Enviar por WebSocket si está disponible
      if (this.io) {
        // Emitir al psicólogo
        this.io.to(`user_${psicologoId}`).emit('new-message', {
          chatId: `chat_${pacienteId}`,
          message: mensajeContenido,
          senderId: paciente.usuario_id,
          timestamp: mensaje.created_at.toISOString(),
          mensajeCompleto: {
            id: mensaje.id,
            contenido: mensaje.contenido,
            emisor_id: mensaje.remitente_id,
            receptor_id: mensaje.destinatario_id,
            emisor_nombre: `${paciente.nombres} ${paciente.apellidos}`,
            emisor_rol: 'paciente',
            timestamp: mensaje.created_at.toISOString(),
            leido: mensaje.leido
          }
        });

        // Emitir al paciente también para confirmación
        this.io.to(`user_${paciente.usuario_id}`).emit('new-message', {
          chatId: `chat_${pacienteId}`,
          message: mensajeContenido,
          senderId: paciente.usuario_id,
          timestamp: mensaje.created_at.toISOString(),
          mensajeCompleto: {
            id: mensaje.id,
            contenido: mensaje.contenido,
            emisor_id: mensaje.remitente_id,
            receptor_id: mensaje.destinatario_id,
            emisor_nombre: `${paciente.nombres} ${paciente.apellidos}`,
            emisor_rol: 'paciente',
            timestamp: mensaje.created_at.toISOString(),
            leido: mensaje.leido
          }
        });

        log.info(`🔌 WebSocket - Mensaje de cancelación emitido a psicólogo: ${psicologoId}`);
        log.info(`🔌 WebSocket - Mensaje de cancelación emitido a paciente: ${paciente.usuario_id}`);
      } else {
        log.warn('⚠️ WebSocket no disponible, mensaje solo guardado en BD');
      }

      return true;
    } catch (error) {
      log.error('❌ Error al enviar mensaje de cancelación:', error);
      return false;
    }
  }
}
