const axios = require('axios');

async function diagnosticoSimple() {
  try {
    console.log('🔍 Diagnóstico simple...');
    
    // Probar login
    console.log('1️⃣ Probando login...');
    const loginResponse = await axios.post('http://localhost:3006/api/v1/autenticacion/login', {
      email: 'laura.fernandez@psyche.cl',
      password: 'laura123'
    });
    console.log('✅ Login exitoso');
    
    const token = loginResponse.data.data.token;
    
    // Probar obtener citas
    console.log('2️⃣ Probando obtener citas...');
    const citasResponse = await axios.get(
      'http://localhost:3006/api/v1/citas/psicologo',
      { 
        headers: { 'Authorization': `Bearer ${token}` },
        timeout: 10000
      }
    );
    console.log('✅ Citas obtenidas:', citasResponse.data.data.length);
    
    if (citasResponse.data.data.length > 0) {
      const cita = citasResponse.data.data[0];
      console.log('📋 Primera cita:', {
        id: cita.id,
        fecha: cita.fecha,
        estado: cita.estado,
        paciente: cita.paciente_nombres + ' ' + cita.paciente_apellidos
      });
      
      // Probar endpoint de estado de sesión
      console.log('3️⃣ Probando endpoint de estado de sesión...');
      try {
        const estadoResponse = await axios.get(
          `http://localhost:3006/api/v1/sesiones-terapeuticas/citas/${cita.id}/estado`,
          { 
            headers: { 'Authorization': `Bearer ${token}` },
            timeout: 10000
          }
        );
        console.log('✅ Estado de sesión obtenido:', estadoResponse.data.data);
      } catch (error) {
        console.log('❌ Error al obtener estado de sesión:', error.response?.data?.mensaje || error.message);
        if (error.response?.data) {
          console.log('📋 Detalles del error:', JSON.stringify(error.response.data, null, 2));
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Error general:', error.message);
    if (error.response) {
      console.error('📋 Detalles del error:', error.response.data);
    }
  }
}

diagnosticoSimple();


