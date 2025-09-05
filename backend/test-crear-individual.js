const axios = require('axios');

const BASE_URL = 'http://localhost:3003/api/v1';
const PSICOLOGO_ID = '559a9710-7a5b-48a5-bd7a-055ec9c114d6';

async function testCrearIndividual() {
  try {
    console.log('🚀 Probando crear registro individual...');
    
    // 1. Login
    const login = await axios.post(`${BASE_URL}/autenticacion/login`, {
      email: 'laura.fernandez@psyche.cl',
      password: 'ola123321'
    });
    const token = login.data.data.token;
    console.log('✅ Login exitoso');
    
    // 2. Crear un registro individual
    const registro = {
      psicologo_id: PSICOLOGO_ID,
      fecha: '2025-09-01',
      hora_inicio: '09:00',
      hora_fin: '17:00',
      activo: true,
      tipo_disponibilidad: 'individual'
    };

    console.log('📅 Creando registro individual...');
    console.log('📊 Datos:', JSON.stringify(registro, null, 2));

    const response = await axios.post(`${BASE_URL}/disponibilidad-mensual`, registro, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ Respuesta:', JSON.stringify(response.data, null, 2));
    
    // 3. Verificar que se creó
    const verificacion = await axios.get(`${BASE_URL}/disponibilidad-mensual/psicologo/${PSICOLOGO_ID}`, {
      headers: { Authorization: `Bearer ${token}` },
      params: { mes: 9, año: 2025 }
    });
    
    console.log('📊 Verificación:', JSON.stringify(verificacion.data, null, 2));
    
  } catch (error) {
    console.error('❌ Error completo:', error);
    if (error.response) {
      console.error('❌ Error response:', error.response.data);
      console.error('❌ Error status:', error.response.status);
    }
  }
}

testCrearIndividual();
