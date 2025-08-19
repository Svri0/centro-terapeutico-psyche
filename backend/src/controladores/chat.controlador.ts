import { Request, Response } from 'express';
import Chat from '../modelos/Chat';
import MensajeChat from '../modelos/MensajeChat';
import Usuario from '../modelos/Usuario';
import { Op } from 'sequelize';

export class ChatController {
  // Obtener chats del usuario (psicólogo o paciente)
  async obtenerChats(req: Request, res: Response): Promise<void> {
    try {
      console.log('🔍 obtenerChats - Iniciando...');
      
      const { usuario_id, tipo_usuario } = req.params;
      console.log('🔍 obtenerChats - Parámetros:', { usuario_id, tipo_usuario });
      
      if (!usuario_id || !tipo_usuario) {
        console.log('🔍 Error: Faltan parámetros');
        res.status(400).json({ 
          error: 'Se requiere usuario_id y tipo_usuario' 
        });
        return;
      }

      let whereClause: any = { activo: true };
      
      if (tipo_usuario === 'psicologo') {
        whereClause.psicologo_id = usuario_id;
      } else if (tipo_usuario === 'paciente') {
        whereClause.paciente_id = usuario_id;
      } else {
        console.log('🔍 Error: Tipo de usuario inválido:', tipo_usuario);
        res.status(400).json({ 
          error: 'Tipo de usuario inválido' 
        });
        return;
      }

      console.log('🔍 whereClause:', whereClause);

      // Verificar conexión a la base de datos
      try {
        await Chat.sequelize?.authenticate();
        console.log('🔍 Conexión a BD: OK');
      } catch (dbError) {
        console.error('🔍 Error de conexión a BD:', dbError);
        res.status(500).json({ error: 'Error de conexión a la base de datos' });
        return;
      }

      // Primero, verificar si existen chats
      console.log('🔍 Contando chats...');
      const totalChats = await Chat.count();
      console.log('🔍 Total de chats en la base de datos:', totalChats);

      console.log('🔍 Buscando chats con whereClause...');
      const chats = await Chat.findAll({
        where: whereClause,
        include: [
          {
            model: Usuario,
            as: 'psicologo',
            attributes: ['id', 'nombres', 'apellidos', 'avatar_url']
          },
          {
            model: Usuario,
            as: 'paciente',
            attributes: ['id', 'nombres', 'apellidos', 'avatar_url']
          }
        ],
        order: [['fecha_ultima_actividad', 'DESC']],
      });

      console.log('🔍 Chats encontrados:', chats.length);
      console.log('🔍 Primer chat:', chats[0] ? JSON.stringify(chats[0], null, 2) : 'No hay chats');

      console.log('🔍 Formateando chats...');
      // Formatear respuesta para el frontend
      const chatsFormateados = chats.map((chat: any) => {
        const otroUsuario = tipo_usuario === 'psicologo' 
          ? chat.paciente 
          : chat.psicologo;
        
        return {
          id: chat.id,
          nombre: `${otroUsuario?.nombres} ${otroUsuario?.apellidos}`,
          avatar: otroUsuario?.avatar_url || 'https://api.dicebear.com/7.x/bottts/svg?seed=default&backgroundColor=ffdfbf&scale=80',
          ultimoMensaje: chat.ultimo_mensaje || 'No hay mensajes',
          timestamp: chat.ultimo_mensaje_timestamp || chat.fecha_creacion,
          noLeidos: tipo_usuario === 'psicologo' 
            ? chat.no_leidos_psicologo 
            : chat.no_leidos_paciente,
          online: false, // Por ahora hardcodeado, se puede implementar después
          tipo: chat.tipo,
          participantes: [chat.psicologo_id, chat.paciente_id].filter(Boolean),
          ultimaActividad: chat.fecha_ultima_actividad,
        };
      });

      console.log('🔍 Enviando respuesta...');
      res.json({ 
        chats: chatsFormateados, 
        total: chatsFormateados.length,
        debug: {
          totalChatsEnDB: totalChats,
          whereClause,
          usuario_id,
          tipo_usuario
        }
      });
      console.log('🔍 Respuesta enviada exitosamente');
      return;
    } catch (error) {
      console.error('Error al obtener chats:', error);
      res.status(500).json({ 
        error: 'Error interno del servidor' 
      });
      return;
    }
  }

