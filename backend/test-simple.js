const axios = require('axios');

const BASE_URL = 'http://localhost:3002/api/v1';
const PSICOLOGO_ID = '559a9710-7a5b-48a5-bd7a-055ec9c114d6';

async function testSimple() {
  try {
    console.log('🚀 Probando endpoint simple...');
    
    // 1. Login
    const login = await axios.post(`${BASE_URL}/autenticacion/login`, {
      email: 'laura.fernandez@psyche.cl',
      password: 'ola123321'
    });
    const token = login.data.data.token;
    console.log('✅ Login exitoso');
    
    // 2. Probar endpoint GET simple
    console.log('🔍 Probando endpoint GET...');
    const response = await axios.get(`${BASE_URL}/disponibilidad-mensual/psicologo/${PSICOLOGO_ID}`, {
      headers: { Authorization: `Bearer ${token}` },
      params: { mes: 9, año: 2025 }
    });
    
    console.log('✅ Respuesta GET:', response.data);
    
    // 3. Probar endpoint POST simple
    console.log('🔍 Probando endpoint POST...');
    const responsePost = await axios.post(`${BASE_URL}/disponibilidad-mensual/psicologo/${PSICOLOGO_ID}/recurrente`, {
      fechaInicio: '2025-09-01',
      fechaFin: '2025-09-02', // Solo 2 días para prueba
      horarios: {
        0: { hora_inicio: '00:00', hora_fin: '00:00', activo: false },
        1: { hora_inicio: '09:00', hora_fin: '17:00', activo: true }
      }
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ Respuesta POST:', responsePost.data);
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
    if (error.response) {
      console.error('❌ Status:', error.response.status);
      console.error('❌ Headers:', error.response.headers);
    }
  }
}

testSimple();



