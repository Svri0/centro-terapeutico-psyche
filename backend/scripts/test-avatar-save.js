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

// Función para obtener perfil actual
async function obtenerPerfil(token) {
  try {
    const response = await axios.get(`${BASE_URL}/autenticacion/perfil`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data.data.usuario;
  } catch (error) {
    console.error('Error al obtener perfil:', error.response?.data || error.message);
    throw error;
  }
}

// Función para actualizar perfil con avatar específico
async function actualizarPerfilConAvatar(token, userId, avatarUrl) {
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
async function testAvatarSave() {
  try {
    console.log('🔐 Iniciando login...');
    const token = await login();
    console.log('✅ Login exitoso');

    const userId = '559a9710-7a5b-48a5-bd7a-055ec9c114d6';

    // Obtener perfil actual
    console.log('📋 Obteniendo perfil actual...');
    const perfilActual = await obtenerPerfil(token);
    console.log('📋 Avatar actual:', perfilActual.avatar_url || 'Sin avatar');

    // Avatar de robot para probar
    const avatarRobot = 'https://api.dicebear.com/7.x/bottts/svg?seed=dolphin&backgroundColor=bfdfff';
    
    console.log('🔄 Actualizando perfil con avatar de robot...');
    await actualizarPerfilConAvatar(token, userId, avatarRobot);
    
    // Verificar que se guardó correctamente
    console.log('🔍 Verificando que se guardó correctamente...');
    const perfilActualizado = await obtenerPerfil(token);
    console.log('📋 Avatar después de actualizar:', perfilActualizado.avatar_url);
    
    if (perfilActualizado.avatar_url === avatarRobot) {
      console.log('✅ Avatar guardado correctamente!');
    } else {
      console.log('❌ Avatar no se guardó correctamente');
    }

    console.log('🎉 Prueba completada!');
  } catch (error) {
    console.error('💥 Error en las pruebas:', error.message);
  }
}

// Ejecutar pruebas
testAvatarSave(); 