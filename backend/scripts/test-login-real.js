require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const axios = require('axios');

const API_URL = process.env.API_URL || 'http://localhost:3002';

async function testLogin() {
  console.log('🔍 PROBANDO LOGIN REAL\n');
  console.log('📡 URL:', `${API_URL}/api/v1/auth/login`);
  console.log('👤 Email: admin@admin.cl');
  console.log('🔐 Password: admin123\n');

  try {
    const response = await axios.post(`${API_URL}/api/v1/auth/login`, {
      email: 'admin@admin.cl',
      password: 'admin123'
    }, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 5000
    });

    console.log('✅ LOGIN EXITOSO!\n');
    console.log('📊 Respuesta:');
    console.log('   Success:', response.data.success);
    console.log('   Mensaje:', response.data.mensaje);
    console.log('   Usuario:', response.data.data?.usuario?.nombres, response.data.data?.usuario?.apellidos);
    console.log('   Token:', response.data.data?.token ? '✅ Presente' : '❌ Faltante');
    console.log('');

  } catch (error) {
    console.error('❌ ERROR EN LOGIN\n');
    
    if (error.response) {
      // El servidor respondió con un código de error
      console.error('📊 Respuesta del servidor:');
      console.error('   Status:', error.response.status);
      console.error('   Mensaje:', error.response.data?.mensaje || error.response.data?.error || error.response.data?.message);
      console.error('   Código:', error.response.data?.codigo);
      console.error('   Data completa:', JSON.stringify(error.response.data, null, 2));
    } else if (error.request) {
      // La petición se hizo pero no hubo respuesta
      console.error('❌ No se recibió respuesta del servidor');
      console.error('   Verifica que el servidor esté corriendo en:', API_URL);
      console.error('   Ejecuta: cd backend && npm run dev');
    } else {
      // Error al configurar la petición
      console.error('❌ Error al hacer la petición:', error.message);
    }
    
    console.error('');
    process.exit(1);
  }
}

testLogin();

