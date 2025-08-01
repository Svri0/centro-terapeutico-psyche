const { enviarEmailBienvenidaPsicologo } = require('../src/utilidades/email.service');

async function testEmailBienvenida() {
  console.log('🧪 Probando envío de email de bienvenida...\n');
  
  try {
    const emailEnviado = await enviarEmailBienvenidaPsicologo(
      'test@example.com', // Cambiar por un email real para probar
      'Dr. Juan Pérez',
      'TempPass123!',
      'Psicología Clínica - Terapia Cognitivo-Conductual'
    );
    
    if (emailEnviado) {
      console.log('✅ Email de bienvenida enviado exitosamente');
      console.log('📧 Revisa la bandeja de entrada del email de prueba');
    } else {
      console.log('❌ Error al enviar el email de bienvenida');
      console.log('🔧 Verifica la configuración de email en el archivo .env');
    }
  } catch (error) {
    console.error('❌ Error en la prueba:', error.message);
    console.log('\n🔧 Configuración necesaria:');
    console.log('1. Agrega EMAIL_USER=tu_email@gmail.com al archivo .env');
    console.log('2. Agrega EMAIL_PASSWORD=tu_password_de_aplicacion al archivo .env');
    console.log('3. Asegúrate de usar una contraseña de aplicación de Gmail');
  }
}

testEmailBienvenida(); 