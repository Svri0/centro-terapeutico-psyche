require('dotenv').config();
const nodemailer = require('nodemailer');

async function testPasswordNoSpaces() {
  console.log('🔍 Probando contraseña sin espacios...\n');
  
  const emailUser = process.env.EMAIL_USER;
  const emailPasswordWithSpaces = process.env.EMAIL_PASSWORD;
  const emailPasswordNoSpaces = emailPasswordWithSpaces.replace(/\s/g, '');
  
  console.log('📋 Configuración:');
  console.log(`   EMAIL_USER: ${emailUser}`);
  console.log(`   Contraseña con espacios: ${emailPasswordWithSpaces}`);
  console.log(`   Contraseña sin espacios: ${emailPasswordNoSpaces}`);
  console.log(`   Longitud sin espacios: ${emailPasswordNoSpaces.length} caracteres`);
  
  // Probar con contraseña sin espacios
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: emailUser,
        pass: emailPasswordNoSpaces
      }
    });
    
    console.log('\n🧪 Probando autenticación sin espacios...');
    await transporter.verify();
    console.log('✅ Conexión exitosa sin espacios');
    
    // Enviar email de prueba
    console.log('📧 Enviando email de prueba...');
    const mailOptions = {
      from: emailUser,
      to: emailUser,
      subject: '🧠 Prueba - Contraseña sin espacios',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f0f9ff; border-radius: 8px;">
          <h2 style="color: #1e40af;">🧠 Centro Terapéutico Psyche</h2>
          <p style="color: #374151;">¡Prueba exitosa con contraseña sin espacios!</p>
          <p style="color: #6b7280; font-size: 12px;">Fecha: ${new Date().toLocaleString()}</p>
        </div>
      `
    };
    
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email enviado exitosamente');
    console.log(`📨 Message ID: ${info.messageId}`);
    
    console.log('\n🎉 ¡PROBLEMA RESUELTO!');
    console.log('✅ La contraseña funciona sin espacios');
    console.log('💡 Actualizando archivo .env...');
    
    // Actualizar el archivo .env con la contraseña sin espacios
    const fs = require('fs');
    const envContent = fs.readFileSync('.env', 'utf8');
    const updatedContent = envContent.replace(
      /EMAIL_PASSWORD=.*/,
      `EMAIL_PASSWORD=${emailPasswordNoSpaces}`
    );
    fs.writeFileSync('.env', updatedContent);
    
    console.log('✅ Archivo .env actualizado');
    console.log('💡 Ahora el sistema de emails debería funcionar correctamente');
    
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
    console.log('\n🔧 El problema no son los espacios');
    console.log('📝 Verifica:');
    console.log('1. Verificación en 2 pasos habilitada');
    console.log('2. Email válido de Gmail');
    console.log('3. Contraseña de aplicación correcta');
  }
}

testPasswordNoSpaces(); 