import express from 'express';
import ChatController from '../controladores/chat.controlador';
import { verificarToken } from '../middleware/auth.middleware';

const router = express.Router();

// Endpoint de prueba simple SIN autenticación
router.get('/test', (req, res) => {
  res.json({ mensaje: 'Chat API funcionando correctamente' });
});

// Endpoint de prueba para obtener chats SIN autenticación
router.get('/test/chats/:tipo_usuario/:usuario_id', ChatController.obtenerChats);

// Endpoint de prueba para simular exactamente lo que hace obtenerChats
router.get('/test/chats-simple/:tipo_usuario/:usuario_id', async (req, res) => {
  try {
    console.log('🔍 test/chats-simple - Iniciando...');
    console.log('🔍 URL completa:', req.originalUrl);
    console.log('🔍 Método:', req.method);
    
    const { usuario_id, tipo_usuario } = req.params;
    console.log('🔍 Parámetros:', { usuario_id, tipo_usuario });
    
    if (!usuario_id || !tipo_usuario) {
      console.log('🔍 Error: Faltan parámetros');
      res.status(400).json({ error: 'Se requiere usuario_id y tipo_usuario' });
      return;
    }

    let whereClause: any = { activo: true };
    
    if (tipo_usuario === 'psicologo') {
      whereClause.psicologo_id = usuario_id;
    } else if (tipo_usuario === 'paciente') {
      whereClause.paciente_id = usuario_id;
    } else {
      console.log('🔍 Error: Tipo de usuario inválido:', tipo_usuario);
      res.status(400).json({ error: 'Tipo de usuario inválido' });
      return;
    }

    console.log('🔍 whereClause:', whereClause);

    // Importar los modelos
    console.log('🔍 Importando modelos...');
    const { Chat, Usuario } = require('../modelos');
    console.log('🔍 Modelos importados:', { Chat: !!Chat, Usuario: !!Usuario });
    
    // Verificar conexión
    console.log('🔍 Verificando conexión a BD...');
    await Chat.sequelize.authenticate();
    console.log('🔍 Conexión a BD: OK');
    
    // Contar chats
    console.log('🔍 Contando chats...');
    const totalChats = await Chat.count();
    console.log('🔍 Total de chats en la BD:', totalChats);
    
    // Buscar chats con include
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
    
    // Formatear respuesta
    console.log('🔍 Formateando respuesta...');
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
        online: false,
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
    
  } catch (error: any) {
    console.error('🔍 Error en test/chats-simple:', error);
    console.error('🔍 Stack trace:', error.stack);
    res.status(500).json({ 
      error: 'Error en test/chats-simple',
      detalle: error.message || 'Error desconocido',
      stack: error.stack
    });
  }
});

// Endpoint de prueba simple para verificar el controlador paso a paso
router.get('/test/controlador', async (req, res) => {
  try {
    console.log('🔍 Probando controlador paso a paso...');
    
    // Importar los modelos
    const { Chat, Usuario } = require('../modelos');
    
    console.log('🔍 Modelos importados OK');
    
    // Verificar que Chat.sequelize existe
    if (!Chat.sequelize) {
      throw new Error('Chat.sequelize no existe');
    }
    console.log('🔍 Chat.sequelize existe OK');
    
    // Verificar conexión
    await Chat.sequelize.authenticate();
    console.log('🔍 Conexión a BD: OK');
    
    // Contar chats
    const totalChats = await Chat.count();
    console.log('🔍 Total de chats:', totalChats);
    
    // Buscar un chat específico
    const chat = await Chat.findOne({
      where: { activo: true },
      include: [
        {
          model: Usuario,
          as: 'psicologo',
          attributes: ['id', 'nombres', 'apellidos']
        }
      ]
    });
    
    console.log('🔍 Chat encontrado:', chat ? 'SÍ' : 'NO');
    
    res.json({
      mensaje: 'Controlador funcionando paso a paso',
      totalChats,
      chatEncontrado: !!chat,
      debug: {
        chatModel: typeof Chat,
        sequelizeExists: !!Chat.sequelize
      }
    });
  } catch (error: any) {
    console.error('🔍 Error en test/controlador:', error);
    res.status(500).json({
      error: 'Error en controlador',
      detalle: error.message || 'Error desconocido',
      stack: error.stack
    });
  }
});

// Endpoint para listar usuarios por rol (para debug)
router.get('/test/usuarios/:rol', async (req, res) => {
  try {
    const { rol } = req.params;
    console.log('🔍 Listando usuarios con rol:', rol);
    
    // Importar los modelos
    const { Usuario } = require('../modelos');
    
    // Mapear nombre de rol a ID
    const rolMap: { [key: string]: number } = {
      'admin': 1,
      'psicologo': 2,
      'paciente': 3,
      'recepcionista': 4
    };
    
    const rolId = rolMap[rol];
    if (!rolId) {
      res.status(400).json({ error: 'Rol inválido' });
      return;
    }
    
    const usuarios = await Usuario.findAll({
      where: { rol_id: rolId },
      attributes: ['id', 'nombres', 'apellidos', 'email', 'rol_id'],
      order: [['nombres', 'ASC']]
    });
    
    res.json({
      rol,
      rol_id: rolId,
      usuarios: usuarios.map((u: any) => ({
        id: u.id,
        nombre: `${u.nombres} ${u.apellidos}`,
        email: u.email,
        rol_id: u.rol_id
      }))
    });
  } catch (error: any) {
    console.error('🔍 Error al listar usuarios:', error);
    res.status(500).json({
      error: 'Error al listar usuarios',
      detalle: error.message || 'Error desconocido'
    });
  }
});

