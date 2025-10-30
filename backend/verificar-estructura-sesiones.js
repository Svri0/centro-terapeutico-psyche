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

async function verificarEstructuraSesiones() {
  try {
    console.log('🔍 Verificando estructura de la tabla sesiones...');
    await sequelize.authenticate();
    console.log('✅ Conexión exitosa a la base de datos');

    // Obtener estructura completa de la tabla sesiones
    const [columnas] = await sequelize.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'sesiones'
      ORDER BY ordinal_position
    `);

    console.log('\n📋 Estructura completa de la tabla sesiones:');
    console.log('==========================================');
    columnas.forEach((col, index) => {
      console.log(`${index + 1}. ${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'nullable' : 'not null'})`);
      if (col.column_default) {
        console.log(`   Default: ${col.column_default}`);
      }
    });

    // Verificar si hay alguna relación con citas
    console.log('\n🔗 Verificando relaciones con citas...');
    const [relaciones] = await sequelize.query(`
      SELECT 
        tc.constraint_name, 
        tc.table_name, 
        kcu.column_name, 
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name 
      FROM 
        information_schema.table_constraints AS tc 
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
          AND tc.table_schema = kcu.table_schema
        JOIN information_schema.constraint_column_usage AS ccu
          ON ccu.constraint_name = tc.constraint_name
          AND ccu.table_schema = tc.table_schema
      WHERE tc.constraint_type = 'FOREIGN KEY' 
        AND tc.table_name = 'sesiones'
    `);

    if (relaciones.length > 0) {
      console.log('✅ Relaciones encontradas:');
      relaciones.forEach(rel => {
        console.log(`  - ${rel.column_name} -> ${rel.foreign_table_name}.${rel.foreign_column_name}`);
      });
    } else {
      console.log('❌ No se encontraron relaciones con otras tablas');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await sequelize.close();
  }
}

verificarEstructuraSesiones();