  // Obtener mensajes de un chat específico
  async obtenerMensajes(req: Request, res: Response): Promise<void> {
    try {
      const { chat_id } = req.params as { chat_id: string };
      const { pagina = 1, limite = 50 } = req.query;
      
      const offset = (Number(pagina) - 1) * Number(limite);

      // Traer chat para poder mapear remitente a psicologo/paciente
      const chat = await Chat.findByPk(chat_id);

      const mensajes = await MensajeChat.findAll({
        where: { chat_id },
        include: [
          {
            model: Usuario,
            as: 'remitente',
            attributes: ['id', 'nombres', 'apellidos']
          }
        ],
        order: [['fecha_envio', 'ASC']],
        limit: Number(limite),
        offset,
      });

      const total = await MensajeChat.count({ where: { chat_id } });

      // Formatear respuesta para el frontend
      const mensajesFormateados = mensajes.map((mensaje: any) => {
        const remitente = mensaje.remitente as any;
        let remitenteRol: 'psicologo' | 'paciente' = 'paciente';
        if (chat) {
          remitenteRol = mensaje.remitente_id === (chat as any).psicologo_id ? 'psicologo' : 'paciente';
        }
        return {
          id: mensaje.id,
          contenido: mensaje.contenido,
          remitente: remitenteRol,
          timestamp: mensaje.fecha_envio,
          tipo: mensaje.tipo,
          leido: mensaje.leido,
          metadata: mensaje.metadata,
        };
      });

      res.json({ 
        mensajes: mensajesFormateados, 
        total,
        pagina: Number(pagina),
        limite: Number(limite),
      });
      return;
    } catch (error) {
      console.error('Error al obtener mensajes:', error);
      res.status(500).json({ 
        error: 'Error interno del servidor' 
      });
      return;
    }
  }

  // Enviar un mensaje
  async enviarMensaje(req: Request, res: Response): Promise<void> {
    try {
      const { chat_id } = req.params as { chat_id: string };
      const { contenido, tipo = 'texto', remitente_id } = req.body;

      if (!contenido || !remitente_id) {
        res.status(400).json({ 
          error: 'Se requiere contenido y remitente_id' 
        });
        return;
      }

      // Crear el mensaje
      const mensaje = await MensajeChat.create({
        chat_id: String(chat_id),
        remitente_id,
        contenido,
        tipo,
        leido: false,
        fecha_envio: new Date(),
      });

      // Actualizar el chat con el último mensaje
      await Chat.update({
        ultimo_mensaje: contenido,
        ultimo_mensaje_timestamp: new Date(),
        ultimo_mensaje_remitente: remitente_id,
        fecha_ultima_actividad: new Date(),
      }, {
        where: { id: chat_id }
      });

      // Incrementar contador de no leídos para el otro usuario
      const chat = await Chat.findByPk(chat_id);
      if (chat) {
        if (remitente_id === chat.psicologo_id) {
          await chat.update({ 
            no_leidos_paciente: chat.no_leidos_paciente + 1 
          });
        } else {
          await chat.update({ 
            no_leidos_psicologo: chat.no_leidos_psicologo + 1 
          });
        }
      }

      // Obtener el mensaje con información del remitente
      const mensajeCompleto = await MensajeChat.findByPk(mensaje.id, {
        include: [
          {
            model: Usuario,
            as: 'remitente',
            attributes: ['id', 'nombres', 'apellidos']
          }
        ]
      });

      // Formatear respuesta
      const remitente = (mensajeCompleto as any)?.remitente as any;
      let remitenteRol: 'psicologo' | 'paciente' = 'paciente';
      const chatForRole = await Chat.findByPk(chat_id);
      if (chatForRole) {
        remitenteRol = remitente_id === (chatForRole as any).psicologo_id ? 'psicologo' : 'paciente';
      }
      const mensajeFormateado = {
        id: mensaje.id,
        contenido: mensaje.contenido,
        remitente: remitenteRol,
        timestamp: mensaje.fecha_envio,
        tipo: mensaje.tipo,
        leido: mensaje.leido,
        metadata: mensaje.metadata,
      };

      // Emitir mensaje en tiempo real via WebSocket
      console.log('🔌 Intentando emitir mensaje en tiempo real...');
      console.log('🔌 chat_id:', chat_id);
      console.log('🔌 mensajeFormateado:', JSON.stringify(mensajeFormateado, null, 2));
      try {
        const chatSocketService = (global as any).chatSocketService;
        console.log('🔌 chatSocketService disponible:', !!chatSocketService);
        if (chatSocketService) {
          console.log('🔌 Emitiendo mensaje al chat:', chat_id);
          chatSocketService.emitirMensajeNuevo(chat_id, mensajeFormateado);
          console.log('🔌 Mensaje emitido correctamente via WebSocket');
        } else {
          console.log('⚠️ chatSocketService no está disponible');
        }
      } catch (error) {
        console.error('⚠️ Error al emitir mensaje en tiempo real:', error);
      }

      res.status(201).json(mensajeFormateado);
      return;
    } catch (error) {
      console.error('Error al enviar mensaje:', error);
      res.status(500).json({ 
        error: 'Error interno del servidor' 
      });
      return;
    }
  }

