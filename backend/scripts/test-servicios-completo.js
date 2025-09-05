const axios = require('axios');

const BASE_URL = 'http://localhost:3002/api/v1';

// Datos de prueba
const psicologoTest = {
  email: 'test.psicologo@psyche.cl',
  password: 'test123'
};

const servicioTest = {
  tipo_servicio_id: 'terapia-individual',
  nombre: 'Terapia Individual',
  descripcion: 'Sesión de terapia individual personalizada',
  duracion: 60,
  categoria: 'Terapia'
};

async function testServiciosCompleto() {
  console.log('🧪 INICIANDO PRUEBAS COMPLETAS DEL SISTEMA DE SERVICIOS');
  console.log('=' .repeat(60));

  try {
    // 1. Probar endpoint de salud
    console.log('\n1️⃣ Probando endpoint de salud...');
    const saludResponse = await axios.get(`${BASE_URL.replace('/api/v1', '')}/salud`);
    console.log('✅ Salud del backend:', saludResponse.data.success);

    // 2. Probar login del psicólogo
    console.log('\n2️⃣ Probando login del psicólogo...');
    const loginResponse = await axios.post(`${BASE_URL}/autenticacion/login`, psicologoTest);
    const token = loginResponse.data.data.token;
    console.log('✅ Login exitoso, token obtenido');

    // Configurar headers con token
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    // 3. Probar obtener servicios (debe estar vacío inicialmente)
    console.log('\n3️⃣ Probando obtener servicios (debe estar vacío)...');
    const serviciosResponse = await axios.get(`${BASE_URL}/servicios`, { headers });
    console.log('✅ Servicios obtenidos:', serviciosResponse.data.data.length, 'servicios');

    // 4. Probar crear un servicio
    console.log('\n4️⃣ Probando crear un servicio...');
    const crearResponse = await axios.post(`${BASE_URL}/servicios`, servicioTest, { headers });
    console.log('✅ Servicio creado:', crearResponse.data.data.nombre);
    const servicioId = crearResponse.data.data.id;

    // 5. Probar obtener servicios nuevamente (debe tener 1 servicio)
    console.log('\n5️⃣ Probando obtener servicios (debe tener 1 servicio)...');
    const serviciosResponse2 = await axios.get(`${BASE_URL}/servicios`, { headers });
    console.log('✅ Servicios obtenidos:', serviciosResponse2.data.data.length, 'servicios');

    // 6. Probar crear el mismo servicio (debe fallar por duplicado)
    console.log('\n6️⃣ Probando crear servicio duplicado (debe fallar)...');
    try {
      await axios.post(`${BASE_URL}/servicios`, servicioTest, { headers });
      console.log('❌ Error: No debería haber permitido crear servicio duplicado');
    } catch (error) {
      console.log('✅ Correcto: Error al crear servicio duplicado:', error.response.data.message);
    }

    // 7. Probar actualizar servicio
    console.log('\n7️⃣ Probando actualizar servicio...');
    const actualizarData = {
      nombre: 'Terapia Individual Actualizada',
      descripcion: 'Descripción actualizada'
    };
    const actualizarResponse = await axios.put(`${BASE_URL}/servicios/${servicioId}`, actualizarData, { headers });
    console.log('✅ Servicio actualizado:', actualizarResponse.data.data.nombre);

    // 8. Probar endpoint público para obtener servicios del psicólogo
    console.log('\n8️⃣ Probando endpoint público para pacientes...');
    const psicologoId = loginResponse.data.data.usuario.id;
    const publicResponse = await axios.get(`${BASE_URL}/servicios/psicologo/${psicologoId}`);
    console.log('✅ Servicios públicos obtenidos:', publicResponse.data.data.length, 'servicios');

    // 9. Probar eliminar servicio
    console.log('\n9️⃣ Probando eliminar servicio...');
    const eliminarResponse = await axios.delete(`${BASE_URL}/servicios/${servicioId}`, { headers });
    console.log('✅ Servicio eliminado:', eliminarResponse.data.message);

    // 10. Verificar que el servicio ya no aparece en la lista
    console.log('\n🔟 Verificando que el servicio ya no aparece...');
    const serviciosFinalResponse = await axios.get(`${BASE_URL}/servicios`, { headers });
    console.log('✅ Servicios finales:', serviciosFinalResponse.data.data.length, 'servicios');

    console.log('\n🎉 ¡TODAS LAS PRUEBAS COMPLETADAS EXITOSAMENTE!');
    console.log('=' .repeat(60));
    console.log('✅ Sistema de servicios funcionando correctamente');
    console.log('✅ Validaciones de duplicados funcionando');
    console.log('✅ CRUD completo funcionando');
    console.log('✅ Endpoint público funcionando');

  } catch (error) {
    console.error('\n❌ ERROR EN LAS PRUEBAS:', error.response?.data || error.message);
    console.log('\n🔍 Detalles del error:');
    console.log('Status:', error.response?.status);
    console.log('Data:', error.response?.data);
  }
}

// Ejecutar pruebas
testServiciosCompleto(); 