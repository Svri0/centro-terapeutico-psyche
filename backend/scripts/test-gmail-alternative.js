require('dotenv').config();
const nodemailer = require('nodemailer');

async function testGmailAlternative() {
  console.log('🔍 Probando configuración alternativa de Gmail...\n');
  
  const emailUser = process.env.EMAIL_USER;
  const emailPassword = process.env.EMAIL_PASSWORD.replace(/\s/g, '');
  
  console.log('📋 Configuración:');
  console.log(`   EMAIL_USER: ${emailUser}`);
  console.log(`   EMAIL_PASSWORD: ${emailPassword}`);
  
  // Configuración alternativa que a veces funciona mejor
  const config = {
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: emailUser,
      pass: emailPassword
    },
    tls: {
      rejectUnauthorized: false
    }
  };
  
  try {
    console.log('🧪 Creando transportador...');
    const transporter = nodemailer.createTransport(config);
    
    console.log('🔐 Verificando conexión...');
    await transporter.verify();
    console.log('✅ Conexión verificada');
    
    console.log('📧 Enviando email de prueba...');
    const mailOptions = {
      from: `"Centro Terapéutico Psyche" <${emailUser}>`,
      to: emailUser,
      subject: '🧠 Prueba de Email - Configuración Alternativa',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 30px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">🧠 Centro Terapéutico Psyche</h1>
            <p style="color: #ffffff; margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Configuración Alternativa - ¡Funcionando!</p>
          </div>
          
          <div style="padding: 40px 30px;">
            <h2 style="color: #1f2937; margin-top: 0; font-size: 24px;">¡Hola! 👋</h2>
            
            <p style="color: #374151; font-size: 16px; line-height: 1.6;">
              Esta es una prueba usando la <strong>configuración alternativa</strong> del sistema de emails 
              del <strong>Centro Terapéutico Psyche</strong>.
            </p>
            
            <div style="background-color: #ecfdf5; border-left: 4px solid #10b981; padding: 15px; margin: 20px 0; border-radius: 0 8px 8px 0;">
              <h4 style="color: #065f46; margin-top: 0;">✅ Configuración Alternativa Verificada</h4>
              <ul style="color: #065f46; line-height: 1.6;">
                <li>Servidor SMTP: smtp.gmail.com:587</li>
                <li>Autenticación exitosa</li>
                <li>Email enviado sin errores</li>
                <li>Configuración TLS optimizada</li>
              </ul>
            </div>
            
            <p style="color: #6b7280; font-size: 14px; text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
              <strong>Equipo del Centro Terapéutico Psyche</strong><br>
              🧠 Transformando vidas a través de la salud mental
            </p>
          </div>
        </div>
      `
    };
    
    const info = await transporter.sendMail(mailOptions);
    
    console.log('✅ Email enviado exitosamente');
    console.log(`📨 Message ID: ${info.messageId}`);
    console.log(`📧 Revisa la bandeja de entrada de: ${emailUser}`);
    
    console.log('\n🎉 ¡CONFIGURACIÓN ALTERNATIVA EXITOSA!');
    console.log('✅ El sistema de emails funciona con la configuración alternativa');
    console.log('💡 Ahora puedes crear psicólogos desde el panel de administración');
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    
    if (error.code === 'EAUTH') {
      console.log('\n🔧 El problema es de autenticación');
      console.log('📝 Verifica estos pasos:');
      console.log('1. Ve a https://myaccount.google.com/security');
      console.log('2. Asegúrate de que "Verificación en dos pasos" esté ACTIVADA');
      console.log('3. Ve a "Contraseñas de aplicación"');
      console.log('4. Selecciona "Otra (nombre personalizado)"');
      console.log('5. Escribe "Psyche App" y genera');
      console.log('6. Copia la nueva contraseña de 16 caracteres');
      console.log('\n⚠️ IMPORTANTE: La verificación en 2 pasos DEBE estar activada');
      console.log('   antes de poder generar contraseñas de aplicación');
    }
  }
}

testGmailAlternative(); 