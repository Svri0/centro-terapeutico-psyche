const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'psyche_db',
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'VMlover01!',
  dialect: 'postgres',
  logging: false
});

async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos exitosa');
    
    // Verificar si hay usuarios
    const usuarios = await sequelize.query(
      'SELECT COUNT(*) as total FROM usuarios WHERE deleted_at IS NULL',
      { type: sequelize.QueryTypes.SELECT }
    );
    
    console.log('📊 Total de usuarios:', usuarios[0].total);
    
    // Verificar usuarios específicos
    const usuariosDetalle = await sequelize.query(
      'SELECT id, nombres, apellidos, email, activo FROM usuarios WHERE deleted_at IS NULL LIMIT 5',
      { type: sequelize.QueryTypes.SELECT }
    );
    
    console.log('👥 Usuarios encontrados:');
    usuariosDetalle.forEach(user => {
      console.log(`  - ${user.nombres} ${user.apellidos} (${user.email}) - Activo: ${user.activo}`);
    });
    
  } catch (error) {
    console.error('❌ Error de conexión:', error.message);
  } finally {
    await sequelize.close();
  }
}

testConnection();
