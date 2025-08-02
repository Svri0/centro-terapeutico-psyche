require('dotenv').config({ path: '../.env' });
const { enviarEmailBienvenidaPsicologo } = require('../dist/utilidades/email.service');

async function testEmailConDiceBear() {
  console.log('🧪 Probando email de bienvenida con avatar DiceBear...\n');
  
  // Avatar de DiceBear de ejemplo (uno de los que usa el sistema)
  const avatarDiceBear = 'https://api.dicebear.com/7.x/bottts/svg?seed=lion&backgroundColor=ffdfbf&scale=80&mouth=smile&eyes=happy';
  
  console.log('📧 Configuración:');
  console.log(`   Email: ${process.env.EMAIL_USER}`);
  console.log(`   Avatar: ${avatarDiceBear}\n`);
  
  try {
    const emailEnviado = await enviarEmailBienvenidaPsicologo(
      process.env.EMAIL_USER, // Enviar a sí mismo para prueba
      'Dr. Juan Pérez',
      'TempPass123!',
      'Psicología Clínica - Terapia Cognitivo-Conductual',
      avatarDiceBear
    );
    
    if (emailEnviado) {
      console.log('✅ Email de bienvenida enviado exitosamente!');
      console.log('📧 Revisa la bandeja de entrada para ver el avatar de DiceBear');
      console.log('🎯 El avatar debería mostrarse como una imagen PNG en lugar de SVG');
    } else {
      console.log('❌ Error al enviar el email de bienvenida');
    }
  } catch (error) {
    console.error('❌ Error en la prueba:', error.message);
  }
}

testEmailConDiceBear(); 