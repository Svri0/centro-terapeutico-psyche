const axios = require('axios');

async function testFrontendConnection() {
  try {
    console.log('🔍 Probando conexión desde frontend...');
    
    // Probar login
    console.log('1️⃣ Probando login...');
    const loginResponse = await axios.post('http://localhost:3002/api/v1/autenticacion/login', {
      email: 'laura.fernandez@psyche.cl',
      password: 'laura123'
    });
    console.log('✅ Login exitoso');
    
    const token = loginResponse.data.data.token;
    
    // Probar endpoint de sesiones terapéuticas
    console.log('2️⃣ Probando endpoint de sesiones terapéuticas...');
    const citaId = 'b57b2b9f-fa9a-4ef6-a629-eca925c7a564';
    
    try {
      const estadoResponse = await axios.get(
        `http://localhost:3002/api/v1/sesiones-terapeuticas/citas/${citaId}/estado`,
        { 
          headers: { 'Authorization': `Bearer ${token}` },
          timeout: 10000
        }
      );
      console.log('✅ Estado de sesión obtenido:', estadoResponse.data.data);
      
      // Probar obtener información del paciente
      console.log('3️⃣ Probando obtener información del paciente...');
      const pacienteId = 'fc20bb77-bbdd-402f-b49c-df51778a0a47';
      const infoPaciente = await axios.get(
        `http://localhost:3002/api/v1/sesiones-terapeuticas/pacientes/${pacienteId}/info`,
        { 
          headers: { 'Authorization': `Bearer ${token}` },
          timeout: 10000
        }
      );
      console.log('✅ Información del paciente obtenida:', infoPaciente.data.data.nombres, infoPaciente.data.data.apellidos);
      
    } catch (error) {
      console.log('❌ Error en endpoint de sesiones:', error.response?.data?.mensaje || error.message);
      if (error.response?.data) {
        console.log('📋 Detalles del error:', JSON.stringify(error.response.data, null, 2));
      }
    }
    
  } catch (error) {
    console.error('❌ Error general:', error.message);
    if (error.response) {
      console.error('📋 Detalles del error:', error.response.data);
    }
  }
}

testFrontendConnection();

