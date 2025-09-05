const { Sequelize } = require('sequelize');
require('dotenv').config();

// Mostrar las variables de entorno (sin mostrar la contraseña completa)
console.log('🔍 Variables de entorno cargadas:');
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_PORT:', process.env.DB_PORT);
console.log('DB_NAME:', process.env.DB_NAME);
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_PASSWORD:', process.env.DB_PASSWORD ? process.env.DB_PASSWORD.substring(0, 3) + '***' : 'NO DEFINIDA');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('');

// Configuración de la base de datos
const sequelize = new Sequelize({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'psyche_db',
  dialect: 'postgres',
  logging: false
});

async function testConnection() {
  try {
    console.log('🔧 Probando conexión a la base de datos...');
    await sequelize.authenticate();
    console.log('✅ Conexión exitosa a la base de datos!');
    
    // Verificar si existen las tablas principales
    console.log('🔍 Verificando tablas...');
    const [results] = await sequelize.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
    console.log('📋 Tablas encontradas:', results.map(r => r.table_name));
    
  } catch (error) {
    console.error('❌ Error de conexión:', error.message);
  } finally {
    await sequelize.close();
  }
}

testConnection(); 