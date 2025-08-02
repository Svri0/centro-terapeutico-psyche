require('dotenv').config({ path: '../.env' });
const { enviarEmailBienvenidaPsicologo } = require('../dist/utilidades/email.service');

async function testDiceBearEmail() {
  console.log('🧪 Probando email con avatar DiceBear...\n');
  
  console.log('📧 Configuración:');
  console.log(`   Email: ${process.env.EMAIL_USER}\n`);
  
  // URL de DiceBear real (robot con fondo verde)
  const dicebearUrl = 'https://api.dicebear.com/7.x/bottts/svg?seed=robot&backgroundColor=4ade80';
  
  console.log('🎨 Avatar DiceBear:');
  console.log(`   URL: ${dicebearUrl}\n`);
  
  try {
    const emailEnviado = await enviarEmailBienvenidaPsicologo(
      process.env.EMAIL_USER, // Enviar a sí mismo para prueba
      'Dr. María Elena Rodríguez', // Nombre para probar
      'TempPass123!',
      'Psicología Clínica - Terapia Familiar',
      dicebearUrl // Pasar la URL de DiceBear
    );
    
    if (emailEnviado) {
      console.log('✅ Email con avatar DiceBear enviado exitosamente!');
      console.log('📧 Revisa la bandeja de entrada');
      console.log('🎯 Deberías ver el robot naranja con fondo verde');
      console.log('💡 Si no se ve, aparecerá un avatar con iniciales "MR"');
    } else {
      console.log('❌ Error al enviar el email con avatar DiceBear');
    }
  } catch (error) {
    console.error('❌ Error en la prueba:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

testDiceBearEmail(); 