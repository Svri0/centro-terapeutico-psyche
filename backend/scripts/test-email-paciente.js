const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

// Importar la función de envío de email
const { enviarEmailRegistroPaciente } = require('../dist/utilidades/email.service');

async function testEmailPaciente() {
  console.log('\n🧪 TEST DE EMAIL DE REGISTRO DE PACIENTE\n');
  console.log('━'.repeat(60));
  
  // Datos de prueba
  const emailPaciente = 'dentrodepsyche@gmail.com'; // Email del sistema (para probar)
  const nombrePaciente = 'Juan Pérez Prueba';
  const emailTemporal = 'juan.perez@test.cl';
  const passwordTemporal = 'juan123';
  const tokenRegistro = 'test-token-123456';
  
  console.log('📧 Datos del email:');
  console.log(`   Para: ${emailPaciente}`);
  console.log(`   Nombre: ${nombrePaciente}`);
  console.log(`   Email temporal: ${emailTemporal}`);
  console.log(`   Password temporal: ${passwordTemporal}`);
  console.log(`   Token: ${tokenRegistro}`);
  console.log('');
  
  console.log('🔄 Enviando email de registro de paciente...\n');
  
  try {
    const resultado = await enviarEmailRegistroPaciente(
      emailPaciente,
      nombrePaciente,
      emailTemporal,
      passwordTemporal,
      tokenRegistro
    );
    
    if (resultado) {
      console.log('✅ EMAIL ENVIADO EXITOSAMENTE!');
      console.log('');
      console.log('━'.repeat(60));
      console.log('🎉 TEST COMPLETADO - EMAIL DE PACIENTE FUNCIONAL');
      console.log('━'.repeat(60));
      console.log('');
      console.log('💡 Verifica tu bandeja de entrada:');
      console.log(`   📧 ${emailPaciente}`);
      console.log('');
      console.log('✅ El sistema de emails para pacientes está funcionando correctamente.');
      console.log('');
    } else {
      console.log('❌ ERROR: Email no fue enviado');
      console.log('');
      console.log('💡 Posibles causas:');
      console.log('   1. Error en la configuración de Gmail');
      console.log('   2. Error en las credenciales');
      console.log('   3. Problema de conexión');
      console.log('');
    }
  } catch (error) {
    console.log('❌ ERROR al enviar email:', error.message);
    console.log('');
    console.log('Stack trace:');
    console.log(error.stack);
    console.log('');
  }
}

// Ejecutar test
testEmailPaciente();

