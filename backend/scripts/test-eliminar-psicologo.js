const axios = require('axios');

async function testEliminarPsicologo() {
  console.log('🧪 Probando eliminación de psicólogos...\n');

  try {
    // 1. Primero hacer login como admin
    console.log('1️⃣ Haciendo login como admin...');
    
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
    console.log('✅ Login exitoso, token obtenido');

    // 2. Obtener lista de psicólogos
    console.log('\n2️⃣ Obteniendo lista de psicólogos...');
    
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
      console.log('❌ No hay psicólogos para probar la eliminación');
      return;
    }

    // Mostrar información de los psicólogos
    psicologos.forEach((psicologo, index) => {
      console.log(`   ${index + 1}. ${psicologo.nombres} ${psicologo.apellidos} (${psicologo.email}) - Activo: ${psicologo.activo}`);
    });

    // 3. Intentar eliminar el primer psicólogo
    const psicologoAEliminar = psicologos[0];
    console.log(`\n3️⃣ Intentando eliminar psicólogo: ${psicologoAEliminar.nombres} ${psicologoAEliminar.apellidos}`);
    
    try {
      const eliminarResponse = await axios.delete(`http://localhost:3002/api/v1/admin/psicologos/${psicologoAEliminar.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        timeout: 15000
      });

      console.log('✅ Psicólogo eliminado exitosamente!');
      console.log('📊 Respuesta del servidor:');
      console.log(`   - Estado: ${eliminarResponse.status}`);
      console.log(`   - Mensaje: ${eliminarResponse.data.mensaje}`);
      console.log(`   - Datos:`, eliminarResponse.data.data);

    } catch (eliminarError) {
      console.log('❌ Error al eliminar psicólogo');
      console.log('📊 Detalles del error:');
      
      if (eliminarError.response) {
        console.log(`   - Estado: ${eliminarError.response.status}`);
        console.log(`   - Mensaje: ${eliminarError.response.data?.mensaje || 'Sin mensaje'}`);
        console.log(`   - Error: ${eliminarError.response.data?.error || 'Sin error específico'}`);
        console.log(`   - Código: ${eliminarError.response.data?.codigo || 'Sin código'}`);
        
        if (eliminarError.response.data?.data) {
          console.log(`   - Datos adicionales:`, eliminarError.response.data.data);
        }
      } else {
        console.log(`   - Error de red: ${eliminarError.message}`);
      }
    }

    // 4. Verificar que el psicólogo ya no existe
    console.log('\n4️⃣ Verificando que el psicólogo fue eliminado...');
    
    try {
      const psicologosDespuesResponse = await axios.get('http://localhost:3002/api/v1/admin/psicologos', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      });

      const psicologosDespues = psicologosDespuesResponse.data.data;
      const psicologoEliminado = psicologosDespues.find(p => p.id === psicologoAEliminar.id);
      
      if (!psicologoEliminado) {
        console.log('✅ Psicólogo eliminado correctamente de la lista');
      } else {
        console.log('⚠️ El psicólogo aún aparece en la lista');
      }

    } catch (verificarError) {
      console.log('❌ Error al verificar la eliminación:', verificarError.message);
    }

  } catch (error) {
    console.error('❌ Error general durante la prueba:', error.message);
    
    if (error.response) {
      console.error('📊 Detalles del error:');
      console.error(`   - Estado: ${error.response.status}`);
      console.error(`   - Mensaje: ${error.response.data?.mensaje || 'Sin mensaje'}`);
      console.error(`   - Error: ${error.response.data?.error || 'Sin error específico'}`);
    }
  }
}

// Ejecutar prueba
testEliminarPsicologo(); 