const axios = require('axios');

async function debugEliminarPsicologo() {
  console.log('🔍 Debug detallado de eliminación de psicólogos...\n');

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

    // 3. Mostrar información detallada del primer psicólogo
    const psicologo = psicologos[0];
    console.log(`\n3️⃣ Información del psicólogo a eliminar:`);
    console.log(`   - ID: ${psicologo.id}`);
    console.log(`   - Nombre: ${psicologo.nombres} ${psicologo.apellidos}`);
    console.log(`   - Email: ${psicologo.email}`);
    console.log(`   - Activo: ${psicologo.activo}`);
    console.log(`   - Email verificado: ${psicologo.email_verificado}`);
    console.log(`   - Creado: ${psicologo.created_at}`);

    // 4. Verificar si tiene registros relacionados
    console.log('\n4️⃣ Verificando registros relacionados...');
    
    try {
      // Verificar pacientes
      const pacientesResponse = await axios.get(`http://localhost:3002/api/v1/admin/psicologos/${psicologo.id}/pacientes`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      });
      console.log(`   - Pacientes: ${pacientesResponse.data.data.length}`);

      // Verificar citas
      const citasResponse = await axios.get(`http://localhost:3002/api/v1/admin/psicologos/${psicologo.id}/citas`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      });
      console.log(`   - Citas: ${citasResponse.data.data.length}`);

    } catch (error) {
      console.log(`   - Error al verificar registros: ${error.response?.data?.mensaje || error.message}`);
    }

    // 5. Intentar eliminación con más detalles
    console.log('\n5️⃣ Intentando eliminación...');
    
    try {
      const eliminarResponse = await axios.delete(`http://localhost:3002/api/v1/admin/psicologos/${psicologo.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000 // 30 segundos para dar más tiempo
      });

      console.log('✅ Eliminación exitosa!');
      console.log(`   - Estado: ${eliminarResponse.status}`);
      console.log(`   - Mensaje: ${eliminarResponse.data.mensaje}`);
      console.log(`   - Datos:`, eliminarResponse.data.data);

    } catch (eliminarError) {
      console.log('❌ Error en eliminación');
      console.log('📊 Detalles completos del error:');
      
      if (eliminarError.response) {
        console.log(`   - Estado HTTP: ${eliminarError.response.status}`);
        console.log(`   - Mensaje: ${eliminarError.response.data?.mensaje || 'Sin mensaje'}`);
        console.log(`   - Código: ${eliminarError.response.data?.codigo || 'Sin código'}`);
        console.log(`   - Error: ${eliminarError.response.data?.error || 'Sin error específico'}`);
        
        if (eliminarError.response.data?.data) {
          console.log(`   - Datos adicionales:`, JSON.stringify(eliminarError.response.data.data, null, 2));
        }
        
        // Mostrar headers de respuesta para debug
        console.log(`   - Headers de respuesta:`, eliminarError.response.headers);
        
      } else if (eliminarError.request) {
        console.log(`   - Error de red: ${eliminarError.message}`);
        console.log(`   - Request:`, eliminarError.request);
      } else {
        console.log(`   - Error: ${eliminarError.message}`);
      }
    }

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

// Ejecutar debug
debugEliminarPsicologo(); 