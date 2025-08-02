const axios = require('axios');

const BASE_URL = 'http://localhost:3002/api/v1';

// Datos del psicólogo de prueba
const psicologoTest = {
  nombres: 'Dr. Test',
  apellidos: 'Psicólogo',
  email: 'test.psicologo@psyche.cl',
  password: 'test123',
  telefono: '+56912345678',
  especialidad: 'Psicología Clínica',
  descripcion: 'Psicólogo de prueba para testing'
};

async function crearPsicologoTest() {
  console.log('🔧 Creando psicólogo de prueba...');
  
  try {
    // Login como admin
    console.log('1️⃣ Login como admin...');
    const adminLogin = await axios.post(`${BASE_URL}/autenticacion/login`, {
      email: 'admin@admin.com',
      password: 'admin123'
    });
    
    const token = adminLogin.data.data.token;
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
    
    console.log('✅ Login exitoso');
    
    // Crear psicólogo
    console.log('2️⃣ Creando psicólogo de prueba...');
    const crearResponse = await axios.post(`${BASE_URL}/admin/psicologos`, psicologoTest, { headers });
    
    console.log('✅ Psicólogo creado exitosamente');
    console.log('📋 Credenciales del psicólogo de prueba:');
    console.log(`   📧 Email: ${psicologoTest.email}`);
    console.log(`   🔑 Contraseña: ${psicologoTest.password}`);
    
    return psicologoTest;
    
  } catch (error) {
    if (error.response?.data?.mensaje?.includes('ya existe')) {
      console.log('✅ El psicólogo de prueba ya existe');
      return psicologoTest;
    } else {
      console.error('❌ Error:', error.response?.data || error.message);
      throw error;
    }
  }
}

// Ejecutar
crearPsicologoTest(); 