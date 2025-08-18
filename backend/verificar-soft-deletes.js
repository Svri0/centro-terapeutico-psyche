const axios = require('axios');

const BASE_URL = 'http://localhost:3003/api/v1';
const PSICOLOGO_ID = '559a9710-7a5b-48a5-bd7a-055ec9c114d6';

async function verificarSoftDeletes() {
  try {
    console.log('🔍 Verificando soft deletes...');
    
    // 1. Login
    const login = await axios.post(`${BASE_URL}/autenticacion/login`, {
      email: 'laura.fernandez@psyche.cl',
      password: 'ola123321'
    });
    const token = login.data.data.token;
    console.log('✅ Login exitoso');
    
    // 2. Verificar todos los meses incluyendo soft deletes
    const meses = [8, 9, 10, 11, 12];
    
    for (const mes of meses) {
      console.log(`\n📅 Verificando mes ${mes}:`);
      
      // Intentar obtener registros sin filtros
      const response = await axios.get(`${BASE_URL}/disponibilidad-mensual/psicologo/${PSICOLOGO_ID}`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { mes, año: 2025, incluirEliminados: true }
      });
      
      const registros = response.data.data;
      console.log(`   - Registros encontrados: ${registros.length}`);
      
      if (registros.length > 0) {
        registros.forEach(reg => {
          console.log(`     - ${reg.fecha}: activo=${reg.activo}, eliminado=${reg.deleted_at ? 'SÍ' : 'NO'}`);
        });
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

verificarSoftDeletes();
