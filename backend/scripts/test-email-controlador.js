require('dotenv').config();
const { enviarEmailBienvenidaPsicologo } = require('../dist/utilidades/email.service');

async function testEmailControlador() {
  console.log('🔍 Simulando envío de email como lo hace el controlador...\n');
  
  // Simular los datos que vienen del controlador
  const email = 'test.psicologo@psyche.cl';
  const nombres = 'Dr. Juan';
  const apellidos = 'Pérez Test';
  const password = 'TestPass123!';
  const especialidad = 'Psicología Clínica - Terapia Cognitivo-Conductual';
  
  console.log('📋 Datos simulados del controlador:');
  console.log(`   Email: ${email}`);
  console.log(`   Nombres: ${nombres}`);
  console.log(`   Apellidos: ${apellidos}`);
  console.log(`   Password: ${password}`);
  console.log(`   Especialidad: ${especialidad}`);
  
  // Simular exactamente lo que hace el controlador
  console.log('\n🧪 Simulando lógica del controlador...');
  
  try {
    // Simular el commit de la transacción
    console.log('✅ Simulando commit de transacción...');
    
    // Simular creación de disponibilidad
    console.log('✅ Simulando creación de disponibilidad...');
    
    // Enviar email de bienvenida al psicólogo (exactamente como en el controlador)
    const nombreCompleto = `${nombres} ${apellidos}`;
    console.log(`📧 Enviando email a: ${nombreCompleto} (${email})`);
    
    const emailEnviado = await enviarEmailBienvenidaPsicologo(
      email,
      nombreCompleto,
      password,
      especialidad
    );

    if (emailEnviado) {
      console.log(`✅ Email de bienvenida enviado exitosamente a: ${email}`);
    } else {
      console.log(`❌ No se pudo enviar el email de bienvenida a: ${email}`);
    }

    console.log(`📝 Nuevo psicólogo creado: ${email}`);
    
    // Simular respuesta del controlador
    console.log('\n📤 Respuesta simulada del controlador:');
    console.log(`   - Email enviado: ${emailEnviado}`);
    console.log(`   - Mensaje: Psicólogo creado exitosamente. Se ha enviado un email de bienvenida.`);
    
  } catch (error) {
    console.error('❌ Error en la simulación:', error.message);
    console.log('\n🔧 Detalles del error:');
    console.log(error.stack);
  }
}

testEmailControlador(); 