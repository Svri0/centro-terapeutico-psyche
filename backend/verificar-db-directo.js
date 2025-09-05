const axios = require('axios');

const BASE_URL = 'http://localhost:3002/api/v1';
const PSICOLOGO_ID = '559a9710-7a5b-48a5-bd7a-055ec9c114d6';

async function verificarDB() {
  try {
    console.log('🔍 Verificando base de datos directamente...');
    
    // 1. Login
    const login = await axios.post(`${BASE_URL}/autenticacion/login`, {
      email: 'laura.fernandez@psyche.cl',
      password: 'ola123321'
    });
    const token = login.data.data.token;
    console.log('✅ Login exitoso');
    
    // 2. Verificar todos los meses
    const meses = [8, 9, 10, 11, 12];
    
    for (const mes of meses) {
      console.log(`\n📅 Verificando mes ${mes}:`);
      
      const response = await axios.get(`${BASE_URL}/disponibilidad-mensual/psicologo/${PSICOLOGO_ID}`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { mes, año: 2025 }
      });
      
      const registros = response.data.data;
      console.log(`   - Registros encontrados: ${registros.length}`);
      
      if (registros.length > 0) {
        const diasLaborables = registros.filter(d => d.activo).length;
        const diasNoLaborables = registros.filter(d => !d.activo).length;
        
        console.log(`   - Días laborables: ${diasLaborables}`);
        console.log(`   - Días no laborables: ${diasNoLaborables}`);
        
        // Mostrar algunos ejemplos
        registros.slice(0, 3).forEach(reg => {
          const fecha = new Date(reg.fecha);
          const diaSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'][fecha.getDay()];
          console.log(`     - ${reg.fecha} (${diaSemana}): activo=${reg.activo}, ${reg.hora_inicio}-${reg.hora_fin}`);
        });
        
        // Verificar domingos específicamente
        const domingos = registros.filter(d => {
          const fecha = new Date(d.fecha);
          return fecha.getDay() === 0;
        });
        
        console.log(`   - Domingos encontrados: ${domingos.length}`);
        if (domingos.length > 0) {
          domingos.slice(0, 3).forEach(d => {
            console.log(`     - Domingo ${d.fecha}: activo=${d.activo}`);
          });
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

verificarDB();
