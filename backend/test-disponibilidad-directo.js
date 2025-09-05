const axios = require('axios');

const BASE_URL = 'http://localhost:3002/api/v1';
const PSICOLOGO_ID = '559a9710-7a5b-48a5-bd7a-055ec9c114d6';

async function testSimple() {
  try {
    console.log('🚀 Probando conexión simple...');
    
    // 1. Probar salud del servidor
    const salud = await axios.get(`${BASE_URL.replace('/api/v1', '')}/salud`);
    console.log('✅ Servidor respondiendo:', salud.data);
    
    // 2. Login
    const login = await axios.post(`${BASE_URL}/autenticacion/login`, {
      email: 'laura.fernandez@psyche.cl',
      password: 'ola123321'
    });
    console.log('✅ Login exitoso');
    const token = login.data.data.token;
    
    // 3. Obtener disponibilidad
    const disponibilidad = await axios.get(`${BASE_URL}/disponibilidad-mensual/psicologo/${PSICOLOGO_ID}`, {
      headers: { Authorization: `Bearer ${token}` },
      params: { mes: 8, año: 2025 }
    });
    console.log('✅ Disponibilidad obtenida:', disponibilidad.data.data.length, 'registros');
    
    // 4. Mostrar algunos ejemplos
    disponibilidad.data.data.slice(0, 5).forEach(reg => {
      const fecha = new Date(reg.fecha);
      const diaSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'][fecha.getDay()];
      console.log(`   ${reg.fecha} (${diaSemana}): ${reg.activo ? 'Activo' : 'Inactivo'} ${reg.hora_inicio}-${reg.hora_fin}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

testSimple();
