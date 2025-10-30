const axios = require('axios');

async function testSesionesTerapeuticas() {
  try {
    console.log('🧪 Probando endpoints de sesiones terapéuticas...');
    
    // Primero hacer login como Laura Fernández
    const loginResponse = await axios.post('http://localhost:3002/api/v1/autenticacion/login', {
      email: 'laura.fernandez@psyche.cl',
      password: 'laura123'
    });
    
    console.log('✅ Login exitoso');
    const token = loginResponse.data.data.token;
    
    // Obtener información del paciente Test Laura
    const pacienteId = 'eb645828-696b-43a9-b82b-2ac06b5785ee'; // ID del paciente Test Laura
    
    console.log('\n1️⃣ Probando obtener información del paciente...');
    try {
      const infoPaciente = await axios.get(
        `http://localhost:3002/api/v1/sesiones-terapeuticas/pacientes/${pacienteId}/info`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      console.log('✅ Información del paciente obtenida:', infoPaciente.data.data.nombres, infoPaciente.data.data.apellidos);
    } catch (error) {
      console.log('❌ Error al obtener información del paciente:', error.response?.data?.mensaje || error.message);
    }
    
    console.log('\n2️⃣ Probando obtener historial de sesiones...');
    try {
      const historial = await axios.get(
        `http://localhost:3002/api/v1/sesiones-terapeuticas/pacientes/${pacienteId}/historial`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      console.log('✅ Historial obtenido:', historial.data.data.length, 'sesiones');
    } catch (error) {
      console.log('❌ Error al obtener historial:', error.response?.data?.mensaje || error.message);
    }
    
    // Obtener una cita existente para probar
    console.log('\n3️⃣ Probando obtener citas existentes...');
    try {
      const citas = await axios.get(
        'http://localhost:3002/api/v1/citas/psicologo',
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      
      if (citas.data.data.length > 0) {
        const citaId = citas.data.data[0].id;
        console.log('✅ Cita encontrada:', citaId);
        
        console.log('\n4️⃣ Probando iniciar sesión terapéutica...');
        try {
          const iniciarSesion = await axios.post(
            `http://localhost:3002/api/v1/sesiones-terapeuticas/citas/${citaId}/iniciar`,
            {},
            { headers: { 'Authorization': `Bearer ${token}` } }
          );
          console.log('✅ Sesión iniciada:', iniciarSesion.data.data.sesionId);
        } catch (error) {
          console.log('❌ Error al iniciar sesión:', error.response?.data?.mensaje || error.message);
        }
      } else {
        console.log('❌ No hay citas disponibles para probar');
      }
    } catch (error) {
      console.log('❌ Error al obtener citas:', error.response?.data?.mensaje || error.message);
    }
    
  } catch (error) {
    console.error('❌ Error general:', error.message);
  }
}

testSesionesTerapeuticas();


