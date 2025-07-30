// Script de prueba para el login
const fetch = require('node-fetch');

async function testLogin() {
  try {
    console.log('🧪 Probando login...');
    
    const response = await fetch('http://localhost:3001/api/v1/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'admin@psyche.cl',
        password: 'admin123'
      })
    });

    const data = await response.json();
    
    console.log('📊 Respuesta del servidor:');
    console.log('Status:', response.status);
    console.log('Data:', JSON.stringify(data, null, 2));
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testLogin(); 