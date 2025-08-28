require('dotenv').config();
const axios = require('axios');

async function testCitasPaciente() {
  console.log('🧪 Probando obtener citas del paciente...\n');
  
  try {
    // Primero, hacer login como paciente para obtener token
    console.log('1️⃣ Haciendo login como paciente...');
    
    const loginResponse = await axios.post('http://localhost:3001/api/auth/login', {
      email: 'paciente@test.com', // Cambia por un email de paciente real
      password: 'password123'     // Cambia por la contraseña real
    });
    
    if (!loginResponse.data.success) {
      console.log('❌ Login falló:', loginResponse.data);
      return;
    }
    
    const token = loginResponse.data.data.token;
    console.log('✅ Login exitoso, token obtenido');
    
    // Ahora probar obtener citas del paciente
    console.log('\n2️⃣ Obteniendo citas del paciente...');
    
    const citasResponse = await axios.get('http://localhost:3001/api/citas/paciente', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('✅ Respuesta del backend:');
    console.log('Status:', citasResponse.status);
    console.log('Data:', JSON.stringify(citasResponse.data, null, 2));
    
    if (citasResponse.data.success) {
      console.log('\n🎉 ¡Funciona! El backend devuelve citas correctamente');
      console.log('📊 Total de citas:', citasResponse.data.data?.length || 0);
    } else {
      console.log('\n⚠️ El backend responde pero sin éxito');
    }
    
  } catch (error) {
    console.error('❌ Error en la prueba:', error.message);
    
    if (error.response) {
      console.log('📊 Detalles del error:');
      console.log('Status:', error.response.status);
      console.log('Data:', error.response.data);
    }
  }
}

testCitasPaciente();
