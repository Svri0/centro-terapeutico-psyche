import { Request, Response } from 'express';
import MensajeChat from '../modelos/MensajeChat';
import Usuario from '../modelos/Usuario';
import Paciente from '../modelos/Paciente';
import { ManejadorRespuestas } from '../utilidades/respuestas';
import { Op } from 'sequelize';

export class ChatController {
  // Obtener pacientes del psicólogo para el chat
  static async obtenerPacientesChat(req: Request, res: Response) {
    try {
      const psicologoId = req.usuario?.id;
      
      if (!psicologoId) {
        return ManejadorRespuestas.noAutorizado(
          res,
          'Usuario no autenticado',
          'AUTH_001'
        );
      }

      // Obtener pacientes del psicólogo
      const pacientes = await Paciente.findAll({
        where: {
          psicologo_id: psicologoId,
          estado: 'activo'
        },
        attributes: ['id', 'usuario_id', 'psicologo_id']
      });

      // Obtener información de mensajes para cada paciente
      const pacientesConMensajes = await Promise.all(
        pacientes.map(async (paciente) => {
          // Obtener información del usuario
          const usuario = await Usuario.findByPk(paciente.usuario_id, {
            attributes: ['id', 'nombres', 'apellidos', 'avatar_url']
          });

          // Obtener último mensaje
          const ultimoMensaje = await MensajeChat.findOne({
            where: {
              [Op.or]: [
                { remitente_id: psicologoId, destinatario_id: paciente.usuario_id },
                { remitente_id: paciente.usuario_id, destinatario_id: psicologoId }
              ]
            },
            order: [['created_at', 'DESC']]
          });

          // Contar mensajes no leídos del paciente hacia el psicólogo
          const mensajesNoLeidos = await MensajeChat.count({
            where: {
              remitente_id: paciente.usuario_id,
              destinatario_id: psicologoId,
              leido: false
            }
          });

          return {
            id: paciente.usuario_id,
            nombres: usuario?.nombres || '',
            apellidos: usuario?.apellidos || '',
            avatar_url: usuario?.avatar_url,
            ultimo_mensaje: ultimoMensaje?.contenido,
            ultimo_mensaje_timestamp: ultimoMensaje?.created_at,
            mensajes_no_leidos: mensajesNoLeidos
          };
        })
      );

      // Ordenar por último mensaje (más recientes primero)
      pacientesConMensajes.sort((a, b) => {
        if (!a.ultimo_mensaje_timestamp && !b.ultimo_mensaje_timestamp) return 0;
        if (!a.ultimo_mensaje_timestamp) return 1;
        if (!b.ultimo_mensaje_timestamp) return -1;
        return new Date(b.ultimo_mensaje_timestamp).getTime() - new Date(a.ultimo_mensaje_timestamp).getTime();
      });

      return ManejadorRespuestas.exito(
        res,
        'Pacientes obtenidos correctamente',
        pacientesConMensajes,
        'CHAT_001'
      );
    } catch (error) {
      console.error('Error al obtener pacientes del chat:', error);
        return ManejadorRespuestas.errorInterno(
          res,
          'Error al obtener pacientes del chat',
          'CHAT_002'
        );
    }
  }

  // Obtener mensajes entre psicólogo y paciente
  static async obtenerMensajes(req: Request, res: Response) {
    try {
      const psicologoId = req.usuario?.id;
      const { pacienteId } = req.params;

      if (!psicologoId) {
        return ManejadorRespuestas.noAutorizado(
          res,
          'Usuario no autenticado',
          'AUTH_001'
        );
      }

      // Verificar que el paciente pertenece al psicólogo
      const paciente = await Paciente.findOne({
        where: {
          usuario_id: pacienteId,
          psicologo_id: psicologoId
        }
      });

      if (!paciente) {
        return ManejadorRespuestas.noEncontrado(
          res,
          'Paciente no encontrado o no autorizado',
          'CHAT_003'
        );
      }

      // Obtener mensajes
      const mensajes = await MensajeChat.findAll({
        where: {
          [Op.or]: [
            { remitente_id: psicologoId, destinatario_id: pacienteId },
            { remitente_id: pacienteId, destinatario_id: psicologoId }
          ]
        },
        order: [['created_at', 'ASC']],
        limit: 100 // Limitar a los últimos 100 mensajes
      });

      return ManejadorRespuestas.exito(
        res,
        'Mensajes obtenidos correctamente',
        mensajes,
        'CHAT_004'
      );
    } catch (error) {
      console.error('Error al obtener mensajes:', error);
        return ManejadorRespuestas.errorInterno(
          res,
          'Error al obtener mensajes',
          'CHAT_005'
        );
    }
  }

