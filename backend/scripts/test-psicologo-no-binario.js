const axios = require('axios');

const API_BASE_URL = 'http://localhost:3001/api/v1';

async function testCrearPsicologoNoBinario() {
  try {
    console.log('🧪 Probando creación de psicólogo no binario...');
    console.log('📍 URL base:', API_BASE_URL);
    
    // Primero, hacer login como admin
    console.log('🔐 Intentando login...');
    const loginResponse = await axios.post(`${API_BASE_URL}/autenticacion/login`, {
      email: 'admin@admin.com',
      password: 'admin123'
    });
    
    const token = loginResponse.data.data.token;
    console.log('✅ Login exitoso');
    console.log('🔑 Token obtenido:', token.substring(0, 20) + '...');
    
    // Crear psicólogo no binario
    console.log('👤 Creando psicólogo no binario...');
    const psicologoData = {
      nombres: 'Alex',
      apellidos: 'García',
      email: 'alex.garcia@psyche.cl',
      password: 'password123',
      telefono: '+56912345678',
      fecha_nacimiento: '1990-05-15',
      genero: 'otro' // Esto se mapeará a 'no_binario' en el frontend
    };
    
    const crearResponse = await axios.post(`${API_BASE_URL}/admin/psicologos`, psicologoData, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('✅ Psicólogo no binario creado exitosamente');
    console.log('📋 Datos del psicólogo:', {
      id: crearResponse.data.data.id,
      nombres: crearResponse.data.data.nombres,
      apellidos: crearResponse.data.data.apellidos,
      genero: crearResponse.data.data.genero
    });
    
    // Obtener lista de psicólogos para verificar
    console.log('📋 Obteniendo lista de psicólogos...');
    const listResponse = await axios.get(`${API_BASE_URL}/admin/psicologos`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('📋 Lista de psicólogos:');
    listResponse.data.data.forEach(psicologo => {
      console.log(`- ${psicologo.nombres} ${psicologo.apellidos}: ${psicologo.genero || 'No especificado'}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
    if (error.response) {
      console.error('📊 Status:', error.response.status);
      console.error('📋 Headers:', error.response.headers);
    }
  }
}

testCrearPsicologoNoBinario(); 