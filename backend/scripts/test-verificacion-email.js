const { enviarEmailBienvenidaPsicologo } = require('../dist/utilidades/email.service');

console.log('🧪 Probando funcionalidad de verificación de email...\n');

// Simular datos de un psicólogo recién creado
const emailPsicologo = 'dentrodepsyche@gmail.com';
const nombrePsicologo = 'María Rodríguez';
const passwordTemporal = 'TempPass123!';
const especialidad = 'Psicología Clínica';
const avatarUrl = 'https://api.dicebear.com/7.x/bottts/svg?seed=maria&backgroundColor=f59e0b';

console.log('📧 Enviando email de bienvenida...');
console.log(`   Email: ${emailPsicologo}`);
console.log(`   Nombre: ${nombrePsicologo}`);
console.log(`   Contraseña temporal: ${passwordTemporal}`);
console.log(`   Especialidad: ${especialidad}`);
console.log(`   Avatar: ${avatarUrl}\n`);

enviarEmailBienvenidaPsicologo(emailPsicologo, nombrePsicologo, passwordTemporal, especialidad, avatarUrl)
  .then((exito) => {
    if (exito) {
      console.log('✅ Email enviado exitosamente!');
      console.log('📧 Revisa la bandeja de entrada');
      console.log('\n🎯 Flujo de verificación:');
      console.log('   1. Psicólogo recibe email con credenciales temporales');
      console.log('   2. Inicia sesión por primera vez');
      console.log('   3. Sistema detecta que debe cambiar contraseña');
      console.log('   4. Al cambiar contraseña, email se marca como verificado');
      console.log('   5. Nunca más aparece la sugerencia de cambio de contraseña');
    } else {
      console.log('❌ Error al enviar email');
    }
  })
  .catch((error) => {
    console.error('❌ Error:', error);
  }); 