  // Enviar mensaje
  static async enviarMensaje(req: Request, res: Response) {
    try {
      const psicologoId = req.usuario?.id;
      const { pacienteId, contenido } = req.body;

      if (!psicologoId) {
        return ManejadorRespuestas.noAutorizado(
          res,
          'Usuario no autenticado',
          'AUTH_001'
        );
      }

      if (!contenido || !contenido.trim()) {
        return ManejadorRespuestas.errorValidacion(
          res,
          'El contenido del mensaje es requerido',
          null,
          'CHAT_006'
        );
      }

      // Verificar que el paciente pertenece al psicólogo
      const paciente = await Paciente.findOne({
        where: {
          usuario_id: pacienteId,
          psicologo_id: psicologoId
        }
      });

      if (!paciente) {
        return ManejadorRespuestas.noEncontrado(
          res,
          'Paciente no encontrado o no autorizado',
          'CHAT_003'
        );
      }

      // Crear mensaje
      const mensaje = await MensajeChat.create({
        contenido: contenido.trim(),
        remitente_id: psicologoId,
        destinatario_id: pacienteId,
        tipo: 'psicologo',
        leido: false
      });

      return ManejadorRespuestas.exito(
        res,
        'Mensaje enviado correctamente',
        mensaje,
        'CHAT_007'
      );
    } catch (error) {
      console.error('Error al enviar mensaje:', error);
        return ManejadorRespuestas.errorInterno(
          res,
          'Error al enviar mensaje',
          'CHAT_008'
        );
    }
  }

  // Marcar mensajes como leídos
  static async marcarComoLeidos(req: Request, res: Response) {
    try {
      const psicologoId = req.usuario?.id;
      const { pacienteId } = req.params;

      if (!psicologoId) {
        return ManejadorRespuestas.noAutorizado(
          res,
          'Usuario no autenticado',
          'AUTH_001'
        );
      }

      // Verificar que el paciente pertenece al psicólogo
      const paciente = await Paciente.findOne({
        where: {
          usuario_id: pacienteId,
          psicologo_id: psicologoId
        }
      });

      if (!paciente) {
        return ManejadorRespuestas.noEncontrado(
          res,
          'Paciente no encontrado o no autorizado',
          'CHAT_003'
        );
      }

      // Marcar mensajes como leídos
      await MensajeChat.update(
        { leido: true },
        {
          where: {
            remitente_id: pacienteId,
            destinatario_id: psicologoId,
            leido: false
          }
        }
      );

      return ManejadorRespuestas.exito(
        res,
        'Mensajes marcados como leídos',
        null,
        'CHAT_009'
      );
    } catch (error) {
      console.error('Error al marcar mensajes como leídos:', error);
        return ManejadorRespuestas.errorInterno(
          res,
          'Error al marcar mensajes como leídos',
          'CHAT_010'
        );
    }
  }

