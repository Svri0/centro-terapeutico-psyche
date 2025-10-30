const axios = require('axios');

async function debugError400() {
  try {
    console.log('🔍 Debugging error 400...');
    
    // Probar con el puerto 3004 (donde está corriendo el backend)
    const loginResponse = await axios.post('http://localhost:3004/api/v1/autenticacion/login', {
      email: 'laura.fernandez@psyche.cl',
      password: 'laura123'
    });
    
    console.log('✅ Login exitoso en puerto 3004');
    const token = loginResponse.data.data.token;
    
    // Probar iniciar sesión terapéutica
    const citaId = 'b57b2b9f-fa9a-4ef6-a629-eca925c7a564';
    
    console.log('\n1️⃣ Probando iniciar sesión terapéutica...');
    try {
      const iniciarSesion = await axios.post(
        `http://localhost:3004/api/v1/sesiones-terapeuticas/citas/${citaId}/iniciar`,
        {},
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      console.log('✅ Sesión iniciada:', iniciarSesion.data.data);
      
      // Verificar estado de la sesión
      console.log('\n2️⃣ Verificando estado de la sesión...');
      const estadoSesion = await axios.get(
        `http://localhost:3004/api/v1/sesiones-terapeuticas/citas/${citaId}/estado`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      console.log('✅ Estado de sesión:', estadoSesion.data.data);
      
    } catch (error) {
      console.log('❌ Error al iniciar sesión:', error.response?.data?.mensaje || error.message);
      if (error.response?.data) {
        console.log('📋 Detalles del error:', error.response.data);
      }
    }
    
  } catch (error) {
    console.error('❌ Error general:', error.message);
  }
}

debugError400();


