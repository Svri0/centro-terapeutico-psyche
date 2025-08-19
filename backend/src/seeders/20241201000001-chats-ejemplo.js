'use strict';

const { v4: uuidv4 } = require('uuid');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Obtener usuarios existentes con JOIN a roles
    const usuarios = await queryInterface.sequelize.query(
      `SELECT u.id, u.nombres, r.nombre as rol 
       FROM usuarios u 
       JOIN roles r ON u.rol_id = r.id 
       WHERE r.nombre IN ('psicologo', 'paciente') 
       LIMIT 10`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    if (usuarios.length < 2) {
      console.log('No hay suficientes usuarios para crear chats de ejemplo');
      return;
    }

    const psicologos = usuarios.filter(u => u.rol === 'psicologo');
    const pacientes = usuarios.filter(u => u.rol === 'paciente');

    if (psicologos.length === 0 || pacientes.length === 0) {
      console.log('No hay psicólogos o pacientes para crear chats de ejemplo');
      return;
    }

    // Crear chats de ejemplo
    const chats = [];
    const mensajes = [];

    // Crear un chat por cada paciente con el primer psicólogo
    for (let i = 0; i < Math.min(pacientes.length, 3); i++) {
      const paciente = pacientes[i];
      const psicologo = psicologos[0]; // Usar el primer psicólogo disponible

      const chatId = uuidv4();
      
      chats.push({
        id: chatId,
        tipo: 'individual',
        psicologo_id: psicologo.id,
        paciente_id: paciente.id,
        ultimo_mensaje: `Hola ${paciente.nombres || 'Paciente'}, ¿cómo te sientes hoy?`,
        ultimo_mensaje_timestamp: new Date(Date.now() - Math.random() * 1000 * 60 * 60 * 24), // Últimas 24 horas
        ultimo_mensaje_remitente: psicologo.id,
        no_leidos_psicologo: Math.floor(Math.random() * 3),
        no_leidos_paciente: Math.floor(Math.random() * 3),
        activo: true,
        fecha_creacion: new Date(),
        fecha_ultima_actividad: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Crear algunos mensajes de ejemplo para este chat
      const mensajesEjemplo = [
        {
          id: uuidv4(),
          chat_id: chatId,
          remitente_id: psicologo.id,
          contenido: `Hola ${paciente.nombres || 'Paciente'}, ¿cómo te sientes hoy?`,
          tipo: 'texto',
          leido: true,
          fecha_envio: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 horas atrás
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: uuidv4(),
          chat_id: chatId,
          remitente_id: paciente.id,
          contenido: 'Me siento mucho mejor, gracias por preguntar',
          tipo: 'texto',
          leido: true,
          fecha_envio: new Date(Date.now() - 1000 * 60 * 60), // 1 hora atrás
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: uuidv4(),
          chat_id: chatId,
          remitente_id: psicologo.id,
          contenido: '¿Has estado practicando los ejercicios que te di?',
          tipo: 'texto',
          leido: false,
          fecha_envio: new Date(Date.now() - 1000 * 60 * 30), // 30 minutos atrás
          createdAt: new Date(),
          updatedAt: new Date(),
        }
      ];

      mensajes.push(...mensajesEjemplo);
    }

    // Insertar chats
    if (chats.length > 0) {
      await queryInterface.bulkInsert('chats', chats, {});
      console.log(`✅ Se crearon ${chats.length} chats de ejemplo`);
    }

    // Insertar mensajes
    if (mensajes.length > 0) {
      await queryInterface.bulkInsert('mensajes_chat', mensajes, {});
      console.log(`✅ Se crearon ${mensajes.length} mensajes de ejemplo`);
    }
  },

  down: async (queryInterface, Sequelize) => {
    // Eliminar mensajes primero (por las foreign keys)
    await queryInterface.bulkDelete('mensajes_chat', null, {});
    
    // Eliminar chats
    await queryInterface.bulkDelete('chats', null, {});
    
    console.log('✅ Se eliminaron todos los chats y mensajes de ejemplo');
  }
};
