const axios = require('axios');

const BASE_URL = 'http://localhost:3002/api/v1';
const PSICOLOGO_ID = '559a9710-7a5b-48a5-bd7a-055ec9c114d6'; // Laura Fernández

async function loginPsicologo() {
  try {
    const response = await axios.post(`${BASE_URL}/autenticacion/login`, {
      email: 'laura.fernandez@psyche.cl',
      password: 'ola123321'
    });
    
    console.log('✅ Login exitoso');
    return response.data.data.token;
  } catch (error) {
    console.error('❌ Error en login:', error.response?.data || error.message);
    throw error;
  }
}

async function testObtenerDisponibilidadMensual(token) {
  try {
    const response = await axios.get(`${BASE_URL}/disponibilidad-mensual/psicologo/${PSICOLOGO_ID}`, {
      headers: { Authorization: `Bearer ${token}` },
      params: { mes: 8, año: 2025 }
    });
    
    console.log('✅ Obtener disponibilidad mensual exitoso');
    console.log('📊 Datos:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error al obtener disponibilidad mensual:', error.response?.data || error.message);
    throw error;
  }
}

async function testGenerarDisponibilidadRecurrente(token) {
  try {
    const fechaInicio = '2025-08-01';
    const fechaFin = '2025-08-31';
    
    const horarios = {
      1: { hora_inicio: '09:00', hora_fin: '17:00', activo: true }, // Lunes
      2: { hora_inicio: '09:00', hora_fin: '17:00', activo: true }, // Martes
      3: { hora_inicio: '09:00', hora_fin: '17:00', activo: true }, // Miércoles
      4: { hora_inicio: '09:00', hora_fin: '17:00', activo: true }, // Jueves
      5: { hora_inicio: '09:00', hora_fin: '17:00', activo: true }, // Viernes
      6: { hora_inicio: '09:00', hora_fin: '13:00', activo: true }, // Sábado
      0: { hora_inicio: '00:00', hora_fin: '00:00', activo: false }  // Domingo
    };

    const response = await axios.post(`${BASE_URL}/disponibilidad-mensual/psicologo/${PSICOLOGO_ID}/recurrente`, {
      fechaInicio,
      fechaFin,
      horarios
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ Generar disponibilidad recurrente exitoso');
    console.log('📊 Resultados:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error al generar disponibilidad recurrente:', error.response?.data || error.message);
    throw error;
  }
}

async function testVerificarDisponibilidadFecha(token) {
  try {
    const response = await axios.get(`${BASE_URL}/disponibilidad-mensual/verificar/${PSICOLOGO_ID}`, {
      headers: { Authorization: `Bearer ${token}` },
      params: { fecha: '2025-08-05' }
    });
    
    console.log('✅ Verificar disponibilidad fecha exitoso');
    console.log('📊 Resultado:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error al verificar disponibilidad fecha:', error.response?.data || error.message);
    throw error;
  }
}

async function runTests() {
  try {
    console.log('🚀 Iniciando pruebas de disponibilidad mensual...\n');
    
    // 1. Login
    const token = await loginPsicologo();
    
    // 2. Obtener disponibilidad mensual
    console.log('\n📅 Probando obtener disponibilidad mensual...');
    await testObtenerDisponibilidadMensual(token);
    
    // 3. Generar disponibilidad recurrente
    console.log('\n🔄 Probando generar disponibilidad recurrente...');
    await testGenerarDisponibilidadRecurrente(token);
    
    // 4. Verificar disponibilidad para una fecha específica
    console.log('\n🔍 Probando verificar disponibilidad fecha...');
    await testVerificarDisponibilidadFecha(token);
    
    console.log('\n✅ Todas las pruebas completadas exitosamente');
    
  } catch (error) {
    console.error('\n❌ Error en las pruebas:', error.message);
  }
}

runTests();
