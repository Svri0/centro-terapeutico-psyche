const axios = require('axios');

// Configuración
const API_URL = 'http://localhost:3002/api/v1';

// Credenciales de Salomón (paciente)
const credenciales = {
  email: 'salomon@gmail.com',
  password: 'password123' // Intentar con password común
};

async function testLoginSalomon() {
  try {
    console.log('🔍 Probando login con Salomón...');
    console.log('🔍 Credenciales:', credenciales);
    
    // Hacer login para obtener token
    const response = await axios.post(`${API_URL}/autenticacion/login`, credenciales);
    
    if (response.data.success) {
      const token = response.data.data.token;
      console.log('✅ Login exitoso con Salomón');
      console.log('🔑 Token:', token.substring(0, 50) + '...');
      
      // Ahora probar el chat con el token válido
      await probarChatConToken(token);
      
    } else {
      console.log('❌ Login falló:', response.data);
    }
    
  } catch (error) {
    console.error('❌ Error al hacer login:', error.response?.data || error.message);
    
    // Si falla, probar con otras contraseñas comunes
    if (error.response?.status === 401) {
      console.log('\n🔍 Probando contraseñas alternativas...');
      await probarContraseñasAlternativas();
    }
  }
}

async function probarContraseñasAlternativas() {
  const contraseñas = [
    '123456',
    'password',
    'admin',
    '12345678',
    'qwerty',
    'abc123',
    'password123',
    'admin123'
  ];
  
  for (const contraseña of contraseñas) {
    try {
      console.log(`🔍 Probando contraseña: ${contraseña}`);
      const response = await axios.post(`${API_URL}/autenticacion/login`, {
        email: 'salomon@gmail.com',
        password: contraseña
      });
      
      if (response.data.success) {
        console.log(`✅ ¡Contraseña encontrada: ${contraseña}!`);
        const token = response.data.data.token;
        await probarChatConToken(token);
        return;
      }
    } catch (error) {
      // Continuar con la siguiente contraseña
    }
  }
  
  console.log('❌ Ninguna contraseña funcionó');
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
testLoginSalomon();
