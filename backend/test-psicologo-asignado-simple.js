const axios = require('axios');

async function testPsicologoAsignado() {
  try {
    console.log('🔍 Probando endpoint de psicólogo asignado...');
    
    // Primero hacer login para obtener un token válido
    console.log('🔐 Haciendo login con María...');
    const loginResponse = await axios.post('http://localhost:3002/api/v1/autenticacion/login', {
      email: 'maria.gonzalez@psyche.cl',
      password: 'password123'
    });
    
    const token = loginResponse.data.data.token;
    console.log('✅ Token obtenido:', token.substring(0, 50) + '...');
    
    // Ahora probar el endpoint del psicólogo asignado
    const response = await axios.get('http://localhost:3002/api/v1/pacientes/mi-psicologo/psicologo-asignado', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Respuesta exitosa:');
    console.log('Status:', response.status);
    console.log('Data:', JSON.stringify(response.data, null, 2));
    
    // Verificar que la imagen del psicólogo esté presente
    if (response.data.data && response.data.data.avatar_url) {
      console.log('✅ El psicólogo tiene imagen:', response.data.data.avatar_url);
    } else {
      console.log('⚠️ El psicólogo no tiene imagen asignada');
    }
    
  } catch (error) {
    console.error('❌ Error al probar endpoint:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
  }
}

testPsicologoAsignado();
