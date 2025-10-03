require('dotenv').config();
const { enviarEmailBienvenidaPsicologo } = require('../src/utilidades/email.service');

async function testEmailReal() {
  console.log('🧪 Probando envío de email REAL...\n');
  
  // Verificar variables de entorno
  const emailUser = process.env.EMAIL_USER;
  const emailPassword = process.env.EMAIL_PASSWORD;
  const frontendUrl = process.env.FRONTEND_URL;
  
  console.log('📋 Variables de entorno:');
  console.log(`   EMAIL_USER: ${emailUser ? '✅ Configurado' : '❌ No configurado'}`);
  console.log(`   EMAIL_PASSWORD: ${emailPassword ? '✅ Configurado' : '❌ No configurado'}`);
  console.log(`   FRONTEND_URL: ${frontendUrl ? '✅ Configurado' : '❌ No configurado'}`);
  
  if (!emailUser || !emailPassword) {
    console.log('\n❌ Configuración incompleta');
    return;
  }
  
  console.log('\n🧪 Probando envío de email REAL...');
  console.log(`📤 ENVIANDO DESDE: ${emailUser}`);
  console.log(`📥 ENVIANDO HACIA: roman@gmail.com`);
  
  try {
    // ENVIAR A UN EMAIL DIFERENTE (no al mismo emailUser)
    const emailEnviado = await enviarEmailBienvenidaPsicologo(
      'romandiazmiguelignacio@gmail.com', // ⚠️ CAMBIA ESTO por tu email personal
      'Dr. Juan Pérez',
      'TempPass123!',
      'Psicología Clínica - Terapia Cognitivo-Conductual'
    );
    
    if (emailEnviado) {
      console.log('✅ Email de bienvenida enviado exitosamente');
      console.log('📧 Revisa la bandeja de entrada de: roman@gmail.com');
      console.log('\n🎉 ¡El sistema funciona correctamente!');
      console.log('💡 Los emails se envían DESDE dentrodepsyche@gmail.com');
      console.log('   HACIA el email del psicólogo que se registra.');
      
    } else {
      console.log('❌ Error al enviar el email de bienvenida');
    }
  } catch (error) {
    console.error('❌ Error en la prueba:', error.message);
  }
}

testEmailReal();
