const axios = require('axios');

const BASE_URL = 'http://localhost:3003/api/v1';

async function testDuplicado() {
  try {
    // Primero crear un servicio
    console.log('🔍 Creando primer servicio...');
    const loginResponse = await axios.post(`${BASE_URL}/autenticacion/login`, {
      email: 'test.psicologo@psyche.cl',
      password: 'test123'
    });
    
    const token = loginResponse.data.data.token;
    const headers = { Authorization: `Bearer ${token}` };
    
    const servicioData = {
      tipo_servicio_id: 'consulta-general',
      nombre: 'Consulta Psicología General',
      descripcion: 'Consulta general de psicología',
      duracion: 60,
      categoria: 'Consulta'
    };
    
    const primerServicio = await axios.post(`${BASE_URL}/servicios`, servicioData, { headers });
    console.log('✅ Primer servicio creado:', primerServicio.data.data.nombre);
    
    // Ahora intentar crear el mismo servicio (duplicado)
    console.log('🔍 Intentando crear servicio duplicado...');
    try {
      const segundoServicio = await axios.post(`${BASE_URL}/servicios`, servicioData, { headers });
      console.log('❌ ERROR: No debería haber creado el segundo servicio');
    } catch (error) {
      console.log('✅ Error capturado correctamente');
      console.log('📊 Status:', error.response?.status);
      console.log('📝 Mensaje:', error.response?.data?.message);
      console.log('📋 Data completa:', error.response?.data);
    }
    
  } catch (error) {
    console.error('❌ Error en el test:', error.message);
  }
}

testDuplicado(); 