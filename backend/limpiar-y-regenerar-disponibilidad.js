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

async function limpiarDisponibilidad(token) {
  try {
    // Obtener toda la disponibilidad actual
    const response = await axios.get(`${BASE_URL}/disponibilidad-mensual/psicologo/${PSICOLOGO_ID}`, {
      headers: { Authorization: `Bearer ${token}` },
      params: { mes: 8, año: 2025 }
    });
    
    console.log('📊 Disponibilidad actual:', response.data.data.length, 'registros');
    
    // Eliminar cada registro
    for (const registro of response.data.data) {
      await axios.delete(`${BASE_URL}/disponibilidad-mensual/${registro.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
    }
    
    console.log('✅ Disponibilidad limpiada exitosamente');
  } catch (error) {
    console.error('❌ Error al limpiar disponibilidad:', error.response?.data || error.message);
    throw error;
  }
}

async function regenerarDisponibilidadCorrecta(token) {
  try {
    const fechaInicio = '2025-08-01';
    const fechaFin = '2025-08-31';
    
    // Horarios correctos: Lunes a Sábado laborables, Domingo no laborable
    const horarios = {
      1: { hora_inicio: '09:00', hora_fin: '17:00', activo: true }, // Lunes
      2: { hora_inicio: '09:00', hora_fin: '17:00', activo: true }, // Martes
      3: { hora_inicio: '09:00', hora_fin: '17:00', activo: true }, // Miércoles
      4: { hora_inicio: '09:00', hora_fin: '17:00', activo: true }, // Jueves
      5: { hora_inicio: '09:00', hora_fin: '17:00', activo: true }, // Viernes
      6: { hora_inicio: '09:00', hora_fin: '13:00', activo: true }, // Sábado
      0: { hora_inicio: '00:00', hora_fin: '00:00', activo: false }  // Domingo
    };

    console.log('🔄 Regenerando disponibilidad con horarios correctos...');
    console.log('📅 Horarios configurados:');
    console.log('   - Lunes a Viernes: 09:00-17:00');
    console.log('   - Sábado: 09:00-13:00');
    console.log('   - Domingo: No laborable');

    const response = await axios.post(`${BASE_URL}/disponibilidad-mensual/psicologo/${PSICOLOGO_ID}/recurrente`, {
      fechaInicio,
      fechaFin,
      horarios
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ Disponibilidad regenerada exitosamente');
    console.log('📊 Registros creados:', response.data.data.length);
    return response.data;
  } catch (error) {
    console.error('❌ Error al regenerar disponibilidad:', error.response?.data || error.message);
    throw error;
  }
}

async function verificarDisponibilidad(token) {
  try {
    const response = await axios.get(`${BASE_URL}/disponibilidad-mensual/psicologo/${PSICOLOGO_ID}`, {
      headers: { Authorization: `Bearer ${token}` },
      params: { mes: 8, año: 2025 }
    });
    
    console.log('📊 Verificación final:');
    console.log('   - Total registros:', response.data.data.length);
    
    // Mostrar algunos ejemplos
    const ejemplos = response.data.data.slice(0, 10);
    console.log('   - Primeros 10 registros:');
    ejemplos.forEach(reg => {
      const fecha = new Date(reg.fecha);
      const diaSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'][fecha.getDay()];
      console.log(`     ${reg.fecha} (${diaSemana}): ${reg.activo ? 'Activo' : 'Inactivo'} ${reg.hora_inicio}-${reg.hora_fin}`);
    });
    
    return response.data;
  } catch (error) {
    console.error('❌ Error al verificar disponibilidad:', error.response?.data || error.message);
    throw error;
  }
}

async function runScript() {
  try {
    console.log('🚀 Iniciando limpieza y regeneración de disponibilidad...\n');
    
    // 1. Login
    const token = await loginPsicologo();
    
    // 2. Limpiar disponibilidad existente
    console.log('\n🧹 Limpiando disponibilidad existente...');
    await limpiarDisponibilidad(token);
    
    // 3. Regenerar disponibilidad correcta
    console.log('\n🔄 Regenerando disponibilidad correcta...');
    await regenerarDisponibilidadCorrecta(token);
    
    // 4. Verificar resultado
    console.log('\n🔍 Verificando resultado...');
    await verificarDisponibilidad(token);
    
    console.log('\n✅ Proceso completado exitosamente');
    
  } catch (error) {
    console.error('\n❌ Error en el proceso:', error.message);
  }
}

runScript();
