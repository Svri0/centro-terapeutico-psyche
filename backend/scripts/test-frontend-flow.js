const axios = require('axios');
const FormData = require('form-data');

const BASE_URL = 'http://localhost:3002/api/v1';

// Función para hacer login y obtener token
async function login() {
  try {
    const response = await axios.post(`${BASE_URL}/autenticacion/login`, {
      email: 'laura.fernandez@psyche.cl',
      password: 'psicologo123'
    });
    
    return response.data.data.token;
  } catch (error) {
    console.error('Error en login:', error.response?.data || error.message);
    throw error;
  }
}

// Función para subir imagen (simula el frontend)
async function subirImagenFrontend(token) {
  try {
    // Crear una imagen de prueba (simula lo que hace el frontend)
    const imageBuffer = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', 'base64');
    
    const formData = new FormData();
    formData.append('avatar', imageBuffer, {
      filename: 'frontend-test-image.png',
      contentType: 'image/png'
    });

    console.log('📤 Enviando imagen al servidor...');
    const response = await axios.post(`${BASE_URL}/usuarios/subir-imagen`, formData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        ...formData.getHeaders()
      }
    });

    console.log('✅ Respuesta del servidor:', response.data);
    return response.data.data.avatar_url;
  } catch (error) {
    console.error('❌ Error al subir imagen:', error.response?.data || error.message);
    throw error;
  }
}

// Función para actualizar perfil (simula el frontend)
async function actualizarPerfilFrontend(token, userId, avatarUrl) {
  try {
    const datosPerfil = {
      nombres: 'Dra. Laura',
      apellidos: 'Fernández',
      email: 'laura.fernandez@psyche.cl',
      telefono: '+56912345678',
      especialidad: 'Psicología Clínica - Terapia Cognitivo-Conductual',
      descripcion: 'Psicóloga clínica especializada en terapia cognitivo-conductual con más de 10 años de experiencia.',
      avatar_url: avatarUrl
    };

    console.log('📝 Enviando datos de perfil:', {
      ...datosPerfil,
      avatar_url: avatarUrl ? `BASE64_IMAGE (${avatarUrl.length} caracteres)` : 'SIN_IMAGEN'
    });

    const response = await axios.put(`${BASE_URL}/usuarios/perfil/${userId}`, datosPerfil, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Respuesta del servidor:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error al actualizar perfil:', error.response?.data || error.message);
    throw error;
  }
}

// Función principal que simula el flujo del frontend
async function testFrontendFlow() {
  try {
    console.log('🔐 Iniciando login...');
    const token = await login();
    console.log('✅ Login exitoso');

    const userId = '559a9710-7a5b-48a5-bd7a-055ec9c114d6';

    // Paso 1: Subir imagen (como hace el frontend)
    console.log('\n📤 PASO 1: Subiendo imagen...');
    const avatarUrl = await subirImagenFrontend(token);
    console.log('✅ Imagen subida, URL recibida:', avatarUrl.substring(0, 50) + '...');

    // Paso 2: Actualizar perfil con la imagen (como hace el frontend)
    console.log('\n📝 PASO 2: Actualizando perfil con la imagen...');
    await actualizarPerfilFrontend(token, userId, avatarUrl);
    console.log('✅ Perfil actualizado exitosamente');

    console.log('\n🎉 ¡Flujo del frontend simulado exitosamente!');
  } catch (error) {
    console.error('💥 Error en el flujo del frontend:', error.message);
  }
}

// Ejecutar pruebas
testFrontendFlow(); 