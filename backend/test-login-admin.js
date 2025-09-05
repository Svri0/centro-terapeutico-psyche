const axios = require('axios');

// Configuración
const API_URL = 'http://localhost:3002/api/v1';

// Credenciales del admin (del seeder)
const credenciales = {
  email: 'admin@terapia.cl',
  password: 'Admin123!'
};

async function testLoginAdmin() {
  try {
    console.log('🔍 Probando login con Admin...');
    console.log('🔍 Credenciales:', credenciales);
    
    // Hacer login para obtener token
    const response = await axios.post(`${API_URL}/autenticacion/login`, credenciales);
    
    if (response.data.success) {
      const token = response.data.data.token;
      console.log('✅ Login exitoso con Admin');
      console.log('🔑 Token:', token.substring(0, 50) + '...');
      
      // Ahora probar el chat con el token válido
      await probarChatConToken(token);
      
    } else {
      console.log('❌ Login falló:', response.data);
    }
    
  } catch (error) {
    console.error('❌ Error al hacer login:', error.response?.data || error.message);
  }
}

async function probarChatConToken(token) {
  try {
    console.log('\n🔍 Probando chat con token válido...');
    
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
    
    const mensajeData = {
      contenido: 'Mensaje de prueba con token válido',
      receptor_id: 'e57db227-a6b7-4e1a-ae8d-08a7cf4d5b7b'
    };
    
    console.log('🔍 Enviando mensaje...');
    const response = await axios.post(`${API_URL}/chat/mensajes`, mensajeData, { headers });
    
    console.log('✅ Mensaje enviado exitosamente');
    console.log('📨 Respuesta:', response.data);
    
  } catch (error) {
    console.error('❌ Error al enviar mensaje:', error.response?.data || error.message);
  }
}

// Ejecutar
testLoginAdmin();
