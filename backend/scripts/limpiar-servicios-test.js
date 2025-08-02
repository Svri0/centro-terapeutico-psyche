const axios = require('axios');

const BASE_URL = 'http://localhost:3002/api/v1';

// Datos de prueba
const psicologoTest = {
  email: 'test.psicologo@psyche.cl',
  password: 'test123'
};

async function limpiarServiciosTest() {
  console.log('🧹 LIMPIANDO SERVICIOS DE PRUEBA');
  console.log('=' .repeat(40));

  try {
    // 1. Login del psicólogo
    console.log('\n1️⃣ Login del psicólogo...');
    const loginResponse = await axios.post(`${BASE_URL}/autenticacion/login`, psicologoTest);
    const token = loginResponse.data.data.token;
    console.log('✅ Login exitoso');

    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    // 2. Obtener todos los servicios
    console.log('\n2️⃣ Obteniendo servicios existentes...');
    const serviciosResponse = await axios.get(`${BASE_URL}/servicios`, { headers });
    const servicios = serviciosResponse.data.data;
    console.log(`📋 Encontrados ${servicios.length} servicios`);

    // 3. Eliminar todos los servicios
    console.log('\n3️⃣ Eliminando servicios...');
    for (const servicio of servicios) {
      try {
        await axios.delete(`${BASE_URL}/servicios/${servicio.id}`, { headers });
        console.log(`✅ Eliminado: ${servicio.nombre}`);
      } catch (error) {
        console.log(`⚠️ Error al eliminar ${servicio.nombre}:`, error.response?.data?.message || error.message);
      }
    }

    // 4. Verificar que no quedan servicios
    console.log('\n4️⃣ Verificando limpieza...');
    const serviciosFinalResponse = await axios.get(`${BASE_URL}/servicios`, { headers });
    console.log(`✅ Servicios restantes: ${serviciosFinalResponse.data.data.length}`);

    console.log('\n🎉 ¡LIMPIEZA COMPLETADA!');
    console.log('=' .repeat(40));

  } catch (error) {
    console.error('\n❌ ERROR EN LA LIMPIEZA:', error.response?.data || error.message);
  }
}

// Ejecutar limpieza
limpiarServiciosTest(); 