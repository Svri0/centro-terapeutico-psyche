const axios = require('axios');

async function testLoginLaura() {
  try {
    console.log('🔐 Probando login con Dra. Laura Fernández...');
    const response = await axios.post('http://localhost:3002/api/v1/autenticacion/login', {
      email: 'laura.fernandez@psyche.cl',
      password: 'psicologo123'
    });
    
    console.log('✅ Login exitoso:');
    console.log('Email:', response.data.data.usuario.email);
    console.log('Nombre:', response.data.data.usuario.nombres, response.data.data.usuario.apellidos);
    console.log('Rol:', response.data.data.usuario.rol);
    console.log('Avatar URL:', response.data.data.usuario.avatar_url);
    console.log('Token:', response.data.data.token.substring(0, 50) + '...');
    
    return response.data.data;
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

testLoginLaura();
