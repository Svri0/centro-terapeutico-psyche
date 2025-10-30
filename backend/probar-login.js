const axios = require('axios');

async function probarLogin() {
  const passwords = [
    'password123',
    '123456',
    'admin123',
    'laura123',
    'psyche123',
    'password',
    '123456789',
    'admin',
    'laura',
    'test123'
  ];

  console.log('🔐 Probando diferentes contraseñas para Laura Fernández...\n');

  for (const password of passwords) {
    try {
      console.log(`🔑 Probando contraseña: "${password}"`);
      
      const response = await axios.post('http://localhost:3002/api/v1/autenticacion/login', {
        email: 'laura.fernandez@psyche.cl',
        password: password
      });

      console.log('✅ ¡LOGIN EXITOSO!');
      console.log('Contraseña correcta:', password);
      console.log('Token:', response.data.data.token);
      console.log('Usuario:', response.data.data.usuario);
      break;

    } catch (error) {
      if (error.response?.status === 401) {
        console.log('❌ Contraseña incorrecta');
      } else {
        console.log('❌ Error:', error.response?.data?.mensaje || error.message);
      }
    }
    
    console.log('---');
  }
}

probarLogin();


