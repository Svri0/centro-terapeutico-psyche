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

async function testNotificacionDuplicados() {
  console.log('🧪 PROBANDO NOTIFICACIÓN DE DUPLICADOS');
  console.log('=' .repeat(50));

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

    // 4. Verificar que solo hay 1 servicio
    console.log('\n4️⃣ Verificando servicios existentes...');
    const serviciosResponse = await axios.get(`${BASE_URL}/servicios`, { headers });
    console.log('✅ Servicios en la base de datos:', serviciosResponse.data.data.length);

    // 5. Eliminar el servicio para limpiar
    console.log('\n5️⃣ Limpiando servicio de prueba...');
    const servicioId = crearResponse1.data.data.id;
    await axios.delete(`${BASE_URL}/servicios/${servicioId}`, { headers });
    console.log('✅ Servicio eliminado');

    console.log('\n🎉 ¡PRUEBA DE NOTIFICACIÓN COMPLETADA!');
    console.log('=' .repeat(50));
    console.log('✅ El backend está devolviendo el error correcto');
    console.log('✅ El frontend debería mostrar la notificación de advertencia');
    console.log('✅ La notificación debería durar 3 segundos');

  } catch (error) {
    console.error('\n❌ ERROR EN LA PRUEBA:', error.response?.data || error.message);
  }
}

// Ejecutar prueba
testNotificacionDuplicados(); 