  // Obtener personal (otros psicólogos y administrador) para el chat
  static async obtenerPersonalChat(req: Request, res: Response) {
    try {
      const psicologoId = req.usuario?.id;
      
      if (!psicologoId) {
        return ManejadorRespuestas.noAutorizado(
          res,
          'Usuario no autenticado',
          'AUTH_001'
        );
      }

      // Obtener otros psicólogos y administrador
      const personal = await Usuario.findAll({
        where: {
          id: {
            [Op.ne]: psicologoId // Excluir al usuario actual
          },
          rol_id: {
            [Op.in]: [1, 2] // 1: administrador, 2: psicólogo
          },
          activo: true
        },
        attributes: ['id', 'nombres', 'apellidos', 'avatar_url', 'rol_id']
      });

      // Obtener información de mensajes para cada miembro del personal
      const personalConMensajes = await Promise.all(
        personal.map(async (usuario) => {
          // Obtener último mensaje
          const ultimoMensaje = await MensajeChat.findOne({
            where: {
              [Op.or]: [
                { remitente_id: psicologoId, destinatario_id: usuario.id },
                { remitente_id: usuario.id, destinatario_id: psicologoId }
              ]
            },
            order: [['created_at', 'DESC']]
          });

          // Contar mensajes no leídos del personal hacia el psicólogo
          const mensajesNoLeidos = await MensajeChat.count({
            where: {
              remitente_id: usuario.id,
              destinatario_id: psicologoId,
              leido: false
            }
          });

          return {
            id: usuario.id,
            nombres: usuario.nombres || '',
            apellidos: usuario.apellidos || '',
            avatar_url: usuario.avatar_url,
            ultimo_mensaje: ultimoMensaje?.contenido,
            ultimo_mensaje_timestamp: ultimoMensaje?.created_at,
            mensajes_no_leidos: mensajesNoLeidos,
            rol: usuario.rol_id === 1 ? 'Administrador' : 'Psicólogo'
          };
        })
      );

      // Ordenar por último mensaje (más recientes primero)
      personalConMensajes.sort((a, b) => {
        if (!a.ultimo_mensaje_timestamp && !b.ultimo_mensaje_timestamp) return 0;
        if (!a.ultimo_mensaje_timestamp) return 1;
        if (!b.ultimo_mensaje_timestamp) return -1;
        return new Date(b.ultimo_mensaje_timestamp).getTime() - new Date(a.ultimo_mensaje_timestamp).getTime();
      });

      return ManejadorRespuestas.exito(
        res,
        'Personal obtenido correctamente',
        personalConMensajes,
        'CHAT_013'
      );
    } catch (error) {
      console.error('Error al obtener personal del chat:', error);
      return ManejadorRespuestas.errorInterno(
        res,
        'Error al obtener personal del chat',
        'CHAT_014'
      );
    }
  }

  // Obtener psicólogo asignado para el paciente
  static async obtenerPsicologoAsignado(req: Request, res: Response) {
    try {
      const pacienteId = req.usuario?.id;
      
      if (!pacienteId) {
        return ManejadorRespuestas.noAutorizado(
          res,
          'Usuario no autenticado',
          'AUTH_001'
        );
      }

      // Buscar el paciente para obtener su psicólogo asignado
      const paciente = await Paciente.findOne({
        where: {
          usuario_id: pacienteId,
          estado: 'activo'
        },
        attributes: ['psicologo_id']
      });

      if (!paciente || !paciente.psicologo_id) {
        return ManejadorRespuestas.noEncontrado(
          res,
          'No tienes un psicólogo asignado',
          'CHAT_009'
        );
      }

      // Obtener información del psicólogo
      const psicologo = await Usuario.findByPk(paciente.psicologo_id, {
        attributes: ['id', 'nombres', 'apellidos', 'avatar_url']
      });

      if (!psicologo) {
        return ManejadorRespuestas.noEncontrado(
          res,
          'Psicólogo no encontrado',
          'CHAT_010'
        );
      }

      // Obtener último mensaje entre paciente y psicólogo
      const ultimoMensaje = await MensajeChat.findOne({
        where: {
          [Op.or]: [
            { remitente_id: pacienteId, destinatario_id: psicologo.id },
            { remitente_id: psicologo.id, destinatario_id: pacienteId }
          ]
        },
        order: [['created_at', 'DESC']],
        limit: 1
      });

      // Contar mensajes no leídos del psicólogo hacia el paciente
      const mensajesNoLeidos = await MensajeChat.count({
        where: {
          remitente_id: psicologo.id,
          destinatario_id: pacienteId,
          leido: false
        }
      });

      const psicologoConMensajes = {
        id: psicologo.id,
        nombres: psicologo.nombres,
        apellidos: psicologo.apellidos,
        avatar_url: psicologo.avatar_url,
        ultimo_mensaje: ultimoMensaje?.contenido || null,
        ultimo_mensaje_timestamp: ultimoMensaje?.created_at || null,
        mensajes_no_leidos: mensajesNoLeidos
      };

      return ManejadorRespuestas.exito(
        res,
        'Psicólogo asignado obtenido correctamente',
        psicologoConMensajes,
        'CHAT_011'
      );

    } catch (error) {
      console.error('Error al obtener psicólogo asignado:', error);
      return ManejadorRespuestas.errorInterno(
        res,
        'Error al obtener psicólogo asignado',
        'CHAT_012'
      );
    }
  }

