const axios = require('axios');

// Configuración
const API_URL = 'http://localhost:3002/api/v1';

// Credenciales del admin (que sabemos que funcionan)
const credenciales = {
  email: 'admin@terapia.cl',
  password: 'Admin123!'
};

async function debugChatError() {
  try {
    console.log('🔍 Obteniendo token para debugging...');
    
    // Hacer login
    const loginResponse = await axios.post(`${API_URL}/autenticacion/login`, credenciales);
    const token = loginResponse.data.data.token;
    console.log('✅ Token obtenido:', token.substring(0, 50) + '...');
    
    // Probar chat con diferentes datos
    console.log('\n🔍 Probando chat con diferentes configuraciones...');
    
    // Prueba 1: Datos básicos
    await probarChat(token, {
      contenido: 'Mensaje de prueba básico',
      receptor_id: 'e57db227-a6b7-4e1a-ae8d-08a7cf4d5b7b'
    }, 'Prueba 1: Datos básicos');
    
    // Prueba 2: Con ID de admin como receptor
    await probarChat(token, {
      contenido: 'Mensaje de prueba a admin',
      receptor_id: '29cac156-33cd-435e-9345-6669a9a72209'
    }, 'Prueba 2: Mensaje a admin');
    
    // Prueba 3: Con ID de Salomón como receptor
    await probarChat(token, {
      contenido: 'Mensaje de prueba a Salomón',
      receptor_id: '03a7db0e-6e57-4095-a717-5b49e6669161'
    }, 'Prueba 3: Mensaje a Salomón');
    
  } catch (error) {
    console.error('❌ Error general:', error.message);
    if (error.response) {
      console.error('❌ Respuesta del servidor:', error.response.data);
      console.error('❌ Status:', error.response.status);
    }
  }
}

async function probarChat(token, mensajeData, descripcion) {
  try {
    console.log(`\n🔍 ${descripcion}`);
    console.log('📨 Datos:', mensajeData);
    
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
    
    const response = await axios.post(`${API_URL}/chat/mensajes`, mensajeData, { headers });
    
    console.log('✅ Éxito:', response.data);
    
  } catch (error) {
    console.error(`❌ Error en ${descripcion}:`);
    console.error('  - Mensaje:', error.response?.data?.message || error.message);
    console.error('  - Error completo:', error.response?.data?.error || 'No disponible');
    console.error('  - Status:', error.response?.status || 'No disponible');
    
    // Si es error 500, mostrar más detalles
    if (error.response?.status === 500) {
      console.error('🚨 ERROR 500 - Revisar logs del backend');
    }
  }
}

// Ejecutar
debugChatError();
