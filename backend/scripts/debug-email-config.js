require('dotenv').config({ path: '../.env' });

console.log('🔍 DEPURACIÓN DE CONFIGURACIÓN DE EMAIL\n');

// Verificar variables de entorno
console.log('📧 Variables de entorno:');
console.log(`   EMAIL_USER: "${process.env.EMAIL_USER}"`);
console.log(`   EMAIL_PASSWORD: "${process.env.EMAIL_PASSWORD}"`);
console.log(`   EMAIL_PASSWORD length: ${process.env.EMAIL_PASSWORD ? process.env.EMAIL_PASSWORD.length : 0}`);
console.log(`   FRONTEND_URL: "${process.env.FRONTEND_URL}"\n`);

// Verificar si las variables están definidas
console.log('✅ Verificación de variables:');
console.log(`   EMAIL_USER definida: ${process.env.EMAIL_USER ? 'SÍ' : 'NO'}`);
console.log(`   EMAIL_PASSWORD definida: ${process.env.EMAIL_PASSWORD ? 'SÍ' : 'NO'}`);
console.log(`   FRONTEND_URL definida: ${process.env.FRONTEND_URL ? 'SÍ' : 'NO'}\n`);

// Procesar contraseña
const rawPassword = process.env.EMAIL_PASSWORD;
const cleanPassword = rawPassword ? rawPassword.replace(/\s/g, '') : '';

console.log('🔑 Procesamiento de contraseña:');
console.log(`   Contraseña original: "${rawPassword}"`);
console.log(`   Contraseña limpia: "${cleanPassword}"`);
console.log(`   Longitud original: ${rawPassword ? rawPassword.length : 0}`);
console.log(`   Longitud limpia: ${cleanPassword.length}\n`);

// Verificar formato de contraseña de aplicación
if (cleanPassword) {
  console.log('🔍 Análisis de contraseña de aplicación:');
  console.log(`   Formato esperado: 16 caracteres sin espacios`);
  console.log(`   Formato actual: ${cleanPassword.length} caracteres`);
  console.log(`   ¿Formato correcto?: ${cleanPassword.length === 16 ? 'SÍ' : 'NO'}`);
  
  if (cleanPassword.length !== 16) {
    console.log('   ⚠️  La contraseña de aplicación debe tener exactamente 16 caracteres');
  }
  
  // Verificar si contiene solo caracteres válidos
  const validChars = /^[a-zA-Z0-9]+$/;
  console.log(`   ¿Solo caracteres válidos?: ${validChars.test(cleanPassword) ? 'SÍ' : 'NO'}`);
}

console.log('\n📋 Pasos para solucionar problemas:');
console.log('1. Verifica que la verificación en dos pasos esté habilitada en Gmail');
console.log('2. Genera una nueva contraseña de aplicación de 16 caracteres');
console.log('3. Asegúrate de que no haya espacios extra en el archivo .env');
console.log('4. Verifica que el email sea correcto y esté verificado'); 