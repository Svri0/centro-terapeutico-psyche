require('dotenv').config({ path: '../.env' });
const { enviarEmailBienvenidaPsicologo } = require('../dist/utilidades/email.service');

async function testAvatarPersonalizado() {
  console.log('🧪 Probando email con avatar personalizado...\n');
  
  console.log('📧 Configuración:');
  console.log(`   Email: ${process.env.EMAIL_USER}\n`);
  
  try {
    const emailEnviado = await enviarEmailBienvenidaPsicologo(
      process.env.EMAIL_USER, // Enviar a sí mismo para prueba
      'Dr. Juan Carlos Pérez González', // Nombre largo para probar iniciales
      'TempPass123!',
      'Psicología Clínica - Terapia Cognitivo-Conductual'
      // Sin avatarUrl para usar el avatar personalizado por defecto
    );
    
    if (emailEnviado) {
      console.log('✅ Email con avatar personalizado enviado exitosamente!');
      console.log('📧 Revisa la bandeja de entrada para ver el avatar con iniciales');
      console.log('🎯 Deberías ver un avatar circular con las iniciales "JP"');
    } else {
      console.log('❌ Error al enviar el email con avatar personalizado');
    }
  } catch (error) {
    console.error('❌ Error en la prueba:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

testAvatarPersonalizado(); 