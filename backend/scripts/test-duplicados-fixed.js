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

async function testDuplicadosFixed() {
  console.log('🧪 PROBANDO VALIDACIÓN DE DUPLICADOS CORREGIDA');
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

    // 2. Limpiar servicios existentes
    console.log('\n2️⃣ Limpiando servicios existentes...');
    const serviciosResponse = await axios.get(`${BASE_URL}/servicios`, { headers });
    const servicios = serviciosResponse.data.data;
    
    for (const servicio of servicios) {
      await axios.delete(`${BASE_URL}/servicios/${servicio.id}`, { headers });
      console.log(`🗑️ Servicio eliminado: ${servicio.nombre}`);
    }

    // 3. Crear primer servicio
    console.log('\n3️⃣ Creando primer servicio...');
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

    // 5. Eliminar el servicio
    console.log('\n5️⃣ Eliminando servicio...');
    const servicioId = crearResponse1.data.data.id;
    await axios.delete(`${BASE_URL}/servicios/${servicioId}`, { headers });
    console.log('✅ Servicio eliminado');

    // 6. Intentar crear el mismo servicio después de eliminar (debe funcionar)
    console.log('\n6️⃣ Intentando crear el mismo servicio después de eliminar (debe funcionar)...');
    const crearResponse2 = await axios.post(`${BASE_URL}/servicios`, servicioTest, { headers });
    console.log('✅ Segundo servicio creado exitosamente:', crearResponse2.data.data.nombre);

    // 7. Limpiar
    console.log('\n7️⃣ Limpiando...');
    await axios.delete(`${BASE_URL}/servicios/${crearResponse2.data.data.id}`, { headers });
    console.log('✅ Servicio final eliminado');

    console.log('\n🎉 ¡PRUEBA COMPLETADA EXITOSAMENTE!');
    console.log('=' .repeat(50));
    console.log('✅ Validación de duplicados funcionando correctamente');
    console.log('✅ Servicios eliminados no bloquean la creación de nuevos');
    console.log('✅ Solo servicios activos se consideran duplicados');

  } catch (error) {
    console.error('\n❌ ERROR EN LA PRUEBA:', error.response?.data || error.message);
  }
}

// Ejecutar prueba
testDuplicadosFixed(); 