const axios = require('axios');

async function testLoginAdmin() {
  try {
    console.log('🔐 Probando login con admin...');
    const response = await axios.post('http://localhost:3002/api/v1/autenticacion/login', {
      email: 'admin@terapia.cl',
      password: 'Admin123!'
    });
    
    console.log('✅ Login exitoso:');
    console.log('Email:', response.data.data.email);
    console.log('Rol:', response.data.data.rol);
    console.log('Token:', response.data.data.token.substring(0, 50) + '...');
    
    return response.data.data;
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

testLoginAdmin();
