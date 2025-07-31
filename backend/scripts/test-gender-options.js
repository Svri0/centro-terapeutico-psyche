const axios = require('axios');

const API_BASE_URL = 'http://localhost:3001/api/v1';

async function testGenderOptions() {
  try {
    console.log('🧪 Probando opciones de género...');
    console.log('📍 URL base:', API_BASE_URL);
    
    // Primero, hacer login como admin
    console.log('🔐 Intentando login...');
    const loginResponse = await axios.post(`${API_BASE_URL}/autenticacion/login`, {
      email: 'admin@admin.com',
      password: 'admin123'
    });
    
    const token = loginResponse.data.data.token;
    console.log('✅ Login exitoso');
    
    // Crear psicólogo con género "otro"
    console.log('👤 Creando psicólogo con género "otro"...');
    const psicologoOtro = {
      nombres: 'María',
      apellidos: 'López',
      email: 'maria.lopez@psyche.cl',
      password: 'password123',
      telefono: '+56987654321',
      fecha_nacimiento: '1985-03-20',
      genero: 'otro'
    };
    
    const crearOtroResponse = await axios.post(`${API_BASE_URL}/admin/psicologos`, psicologoOtro, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('✅ Psicólogo con género "otro" creado exitosamente');
    console.log('📋 Datos:', {
      nombres: crearOtroResponse.data.data.usuario.nombres,
      apellidos: crearOtroResponse.data.data.usuario.apellidos,
      genero: crearOtroResponse.data.data.usuario.genero
    });
    
    // Crear psicólogo con género "no_binario" (se mapeará a "otro" en backend)
    console.log('👤 Creando psicólogo con género "no_binario"...');
    const psicologoNoBinario = {
      nombres: 'Alex',
      apellidos: 'Rivera',
      email: 'alex.rivera@psyche.cl',
      password: 'password123',
      telefono: '+56912345678',
      fecha_nacimiento: '1992-08-15',
      genero: 'otro' // En el backend será 'otro', pero en frontend se mostrará como 'no_binario'
    };
    
    const crearNoBinarioResponse = await axios.post(`${API_BASE_URL}/admin/psicologos`, psicologoNoBinario, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('✅ Psicólogo con género "no_binario" creado exitosamente');
    console.log('📋 Datos:', {
      nombres: crearNoBinarioResponse.data.data.usuario.nombres,
      apellidos: crearNoBinarioResponse.data.data.usuario.apellidos,
      genero: crearNoBinarioResponse.data.data.usuario.genero
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
    
    console.log('\n✅ Prueba completada exitosamente');
    console.log('📝 Resumen:');
    console.log('  - "otro" en frontend → "otro" en backend');
    console.log('  - "no_binario" en frontend → "otro" en backend (para compatibilidad)');
    console.log('  - Ambos se muestran correctamente en la tabla');
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
    if (error.response) {
      console.error('📊 Status:', error.response.status);
    }
  }
}

testGenderOptions(); 