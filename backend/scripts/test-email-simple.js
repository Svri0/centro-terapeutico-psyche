require('dotenv').config();
const nodemailer = require('nodemailer');

async function testEmailSimple() {
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
    console.log('1. Verifica que el archivo .env tenga las variables correctas');
    console.log('2. EMAIL_USER=tu_email@gmail.com');
    console.log('3. EMAIL_PASSWORD=tu_password_de_aplicacion');
    return;
  }
  
  console.log('\n🧪 Probando envío de email...');
  
  try {
    // Configurar transportador
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: emailUser,
        pass: emailPassword
      }
    });
    
    // Configurar email de prueba
    const mailOptions = {
      from: emailUser,
      to: emailUser, // Enviar a tu propio email para probar
      subject: '🧠 Prueba de Email - Centro Terapéutico Psyche',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 30px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">🧠 Centro Terapéutico Psyche</h1>
            <p style="color: #ffffff; margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">¡Prueba de configuración exitosa!</p>
          </div>
          
          <div style="padding: 40px 30px;">
            <h2 style="color: #1f2937; margin-top: 0; font-size: 24px;">¡Hola! 👋</h2>
            
            <p style="color: #374151; font-size: 16px; line-height: 1.6;">
              Este es un email de prueba para verificar que la configuración del sistema de emails 
              del <strong>Centro Terapéutico Psyche</strong> está funcionando correctamente.
            </p>
            
            <div style="background-color: #ecfdf5; border-left: 4px solid #10b981; padding: 15px; margin: 20px 0; border-radius: 0 8px 8px 0;">
              <h4 style="color: #065f46; margin-top: 0;">✅ Configuración Verificada</h4>
              <ul style="color: #065f46; line-height: 1.6;">
                <li>Servidor SMTP configurado correctamente</li>
                <li>Autenticación exitosa</li>
                <li>Email enviado sin errores</li>
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
    
    // Enviar email
    const info = await transporter.sendMail(mailOptions);
    
    console.log('✅ Email de prueba enviado exitosamente');
    console.log(`📧 Revisa la bandeja de entrada de: ${emailUser}`);
    console.log(`📨 Message ID: ${info.messageId}`);
    console.log('\n🎉 ¡La configuración de email está funcionando correctamente!');
    console.log('💡 Ahora puedes crear psicólogos desde el panel de administración');
    console.log('   y automáticamente recibirán emails de bienvenida.');
    
  } catch (error) {
    console.error('❌ Error al enviar el email:', error.message);
    console.log('\n🔧 Posibles soluciones:');
    console.log('1. Verifica que la contraseña de aplicación sea correcta');
    console.log('2. Asegúrate de que la verificación en dos pasos esté habilitada');
    console.log('3. Revisa que el email no esté en la carpeta de spam');
    console.log('4. Verifica que EMAIL_USER sea un email válido de Gmail');
  }
}

testEmailSimple(); 