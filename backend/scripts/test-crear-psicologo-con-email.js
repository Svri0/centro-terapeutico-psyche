require('dotenv').config();
const axios = require('axios');

async function testCrearPsicologoConEmail() {
  console.log('🧪 Probando creación de psicólogo con envío de email...\n');
  
  try {
    // Primero hacer login como admin
    console.log('🔐 Iniciando sesión como administrador...');
    const loginResponse = await axios.post('http://localhost:3002/api/v1/autenticacion/login', {
      email: 'admin@admin.cl',
      password: 'admin123'
    });
    
    const token = loginResponse.data.data.token;
    console.log('✅ Login exitoso');
    
    // Crear un psicólogo de prueba
    console.log('\n👨‍⚕️ Creando psicólogo de prueba...');
    const psicologoData = {
      nombres: 'Dr. Juan',
      apellidos: 'Pérez Test',
      email: 'test.psicologo2@psyche.cl',
      password: 'TestPass123!',
      telefono: '+56912345678',
      especialidad: 'Psicología Clínica - Terapia Cognitivo-Conductual',
      descripcion: 'Psicólogo de prueba para verificar envío de emails'
    };
    
    const crearResponse = await axios.post(
      'http://localhost:3002/api/v1/admin/psicologos',
      psicologoData,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('✅ Psicólogo creado exitosamente');
    console.log('📧 Respuesta del servidor:');
    console.log(`   - Email enviado: ${crearResponse.data.data.email_enviado}`);
    console.log(`   - Mensaje: ${crearResponse.data.mensaje}`);
    
    if (crearResponse.data.data.email_enviado) {
      console.log('\n🎉 ¡El email de bienvenida se envió correctamente!');
      console.log(`📧 Revisa la bandeja de entrada de: ${psicologoData.email}`);
      console.log('💡 También revisa la carpeta de spam por si acaso');
    } else {
      console.log('\n⚠️ El psicólogo se creó pero no se pudo enviar el email');
      console.log('🔧 Verifica los logs del servidor para más detalles');
    }
    
  } catch (error) {
    console.error('❌ Error en la prueba:', error.message);
    
    if (error.response) {
      console.log('📋 Detalles del error:');
      console.log(`   - Status: ${error.response.status}`);
      console.log(`   - Mensaje: ${error.response.data?.mensaje || 'Sin mensaje'}`);
      console.log(`   - Código: ${error.response.data?.codigo || 'Sin código'}`);
    }
  }
}

testCrearPsicologoConEmail(); 