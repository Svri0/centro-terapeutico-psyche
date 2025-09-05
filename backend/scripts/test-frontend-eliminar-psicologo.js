const axios = require('axios');

async function testFrontendEliminarPsicologo() {
  console.log('🧪 Probando flujo completo de eliminación desde frontend...\n');

  try {
    // 1. Login como admin
    console.log('1️⃣ Login como admin...');
    
    const loginData = {
      email: 'admin@admin.cl',
      password: 'admin123'
    };

    const loginResponse = await axios.post('http://localhost:3002/api/v1/autenticacion/login', loginData, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });

    const token = loginResponse.data.data.token;
    console.log('✅ Login exitoso');

    // 2. Obtener psicólogos
    console.log('\n2️⃣ Obteniendo psicólogos...');
    
    const psicologosResponse = await axios.get('http://localhost:3002/api/v1/admin/psicologos', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });

    const psicologos = psicologosResponse.data.data;
    console.log(`✅ Se encontraron ${psicologos.length} psicólogos`);

    if (psicologos.length === 0) {
      console.log('❌ No hay psicólogos para probar');
      return;
    }

    // 3. Mostrar información del psicólogo a eliminar
    const psicologo = psicologos[0];
    console.log(`\n3️⃣ Psicólogo a eliminar:`);
    console.log(`   - ID: ${psicologo.id}`);
    console.log(`   - Nombre: ${psicologo.nombres} ${psicologo.apellidos}`);
    console.log(`   - Email: ${psicologo.email}`);
    console.log(`   - Activo: ${psicologo.activo}`);

    // 4. Simular el flujo del frontend
    console.log('\n4️⃣ Simulando flujo del frontend...');
    console.log('   - Usuario hace clic en "Eliminar"');
    console.log('   - Se abre modal de confirmación');
    console.log('   - Usuario escribe "confirmar"');
    console.log('   - Usuario marca checkbox de confirmación');
    console.log('   - Usuario hace clic en "Eliminar"');

    // 5. Intentar eliminación (simulando el frontend)
    console.log('\n5️⃣ Ejecutando eliminación...');
    
    try {
      const eliminarResponse = await axios.delete(`http://localhost:3002/api/v1/admin/psicologos/${psicologo.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000
      });

      console.log('✅ Eliminación exitosa!');
      console.log(`   - Estado: ${eliminarResponse.status}`);
      console.log(`   - Mensaje: ${eliminarResponse.data.mensaje}`);
      console.log(`   - Datos:`, eliminarResponse.data.data);

      // 6. Verificar que el psicólogo ya no existe
      console.log('\n6️⃣ Verificando que el psicólogo fue eliminado...');
      
      const psicologosDespuesResponse = await axios.get('http://localhost:3002/api/v1/admin/psicologos', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      });

      const psicologosDespues = psicologosDespuesResponse.data.data;
      const psicologoEliminado = psicologosDespues.find(p => p.id === psicologo.id);
      
      if (!psicologoEliminado) {
        console.log('✅ Psicólogo eliminado correctamente de la lista');
        console.log(`   - Psicólogos restantes: ${psicologosDespues.length}`);
      } else {
        console.log('⚠️ El psicólogo aún aparece en la lista');
      }

    } catch (eliminarError) {
      console.log('❌ Error en eliminación');
      console.log('📊 Detalles del error:');
      
      if (eliminarError.response) {
        console.log(`   - Estado: ${eliminarError.response.status}`);
        console.log(`   - Mensaje: ${eliminarError.response.data?.mensaje || 'Sin mensaje'}`);
        console.log(`   - Código: ${eliminarError.response.data?.codigo || 'Sin código'}`);
        console.log(`   - Error: ${eliminarError.response.data?.error || 'Sin error específico'}`);
        
        if (eliminarError.response.data?.data) {
          console.log(`   - Datos adicionales:`, eliminarError.response.data.data);
        }
      } else {
        console.log(`   - Error de red: ${eliminarError.message}`);
      }
    }

    console.log('\n🎉 Prueba completada');
    console.log('💡 Ahora puedes probar el modal en el frontend:');
    console.log('   1. Ve a http://localhost:3000');
    console.log('   2. Login con admin@admin.cl / admin123');
    console.log('   3. Ve al panel de administración');
    console.log('   4. Haz clic en "Eliminar" en cualquier psicólogo');
    console.log('   5. Escribe "confirmar" y marca el checkbox');
    console.log('   6. Haz clic en "Eliminar"');

  } catch (error) {
    console.error('❌ Error general:', error.message);
    
    if (error.response) {
      console.error('📊 Detalles del error:');
      console.error(`   - Estado: ${error.response.status}`);
      console.error(`   - Mensaje: ${error.response.data?.mensaje || 'Sin mensaje'}`);
      console.error(`   - Error: ${error.response.data?.error || 'Sin error específico'}`);
    }
  }
}

// Ejecutar prueba
testFrontendEliminarPsicologo(); 