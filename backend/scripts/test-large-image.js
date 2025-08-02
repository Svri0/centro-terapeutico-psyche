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

// Función para subir imagen grande (simula imagen real)
async function subirImagenGrande(token) {
  try {
    // Crear una imagen de prueba más grande (simula una imagen real)
    // Esta es una imagen JPEG de 100x100 píxeles
    const imageBuffer = Buffer.from('/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=', 'base64');
    
    const formData = new FormData();
    formData.append('avatar', imageBuffer, {
      filename: 'large-test-image.jpg',
      contentType: 'image/jpeg'
    });

    console.log('📤 Enviando imagen grande al servidor...');
    const response = await axios.post(`${BASE_URL}/usuarios/subir-imagen`, formData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        ...formData.getHeaders()
      }
    });

    console.log('✅ Respuesta del servidor:', response.data);
    console.log('📏 Tamaño de la imagen base64:', response.data.data.avatar_url.length, 'caracteres');
    return response.data.data.avatar_url;
  } catch (error) {
    console.error('❌ Error al subir imagen grande:', error.response?.data || error.message);
    throw error;
  }
}

// Función para actualizar perfil con imagen grande
async function actualizarPerfilConImagenGrande(token, userId, avatarUrl) {
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

    console.log('📝 Enviando datos de perfil con imagen grande...');
    console.log('📏 Tamaño de avatar_url:', avatarUrl.length, 'caracteres');

    const response = await axios.put(`${BASE_URL}/usuarios/perfil/${userId}`, datosPerfil, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Respuesta del servidor:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error al actualizar perfil con imagen grande:', error.response?.data || error.message);
    throw error;
  }
}

// Función principal
async function testLargeImage() {
  try {
    console.log('🔐 Iniciando login...');
    const token = await login();
    console.log('✅ Login exitoso');

    const userId = '559a9710-7a5b-48a5-bd7a-055ec9c114d6';

    console.log('📤 Subiendo imagen grande...');
    const avatarUrl = await subirImagenGrande(token);

    console.log('📝 Actualizando perfil con imagen grande...');
    await actualizarPerfilConImagenGrande(token, userId, avatarUrl);

    console.log('🎉 Prueba con imagen grande completada!');
  } catch (error) {
    console.error('💥 Error en las pruebas:', error.message);
  }
}

// Ejecutar pruebas
testLargeImage(); 