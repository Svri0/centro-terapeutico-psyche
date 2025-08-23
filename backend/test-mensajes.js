const { Sequelize } = require('sequelize');

// Configuración de la base de datos
const sequelize = new Sequelize({
  dialect: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: 'VMlover01!',
  database: 'psyche_db',
  logging: console.log
});

async function testMensajes() {
  try {
    console.log('🔍 Conectando a la base de datos...');
    await sequelize.authenticate();
    console.log('✅ Conexión exitosa');

    // Verificar si la tabla mensajes existe
    console.log('\n🔍 Verificando tabla mensajes...');
    const [results] = await sequelize.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'mensajes'
    `);
    
    if (results.length > 0) {
      console.log('✅ Tabla mensajes existe');
      
      // Verificar estructura de la tabla
      console.log('\n🔍 Estructura de la tabla mensajes:');
      const [columns] = await sequelize.query(`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns 
        WHERE table_name = 'mensajes'
        ORDER BY ordinal_position
      `);
      
      columns.forEach(col => {
        console.log(`  - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
      });
      
      // Verificar si hay datos
      console.log('\n🔍 Verificando datos en la tabla:');
      const [count] = await sequelize.query('SELECT COUNT(*) as total FROM mensajes');
      console.log(`  - Total de mensajes: ${count[0].total}`);
      
      // Verificar usuarios disponibles
      console.log('\n🔍 Usuarios disponibles:');
      const [usuarios] = await sequelize.query('SELECT id, nombres, apellidos, rol_id FROM usuarios LIMIT 5');
      usuarios.forEach(user => {
        console.log(`  - ${user.nombres} ${user.apellidos} (ID: ${user.id}, Rol: ${user.rol_id})`);
      });
      
    } else {
      console.log('❌ Tabla mensajes NO existe');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await sequelize.close();
  }
}

testMensajes();
