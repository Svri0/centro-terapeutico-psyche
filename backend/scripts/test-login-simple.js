const axios = require('axios');

const BASE_URL = 'http://localhost:3003/api/v1';

async function testLogin() {
  try {
    console.log('🔍 Probando login...');
    const loginResponse = await axios.post(`${BASE_URL}/autenticacion/login`, {
      email: 'test.psicologo@psyche.cl',
      password: 'test123'
    });
    
    console.log('✅ Login exitoso');
    console.log('📊 Token:', loginResponse.data.token ? 'Presente' : 'Ausente');
    console.log('👤 Usuario:', loginResponse.data.user?.nombres, loginResponse.data.user?.apellidos);
    console.log('📋 Respuesta completa:', JSON.stringify(loginResponse.data, null, 2));
    
  } catch (error) {
    console.log('❌ Error en login');
    console.log('📊 Status:', error.response?.status);
    console.log('📝 Mensaje:', error.response?.data?.message);
    console.log('📋 Data completa:', error.response?.data);
  }
}

testLogin(); 