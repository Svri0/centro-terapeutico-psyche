const axios = require('axios');

const BASE_URL = 'http://localhost:3003/api/v1';

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

// Función para actualizar perfil
async function actualizarPerfil(token, userId) {
  try {
    const response = await axios.put(`${BASE_URL}/usuarios/perfil/${userId}`, {
      nombres: 'Dra. Laura',
      apellidos: 'Fernández',
      email: 'laura.fernandez@psyche.cl',
      telefono: '+56912345678',
      especialidad: 'Psicología Clínica - Terapia Cognitivo-Conductual',
      descripcion: 'Psicóloga clínica especializada en terapia cognitivo-conductual con más de 10 años de experiencia.',
      avatar_url: null
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
async function testUpdateProfile() {
  try {
    console.log('🔐 Iniciando login...');
    const token = await login();
    console.log('✅ Login exitoso');

    // Obtener ID del usuario
    const userId = '559a9710-7a5b-48a5-bd7a-055ec9c114d6';

    console.log('📝 Actualizando perfil...');
    await actualizarPerfil(token, userId);
    console.log('✅ Perfil actualizado exitosamente');

    console.log('🎉 Prueba completada!');
  } catch (error) {
    console.error('💥 Error en las pruebas:', error.message);
  }
}

// Ejecutar pruebas
testUpdateProfile(); 