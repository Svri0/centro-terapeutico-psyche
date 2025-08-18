const axios = require('axios');

async function testAuth() {
  try {
    // 1. Login
    console.log('🔍 Probando login...');
    const loginResponse = await axios.post('http://localhost:3008/api/v1/autenticacion/login', {
      email: 'laura.fernandez@psyche.cl',
      password: 'password123'
    });
    
    console.log('✅ Login exitoso');
    console.log('Token:', loginResponse.data.data.token);
    
    const token = loginResponse.data.data.token;
    const userId = loginResponse.data.data.usuario.id;
    
    console.log('User ID:', userId);
    
    // 2. Probar ruta de disponibilidad
    console.log('\n🔍 Probando ruta de disponibilidad...');
    const disponibilidadResponse = await axios.get(`http://localhost:3008/api/v1/disponibilidad/psicologo/${userId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('✅ Ruta de disponibilidad funciona');
    console.log('Response:', disponibilidadResponse.data);
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

testAuth(); 