const axios = require('axios');

async function debugError400Frontend() {
  try {
    console.log('🔍 Debugging error 400 desde frontend...');
    
    // Probar con el puerto 3006 (donde está corriendo el backend)
    const loginResponse = await axios.post('http://localhost:3006/api/v1/autenticacion/login', {
      email: 'laura.fernandez@psyche.cl',
      password: 'laura123'
    });
    
    console.log('✅ Login exitoso en puerto 3006');
    const token = loginResponse.data.data.token;
    
    // Obtener citas existentes
    console.log('\n1️⃣ Obteniendo citas existentes...');
    const citasResponse = await axios.get(
      'http://localhost:3006/api/v1/citas/psicologo',
      { headers: { 'Authorization': `Bearer ${token}` } }
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
      
      // Probar iniciar sesión terapéutica
      console.log('\n2️⃣ Probando iniciar sesión terapéutica...');
      try {
        const iniciarSesion = await axios.post(
          `http://localhost:3006/api/v1/sesiones-terapeuticas/citas/${cita.id}/iniciar`,
          {},
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
        console.log('✅ Sesión iniciada:', iniciarSesion.data.data);
        
        // Verificar estado de la sesión
        console.log('\n3️⃣ Verificando estado de la sesión...');
        const estadoSesion = await axios.get(
          `http://localhost:3006/api/v1/sesiones-terapeuticas/citas/${cita.id}/estado`,
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
        console.log('✅ Estado de sesión:', estadoSesion.data.data);
        
        // Probar obtener información del paciente
        console.log('\n4️⃣ Probando obtener información del paciente...');
        const infoPaciente = await axios.get(
          `http://localhost:3006/api/v1/sesiones-terapeuticas/pacientes/${cita.paciente_id}/info`,
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
        console.log('✅ Información del paciente:', infoPaciente.data.data.nombres, infoPaciente.data.data.apellidos);
        
        // Probar obtener historial
        console.log('\n5️⃣ Probando obtener historial...');
        const historial = await axios.get(
          `http://localhost:3006/api/v1/sesiones-terapeuticas/pacientes/${cita.paciente_id}/historial`,
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
        console.log('✅ Historial obtenido:', historial.data.data.length, 'sesiones');
        
      } catch (error) {
        console.log('❌ Error al iniciar sesión:', error.response?.data?.mensaje || error.message);
        if (error.response?.data) {
          console.log('📋 Detalles del error:', error.response.data);
        }
      }
    } else {
      console.log('❌ No hay citas disponibles para probar');
    }
    
  } catch (error) {
    console.error('❌ Error general:', error.message);
  }
}

debugError400Frontend();




