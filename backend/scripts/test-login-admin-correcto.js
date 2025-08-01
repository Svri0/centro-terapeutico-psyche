const axios = require('axios');

async function testLoginAdminCorrecto() {
  console.log('🧪 Probando login con credenciales correctas...\n');

  try {
    // 1. Probar login con credenciales correctas
    console.log('1️⃣ Probando login con admin@admin.cl / admin123...');
    
    const loginData = {
      email: 'admin@admin.cl',
      password: 'admin123'
    };

    const response = await axios.post('http://localhost:3002/api/v1/auth/login', loginData, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });

    console.log('✅ Login exitoso!');
    console.log('📊 Respuesta del servidor:');
    console.log(`   - Estado: ${response.status}`);
    console.log(`   - Mensaje: ${response.data.mensaje}`);
    console.log(`   - Usuario: ${response.data.data.usuario.nombres} ${response.data.data.usuario.apellidos}`);
    console.log(`   - Email: ${response.data.data.usuario.email}`);
    console.log(`   - Rol ID: ${response.data.data.usuario.rol_id}`);
    console.log(`   - Token: ${response.data.data.token ? '✅ Presente' : '❌ Ausente'}`);

    // 2. Probar acceso a endpoint protegido
    console.log('\n2️⃣ Probando acceso a endpoint protegido...');
    
    const token = response.data.data.token;
    const protectedResponse = await axios.get('http://localhost:3002/api/v1/admin/dashboard', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });

    console.log('✅ Acceso a endpoint protegido exitoso!');
    console.log(`   - Estado: ${protectedResponse.status}`);
    console.log(`   - Mensaje: ${protectedResponse.data.mensaje}`);

    console.log('');
    console.log('🎉 ¡Todas las pruebas pasaron exitosamente!');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('✅ Login funciona correctamente');
    console.log('✅ Autenticación JWT funciona');
    console.log('✅ Endpoints protegidos accesibles');
    console.log('✅ Credenciales: admin@admin.cl / admin123');
    console.log('═══════════════════════════════════════════════════════════════');

  } catch (error) {
    console.error('❌ Error durante la prueba:', error.message);
    
    if (error.response) {
      console.error('📊 Detalles del error:');
      console.error(`   - Estado: ${error.response.status}`);
      console.error(`   - Mensaje: ${error.response.data?.mensaje || 'Sin mensaje'}`);
      console.error(`   - Error: ${error.response.data?.error || 'Sin error específico'}`);
    }
    
    console.log('');
    console.log('💡 Posibles soluciones:');
    console.log('   1. Asegúrate de que el backend esté corriendo en puerto 3002');
    console.log('   2. Verifica que el usuario admin@admin.cl exista en la base de datos');
    console.log('   3. Ejecuta: node scripts/crear-admin-correcto.js');
    console.log('   4. Verifica que la base de datos esté funcionando');
  }
}

// Ejecutar prueba
testLoginAdminCorrecto(); 