  // Marcar mensajes como leídos
  async marcarMensajesLeidos(req: Request, res: Response): Promise<void> {
    try {
      const { chat_id } = req.params;
      const { usuario_id, tipo_usuario } = req.body;

      if (!usuario_id || !tipo_usuario) {
        res.status(400).json({ 
          error: 'Se requiere usuario_id y tipo_usuario' 
        });
        return;
      }

      // Marcar mensajes como leídos
      await MensajeChat.update(
        { leido: true },
        { 
          where: { 
            chat_id,
            remitente_id: { [Op.ne]: usuario_id } // Solo mensajes del otro usuario
          }
        }
      );

      // Resetear contador de no leídos
      const chat = await Chat.findByPk(chat_id);
      if (chat) {
        if (tipo_usuario === 'psicologo') {
          await chat.update({ no_leidos_psicologo: 0 });
        } else {
          await chat.update({ no_leidos_paciente: 0 });
        }
      }

      res.json({ mensaje: 'Mensajes marcados como leídos' });
      return;
    } catch (error) {
      console.error('Error al marcar mensajes como leídos:', error);
      res.status(500).json({ 
        error: 'Error interno del servidor' 
      });
      return;
    }
  }

  // Crear un nuevo chat
  async crearChat(req: Request, res: Response): Promise<void> {
    try {
      const { psicologo_id, paciente_id, tipo = 'individual' } = req.body;

      if (!psicologo_id || !paciente_id) {
        res.status(400).json({ 
          error: 'Se requiere psicologo_id y paciente_id' 
        });
        return;
      }

      // Verificar si ya existe un chat entre estos usuarios
      const chatExistente = await Chat.findOne({
        where: {
          psicologo_id,
          paciente_id,
          tipo: 'individual',
          activo: true,
        }
      });

      if (chatExistente) {
        res.json(chatExistente);
        return;
      }

      // Crear nuevo chat
      const nuevoChat = await Chat.create({
        tipo,
        psicologo_id,
        paciente_id,
        no_leidos_psicologo: 0,
        no_leidos_paciente: 0,
        activo: true,
        fecha_creacion: new Date(),
        fecha_ultima_actividad: new Date(),
      });

      res.status(201).json(nuevoChat);
      return;
    } catch (error) {
      console.error('Error al crear chat:', error);
      res.status(500).json({ 
        error: 'Error interno del servidor' 
      });
      return;
    }
  }

