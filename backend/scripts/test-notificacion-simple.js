const axios = require('axios');

const BASE_URL = 'http://localhost:3002/api/v1';

// Datos de prueba
const psicologoTest = {
  email: 'test.psicologo@psyche.cl',
  password: 'test123'
};

const servicioTest = {
  tipo_servicio_id: 'consulta-general',
  nombre: 'Consulta Psicología General',
  descripcion: 'Consulta general de psicología',
  duracion: 60,
  categoria: 'Consulta'
};

async function testNotificacionSimple() {
  console.log('🧪 PROBANDO NOTIFICACIÓN SIMPLE');
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

    // 2. Crear primer servicio
    console.log('\n2️⃣ Creando primer servicio...');
    const crearResponse1 = await axios.post(`${BASE_URL}/servicios`, servicioTest, { headers });
    console.log('✅ Primer servicio creado:', crearResponse1.data.data.nombre);

    // 3. Intentar crear el mismo servicio (debe fallar)
    console.log('\n3️⃣ Intentando crear el mismo servicio (debe fallar)...');
    try {
      await axios.post(`${BASE_URL}/servicios`, servicioTest, { headers });
      console.log('❌ Error: No debería haber permitido crear servicio duplicado');
    } catch (error) {
      console.log('✅ Correcto: Error al crear servicio duplicado');
      console.log('📋 Mensaje de error:', error.response.data.message);
      console.log('📋 Código de estado:', error.response.status);
    }

    // 4. Limpiar servicio
    console.log('\n4️⃣ Limpiando servicio de prueba...');
    const servicioId = crearResponse1.data.data.id;
    await axios.delete(`${BASE_URL}/servicios/${servicioId}`, { headers });
    console.log('✅ Servicio eliminado');

    console.log('\n🎉 ¡PRUEBA COMPLETADA!');
    console.log('=' .repeat(40));
    console.log('📋 INSTRUCCIONES PARA PROBAR EN FRONTEND:');
    console.log('1. Ve a http://localhost:3000');
    console.log('2. Inicia sesión con: test.psicologo@psyche.cl / test123');
    console.log('3. Ve a la pestaña "Servicios"');
    console.log('4. Haz clic en "Agregar Nuevo Servicio"');
    console.log('5. Selecciona "Consulta" como categoría');
    console.log('6. Selecciona "Consulta Psicología General"');
    console.log('7. Haz clic en "Agregar Servicio"');
    console.log('8. Intenta agregar el mismo servicio nuevamente');
    console.log('9. Deberías ver: "⚠️ No se pueden agregar servicios duplicados. Ya existe un servicio con este tipo."');

  } catch (error) {
    console.error('\n❌ ERROR EN LA PRUEBA:', error.response?.data || error.message);
  }
}

// Ejecutar prueba
testNotificacionSimple(); 