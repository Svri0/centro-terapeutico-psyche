const axios = require('axios');

async function testPsicologoAsignadoFinal() {
  try {
    console.log('🔍 Probando endpoint de psicólogo asignado...');
    
    // Primero hacer login con María González (paciente)
    console.log('🔐 Haciendo login con María González...');
    const loginResponse = await axios.post('http://localhost:3002/api/v1/autenticacion/login', {
      email: 'maria.gonzalez.paciente@email.com',
      password: 'password123'
    });
    
    const token = loginResponse.data.data.token;
    console.log('✅ Token obtenido:', token.substring(0, 50) + '...');
    console.log('👤 Usuario logueado:', loginResponse.data.data.usuario.nombres, loginResponse.data.data.usuario.apellidos);
    
    // Ahora probar el endpoint del psicólogo asignado
    console.log('\n🔍 Obteniendo información del psicólogo asignado...');
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
      console.log('\n✅ El psicólogo tiene imagen:', response.data.data.avatar_url);
      console.log('👨‍⚕️ Psicólogo:', response.data.data.nombres, response.data.data.apellidos);
    } else {
      console.log('\n⚠️ El psicólogo no tiene imagen asignada');
      console.log('👨‍⚕️ Psicólogo:', response.data.data.nombres, response.data.data.apellidos);
    }
    
  } catch (error) {
    console.error('❌ Error al probar endpoint:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('Error:', error.message);
    }
  }
}

testPsicologoAsignadoFinal();
