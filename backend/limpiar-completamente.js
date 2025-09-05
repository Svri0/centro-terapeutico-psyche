const axios = require('axios');

const BASE_URL = 'http://localhost:3003/api/v1';
const PSICOLOGO_ID = '559a9710-7a5b-48a5-bd7a-055ec9c114d6';

async function limpiarCompletamente() {
  try {
    console.log('🚀 Limpiando completamente la base de datos...');
    
    // 1. Login
    const login = await axios.post(`${BASE_URL}/autenticacion/login`, {
      email: 'laura.fernandez@psyche.cl',
      password: 'ola123321'
    });
    const token = login.data.data.token;
    console.log('✅ Login exitoso');
    
    // 2. Obtener todos los registros (incluyendo eliminados)
    const meses = [8, 9, 10, 11, 12];
    let totalEliminados = 0;
    
    for (const mes of meses) {
      const response = await axios.get(`${BASE_URL}/disponibilidad-mensual/psicologo/${PSICOLOGO_ID}`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { mes, año: 2025, incluirEliminados: true }
      });
      
      const registros = response.data.data;
      console.log(`📅 Mes ${mes}: ${registros.length} registros encontrados`);
      
      // Eliminar cada registro (hard delete)
      for (const registro of registros) {
        try {
          await axios.delete(`${BASE_URL}/disponibilidad-mensual/${registro.id}?hardDelete=true`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          totalEliminados++;
        } catch (error) {
          console.log(`   - Error eliminando ${registro.fecha}:`, error.response?.data?.message || error.message);
        }
      }
    }
    
    console.log(`✅ Total de registros eliminados: ${totalEliminados}`);
    
    // 3. Verificar que está limpio
    console.log('\n🔍 Verificando que está limpio...');
    for (const mes of meses) {
      const response = await axios.get(`${BASE_URL}/disponibilidad-mensual/psicologo/${PSICOLOGO_ID}`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { mes, año: 2025, incluirEliminados: true }
      });
      
      const registros = response.data.data;
      console.log(`   - Mes ${mes}: ${registros.length} registros restantes`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

limpiarCompletamente();
