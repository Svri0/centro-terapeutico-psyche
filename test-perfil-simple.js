// Script de prueba para verificar el endpoint de perfil
const axios = require('axios');

async function testPerfil() {
  try {
    console.log('🧪 Probando endpoint de conexión...');
    
    // 1. Probar conexión básica
    const testResponse = await axios.get('http://localhost:3002/api/v1/usuarios/test');
    console.log('✅ Conexión exitosa:', testResponse.data);
    
    // 2. Probar actualización con datos mínimos
    console.log('\n🧪 Probando actualización de perfil...');
    
    const updateData = {
      nombres: 'Test Nombre',
      apellidos: 'Test Apellido'
    };
    
    console.log('📤 Enviando datos:', updateData);
    
    const updateResponse = await axios.put(
      'http://localhost:3002/api/v1/usuarios/perfil-paciente/03a7db0e-6e57-4095-a717-5b49e6669161',
      updateData,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-token' // Token de prueba
        }
      }
    );
    
    console.log('✅ Actualización exitosa:', updateResponse.data);
    
  } catch (error) {
    console.error('💥 Error:', error.response?.data || error.message);
    if (error.response?.status === 500) {
      console.error('🔍 Error 500 - Revisar logs del backend');
    }
  }
}

testPerfil();
