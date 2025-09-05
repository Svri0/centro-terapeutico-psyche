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

async function limpiarTodaDisponibilidad(token) {
  try {
    const meses = [8, 9, 10, 11, 12];
    let totalEliminados = 0;
    
    console.log('🧹 Limpiando toda la disponibilidad...');
    
    for (const mes of meses) {
      const response = await axios.get(`${BASE_URL}/disponibilidad-mensual/psicologo/${PSICOLOGO_ID}`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { mes, año: 2025 }
      });
      
      const registros = response.data.data;
      console.log(`   - Mes ${mes}: ${registros.length} registros encontrados`);
      
      // Eliminar cada registro
      for (const registro of registros) {
        await axios.delete(`${BASE_URL}/disponibilidad-mensual/${registro.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        totalEliminados++;
      }
    }
    
    console.log(`✅ Total de registros eliminados: ${totalEliminados}`);
  } catch (error) {
    console.error('❌ Error al limpiar disponibilidad:', error.response?.data || error.message);
    throw error;
  }
}

async function regenerarDisponibilidadCompleta(token) {
  try {
    const fechaInicio = '2025-08-01';
    const fechaFin = '2025-12-31';
    
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

    console.log('🔄 Regenerando disponibilidad completa...');
    console.log('📅 Horarios configurados:');
    console.log('   - Lunes a Viernes: 09:00-17:00');
    console.log('   - Sábado: 09:00-13:00');
    console.log('   - Domingo: No laborable (activo: false)');

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

async function verificarDisponibilidadPorMes(token) {
  try {
    const meses = [8, 9, 10, 11, 12];
    
    console.log('📊 Verificación por mes:');
    
    for (const mes of meses) {
      const response = await axios.get(`${BASE_URL}/disponibilidad-mensual/psicologo/${PSICOLOGO_ID}`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { mes, año: 2025 }
      });
      
      const disponibilidad = response.data.data;
      const diasLaborables = disponibilidad.filter(d => d.activo).length;
      const diasNoLaborables = disponibilidad.filter(d => !d.activo).length;
      
      console.log(`   - Mes ${mes}: ${disponibilidad.length} registros totales`);
      console.log(`     - Días laborables: ${diasLaborables}`);
      console.log(`     - Días no laborables: ${diasNoLaborables}`);
      
      // Mostrar algunos ejemplos de domingos
      const domingos = disponibilidad.filter(d => {
        const fecha = new Date(d.fecha);
        return fecha.getDay() === 0; // Domingo
      });
      
      if (domingos.length > 0) {
        console.log(`     - Ejemplos de domingos: ${domingos.slice(0, 3).map(d => `${d.fecha} (activo: ${d.activo})`).join(', ')}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Error al verificar disponibilidad:', error.response?.data || error.message);
    throw error;
  }
}

async function runScript() {
  try {
    console.log('🚀 Iniciando limpieza completa y regeneración...\n');
    
    // 1. Login
    const token = await loginPsicologo();
    
    // 2. Limpiar toda la disponibilidad existente
    console.log('\n🧹 Limpiando toda la disponibilidad existente...');
    await limpiarTodaDisponibilidad(token);
    
    // 3. Regenerar disponibilidad completa
    console.log('\n🔄 Regenerando disponibilidad completa...');
    await regenerarDisponibilidadCompleta(token);
    
    // 4. Verificar resultado por mes
    console.log('\n🔍 Verificando resultado por mes...');
    await verificarDisponibilidadPorMes(token);
    
    console.log('\n✅ Proceso completado exitosamente');
    
  } catch (error) {
    console.error('\n❌ Error en el proceso:', error.message);
  }
}

runScript();
