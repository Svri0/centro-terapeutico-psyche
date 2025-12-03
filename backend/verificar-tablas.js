const { Sequelize } = require('sequelize');

// Configuración de la base de datos
const sequelize = new Sequelize({
  database: 'psyche_db',
  username: 'postgres',
  password: 'Ferreteriakm6',
  host: 'localhost',
  port: 5432,
  dialect: 'postgres',
  logging: false
});

async function verificarTablas() {
  try {
    console.log('🔍 Conectando a la base de datos...');
    await sequelize.authenticate();
    console.log('✅ Conexión exitosa a la base de datos');

    // Obtener todas las tablas
    const [tablas] = await sequelize.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);

    console.log('\n📋 Tablas existentes en la base de datos:');
    console.log('=====================================');
    
    tablas.forEach((tabla, index) => {
      console.log(`${index + 1}. ${tabla.table_name}`);
    });

    // Verificar si existe la tabla sesiones
    const [sesionesExiste] = await sequelize.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'sesiones'
    `);

    if (sesionesExiste.length > 0) {
      console.log('\n✅ La tabla "sesiones" existe');
      
      // Verificar estructura de la tabla sesiones
      const [columnas] = await sequelize.query(`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_name = 'sesiones'
        ORDER BY ordinal_position
      `);
      
      console.log('\n📋 Estructura de la tabla sesiones:');
      columnas.forEach(col => {
        console.log(`  - ${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'nullable' : 'not null'})`);
      });
    } else {
      console.log('\n❌ La tabla "sesiones" NO existe');
      console.log('🔧 Necesitamos crear la tabla sesiones');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await sequelize.close();
  }
}

verificarTablas();




