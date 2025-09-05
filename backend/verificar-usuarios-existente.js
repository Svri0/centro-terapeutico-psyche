const axios = require('axios');

async function verificarUsuariosExistentes() {
  try {
    console.log('🔍 Verificando usuarios existentes en la base de datos...');
    
    // Hacer una consulta directa a la base de datos para ver qué usuarios existen
    const response = await axios.get('http://localhost:3002/api/v1/usuarios', {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Usuarios encontrados:');
    console.log(JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.error('❌ Error al verificar usuarios:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
  }
}

verificarUsuariosExistentes();
