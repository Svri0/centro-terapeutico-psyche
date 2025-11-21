const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

console.log('\n🔍 DIAGNÓSTICO DE CONFIGURACIÓN DE EMAIL\n');
console.log('━'.repeat(60));

// Verificar variables de entorno
console.log('\n📧 Variables de Entorno:');
console.log('━'.repeat(60));
console.log(`EMAIL_USER: ${process.env.EMAIL_USER ? '✅ Configurado (' + process.env.EMAIL_USER + ')' : '❌ NO CONFIGURADO'}`);
console.log(`EMAIL_PASSWORD: ${process.env.EMAIL_PASSWORD ? '✅ Configurado (' + process.env.EMAIL_PASSWORD.substring(0, 4) + '****' + process.env.EMAIL_PASSWORD.substring(process.env.EMAIL_PASSWORD.length - 4) + ')' : '❌ NO CONFIGURADO'}`);
console.log(`FRONTEND_URL: ${process.env.FRONTEND_URL ? '✅ Configurado (' + process.env.FRONTEND_URL + ')' : '❌ NO CONFIGURADO'}`);

// Verificar que las variables no estén vacías
if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
  console.log('\n❌ ERROR: Variables de email no configuradas correctamente');
  console.log('\n💡 SOLUCIÓN:');
  console.log('   1. Verifica que el archivo backend/.env exista');
  console.log('   2. Asegúrate de que tenga estas líneas:');
  console.log('      EMAIL_USER=dentrodepsyche@gmail.com');
  console.log('      EMAIL_PASSWORD=vpbv pvtd oryn daww');
  console.log('      FRONTEND_URL=http://localhost:3000');
  console.log('\n');
  process.exit(1);
}

// Intentar enviar un email de prueba
async function probarEmail() {
  try {
    console.log('\n📤 Probando envío de email...');
    console.log('━'.repeat(60));
    
    const nodemailer = require('nodemailer');
    
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD.replace(/\s/g, '') // Eliminar espacios
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    // Verificar conexión
    console.log('🔄 Verificando conexión con Gmail...');
    await transporter.verify();
    console.log('✅ Conexión con Gmail exitosa!\n');

    // Intentar enviar email de prueba
    console.log('🔄 Enviando email de prueba...');
    const info = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER, // Enviar a nosotros mismos
      subject: '✅ Prueba de Email - Centro Terapéutico Psyche',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #2563eb;">🧠 Centro Terapéutico Psyche</h2>
          <p>Este es un email de prueba.</p>
          <p>✅ Si recibes este email, significa que el sistema de correos está funcionando correctamente.</p>
          <hr>
          <p style="color: #666; font-size: 12px;">
            Email enviado el: ${new Date().toLocaleString('es-CL')}
          </p>
        </div>
      `
    });

    console.log('✅ Email de prueba enviado exitosamente!');
    console.log(`📧 Message ID: ${info.messageId}`);
    console.log(`📧 Enviado a: ${process.env.EMAIL_USER}`);
    console.log('\n');
    console.log('━'.repeat(60));
    console.log('🎉 DIAGNÓSTICO COMPLETADO - SISTEMA DE EMAIL FUNCIONAL');
    console.log('━'.repeat(60));
    console.log('\n💡 Si el email no llega:');
    console.log('   1. Verifica tu bandeja de entrada');
    console.log('   2. Revisa la carpeta de spam');
    console.log('   3. Espera unos segundos, puede tardar en llegar');
    console.log('\n');

  } catch (error) {
    console.log('❌ ERROR al enviar email:', error.message);
    console.log('\n💡 SOLUCIÓN según el error:');
    
    if (error.message.includes('Authentication') || error.message.includes('auth')) {
      console.log('   ⚠️  Error de autenticación de Gmail:');
      console.log('   1. Verifica que EMAIL_PASSWORD sea correcto');
      console.log('   2. La contraseña correcta es: vpbv pvtd oryn daww');
      console.log('   3. Asegúrate de que esté en backend/.env sin comillas');
      console.log('   4. Reinicia el servidor después de cambiar .env');
    } else if (error.message.includes('connection') || error.message.includes('ETIMEDOUT')) {
      console.log('   ⚠️  Error de conexión:');
      console.log('   1. Verifica tu conexión a internet');
      console.log('   2. Verifica que no haya un firewall bloqueando Gmail');
    } else {
      console.log('   ⚠️  Error desconocido:');
      console.log('   ', error.message);
    }
    console.log('\n');
    process.exit(1);
  }
}

// Ejecutar prueba
probarEmail();

