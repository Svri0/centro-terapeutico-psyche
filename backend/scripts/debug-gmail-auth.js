require('dotenv').config({ path: '../.env' });
const nodemailer = require('nodemailer');

async function debugGmailAuth() {
  console.log('🔍 DEPURACIÓN DETALLADA DE AUTENTICACIÓN GMAIL\n');
  
  // Mostrar configuración actual
  console.log('📧 Configuración actual:');
  console.log(`   Email: ${process.env.EMAIL_USER}`);
  console.log(`   Contraseña: ${process.env.EMAIL_PASSWORD}`);
  console.log(`   Contraseña limpia: ${process.env.EMAIL_PASSWORD ? process.env.EMAIL_PASSWORD.replace(/\s/g, '') : 'NO DEFINIDA'}\n`);
  
  // Configurar transportador con más opciones de debug
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD ? process.env.EMAIL_PASSWORD.replace(/\s/g, '') : ''
    },
    tls: {
      rejectUnauthorized: false
    },
    debug: true, // Habilitar debug
    logger: true // Habilitar logger
  });
  
  try {
    console.log('🔐 Intentando verificar conexión...');
    console.log('   Configuración SMTP:');
    console.log(`   - Host: smtp.gmail.com`);
    console.log(`   - Puerto: 587`);
    console.log(`   - Seguro: false`);
    console.log(`   - Usuario: ${process.env.EMAIL_USER}`);
    console.log(`   - Contraseña: ${process.env.EMAIL_PASSWORD ? 'CONFIGURADA' : 'NO CONFIGURADA'}\n`);
    
    // Verificar conexión
    const verifyResult = await transporter.verify();
    console.log('✅ Verificación exitosa:', verifyResult);
    
  } catch (error) {
    console.error('❌ Error en verificación:', error.message);
    console.error('   Código de error:', error.code);
    console.error('   Comando SMTP:', error.command);
    console.error('   Respuesta del servidor:', error.response);
    
    // Análisis específico del error
    if (error.code === 'EAUTH') {
      console.log('\n🔧 Análisis del error de autenticación:');
      console.log('   - El servidor rechazó las credenciales');
      console.log('   - Posibles causas:');
      console.log('     1. Verificación en dos pasos no habilitada');
      console.log('     2. Contraseña de aplicación incorrecta');
      console.log('     3. Email incorrecto');
      console.log('     4. La cuenta tiene restricciones de seguridad');
    } else if (error.code === 'ECONNECTION') {
      console.log('\n🔧 Análisis del error de conexión:');
      console.log('   - No se pudo conectar al servidor SMTP');
      console.log('   - Posibles causas:');
      console.log('     1. Problema de red');
      console.log('     2. Firewall bloqueando la conexión');
      console.log('     3. Gmail temporalmente no disponible');
    }
    
    console.log('\n📋 Pasos para solucionar:');
    console.log('1. Ve a https://myaccount.google.com/security');
    console.log('2. Verifica que "Verificación en dos pasos" esté ACTIVADA');
    console.log('3. Ve a "Contraseñas de aplicación"');
    console.log('4. Genera una nueva contraseña para "Centro Terapéutico Psyche"');
    console.log('5. Copia la contraseña de 16 caracteres SIN espacios');
    console.log('6. Actualiza el archivo .env con la nueva contraseña');
  }
}

debugGmailAuth(); 