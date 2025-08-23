const { Sequelize } = require('sequelize');

// Configuración de la base de datos
const sequelize = new Sequelize({
  dialect: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: 'VMlover01!',
  database: 'psyche_db',
  logging: false
});

async function verificarEstructuraUsuarios() {
  try {
    console.log('🔍 Conectando a la base de datos...');
    await sequelize.authenticate();
    console.log('✅ Conexión exitosa\n');

    // Verificar estructura de la tabla usuarios
    console.log('🔍 Estructura de la tabla usuarios:');
    const [columnas] = await sequelize.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'usuarios'
      ORDER BY ordinal_position
    `);
    
    columnas.forEach(col => {
      console.log(`   - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
    });

    // Verificar si hay datos en la tabla
    console.log('\n🔍 Datos de ejemplo en usuarios:');
    const [usuarios] = await sequelize.query(`
      SELECT * FROM usuarios LIMIT 3
    `);
    
    usuarios.forEach((user, index) => {
      console.log(`\nUsuario ${index + 1}:`);
      Object.keys(user).forEach(key => {
        console.log(`   ${key}: ${user[key]}`);
      });
    });

    // Verificar roles
    console.log('\n🔍 Roles disponibles:');
    const [roles] = await sequelize.query('SELECT * FROM roles');
    roles.forEach(rol => {
      console.log(`   - ${rol.id}: ${rol.nombre}`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await sequelize.close();
  }
}

verificarEstructuraUsuarios();
