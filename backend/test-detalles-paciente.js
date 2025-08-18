const axios = require('axios');

async function testDetallesPaciente() {
  try {
    console.log('🔍 Probando endpoint de detalles del paciente...');
    
    // Primero hacer login con la Dra. Laura Fernández (psicóloga)
    console.log('🔐 Haciendo login con Dra. Laura Fernández...');
    const loginResponse = await axios.post('http://localhost:3002/api/v1/autenticacion/login', {
      email: 'laura.fernandez@psyche.cl',
      password: 'ola123321'
    });
    
    const token = loginResponse.data.data.token;
    console.log('✅ Token obtenido:', token.substring(0, 50) + '...');
    console.log('👤 Usuario logueado:', loginResponse.data.data.usuario.nombres, loginResponse.data.data.usuario.apellidos);
    
    // Obtener la lista de pacientes para ver qué IDs están disponibles
    console.log('\n📋 Obteniendo lista de pacientes...');
    const pacientesResponse = await axios.get('http://localhost:3002/api/v1/pacientes', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Pacientes obtenidos:', pacientesResponse.data.data.pacientes.length);
    
    if (pacientesResponse.data.data.pacientes.length > 0) {
      const primerPaciente = pacientesResponse.data.data.pacientes[0];
      console.log('👤 Primer paciente:', primerPaciente.nombres, primerPaciente.apellidos, 'ID:', primerPaciente.id);
      
      // Ahora probar el endpoint de detalles del paciente
      console.log('\n🔍 Obteniendo detalles del paciente...');
      const detallesResponse = await axios.get(`http://localhost:3002/api/v1/pacientes/${primerPaciente.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('✅ Detalles del paciente obtenidos exitosamente:');
      console.log('📄 Datos del paciente:', JSON.stringify(detallesResponse.data.data, null, 2));
      
    } else {
      console.log('❌ No hay pacientes disponibles para probar');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

testDetallesPaciente();
