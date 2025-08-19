const axios = require('axios');

const BASE_URL = 'http://localhost:3002/api/v1';
let token = '';

// Función para hacer login
async function login(email, password) {
  try {
    const response = await axios.post(`${BASE_URL}/autenticacion/login`, {
      email,
      password
    });
    
    token = response.data.data.token;
    console.log('✅ Login exitoso');
    return response.data.data.usuario;
  } catch (error) {
    console.error('❌ Error en login:', error.response?.data || error.message);
    throw error;
  }
}

// Función para obtener chats
async function obtenerChats(tipoUsuario, usuarioId) {
  try {
    const response = await axios.get(`${BASE_URL}/chat/chats/${tipoUsuario}/${usuarioId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log(`✅ Chats obtenidos para ${tipoUsuario}:`, response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error al obtener chats:', error.response?.data || error.message);
    throw error;
  }
}

// Función para obtener mensajes de un chat
async function obtenerMensajes(chatId) {
  try {
    const response = await axios.get(`${BASE_URL}/chat/mensajes/${chatId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log(`✅ Mensajes obtenidos para chat ${chatId}:`, response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error al obtener mensajes:', error.response?.data || error.message);
    throw error;
  }
}

// Función para enviar un mensaje
async function enviarMensaje(chatId, contenido, remitenteId) {
  try {
    const response = await axios.post(`${BASE_URL}/chat/mensajes/${chatId}`, {
      contenido,
      tipo: 'texto',
      remitente_id: remitenteId
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log(`✅ Mensaje enviado:`, response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error al enviar mensaje:', error.response?.data || error.message);
    throw error;
  }
}

// Función para crear un chat
async function crearChat(psicologoId, pacienteId) {
  try {
    const response = await axios.post(`${BASE_URL}/chat/chats`, {
      psicologo_id: psicologoId,
      paciente_id: pacienteId,
      tipo: 'individual'
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log(`✅ Chat creado:`, response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error al crear chat:', error.response?.data || error.message);
    throw error;
  }
}

// Función para buscar usuarios
async function buscarUsuarios(query, tipoUsuario, usuarioActualId) {
  try {
    const response = await axios.get(`${BASE_URL}/chat/usuarios/buscar`, {
      params: { q: query, tipo_usuario: tipoUsuario, usuario_actual_id: usuarioActualId },
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log(`✅ Usuarios encontrados:`, response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error al buscar usuarios:', error.response?.data || error.message);
    throw error;
  }
}

// Función principal de prueba
async function testChat() {
  try {
    console.log('🚀 Iniciando pruebas del sistema de chat...\n');

    // 1. Login como psicólogo
    console.log('1️⃣ Login como psicólogo...');
    const psicologo = await login('psicologo@test.com', 'password123');
    console.log(`   Usuario: ${psicologo.nombres} ${psicologo.apellidos} (${psicologo.rol})\n`);

    // 2. Obtener chats del psicólogo
    console.log('2️⃣ Obteniendo chats del psicólogo...');
    const chatsPsicologo = await obtenerChats('psicologo', psicologo.id);
    console.log(`   Total de chats: ${chatsPsicologo.total}\n`);

    // 3. Si hay chats, obtener mensajes del primero
    if (chatsPsicologo.chats && chatsPsicologo.chats.length > 0) {
      const primerChat = chatsPsicologo.chats[0];
      console.log('3️⃣ Obteniendo mensajes del primer chat...');
      await obtenerMensajes(primerChat.id);
      console.log('');

      // 4. Enviar un mensaje
      console.log('4️⃣ Enviando mensaje...');
      await enviarMensaje(primerChat.id, 'Hola, ¿cómo estás hoy?', psicologo.id);
      console.log('');

      // 5. Obtener mensajes actualizados
      console.log('5️⃣ Obteniendo mensajes actualizados...');
      await obtenerMensajes(primerChat.id);
      console.log('');
    }

    // 6. Buscar usuarios
    console.log('6️⃣ Buscando usuarios...');
    await buscarUsuarios('paciente', 'psicologo', psicologo.id);
    console.log('');

    console.log('✅ Todas las pruebas completadas exitosamente!');
    
  } catch (error) {
    console.error('💥 Error en las pruebas:', error.message);
  }
}

// Ejecutar pruebas si se llama directamente
if (require.main === module) {
  testChat();
}

module.exports = {
  login,
  obtenerChats,
  obtenerMensajes,
  enviarMensaje,
  crearChat,
  buscarUsuarios,
  testChat
};
