require('dotenv').config();

console.log('🔍 Verificando variables de entorno en el contexto del servidor...\n');

// Verificar variables de entorno
const emailUser = process.env.EMAIL_USER;
const emailPassword = process.env.EMAIL_PASSWORD;
const frontendUrl = process.env.FRONTEND_URL;

console.log('📋 Variables de entorno:');
console.log(`   EMAIL_USER: ${emailUser ? '✅ Configurado' : '❌ No configurado'}`);
console.log(`   EMAIL_PASSWORD: ${emailPassword ? '✅ Configurado' : '❌ No configurado'}`);
console.log(`   FRONTEND_URL: ${frontendUrl ? '✅ Configurado' : '❌ No configurado'}`);

if (emailUser) {
  console.log(`   EMAIL_USER valor: ${emailUser}`);
}
if (emailPassword) {
  console.log(`   EMAIL_PASSWORD valor: ${emailPassword.substring(0, 4)}...`);
}
if (frontendUrl) {
  console.log(`   FRONTEND_URL valor: ${frontendUrl}`);
}

console.log('\n🔧 Verificando archivo .env...');
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
  console.log('✅ Archivo .env existe');
  const envContent = fs.readFileSync(envPath, 'utf8');
  const emailUserLine = envContent.split('\n').find(line => line.startsWith('EMAIL_USER='));
  const emailPasswordLine = envContent.split('\n').find(line => line.startsWith('EMAIL_PASSWORD='));
  
  if (emailUserLine) {
    console.log(`   EMAIL_USER en archivo: ${emailUserLine}`);
  }
  if (emailPasswordLine) {
    console.log(`   EMAIL_PASSWORD en archivo: ${emailPasswordLine.substring(0, 20)}...`);
  }
} else {
  console.log('❌ Archivo .env no existe');
}

console.log('\n🧪 Probando importación del email service...');
try {
  const { enviarEmailBienvenidaPsicologo } = require('../dist/utilidades/email.service');
  console.log('✅ Email service importado correctamente');
  
  // Verificar que la función existe
  if (typeof enviarEmailBienvenidaPsicologo === 'function') {
    console.log('✅ Función enviarEmailBienvenidaPsicologo disponible');
  } else {
    console.log('❌ Función enviarEmailBienvenidaPsicologo no disponible');
  }
} catch (error) {
  console.error('❌ Error al importar email service:', error.message);
} 