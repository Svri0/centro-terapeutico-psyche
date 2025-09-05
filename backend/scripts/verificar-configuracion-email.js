require('dotenv').config();
const { enviarEmailBienvenidaPsicologo } = require('../src/utilidades/email.service');

async function verificarConfiguracionEmail() {
  console.log('🔍 Verificando configuración de email...\n');
  
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
    console.log('\n🔧 Para configurar el email:');
    console.log('1. Abre tu archivo .env en la carpeta backend/');
    console.log('2. Agrega estas líneas:');
    console.log('   EMAIL_USER=tu_email@gmail.com');
    console.log('   EMAIL_PASSWORD=tu_password_de_aplicacion');
    console.log('   FRONTEND_URL=http://localhost:3000');
    console.log('\n📧 Para obtener una contraseña de aplicación de Gmail:');
    console.log('1. Ve a https://myaccount.google.com/');
    console.log('2. Seguridad → Verificación en dos pasos');
    console.log('3. Contraseñas de aplicación → Generar nueva contraseña');
    console.log('4. Usa esa contraseña en EMAIL_PASSWORD');
    return;
  }
  
  console.log('\n🧪 Probando envío de email...');
  
  try {
    const emailEnviado = await enviarEmailBienvenidaPsicologo(
      emailUser, // Enviar a tu propio email para probar
      'Dr. Juan Pérez',
      'TempPass123!',
      'Psicología Clínica - Terapia Cognitivo-Conductual'
    );
    
    if (emailEnviado) {
      console.log('✅ Email de bienvenida enviado exitosamente');
      console.log(`📧 Revisa la bandeja de entrada de: ${emailUser}`);
      console.log('\n🎉 ¡La configuración de email está funcionando correctamente!');
      console.log('💡 Ahora puedes crear psicólogos desde el panel de administración');
      console.log('   y automáticamente recibirán emails de bienvenida.');
    } else {
      console.log('❌ Error al enviar el email de bienvenida');
      console.log('\n🔧 Posibles soluciones:');
      console.log('1. Verifica que la contraseña de aplicación sea correcta');
      console.log('2. Asegúrate de que la verificación en dos pasos esté habilitada');
      console.log('3. Revisa que el email no esté en la carpeta de spam');
    }
  } catch (error) {
    console.error('❌ Error en la prueba:', error.message);
    console.log('\n🔧 Configuración necesaria:');
    console.log('1. Verifica que EMAIL_USER sea un email válido de Gmail');
    console.log('2. Verifica que EMAIL_PASSWORD sea una contraseña de aplicación válida');
    console.log('3. Asegúrate de que la verificación en dos pasos esté habilitada');
  }
}

verificarConfiguracionEmail(); 