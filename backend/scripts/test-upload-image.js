const axios = require('axios');
const fs = require('fs');
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

// Función para subir imagen
async function subirImagen(token) {
  try {
    // Crear una imagen de prueba simple (1x1 pixel PNG)
    const imageBuffer = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', 'base64');
    
    const formData = new FormData();
    formData.append('avatar', imageBuffer, {
      filename: 'test-image.png',
      contentType: 'image/png'
    });

    const response = await axios.post(`${BASE_URL}/usuarios/subir-imagen`, formData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        ...formData.getHeaders()
      }
    });

    console.log('✅ Imagen subida exitosamente:', response.data);
    return response.data.data.avatar_url;
  } catch (error) {
    console.error('❌ Error al subir imagen:', error.response?.data || error.message);
    throw error;
  }
}

// Función para actualizar perfil
async function actualizarPerfil(token, userId, avatarUrl) {
  try {
    const response = await axios.put(`${BASE_URL}/usuarios/perfil/${userId}`, {
      nombres: 'Dra. Laura',
      apellidos: 'Fernández',
      email: 'laura.fernandez@psyche.cl',
      telefono: '+56912345678',
      especialidad: 'Psicología Clínica - Terapia Cognitivo-Conductual',
      descripcion: 'Psicóloga clínica especializada en terapia cognitivo-conductual con más de 10 años de experiencia.',
      avatar_url: avatarUrl
    }, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Perfil actualizado exitosamente:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error al actualizar perfil:', error.response?.data || error.message);
    throw error;
  }
}

// Función principal
async function testUploadAndUpdate() {
  try {
    console.log('🔐 Iniciando login...');
    const token = await login();
    console.log('✅ Login exitoso');

    // Obtener ID del usuario (asumiendo que es el psicólogo de prueba)
    const userId = '559a9710-7a5b-48a5-bd7a-055ec9c114d6'; // ID del psicólogo de prueba

    console.log('📤 Subiendo imagen...');
    const avatarUrl = await subirImagen(token);
    console.log('✅ Imagen subida, URL:', avatarUrl.substring(0, 50) + '...');

    console.log('📝 Actualizando perfil...');
    await actualizarPerfil(token, userId, avatarUrl);
    console.log('✅ Perfil actualizado exitosamente');

    console.log('🎉 Todas las pruebas pasaron exitosamente!');
  } catch (error) {
    console.error('💥 Error en las pruebas:', error.message);
  }
}

// Ejecutar pruebas
testUploadAndUpdate(); 