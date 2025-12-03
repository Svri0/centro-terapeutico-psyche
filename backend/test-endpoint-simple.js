const axios = require('axios');

async function testEndpointSimple() {
  try {
    console.log('🔍 Probando endpoint simple...');
    
    // Login
    const loginResponse = await axios.post('http://localhost:3006/api/v1/autenticacion/login', {
      email: 'laura.fernandez@psyche.cl',
      password: 'laura123'
    });
    
    const token = loginResponse.data.data.token;
    console.log('✅ Login exitoso');
    
    // Obtener citas
    const citasResponse = await axios.get(
      'http://localhost:3006/api/v1/citas/psicologo',
      { headers: { 'Authorization': `Bearer ${token}` } }
    );
    
    if (citasResponse.data.data.length > 0) {
      const cita = citasResponse.data.data[0];
      console.log('📋 Cita encontrada:', cita.id, cita.fecha, cita.estado);
      
      // Probar estado de sesión
      try {
        const estadoResponse = await axios.get(
          `http://localhost:3006/api/v1/sesiones-terapeuticas/citas/${cita.id}/estado`,
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
        console.log('✅ Estado obtenido:', estadoResponse.data.data);
      } catch (error) {
        console.log('❌ Error al obtener estado:', error.response?.data?.mensaje || error.message);
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testEndpointSimple();




