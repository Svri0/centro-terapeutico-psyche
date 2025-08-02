require('dotenv').config();
const nodemailer = require('nodemailer');

async function testGmailConfig() {
  console.log('🔍 Probando diferentes configuraciones de Gmail...\n');
  
  const emailUser = process.env.EMAIL_USER;
  const emailPassword = process.env.EMAIL_PASSWORD;
  
  console.log('📋 Configuración actual:');
  console.log(`   EMAIL_USER: ${emailUser}`);
  console.log(`   EMAIL_PASSWORD: ${emailPassword}`);
  console.log(`   Longitud: ${emailPassword ? emailPassword.length : 0} caracteres`);
  
  // Probar diferentes configuraciones
  const configs = [
    {
      name: 'Configuración Gmail estándar',
      config: {
        service: 'gmail',
        auth: {
          user: emailUser,
          pass: emailPassword
        }
      }
    },
    {
      name: 'Configuración SMTP explícita',
      config: {
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
          user: emailUser,
          pass: emailPassword
        }
      }
    },
    {
      name: 'Configuración SMTP con TLS',
      config: {
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
          user: emailUser,
          pass: emailPassword
        }
      }
    }
  ];
  
  for (const config of configs) {
    console.log(`\n🧪 Probando: ${config.name}`);
    
    try {
      const transporter = nodemailer.createTransport(config.config);
      
      // Verificar conexión
      console.log('   🔐 Verificando autenticación...');
      await transporter.verify();
      console.log('   ✅ Conexión exitosa');
      
      // Enviar email de prueba
      console.log('   📧 Enviando email de prueba...');
      const mailOptions = {
        from: emailUser,
        to: emailUser,
        subject: `🧠 Prueba - ${config.name}`,
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f0f9ff; border-radius: 8px;">
            <h2 style="color: #1e40af;">🧠 Centro Terapéutico Psyche</h2>
            <p style="color: #374151;">Esta es una prueba de la configuración: <strong>${config.name}</strong></p>
            <p style="color: #6b7280; font-size: 12px;">Fecha: ${new Date().toLocaleString()}</p>
          </div>
        `
      };
      
      const info = await transporter.sendMail(mailOptions);
      console.log(`   ✅ Email enviado exitosamente`);
      console.log(`   📨 Message ID: ${info.messageId}`);
      
      // Si llegamos aquí, la configuración funciona
      console.log('\n🎉 ¡CONFIGURACIÓN EXITOSA!');
      console.log(`✅ La configuración "${config.name}" funciona correctamente`);
      console.log('💡 Ahora puedes usar esta configuración en el sistema');
      
      return;
      
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
      
      if (error.code === 'EAUTH') {
        console.log('   🔧 Problema de autenticación detectado');
        console.log('   📝 Verifica:');
        console.log('      - Verificación en 2 pasos habilitada');
        console.log('      - Contraseña de aplicación correcta');
        console.log('      - Email válido de Gmail');
      }
    }
  }
  
  console.log('\n❌ Ninguna configuración funcionó');
  console.log('\n🔧 Soluciones recomendadas:');
  console.log('1. Verifica que la verificación en 2 pasos esté habilitada');
  console.log('2. Genera una nueva contraseña de aplicación');
  console.log('3. Asegúrate de que el email sea válido');
  console.log('4. Verifica que no haya espacios extra en la contraseña');
  console.log('\n📝 Pasos para generar contraseña de aplicación:');
  console.log('1. Ve a https://myaccount.google.com/security');
  console.log('2. Verificación en dos pasos → ACTIVAR');
  console.log('3. Contraseñas de aplicación → Generar nueva');
  console.log('4. Selecciona "Otra" y escribe "Psyche App"');
  console.log('5. Copia la contraseña de 16 caracteres');
}

testGmailConfig(); 