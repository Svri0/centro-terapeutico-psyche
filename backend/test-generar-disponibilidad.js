const axios = require('axios');

const BASE_URL = 'http://localhost:3002/api/v1';
const PSICOLOGO_ID = '559a9710-7a5b-48a5-bd7a-055ec9c114d6';

async function testGenerarDisponibilidad() {
  try {
    console.log('🚀 Probando generar disponibilidad...');
    
    // 1. Login
    const login = await axios.post(`${BASE_URL}/autenticacion/login`, {
      email: 'laura.fernandez@psyche.cl',
      password: 'ola123321'
    });
    const token = login.data.data.token;
    console.log('✅ Login exitoso');
    console.log('🔍 Token:', token.substring(0, 50) + '...');
    
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
    console.log('📊 Horarios:', horarios);

    console.log('🔍 Enviando petición a:', `${BASE_URL}/disponibilidad-mensual/psicologo/${PSICOLOGO_ID}/recurrente`);
    console.log('🔍 Headers:', { Authorization: `Bearer ${token.substring(0, 50)}...` });
    console.log('🔍 Body:', { fechaInicio, fechaFin, horarios });
    
    const response = await axios.post(`${BASE_URL}/disponibilidad-mensual/psicologo/${PSICOLOGO_ID}/recurrente`, {
      fechaInicio,
      fechaFin,
      horarios
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ Respuesta:', response.data);
    console.log('📊 Registros creados:', response.data.data.length);
    
    // 3. Verificar qué se creó
    const verificacion = await axios.get(`${BASE_URL}/disponibilidad-mensual/psicologo/${PSICOLOGO_ID}`, {
      headers: { Authorization: `Bearer ${token}` },
      params: { mes: 9, año: 2025 }
    });
    
    console.log('📊 Verificación:');
    console.log('   - Total registros:', verificacion.data.data.length);
    
    const diasLaborables = verificacion.data.data.filter(d => d.activo).length;
    const diasNoLaborables = verificacion.data.data.filter(d => !d.activo).length;
    
    console.log('   - Días laborables:', diasLaborables);
    console.log('   - Días no laborables:', diasNoLaborables);
    
    // Mostrar algunos ejemplos
    verificacion.data.data.slice(0, 5).forEach(reg => {
      const fecha = new Date(reg.fecha);
      const diaSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'][fecha.getDay()];
      console.log(`   - ${reg.fecha} (${diaSemana}): activo=${reg.activo}, ${reg.hora_inicio}-${reg.hora_fin}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

testGenerarDisponibilidad();
