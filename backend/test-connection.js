const { Sequelize } = require('sequelize');

// Configuración de la base de datos
const sequelize = new Sequelize('psyche_db', 'postgres', 'Ferreteriakm6', {
  host: 'localhost',
  port: 5432,
  dialect: 'postgres',
  logging: false
});

async function testConnection() {
  try {
    console.log('🔍 Probando conexión a la base de datos...');
    await sequelize.authenticate();
    console.log('✅ Conexión exitosa a la base de datos');
    
    // Probar una consulta simple
    const [result] = await sequelize.query('SELECT NOW() as current_time');
    console.log('✅ Consulta exitosa:', result[0]);
    
  } catch (error) {
    console.error('❌ Error de conexión:', error.message);
  } finally {
    await sequelize.close();
  }
}

testConnection(); 