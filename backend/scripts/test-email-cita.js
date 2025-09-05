require('dotenv').config();
const { enviarEmailConfirmacionCita } = require('../dist/utilidades/email.service');

async function testEmailCita() {
  console.log('🧪 Probando email de confirmación de cita...\n');
  
  try {
    // Datos de prueba
    const emailPaciente = 'paciente.test@psyche.cl';
    const nombrePaciente = 'María González';
    const nombrePsicologo = 'Dr. Carlos Rodríguez';
    const fecha = '2024-12-15';
    const hora = '14:00';
    const tipoSesion = 'individual';
    const modalidad = 'presencial';
    const citaId = 'test-cita-123';
    
    console.log('📧 Enviando email de confirmación de cita...');
    console.log('   - Paciente:', nombrePaciente);
    console.log('   - Psicólogo:', nombrePsicologo);
    console.log('   - Fecha:', fecha);
    console.log('   - Hora:', hora);
    console.log('   - Email destino:', emailPaciente);
    
    const resultado = await enviarEmailConfirmacionCita(
      emailPaciente,
      nombrePaciente,
      nombrePsicologo,
      fecha,
      hora,
      tipoSesion,
      modalidad,
      citaId
    );
    
    if (resultado) {
      console.log('\n✅ Email enviado exitosamente!');
      console.log('📱 El paciente puede acceder desde su dispositivo móvil');
      console.log('🔗 Enlace del perfil:', `${process.env.FRONTEND_URL}/perfil-paciente`);
    } else {
      console.log('\n❌ Error al enviar el email');
    }
    
  } catch (error) {
    console.error('\n💥 Error en la prueba:', error.message);
    console.error('Stack:', error.stack);
  }
}

// Ejecutar la prueba
testEmailCita();
