const { Sequelize } = require('sequelize');
require('dotenv').config();

// Configuración de la base de datos
const sequelize = new Sequelize({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Ferreteriakm6',
  database: process.env.DB_NAME || 'psyche_db',
  dialect: 'postgres',
  logging: false
});

async function verificarTablaMensajes() {
  console.log('🔍 Verificando estructura de la tabla mensajes...\n');

  try {
    // 1. Verificar conexión
    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos exitosa');

    // 2. Verificar si existe la tabla mensajes
    console.log('\n2️⃣ Verificando si existe la tabla mensajes...');
    
    const [tablas] = await sequelize.query(
      "SELECT table_name FROM information_schema.tables WHERE table_name = 'mensajes'"
    );

    if (tablas.length === 0) {
      console.log('❌ La tabla mensajes no existe');
      return;
    }

    console.log('✅ La tabla mensajes existe');

    // 3. Verificar estructura de la tabla mensajes
    console.log('\n3️⃣ Verificando estructura de la tabla mensajes...');
    
    const [columnas] = await sequelize.query(
      "SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_name = 'mensajes' ORDER BY ordinal_position"
    );

    console.log('📋 Columnas de la tabla mensajes:');
    columnas.forEach((columna, index) => {
      console.log(`   ${index + 1}. ${columna.column_name} (${columna.data_type}) - Nullable: ${columna.is_nullable}`);
    });

    // 4. Verificar restricciones de clave foránea de mensajes
    console.log('\n4️⃣ Verificando restricciones de clave foránea de mensajes...');
    
    const [restricciones] = await sequelize.query(
      `SELECT 
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
       AND tc.table_name = 'mensajes'
       ORDER BY kcu.column_name`
    );

    console.log('📋 Restricciones de clave foránea de mensajes:');
    restricciones.forEach((restriccion, index) => {
      console.log(`   ${index + 1}. ${restriccion.column_name} -> ${restriccion.foreign_table_name}.${restriccion.foreign_column_name}`);
    });

    // 5. Verificar datos de ejemplo
    console.log('\n5️⃣ Verificando datos de ejemplo en mensajes...');
    
    const [datos] = await sequelize.query(
      'SELECT * FROM mensajes LIMIT 5'
    );

    console.log(`📋 Datos de ejemplo (${datos.length} registros):`);
    datos.forEach((dato, index) => {
      console.log(`   ${index + 1}.`, dato);
    });

  } catch (error) {
    console.error('❌ Error durante la verificación:', error.message);
    console.error('🔍 Detalles del error:', error);
  } finally {
    await sequelize.close();
  }
}

// Ejecutar verificación
verificarTablaMensajes(); 