  // Buscar usuarios para iniciar chat
  async buscarUsuarios(req: Request, res: Response): Promise<void> {
    try {
      const { q, tipo_usuario, usuario_actual_id } = req.query;

      if (!q || !tipo_usuario || !usuario_actual_id) {
        res.status(400).json({ 
          error: 'Se requiere query, tipo_usuario y usuario_actual_id' 
        });
        return;
      }

      let whereClause: any = {
        [Op.or]: [
          { nombres: { [Op.iLike]: `%${q}%` } },
          { apellidos: { [Op.iLike]: `%${q}%` } },
          { email: { [Op.iLike]: `%${q}%` } }
        ],
        id: { [Op.ne]: usuario_actual_id },
        activo: true
      };

      // Si es psicólogo, buscar pacientes
      const ROL_PSICOLOGO_ID = 2;
      const ROL_PACIENTE_ID = 3;
      if (tipo_usuario === 'psicologo') {
        whereClause.rol_id = ROL_PACIENTE_ID;
      } else if (tipo_usuario === 'paciente') {
        whereClause.rol_id = ROL_PSICOLOGO_ID;
      }

      const usuarios = await Usuario.findAll({
        where: whereClause,
        attributes: ['id', 'nombres', 'apellidos', 'avatar_url', 'rol_id'],
        limit: 10,
      });

      // Formatear respuesta
      const usuariosFormateados = usuarios.map(usuario => ({
        id: usuario.id,
        nombre: `${usuario.nombres} ${usuario.apellidos}`,
        avatar: usuario.avatar_url || 'https://api.dicebear.com/7.x/bottts/svg?seed=default&backgroundColor=ffdfbf&scale=80',
        rol: usuario.rol_id === ROL_PSICOLOGO_ID ? 'psicologo' : 'paciente',
        online: false, // Por ahora hardcodeado
        ultimaActividad: new Date(),
      }));

      res.json(usuariosFormateados);
      return;
    } catch (error) {
      console.error('Error al buscar usuarios:', error);
      res.status(500).json({ 
        error: 'Error interno del servidor' 
      });
      return;
    }
  }

  // Método temporal para debug y crear chat de prueba
  async crearChatPrueba(req: Request, res: Response): Promise<void> {
    try {
      console.log('🔍 crearChatPrueba - Iniciando...');
      
      // Buscar un psicólogo y un paciente
      const psicologo = await Usuario.findOne({
        where: { rol_id: 2 }, // ID del rol psicólogo
        attributes: ['id', 'nombres', 'apellidos']
      });
      
      const paciente = await Usuario.findOne({
        where: { rol_id: 3 }, // ID del rol paciente
        attributes: ['id', 'nombres', 'apellidos']
      });

      console.log('🔍 Psicólogo encontrado:', psicologo);
      console.log('🔍 Paciente encontrado:', paciente);

      if (!psicologo || !paciente) {
        res.status(400).json({ 
          error: 'No se encontraron psicólogo o paciente' 
        });
        return;
      }

      // Verificar si ya existe un chat
      const chatExistente = await Chat.findOne({
        where: {
          psicologo_id: psicologo.id,
          paciente_id: paciente.id,
          activo: true
        }
      });

      if (chatExistente) {
        console.log('🔍 Chat ya existe:', chatExistente.id);
        res.json({ 
          mensaje: 'Chat ya existe',
          chat: chatExistente,
          psicologo,
          paciente
        });
        return;
      }

      // Crear nuevo chat
      const nuevoChat = await Chat.create({
        tipo: 'individual',
        psicologo_id: psicologo.id,
        paciente_id: paciente.id,
        ultimo_mensaje: `Hola ${paciente.nombres}, ¿cómo te sientes hoy?`,
        ultimo_mensaje_timestamp: new Date(),
        ultimo_mensaje_remitente: psicologo.id,
        no_leidos_psicologo: 0,
        no_leidos_paciente: 1,
        activo: true,
        fecha_creacion: new Date(),
        fecha_ultima_actividad: new Date(),
      });

      console.log('🔍 Nuevo chat creado:', nuevoChat.id);

      // Crear mensaje inicial
      const mensaje = await MensajeChat.create({
        chat_id: nuevoChat.id,
        remitente_id: psicologo.id,
        contenido: `Hola ${paciente.nombres}, ¿cómo te sientes hoy?`,
        tipo: 'texto',
        leido: false,
        fecha_envio: new Date(),
      });

      res.status(201).json({ 
        mensaje: 'Chat de prueba creado exitosamente',
        chat: nuevoChat,
        mensajeInicial: mensaje,
        psicologo,
        paciente
      });
      return;
    } catch (error) {
      console.error('Error al crear chat de prueba:', error);
      res.status(500).json({ 
        error: 'Error interno del servidor' 
      });
      return;
    }
  }
}

export default new ChatController();
