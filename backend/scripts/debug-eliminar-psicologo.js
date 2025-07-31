const axios = require('axios');

const API_BASE_URL = 'http://localhost:3001/api/v1';

// Función para obtener el token de administrador
async function obtenerTokenAdmin() {
  try {
    const response = await axios.post(`${API_BASE_URL}/autenticacion/login`, {
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
    console.log(`Intentando eliminar psicólogo con ID: ${psicologoId}`);
    const response = await axios.delete(`${API_BASE_URL}/admin/psicologos/${psicologoId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    console.log('Respuesta exitosa:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error al eliminar psicólogo:');
    console.error('Status:', error.response?.status);
    console.error('Data:', error.response?.data);
    console.error('Message:', error.message);
    return {
      error: true,
      status: error.response?.status,
      data: error.response?.data || { mensaje: error.message }
    };
  }
}

// Función principal de debug
async function debugEliminarPsicologo() {
  try {
    console.log('🔧 Iniciando debug de eliminación de psicólogos...\n');

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

    // Probar con el primer psicólogo disponible
    if (psicologos.length > 0) {
      const primerPsicologo = psicologos[0];
      console.log(`3. Probando eliminación con ${primerPsicologo.nombres} ${primerPsicologo.apellidos}...`);
      console.log(`   ID: ${primerPsicologo.id}`);
      console.log(`   Estado: ${primerPsicologo.activo ? 'Activo' : 'Inactivo'}`);
      console.log('');
      
      const resultado = await eliminarPsicologo(token, primerPsicologo.id);
      
      if (resultado.error) {
        console.log('❌ Error al eliminar psicólogo:');
        console.log(`   Status: ${resultado.status}`);
        console.log(`   Código: ${resultado.data.codigo || 'N/A'}`);
        console.log(`   Mensaje: ${resultado.data.mensaje || resultado.data.error || 'Error desconocido'}`);
        console.log(`   Detalles: ${JSON.stringify(resultado.data.detalles || {}, null, 2)}`);
      } else {
        console.log('✅ Psicólogo eliminado correctamente');
        console.log(`   Respuesta: ${JSON.stringify(resultado, null, 2)}`);
      }
    } else {
      console.log('⚠️  No hay psicólogos disponibles para probar');
    }

    console.log('\n✅ Debug completado');

  } catch (error) {
    console.error('❌ Error en el debug:', error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', error.response.data);
    }
  }
}

// Ejecutar el debug
debugEliminarPsicologo(); 