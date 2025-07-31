const axios = require('axios');

const API_BASE_URL = 'http://localhost:3001/api';

// Función para obtener el token de administrador
async function obtenerTokenAdmin() {
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: 'admin@psyche.cl',
      password: 'admin123'
    });
    return response.data.data.token;
  } catch (error) {
    console.error('Error al obtener token de admin:', error.response?.data || error.message);
    throw error;
  }
}

// Función para obtener todos los psicólogos
async function obtenerPsicologos(token) {
  try {
    const response = await axios.get(`${API_BASE_URL}/admin/psicologos`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data.data;
  } catch (error) {
    console.error('Error al obtener psicólogos:', error.response?.data || error.message);
    throw error;
  }
}

// Función para intentar eliminar un psicólogo
async function eliminarPsicologo(token, psicologoId) {
  try {
    const response = await axios.delete(`${API_BASE_URL}/admin/psicologos/${psicologoId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error al eliminar psicólogo:', error.response?.data || error.message);
    return {
      error: true,
      data: error.response?.data || { mensaje: error.message }
    };
  }
}

// Función principal de prueba
async function testEliminarPsicologo() {
  try {
    console.log('🔧 Iniciando prueba de eliminación de psicólogos...\n');

    // Obtener token de admin
    console.log('1. Obteniendo token de administrador...');
    const token = await obtenerTokenAdmin();
    console.log('✅ Token obtenido correctamente\n');

    // Obtener lista de psicólogos
    console.log('2. Obteniendo lista de psicólogos...');
    const psicologos = await obtenerPsicologos(token);
    console.log(`✅ Se encontraron ${psicologos.length} psicólogos:`);
    
    psicologos.forEach((psicologo, index) => {
      console.log(`   ${index + 1}. ${psicologo.nombres} ${psicologo.apellidos} (ID: ${psicologo.id}) - Estado: ${psicologo.activo ? 'Activo' : 'Inactivo'}`);
    });
    console.log('');

    // Buscar a Laura Fernández
    const lauraFernandez = psicologos.find(p => 
      p.nombres.toLowerCase().includes('laura') && 
      p.apellidos.toLowerCase().includes('fernandez')
    );

    if (lauraFernandez) {
      console.log('3. Probando eliminación de Laura Fernández...');
      console.log(`   ID: ${lauraFernandez.id}`);
      console.log(`   Nombre: ${lauraFernandez.nombres} ${lauraFernandez.apellidos}`);
      console.log(`   Estado: ${lauraFernandez.activo ? 'Activo' : 'Inactivo'}`);
      console.log('');

      const resultado = await eliminarPsicologo(token, lauraFernandez.id);
      
      if (resultado.error) {
        console.log('❌ Error al eliminar Laura Fernández:');
        console.log(`   Código: ${resultado.data.codigo || 'N/A'}`);
        console.log(`   Mensaje: ${resultado.data.mensaje || resultado.data.error || 'Error desconocido'}`);
        console.log(`   Detalles: ${JSON.stringify(resultado.data.detalles || {}, null, 2)}`);
      } else {
        console.log('✅ Laura Fernández eliminada correctamente');
        console.log(`   Respuesta: ${JSON.stringify(resultado, null, 2)}`);
      }
    } else {
      console.log('⚠️  No se encontró a Laura Fernández en la lista de psicólogos');
      
      // Probar con el primer psicólogo disponible
      if (psicologos.length > 0) {
        const primerPsicologo = psicologos[0];
        console.log(`\n3. Probando eliminación con ${primerPsicologo.nombres} ${primerPsicologo.apellidos}...`);
        
        const resultado = await eliminarPsicologo(token, primerPsicologo.id);
        
        if (resultado.error) {
          console.log('❌ Error al eliminar psicólogo:');
          console.log(`   Código: ${resultado.data.codigo || 'N/A'}`);
          console.log(`   Mensaje: ${resultado.data.mensaje || resultado.data.error || 'Error desconocido'}`);
          console.log(`   Detalles: ${JSON.stringify(resultado.data.detalles || {}, null, 2)}`);
        } else {
          console.log('✅ Psicólogo eliminado correctamente');
          console.log(`   Respuesta: ${JSON.stringify(resultado, null, 2)}`);
        }
      }
    }

    console.log('\n✅ Prueba completada');

  } catch (error) {
    console.error('❌ Error en la prueba:', error.message);
    if (error.response) {
      console.error('   Respuesta del servidor:', error.response.data);
    }
  }
}

// Ejecutar la prueba
testEliminarPsicologo(); 