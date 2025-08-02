require('dotenv').config({ path: '../.env' });
const nodemailer = require('nodemailer');

async function testEmail() {
  console.log('🧪 Probando configuración de email...\n');
  
  // Verificar variables de entorno
  console.log('📧 Configuración de email:');
  console.log(`   EMAIL_USER: ${process.env.EMAIL_USER}`);
  console.log(`   EMAIL_PASSWORD: ${process.env.EMAIL_PASSWORD ? '✅ Configurada' : '❌ No configurada'}`);
  console.log(`   FRONTEND_URL: ${process.env.FRONTEND_URL}\n`);
  
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
    console.log('❌ Error: Faltan variables de entorno de email');
    console.log('   Verifica que EMAIL_USER y EMAIL_PASSWORD estén configuradas en el archivo .env');
    return;
  }
  
  // Configurar transportador
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD.replace(/\s/g, '') // Remover espacios
    },
    tls: {
      rejectUnauthorized: false
    }
  });
  
  try {
    console.log('🔐 Verificando conexión con Gmail...');
    
    // Verificar conexión
    await transporter.verify();
    console.log('✅ Conexión con Gmail exitosa\n');
    
    // Enviar email de prueba
    console.log('📤 Enviando email de prueba...');
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER, // Enviar a sí mismo para prueba
      subject: '🧠 Prueba de Email - Centro Terapéutico Psyche',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 30px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">🧠 Centro Terapéutico Psyche</h1>
            <p style="color: #ffffff; margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Prueba de configuración de email</p>
          </div>
          
          <div style="padding: 40px 30px;">
            <h2 style="color: #1f2937; margin-top: 0;">¡Email de prueba exitoso! 🎉</h2>
            
            <p style="color: #374151; font-size: 16px; line-height: 1.6;">
              La configuración de email del <strong>Centro Terapéutico Psyche</strong> está funcionando correctamente.
            </p>
            
            <div style="background-color: #ecfdf5; border-left: 4px solid #10b981; padding: 15px; margin: 20px 0; border-radius: 0 8px 8px 0;">
              <h4 style="color: #065f46; margin-top: 0;">✅ Configuración verificada:</h4>
              <ul style="color: #065f46; line-height: 1.6;">
                <li>Servidor SMTP: smtp.gmail.com</li>
                <li>Puerto: 587</li>
                <li>Autenticación: Gmail App Password</li>
                <li>Email remitente: ${process.env.EMAIL_USER}</li>
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
    console.log('✅ Email de prueba enviado exitosamente!');
    console.log(`   Message ID: ${info.messageId}`);
    console.log(`   📧 Revisa la bandeja de entrada de: ${process.env.EMAIL_USER}`);
    
  } catch (error) {
    console.error('❌ Error al enviar email:', error.message);
    
    if (error.code === 'EAUTH') {
      console.log('\n🔧 Solución de problemas:');
      console.log('1. Verifica que la verificación en dos pasos esté habilitada en Gmail');
      console.log('2. Verifica que la contraseña de aplicación sea correcta');
      console.log('3. Asegúrate de que no haya espacios extra en EMAIL_PASSWORD');
    } else if (error.code === 'ECONNECTION') {
      console.log('\n🔧 Solución de problemas:');
      console.log('1. Verifica tu conexión a internet');
      console.log('2. Asegúrate de que Gmail no esté bloqueado por firewall');
    }
  }
}

testEmail(); 