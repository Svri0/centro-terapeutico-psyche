const axios = require('axios');

const API_BASE_URL = 'http://localhost:3002/api/v1';

// Función para obtener token de autenticación
async function obtenerToken() {
  try {
    const response = await axios.post(`${API_BASE_URL}/autenticacion/login`, {
      email: 'laura.fernandez@psyche.cl',
      password: 'laura123'
    });
    return response.data.data.token;
  } catch (error) {
    console.error('Error al obtener token:', error.response?.data || error.message);
    throw error;
  }
}

// Función para obtener citas existentes
async function obtenerCitas(token) {
  try {
    const response = await axios.get(`${API_BASE_URL}/citas/psicologo`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.data.data;
  } catch (error) {
    console.error('Error al obtener citas:', error.response?.data || error.message);
    throw error;
  }
}

// Función para iniciar sesión
async function iniciarSesion(citaId, token) {
  try {
    const response = await axios.post(`${API_BASE_URL}/sesiones-terapeuticas/citas/${citaId}/iniciar`, {}, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.data.data;
  } catch (error) {
    console.error('Error al iniciar sesión:', error.response?.data || error.message);
    throw error;
  }
}

// Función para finalizar sesión
async function finalizarSesion(sesionId, token) {
  try {
    const response = await axios.post(`${API_BASE_URL}/sesiones-terapeuticas/sesiones/${sesionId}/finalizar`, {
      resumenSesion: 'Sesión de prueba finalizada correctamente',
      notasPsicologo: 'Notas de prueba del psicólogo'
    }, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.data.data;
  } catch (error) {
    console.error('Error al finalizar sesión:', error.response?.data || error.message);
    throw error;
  }
}

// Función principal de prueba
async function probarFinalizarSesion() {
  try {
    console.log('🧪 Iniciando prueba de finalización de sesión...\n');
    
    // 1. Obtener token
    console.log('1. Obteniendo token de autenticación...');
    const token = await obtenerToken();
    console.log('✅ Token obtenido\n');
    
    // 2. Obtener citas existentes
    console.log('2. Obteniendo citas existentes...');
    const citas = await obtenerCitas(token);
    console.log(`✅ Se encontraron ${citas.length} citas`);
    
    // Buscar una cita confirmada
    const citaConfirmada = citas.find(c => c.estado === 'confirmada');
    if (!citaConfirmada) {
      console.log('❌ No se encontró ninguna cita confirmada');
      return;
    }
    
    console.log('✅ Cita encontrada:', {
      id: citaConfirmada.id,
      fecha: citaConfirmada.fecha,
      estado: citaConfirmada.estado,
      duracion: citaConfirmada.duracion_minutos
    });
    console.log('');
    
    // 3. Iniciar sesión
    console.log('3. Iniciando sesión...');
    const sesionIniciada = await iniciarSesion(citaConfirmada.id, token);
    console.log('✅ Sesión iniciada:', {
      sesionId: sesionIniciada.sesionId,
      esReanudacion: sesionIniciada.esReanudacion,
      duracionMinutos: sesionIniciada.duracionMinutos
    });
    console.log('');
    
    // 4. Esperar un poco
    console.log('4. Esperando 5 segundos...');
    await new Promise(resolve => setTimeout(resolve, 5000));
    console.log('✅ Espera completada\n');
    
    // 5. Finalizar sesión
    console.log('5. Finalizando sesión...');
    const sesionFinalizada = await finalizarSesion(sesionIniciada.sesionId, token);
    console.log('✅ Sesión finalizada:', {
      sesionId: sesionFinalizada.sesionId,
      duracionReal: sesionFinalizada.duracionReal,
      fechaFin: sesionFinalizada.fechaFin
    });
    console.log('');
    
    // 6. Verificar estado de la cita
    console.log('6. Verificando estado de la cita...');
    const citasActualizadas = await obtenerCitas(token);
    const citaActualizada = citasActualizadas.find(c => c.id === citaConfirmada.id);
    
    if (citaActualizada) {
      console.log('✅ Estado de la cita actualizado:', {
        id: citaActualizada.id,
        estado: citaActualizada.estado
      });
      
      if (citaActualizada.estado === 'completada') {
        console.log('✅ PRUEBA EXITOSA: La sesión se finalizó correctamente y la cita se marcó como completada');
      } else {
        console.log('⚠️ ADVERTENCIA: La sesión se finalizó pero la cita no se marcó como completada');
      }
    } else {
      console.log('❌ No se pudo encontrar la cita actualizada');
    }
    
  } catch (error) {
    console.error('❌ Error en la prueba:', error.message);
  }
}

// Ejecutar prueba
probarFinalizarSesion();