  // Obtener personal (administradores y psicólogos) para el chat del recepcionista
  static async obtenerPersonalRecepcionistaChat(req: Request, res: Response) {
    try {
      const recepcionistaId = req.usuario?.id;
      
      if (!recepcionistaId) {
        return ManejadorRespuestas.noAutorizado(
          res,
          'Usuario no autenticado',
          'AUTH_001'
        );
      }

      // Obtener administradores y psicólogos
      const personal = await Usuario.findAll({
        where: {
          rol_id: {
            [Op.in]: [1, 2] // 1: admin, 2: psicologo
          },
          activo: true
        },
        paranoid: true, // Esto excluye automáticamente los registros con deleted_at
        attributes: ['id', 'nombres', 'apellidos', 'avatar_url']
      });

      // Obtener información de mensajes para cada persona
      const personalConMensajes = await Promise.all(
        personal.map(async (persona) => {
          const ultimoMensaje = await MensajeChat.findOne({
            where: {
              [Op.or]: [
                { remitente_id: recepcionistaId, destinatario_id: persona.id },
                { remitente_id: persona.id, destinatario_id: recepcionistaId }
              ]
            },
            order: [['created_at', 'DESC']],
            attributes: ['contenido', 'created_at', 'tipo']
          });

          const mensajesNoLeidos = await MensajeChat.count({
            where: {
              remitente_id: persona.id,
              destinatario_id: recepcionistaId,
              leido: false
            }
          });

          return {
            id: persona.id,
            nombres: persona.nombres,
            apellidos: persona.apellidos,
            avatar_url: persona.avatar_url,
            ultimo_mensaje: ultimoMensaje?.contenido || null,
            ultimo_mensaje_timestamp: ultimoMensaje?.created_at || null,
            mensajes_no_leidos: mensajesNoLeidos
          };
        })
      );

      // Ordenar por último mensaje
      personalConMensajes.sort((a, b) => {
        if (!a.ultimo_mensaje_timestamp && !b.ultimo_mensaje_timestamp) return 0;
        if (!a.ultimo_mensaje_timestamp) return 1;
        if (!b.ultimo_mensaje_timestamp) return -1;
        return new Date(b.ultimo_mensaje_timestamp).getTime() - new Date(a.ultimo_mensaje_timestamp).getTime();
      });

      return ManejadorRespuestas.exito(
        res,
        'Personal obtenido exitosamente',
        personalConMensajes,
        'CHAT_009'
      );
    } catch (error) {
      console.error('Error al obtener personal para recepcionista:', error);
      return ManejadorRespuestas.errorInterno(
        res,
        'Error al obtener personal',
        'CHAT_010'
      );
    }
  }