// Endpoint de prueba simple para verificar la base de datos
router.get('/test/db', async (req, res) => {
  try {
    console.log('🔍 Probando conexión a BD...');
    
    // Importar los modelos
    const { Chat, Usuario } = require('../modelos');
    
    // Verificar conexión
    await Chat.sequelize.authenticate();
    console.log('🔍 Conexión a BD: OK');
    
    // Contar chats
    const totalChats = await Chat.count();
    console.log('🔍 Total de chats:', totalChats);
    
    // Contar usuarios
    const totalUsuarios = await Usuario.count();
    console.log('🔍 Total de usuarios:', totalUsuarios);
    
    // Listar algunos usuarios con sus IDs y roles
    const usuarios = await Usuario.findAll({
      attributes: ['id', 'nombres', 'apellidos', 'rol_id'],
      limit: 5
    });
    
    // Listar TODOS los chats con sus detalles
    const todosLosChats = await Chat.findAll({
      include: [
        {
          model: Usuario,
          as: 'psicologo',
          attributes: ['id', 'nombres', 'apellidos']
        },
        {
          model: Usuario,
          as: 'paciente',
          attributes: ['id', 'nombres', 'apellidos']
        }
      ]
    });
    
    res.json({
      mensaje: 'Base de datos funcionando',
      totalChats,
      totalUsuarios,
      usuarios: usuarios.map((u: any) => ({
        id: u.id,
        nombre: `${u.nombres} ${u.apellidos}`,
        rol_id: u.rol_id
      })),
      chats: todosLosChats.map((chat: any) => ({
        id: chat.id,
        psicologo: chat.psicologo ? `${chat.psicologo.nombres} ${chat.psicologo.apellidos}` : 'N/A',
        psicologo_id: chat.psicologo_id,
        paciente: chat.paciente ? `${chat.paciente.nombres} ${chat.paciente.apellidos}` : 'N/A',
        paciente_id: chat.paciente_id,
        activo: chat.activo,
        tipo: chat.tipo
      }))
    });
  } catch (error: any) {
    console.error('🔍 Error en test/db:', error);
    res.status(500).json({
      error: 'Error en base de datos',
      detalle: error.message || 'Error desconocido'
    });
  }
});

// Obtener chats del usuario
router.get('/chats/:tipo_usuario/:usuario_id', ChatController.obtenerChats);

// Obtener mensajes de un chat
router.get('/mensajes/:chat_id', ChatController.obtenerMensajes);

// Enviar mensaje
router.post('/mensajes/:chat_id', ChatController.enviarMensaje);

// Marcar mensajes como leídos
router.put('/mensajes/:chat_id/leer', ChatController.marcarMensajesLeidos);

// Crear nuevo chat
router.post('/chats', ChatController.crearChat);

// Buscar usuarios para iniciar chat
router.get('/usuarios/buscar', ChatController.buscarUsuarios);

// Endpoint para crear chat de prueba entre Miguel y Salomón
router.post('/test/crear-chat-miguel-salomon', async (req, res) => {
  try {
    console.log('🔍 Creando chat de prueba entre Miguel y Salomón...');
    
    // Importar los modelos
    const { Chat, Usuario } = require('../modelos');
    
    // IDs de Miguel (psicólogo) y Salomón (paciente)
    const miguelId = 'e57db227-a6b7-4e1a-ae8d-08a7cf4d5b7b';
    const salomonId = '03a7db0e-6e57-4095-a717-5b49e6669161';
    
    // Verificar que ambos usuarios existen
    const miguel = await Usuario.findByPk(miguelId);
    const salomon = await Usuario.findByPk(salomonId);
    
    if (!miguel || !salomon) {
      res.status(400).json({ error: 'Usuario no encontrado', miguel: !!miguel, salomon: !!salomon });
      return;
    }
    
    // Crear el chat
    const nuevoChat = await Chat.create({
      psicologo_id: miguelId,
      paciente_id: salomonId,
      tipo: 'individual',
      activo: true,
      ultimo_mensaje: 'Hola Salomón, ¿cómo te sientes hoy?',
      ultimo_mensaje_timestamp: new Date(),
      no_leidos_psicologo: 0,
      no_leidos_paciente: 1,
      fecha_ultima_actividad: new Date()
    });
    
    console.log('🔍 Chat creado:', nuevoChat.id);
    
    res.json({
      mensaje: 'Chat creado exitosamente',
      chat: {
        id: nuevoChat.id,
        psicologo: `${miguel.nombres} ${miguel.apellidos}`,
        paciente: `${salomon.nombres} ${salomon.apellidos}`,
        tipo: nuevoChat.tipo,
        activo: nuevoChat.activo
      }
    });
    
  } catch (error: any) {
    console.error('🔍 Error al crear chat:', error);
    res.status(500).json({
      error: 'Error al crear chat',
      detalle: error.message || 'Error desconocido'
    });
  }
});

// Aplicar middleware de autenticación a las rutas que lo necesitan
router.use(verificarToken);

// Endpoint temporal para debug y crear chat de prueba
router.post('/debug/crear-chat-prueba', ChatController.crearChatPrueba);

// Endpoint de prueba simple
router.get('/test', (req, res) => {
  res.json({ mensaje: 'Chat API funcionando correctamente' });
});

export default router;
