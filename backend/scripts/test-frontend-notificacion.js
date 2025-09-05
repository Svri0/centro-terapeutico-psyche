const axios = require('axios');

const BASE_URL = 'http://localhost:3002/api/v1';
const FRONTEND_URL = 'http://localhost:3000';

// Datos de prueba
const psicologoTest = {
  email: 'test.psicologo@psyche.cl',
  password: 'test123'
};

async function testFrontendNotificacion() {
  console.log('🧪 PROBANDO NOTIFICACIÓN EN FRONTEND');
  console.log('=' .repeat(50));

  try {
    // 1. Verificar que el frontend está disponible
    console.log('\n1️⃣ Verificando frontend...');
    try {
      const frontendResponse = await axios.get(FRONTEND_URL);
      console.log('✅ Frontend disponible en:', FRONTEND_URL);
    } catch (error) {
      console.log('⚠️ Frontend no disponible en:', FRONTEND_URL);
      console.log('💡 Asegúrate de que el frontend esté ejecutándose en el puerto 3000');
    }

    // 2. Login del psicólogo
    console.log('\n2️⃣ Login del psicólogo...');
    const loginResponse = await axios.post(`${BASE_URL}/autenticacion/login`, psicologoTest);
    const token = loginResponse.data.data.token;
    console.log('✅ Login exitoso');

    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    // 3. Crear primer servicio
    console.log('\n3️⃣ Creando primer servicio...');
    const servicioTest = {
      tipo_servicio_id: 'consulta-general',
      nombre: 'Consulta Psicología General',
      descripcion: 'Consulta general de psicología',
      duracion: 60,
      categoria: 'Consulta'
    };

    const crearResponse1 = await axios.post(`${BASE_URL}/servicios`, servicioTest, { headers });
    console.log('✅ Primer servicio creado:', crearResponse1.data.data.nombre);

    // 4. Intentar crear el mismo servicio (debe fallar)
    console.log('\n4️⃣ Intentando crear el mismo servicio (debe fallar)...');
    try {
      await axios.post(`${BASE_URL}/servicios`, servicioTest, { headers });
      console.log('❌ Error: No debería haber permitido crear servicio duplicado');
    } catch (error) {
      console.log('✅ Correcto: Error al crear servicio duplicado');
      console.log('📋 Mensaje de error:', error.response.data.message);
      console.log('📋 Código de estado:', error.response.status);
    }

    // 5. Limpiar servicio
    console.log('\n5️⃣ Limpiando servicio de prueba...');
    const servicioId = crearResponse1.data.data.id;
    await axios.delete(`${BASE_URL}/servicios/${servicioId}`, { headers });
    console.log('✅ Servicio eliminado');

    console.log('\n🎉 ¡PRUEBA COMPLETADA!');
    console.log('=' .repeat(50));
    console.log('📋 INSTRUCCIONES PARA PROBAR EN FRONTEND:');
    console.log('1. Ve a http://localhost:3000');
    console.log('2. Inicia sesión con: test.psicologo@psyche.cl / test123');
    console.log('3. Ve a la pestaña "Servicios"');
    console.log('4. Haz clic en "Agregar Nuevo Servicio"');
    console.log('5. Selecciona "Consulta" como categoría');
    console.log('6. Selecciona "Consulta Psicología General"');
    console.log('7. Haz clic en "Agregar Servicio"');
    console.log('8. Intenta agregar el mismo servicio nuevamente');
    console.log('9. Deberías ver una notificación amarilla de advertencia por 3 segundos');

  } catch (error) {
    console.error('\n❌ ERROR EN LA PRUEBA:', error.response?.data || error.message);
  }
}

// Ejecutar prueba
testFrontendNotificacion(); 