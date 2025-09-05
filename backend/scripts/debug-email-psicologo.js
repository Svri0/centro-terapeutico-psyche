require('dotenv').config();
const { enviarEmailBienvenidaPsicologo } = require('../dist/utilidades/email.service');

async function debugEmailPsicologo() {
  console.log('🔍 Debuggeando envío de email para psicólogo...\n');
  
  // Datos del psicólogo que se creó en el test anterior
  const emailPsicologo = 'test.psicologo@psyche.cl';
  const nombrePsicologo = 'Dr. Juan Pérez Test';
  const passwordTemporal = 'TestPass123!';
  const especialidad = 'Psicología Clínica - Terapia Cognitivo-Conductual';
  
  console.log('📋 Datos del psicólogo:');
  console.log(`   Email: ${emailPsicologo}`);
  console.log(`   Nombre: ${nombrePsicologo}`);
  console.log(`   Contraseña: ${passwordTemporal}`);
  console.log(`   Especialidad: ${especialidad}`);
  
  console.log('\n🧪 Probando envío de email...');
  
  try {
    const emailEnviado = await enviarEmailBienvenidaPsicologo(
      emailPsicologo,
      nombrePsicologo,
      passwordTemporal,
      especialidad
    );
    
    if (emailEnviado) {
      console.log('✅ Email de bienvenida enviado exitosamente');
      console.log(`📧 Revisa la bandeja de entrada de: ${emailPsicologo}`);
    } else {
      console.log('❌ Error al enviar el email de bienvenida');
      console.log('🔧 Posibles causas:');
      console.log('1. Error en la configuración de Gmail');
      console.log('2. Problema con la contraseña de aplicación');
      console.log('3. Error en el servidor SMTP');
    }
  } catch (error) {
    console.error('❌ Error en el envío:', error.message);
    console.log('\n🔧 Detalles del error:');
    console.log(error.stack);
  }
}

debugEmailPsicologo(); 