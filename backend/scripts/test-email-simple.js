require('dotenv').config();
const { enviarEmailBienvenidaPsicologo } = require('../dist/utilidades/email.service');

async function testEmail() {
  console.log('🧪 Probando envío de email...');
  console.log('📧 Email configurado:', process.env.EMAIL_USER);
  console.log('🔑 Contraseña configurada:', process.env.EMAIL_PASSWORD ? 'SÍ' : 'NO');
  
  try {
    const resultado = await enviarEmailBienvenidaPsicologo(
      'gabrielgodoy211@gmail.com', // Email de prueba
      'Psicólogo de Prueba',
      'password123',
      'Psicología Clínica',
      undefined // Sin imagen por ahora
    );
    
    if (resultado) {
      console.log('✅ Email enviado exitosamente');
      console.log('📧 Revisa la bandeja de entrada de: gabrielgodoy211@gmail.com');
    } else {
      console.log('❌ Error al enviar email');
    }
  } catch (error) {
    console.error('💥 Error:', error.message);
  }
}

testEmail(); 