  // Obtener trabajadores (psicólogos y recepcionistas) para el chat del administrador
  static async obtenerTrabajadoresChat(req: Request, res: Response) {
    try {
      const adminId = req.usuario?.id;
      
      if (!adminId) {
        return ManejadorRespuestas.noAutorizado(
          res,
          'Usuario no autenticado',
          'AUTH_001'
        );
      }

      // Obtener psicólogos y recepcionistas
      const trabajadores = await Usuario.findAll({
        where: {
          id: {
            [Op.ne]: adminId // Excluir al administrador actual
          },
          rol_id: {
            [Op.in]: [2, 3] // 2: psicólogo, 3: recepcionista
          },
          activo: true
        },
        attributes: ['id', 'nombres', 'apellidos', 'avatar_url', 'rol_id']
      });

      // Obtener información de mensajes para cada trabajador
      const trabajadoresConMensajes = await Promise.all(
        trabajadores.map(async (usuario) => {
          // Obtener último mensaje
          const ultimoMensaje = await MensajeChat.findOne({
            where: {
              [Op.or]: [
                { remitente_id: adminId, destinatario_id: usuario.id },
                { remitente_id: usuario.id, destinatario_id: adminId }
              ]
            },
            order: [['created_at', 'DESC']]
          });

          // Contar mensajes no leídos del trabajador hacia el administrador
          const mensajesNoLeidos = await MensajeChat.count({
            where: {
              remitente_id: usuario.id,
              destinatario_id: adminId,
              leido: false
            }
          });

          return {
            id: usuario.id,
            nombres: usuario.nombres || '',
            apellidos: usuario.apellidos || '',
            avatar_url: usuario.avatar_url,
            ultimo_mensaje: ultimoMensaje?.contenido,
            ultimo_mensaje_timestamp: ultimoMensaje?.created_at,
            mensajes_no_leidos: mensajesNoLeidos,
            rol: usuario.rol_id === 2 ? 'Psicólogo' : 'Recepcionista'
          };
        })
      );

      // Ordenar por último mensaje (más recientes primero)
      trabajadoresConMensajes.sort((a, b) => {
        if (!a.ultimo_mensaje_timestamp && !b.ultimo_mensaje_timestamp) return 0;
        if (!a.ultimo_mensaje_timestamp) return 1;
        if (!b.ultimo_mensaje_timestamp) return -1;
        return new Date(b.ultimo_mensaje_timestamp).getTime() - new Date(a.ultimo_mensaje_timestamp).getTime();
      });

      return ManejadorRespuestas.exito(
        res,
        'Trabajadores obtenidos correctamente',
        trabajadoresConMensajes,
        'CHAT_015'
      );
    } catch (error) {
      console.error('Error al obtener trabajadores del chat:', error);
      return ManejadorRespuestas.errorInterno(
        res,
        'Error al obtener trabajadores del chat',
        'CHAT_016'
      );
    }
  }

  // Obtener estadísticas del chat
  static async obtenerEstadisticas(req: Request, res: Response) {
    try {
      const psicologoId = req.usuario?.id;

      if (!psicologoId) {
        return ManejadorRespuestas.noAutorizado(
          res,
          'Usuario no autenticado',
          'AUTH_001'
        );
      }

      // Contar mensajes enviados por el psicólogo
      const mensajesEnviados = await MensajeChat.count({
        where: {
          remitente_id: psicologoId,
          tipo: 'psicologo'
        }
      });

      // Contar mensajes recibidos del psicólogo
      const mensajesRecibidos = await MensajeChat.count({
        where: {
          destinatario_id: psicologoId,
          tipo: 'paciente'
        }
      });

      // Contar mensajes no leídos
      const mensajesNoLeidos = await MensajeChat.count({
        where: {
          destinatario_id: psicologoId,
          tipo: 'paciente',
          leido: false
        }
      });

      // Contar pacientes activos en chat
      const pacientesActivos = await Paciente.count({
        where: {
          psicologo_id: psicologoId,
          estado: 'activo'
        }
      });

      const estadisticas = {
        mensajes_enviados: mensajesEnviados,
        mensajes_recibidos: mensajesRecibidos,
        mensajes_no_leidos: mensajesNoLeidos,
        pacientes_activos: pacientesActivos,
        total_mensajes: mensajesEnviados + mensajesRecibidos
      };

      return ManejadorRespuestas.exito(
        res,
        'Estadísticas obtenidas correctamente',
        estadisticas,
        'CHAT_011'
      );
    } catch (error) {
      console.error('Error al obtener estadísticas del chat:', error);
        return ManejadorRespuestas.errorInterno(
          res,
          'Error al obtener estadísticas del chat',
          'CHAT_012'
        );
    }
  }
}
