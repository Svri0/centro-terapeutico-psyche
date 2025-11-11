require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const fs = require('fs');
const path = require('path');

console.log('🔍 VERIFICANDO CONFIGURACIÓN .ENV\n');

// Verificar si existe el archivo .env
const envPath = path.join(__dirname, '..', '.env');
console.log('📁 Ruta del .env:', envPath);
console.log('📁 Existe:', fs.existsSync(envPath) ? '✅ SÍ' : '❌ NO\n');

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  console.log('📄 Contenido del .env (sin contraseñas):');
  envContent.split('\n').forEach(line => {
    if (line.trim() && !line.trim().startsWith('#')) {
      const [key, ...valueParts] = line.split('=');
      const value = valueParts.join('=');
      if (key && value) {
        if (key.includes('PASSWORD') || key.includes('SECRET')) {
          console.log(`   ${key.trim()}=${value.trim().substring(0, 3)}***`);
        } else {
          console.log(`   ${key.trim()}=${value.trim()}`);
        }
      }
    }
  });
  console.log('');
}

console.log('🔍 Variables cargadas en process.env:');
console.log(`   DB_HOST: ${process.env.DB_HOST || 'NO DEFINIDO'}`);
console.log(`   DB_PORT: ${process.env.DB_PORT || 'NO DEFINIDO'}`);
console.log(`   DB_NAME: ${process.env.DB_NAME || 'NO DEFINIDO'}`);
console.log(`   DB_USER: ${process.env.DB_USER || 'NO DEFINIDO'}`);
console.log(`   DB_PASSWORD: ${process.env.DB_PASSWORD ? '***DEFINIDO***' : '❌ NO DEFINIDO'}`);
console.log(`   JWT_SECRET: ${process.env.JWT_SECRET ? '***DEFINIDO***' : '❌ NO DEFINIDO'}`);
console.log(`   PORT: ${process.env.PORT || 'NO DEFINIDO'}`);
console.log('');

// Verificar si las variables están definidas
const requiredVars = ['DB_HOST', 'DB_PORT', 'DB_NAME', 'DB_USER', 'DB_PASSWORD'];
const missing = requiredVars.filter(v => !process.env[v]);

if (missing.length > 0) {
  console.log('❌ VARIABLES FALTANTES:');
  missing.forEach(v => console.log(`   - ${v}`));
  console.log('\n💡 SOLUCIÓN:');
  console.log('   1. Verifica que el archivo .env esté en: backend/.env');
  console.log('   2. Ejecuta: node scripts/setup-rapido.js');
  console.log('   3. O crea el .env manualmente con las variables necesarias\n');
} else {
  console.log('✅ Todas las variables requeridas están definidas\n');
}

// Probar conexión
const { Sequelize } = require('sequelize');
const sequelize = new Sequelize({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'psyche_db',
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
  dialect: 'postgres',
  logging: false
});

console.log('🔌 Probando conexión con estas credenciales...');
sequelize.authenticate()
  .then(() => {
    console.log('✅ Conexión exitosa con las credenciales del .env\n');
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Error de conexión:');
    console.error('   Mensaje:', error.message);
    if (error.original) {
      console.error('   Código:', error.original.code);
      console.error('   Detalles:', error.original.message);
    }
    console.error('\n💡 Si las credenciales están correctas, verifica:');
    console.error('   1. Que PostgreSQL esté corriendo');
    console.error('   2. Que la base de datos exista');
    console.error('   3. Que el usuario tenga permisos\n');
    process.exit(1);
  });

