import { Request, Response } from 'express';
import { Usuario, Paciente } from '../modelos';

class ChatController {
  // Obtener conversaciones del usuario actual
  async obtenerConversaciones(req: Request, res: Response) {
    try {
             console.log('🔍 Debug - Chat - obtenerConversaciones - método llamado - VERSION 2.0');
      
      // Obtener el usuario autenticado desde el middleware
      const userId = req.usuario?.id;
      const userRole = req.usuario?.rol_id === 1 ? 'admin' : 'psicologo';
      
      console.log('🔍 Debug - Chat - userId:', userId, 'userRole:', userRole);
      console.log('🔍 Debug - Chat - req.usuario completo:', req.usuario);
      
      if (!userId) {
        console.log('❌ Error: No hay userId en req.usuario');
        return res.status(401).json({
          success: false,
          message: 'Usuario no autenticado'
        });
      }
      
      let conversaciones: any[] = [];
      
      // Si es psicólogo, obtener sus pacientes
      if (userRole === 'psicologo') {
        console.log('🔍 Debug - Chat - Buscando pacientes del psicólogo:', userId);
        
        // Primero, obtener solo los IDs para ver qué hay
        const pacientesIds = await Paciente.findAll({
          where: { psicologo_id: userId },
          attributes: ['id', 'usuario_id', 'psicologo_id']
        });
        
        console.log('🔍 Debug - Chat - IDs de pacientes encontrados:', JSON.stringify(pacientesIds, null, 2));
        
        // Ahora obtener los datos completos
        const pacientes = await Paciente.findAll({
          where: { psicologo_id: userId },
          attributes: ['id', 'usuario_id', 'psicologo_id', 'nombres', 'apellidos', 'email']
        });
        
        console.log('🔍 Debug - Chat - Pacientes encontrados:', pacientes.length);
        console.log('🔍 Debug - Chat - Primer paciente completo:', JSON.stringify(pacientes[0], null, 2));
        
        // Verificar si hay datos en la tabla usuarios
        if (pacientes.length > 0 && pacientes[0]) {
          const primerUsuarioId = pacientes[0].usuario_id;
          console.log('🔍 Debug - Chat - Verificando usuario_id:', primerUsuarioId);
          
          // Intentar obtener datos del usuario
          try {
            const usuario = await Usuario.findByPk(primerUsuarioId);
            console.log('🔍 Debug - Chat - Usuario encontrado:', JSON.stringify(usuario, null, 2));
          } catch (error) {
            console.log('🔍 Debug - Chat - Error al buscar usuario:', error);
          }
        }
        
        // Obtener nombres reales desde la tabla usuarios
        const conversacionesConNombres = await Promise.all(
          pacientes.map(async (paciente) => {
            try {
              const usuario = await Usuario.findByPk(paciente.usuario_id);
              return {
                id: `paciente_${paciente.id}`,
                participante_id: paciente.id,
                participante_nombre: usuario ? `${usuario.nombres || 'Sin nombre'} ${usuario.apellidos || 'Sin apellido'}` : 'Usuario no encontrado',
                participante_rol: 'paciente',
                ultimo_mensaje: 'Inicia una conversación',
                timestamp_ultimo: new Date().toISOString(),
                no_leidos: 0,
                avatar_url: usuario?.avatar_url || null
              };
            } catch (error) {
              console.log('🔍 Debug - Chat - Error al obtener usuario para paciente:', paciente.id, error);
              return {
                id: `paciente_${paciente.id}`,
                participante_id: paciente.id,
                participante_nombre: 'Error al cargar nombre',
                participante_rol: 'paciente',
                ultimo_mensaje: 'Inicia una conversación',
                timestamp_ultimo: new Date().toISOString(),
                no_leidos: 0,
                avatar_url: null
              };
            }
          })
        );
        
        conversaciones = conversacionesConNombres;
        
        console.log('🔍 Debug - Chat - Conversaciones generadas:', conversaciones.length);
      }
      
      // Si es admin, obtener todos los psicólogos
      if (userRole === 'admin') {
        console.log('🔍 Debug - Chat - Buscando psicólogos para admin');
        
        const psicologos = await Usuario.findAll({
          where: { rol_id: 2 }, // Asumiendo que rol_id 2 es psicólogo
          attributes: ['id', 'nombres', 'apellidos', 'email']
        });
        
        conversaciones = psicologos.map(psicologo => ({
          id: `psicologo_${psicologo.id}`,
          participante_id: psicologo.id,
          participante_nombre: `${psicologo.nombres} ${psicologo.apellidos}`,
          participante_rol: 'psicologo',
          ultimo_mensaje: 'Inicia una conversación',
          timestamp_ultimo: new Date().toISOString(),
          no_leidos: 0
        }));
      }
      
      // Si no es ni psicólogo ni admin, retornar array vacío
      if (userRole !== 'psicologo' && userRole !== 'admin') {
        console.log('🔍 Debug - Chat - Rol no reconocido:', userRole);
        conversaciones = [];
      }
      
      console.log('🔍 Debug - Chat - Conversaciones finales:', conversaciones.length);
      
      return res.json({
        success: true,
        data: conversaciones
      });
    } catch (error: any) {
      console.error('Error al obtener conversaciones:', error);
      return res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  // Obtener mensajes de una conversación específica
  async obtenerMensajes(req: Request, res: Response) {
    try {
      console.log('🔍 Debug - Chat - obtenerMensajes - método llamado');
      
      return res.json({
        success: true,
        data: []
      });
    } catch (error: any) {
      console.error('Error al obtener mensajes:', error);
      return res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  // Enviar un nuevo mensaje
  async enviarMensaje(req: Request, res: Response) {
    try {
      console.log('🔍 Debug - Chat - enviarMensaje - método llamado');
      
      return res.json({
        success: true,
        message: 'Mensaje enviado correctamente',
        data: { id: 'temp-id', contenido: 'mensaje temporal' }
      });
    } catch (error: any) {
      console.error('Error al enviar mensaje:', error);
      return res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  // Iniciar una nueva conversación
  async iniciarConversacion(req: Request, res: Response) {
    try {
      console.log('🔍 Debug - Chat - iniciarConversacion - método llamado');
      
      return res.json({
        success: true,
        message: 'Conversación iniciada',
        data: { conversacion_id: 'temp-id' }
      });
    } catch (error: any) {
      console.error('Error al iniciar conversación:', error);
      return res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  // Marcar mensajes como leídos
  async marcarComoLeidos(req: Request, res: Response) {
    try {
      console.log('🔍 Debug - Chat - marcarComoLeidos - método llamado');
      
      return res.json({
        success: true,
        message: 'Mensajes marcados como leídos',
        data: { mensajes_actualizados: 0 }
      });
    } catch (error: any) {
      console.error('Error al marcar como leídos:', error);
      return res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  // Obtener estadísticas del chat
  async obtenerEstadisticas(req: Request, res: Response) {
    try {
      console.log('🔍 Debug - Chat - obtenerEstadisticas - método llamado');
      
      return res.json({
        success: true,
        data: {
          total_mensajes: 0,
          mensajes_no_leidos: 0,
          conversaciones_activas: 0
        }
      });
    } catch (error: any) {
      console.error('Error al obtener estadísticas:', error);
      return res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  // Buscar usuarios para iniciar conversación
  async buscarUsuarios(req: Request, res: Response) {
    try {
      console.log('🔍 Debug - Chat - buscarUsuarios - método llamado');
      
      return res.json({
        success: true,
        data: []
      });
    } catch (error: any) {
      console.error('Error al buscar usuarios:', error);
      return res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }
}

export default new ChatController();
