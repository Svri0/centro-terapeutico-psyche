import { Op } from 'sequelize';
import Tarea from '../modelos/Tarea';
import Paciente from '../modelos/Paciente';
import { enviarEmailRecordatorioTareas, TareaPendiente } from '../utilidades/email.service';
import { logger } from '../utilidades/logger';

/**
 * Servicio para enviar recordatorios de tareas pendientes a pacientes
 */
export class RecordatoriosTareasService {
  /**
   * Busca todas las tareas pendientes y envía recordatorios por email
   * @returns Promise con el resultado del proceso
   */
  static async enviarRecordatoriosTareas(): Promise<{
    exitosos: number;
    fallidos: number;
    pacientesNotificados: number;
    totalTareas: number;
  }> {
    try {
      logger.info('📧 Iniciando envío de recordatorios de tareas pendientes');

      // Buscar todas las tareas pendientes o en progreso que no estén completadas, canceladas o vencidas
      // y que tengan fecha de vencimiento (opcional, pero recomendado)
      const tareasPendientes = await Tarea.findAll({
        where: {
          estado: {
            [Op.in]: ['pendiente', 'en_progreso']
          },
          es_borrador: false
        },
        include: [
          {
            model: Paciente,
            as: 'paciente',
            attributes: ['id', 'nombres', 'apellidos', 'email', 'estado'],
            where: {
              estado: 'activo' // Solo pacientes activos
            },
            required: true
          }
        ],
        order: [
          ['fecha_vencimiento', 'ASC'],
          ['prioridad', 'DESC']
        ]
      });

      if (tareasPendientes.length === 0) {
        logger.info('✅ No hay tareas pendientes para enviar recordatorios');
        return {
          exitosos: 0,
          fallidos: 0,
          pacientesNotificados: 0,
          totalTareas: 0
        };
      }

      logger.info(`📋 Encontradas ${tareasPendientes.length} tareas pendientes`);

      // Agrupar tareas por paciente
      const tareasPorPaciente = new Map<string, {
        paciente: Paciente;
        tareas: Tarea[];
      }>();

      tareasPendientes.forEach((tarea) => {
        const pacienteId = tarea.paciente_id;
        const paciente = tarea.paciente as Paciente;

        if (!paciente || !paciente.email) {
          logger.warn(`⚠️ Tarea ${tarea.id} sin paciente o email válido`);
          return;
        }

        const emailPaciente = typeof paciente.email === 'string' ? paciente.email.trim() : '';
        if (!emailPaciente) {
          logger.warn(`⚠️ Tarea ${tarea.id} con email vacío para paciente ${paciente.id}`);
          return;
        }

        if (!tareasPorPaciente.has(pacienteId)) {
          tareasPorPaciente.set(pacienteId, {
            paciente,
            tareas: []
          });
        }

        tareasPorPaciente.get(pacienteId)!.tareas.push(tarea);
      });

      logger.info(`👥 Encontrados ${tareasPorPaciente.size} pacientes con tareas pendientes`);

      // Enviar email a cada paciente
      let exitosos = 0;
      let fallidos = 0;
      let pacientesNotificados = 0;

      for (const [pacienteId, datos] of tareasPorPaciente.entries()) {
        try {
          const { paciente, tareas } = datos;

          // Construir nombre del paciente
          const nombrePaciente = [paciente.nombres, paciente.apellidos]
            .filter(Boolean)
            .join(' ') || 'Estimado/a paciente';

          // Convertir tareas al formato esperado por el email
          const tareasPendientesEmail: TareaPendiente[] = tareas.map((tarea) => {
            const tareaData: TareaPendiente = {
              id: tarea.id,
              titulo: tarea.titulo,
              prioridad: tarea.prioridad,
              puntos_asignados: tarea.puntos_asignados
            };

            if (tarea.instrucciones) {
              tareaData.instrucciones = tarea.instrucciones;
            }

            if (tarea.fecha_vencimiento) {
              tareaData.fecha_vencimiento = tarea.fecha_vencimiento;
            }

            return tareaData;
          });

          // Enviar email
          const emailPaciente = typeof paciente.email === 'string' ? paciente.email.trim() : '';

          const enviado = await enviarEmailRecordatorioTareas(
            emailPaciente,
            nombrePaciente,
            tareasPendientesEmail
          );

          if (enviado) {
            exitosos += tareas.length;
            pacientesNotificados++;
            logger.info(`✅ Email enviado a ${paciente.email} (${tareas.length} tarea(s))`);
          } else {
            fallidos += tareas.length;
            logger.error(`❌ Error al enviar email a ${paciente.email}`);
          }
        } catch (error) {
          fallidos += datos.tareas.length;
          logger.error(`❌ Error al procesar paciente ${pacienteId}:`, error);
        }
      }

      const resultado = {
        exitosos,
        fallidos,
        pacientesNotificados,
        totalTareas: tareasPendientes.length
      };

      logger.info('📧 Proceso de recordatorios completado', resultado);

      return resultado;
    } catch (error) {
      logger.error('❌ Error en el servicio de recordatorios de tareas:', error);
      throw error;
    }
  }

  /**
   * Envía recordatorio de tareas a un paciente específico
   * @param pacienteId ID del paciente
   * @returns Promise con el resultado del envío
   */
  static async enviarRecordatorioPaciente(pacienteId: string): Promise<boolean> {
    try {
      const paciente = await Paciente.findOne({
        where: {
          id: pacienteId,
          estado: 'activo'
        }
      });

      if (!paciente || !paciente.email) {
        logger.warn(`⚠️ Paciente ${pacienteId} no encontrado o sin email`);
        return false;
      }

      const emailPaciente = typeof paciente.email === 'string' ? paciente.email.trim() : '';

      if (!emailPaciente) {
        logger.warn(`⚠️ Paciente ${pacienteId} tiene email vacío`);
        return false;
      }

      const tareasPendientes = await Tarea.findAll({
        where: {
          paciente_id: pacienteId,
          estado: {
            [Op.in]: ['pendiente', 'en_progreso']
          },
          es_borrador: false
        },
        order: [
          ['fecha_vencimiento', 'ASC'],
          ['prioridad', 'DESC']
        ]
      });

      if (tareasPendientes.length === 0) {
        logger.info(`✅ Paciente ${pacienteId} no tiene tareas pendientes`);
        return false;
      }

      const nombrePaciente = [paciente.nombres, paciente.apellidos]
        .filter(Boolean)
        .join(' ') || 'Estimado/a paciente';

      const tareasPendientesEmail: TareaPendiente[] = tareasPendientes.map((tarea) => {
        const tareaData: TareaPendiente = {
          id: tarea.id,
          titulo: tarea.titulo,
          prioridad: tarea.prioridad,
          puntos_asignados: tarea.puntos_asignados
        };

        if (tarea.instrucciones) {
          tareaData.instrucciones = tarea.instrucciones;
        }

        if (tarea.fecha_vencimiento) {
          tareaData.fecha_vencimiento = tarea.fecha_vencimiento;
        }

        return tareaData;
      });

      const enviado = await enviarEmailRecordatorioTareas(
        emailPaciente,
        nombrePaciente,
        tareasPendientesEmail
      );

      if (enviado) {
        logger.info(`✅ Recordatorio enviado a ${paciente.email} (${tareasPendientes.length} tarea(s))`);
      }

      return enviado;
    } catch (error) {
      logger.error(`❌ Error al enviar recordatorio a paciente ${pacienteId}:`, error);
      return false;
    }
  }
}

