const axios = require('axios');

const BASE_URL = 'http://localhost:3003/api/v1';

// Función para hacer login y obtener token
async function login() {
  try {
    const response = await axios.post(`${BASE_URL}/autenticacion/login`, {
      email: 'laura.fernandez@psyche.cl',
      password: 'psicologo123'
    });
    
    return response.data;
  } catch (error) {
    console.error('Error en login:', error.response?.data || error.message);
    throw error;
  }
}

// Función principal
async function testLoginComplete() {
  try {
    console.log('🔐 Iniciando login...');
    const loginResponse = await login();
    console.log('✅ Login exitoso');
    
    console.log('📋 Datos del usuario en login:');
    console.log(JSON.stringify(loginResponse.data.usuario, null, 2));
    
    // Verificar que todos los campos están presentes
    const usuario = loginResponse.data.usuario;
    const camposRequeridos = ['id', 'nombres', 'apellidos', 'email', 'telefono', 'especialidad', 'descripcion', 'avatar_url', 'rol', 'rol_id'];
    
    console.log('\n🔍 Verificando campos requeridos:');
    let todosLosCamposPresentes = true;
    
    for (const campo of camposRequeridos) {
      if (usuario.hasOwnProperty(campo)) {
        console.log(`✅ ${campo}: ${usuario[campo] || 'null/undefined'}`);
      } else {
        console.log(`❌ ${campo}: FALTANTE`);
        todosLosCamposPresentes = false;
      }
    }
    
    if (todosLosCamposPresentes) {
      console.log('\n🎉 Todos los campos están presentes en el login!');
    } else {
      console.log('\n⚠️ Faltan algunos campos en el login');
    }
    
    console.log('\n🎉 Prueba completada!');
  } catch (error) {
    console.error('💥 Error en las pruebas:', error.message);
  }
}

// Ejecutar pruebas
testLoginComplete(); 