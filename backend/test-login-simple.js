const axios = require('axios');

async function testLogin() {
  const testUsers = [
    { email: 'maria.gonzalez@psyche.cl', password: 'password123' },
    { email: 'maria@psyche.cl', password: 'password123' },
    { email: 'paciente@psyche.cl', password: 'password123' },
    { email: 'test@psyche.cl', password: 'password123' }
  ];

  for (const user of testUsers) {
    try {
      console.log(`🔐 Probando login con: ${user.email}`);
      const response = await axios.post('http://localhost:3002/api/v1/autenticacion/login', user);
      console.log('✅ Login exitoso:', response.data.data.email);
      console.log('Token:', response.data.data.token.substring(0, 50) + '...');
      console.log('Rol:', response.data.data.rol);
      console.log('---');
      return response.data.data;
    } catch (error) {
      console.log('❌ Login fallido:', error.response?.data?.mensaje || error.message);
      console.log('---');
    }
  }
}

testLogin();
