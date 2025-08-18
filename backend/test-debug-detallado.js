const axios = require('axios');

const BASE_URL = 'http://localhost:3003/api/v1';
const PSICOLOGO_ID = '559a9710-7a5b-48a5-bd7a-055ec9c114d6';

async function testDebugDetallado() {
  try {
    console.log('🚀 Iniciando debug detallado...');
    
    // 1. Login
    const login = await axios.post(`${BASE_URL}/autenticacion/login`, {
      email: 'laura.fernandez@psyche.cl',
      password: 'ola123321'
    });
    const token = login.data.data.token;
    console.log('✅ Login exitoso');
    
    // 2. Generar disponibilidad para septiembre 2025
    const fechaInicio = '2025-09-01';
    const fechaFin = '2025-09-30';
    
    const horarios = {
      1: { hora_inicio: '09:00', hora_fin: '17:00', activo: true }, // Lunes
      2: { hora_inicio: '09:00', hora_fin: '17:00', activo: true }, // Martes
      3: { hora_inicio: '09:00', hora_fin: '17:00', activo: true }, // Miércoles
      4: { hora_inicio: '09:00', hora_fin: '17:00', activo: true }, // Jueves
      5: { hora_inicio: '09:00', hora_fin: '17:00', activo: true }, // Viernes
      6: { hora_inicio: '09:00', hora_fin: '13:00', activo: true }, // Sábado
      0: { hora_inicio: '00:00', hora_fin: '00:00', activo: false }  // Domingo
    };

    console.log('📅 Generando disponibilidad para septiembre 2025...');
    console.log('📊 Fecha inicio:', fechaInicio);
    console.log('📊 Fecha fin:', fechaFin);
    console.log('📊 Horarios:', JSON.stringify(horarios, null, 2));

    // 3. Calcular fechas que deberían generarse
    const fechas = [];
    const fechaInicioObj = new Date(fechaInicio);
    const fechaFinObj = new Date(fechaFin);

    for (let fecha = new Date(fechaInicioObj); fecha <= fechaFinObj; fecha.setDate(fecha.getDate() + 1)) {
      fechas.push(new Date(fecha).toISOString().split('T')[0]);
    }

    console.log('📊 Fechas a procesar:', fechas.length);
    console.log('📊 Primeras 5 fechas:', fechas.slice(0, 5));
    console.log('📊 Últimas 5 fechas:', fechas.slice(-5));

    const response = await axios.post(`${BASE_URL}/disponibilidad-mensual/psicologo/${PSICOLOGO_ID}/recurrente`, {
      fechaInicio,
      fechaFin,
      horarios
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ Respuesta completa:', JSON.stringify(response.data, null, 2));
    
    // 4. Verificar qué se creó
    const verificacion = await axios.get(`${BASE_URL}/disponibilidad-mensual/psicologo/${PSICOLOGO_ID}`, {
      headers: { Authorization: `Bearer ${token}` },
      params: { mes: 9, año: 2025 }
    });
    
    console.log('📊 Verificación completa:', JSON.stringify(verificacion.data, null, 2));
    
  } catch (error) {
    console.error('❌ Error completo:', error);
    if (error.response) {
      console.error('❌ Error response:', error.response.data);
      console.error('❌ Error status:', error.response.status);
    }
  }
}

testDebugDetallado();
