const { Sequelize } = require('sequelize');
require('dotenv').config();

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

async function verificarSimple() {
  try {
    console.log('🔍 Verificación simple de la base de datos...\n');

    // 1. Verificar conexión
    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos exitosa');

    // 2. Listar todas las tablas
    console.log('2️⃣ Listando todas las tablas...');
    const [tables] = await sequelize.query(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name",
      { type: Sequelize.QueryTypes.SELECT }
    );

    console.log('📋 Tablas encontradas:');
    tables.forEach(table => {
      console.log(`   - ${table.table_name}`);
    });

    // 3. Si existe la tabla roles, verificar su contenido
    if (tables.some(t => t.table_name === 'roles')) {
      console.log('\n3️⃣ Verificando tabla roles...');
      const [roles] = await sequelize.query(
        "SELECT * FROM roles",
        { type: Sequelize.QueryTypes.SELECT }
      );

      console.log('📋 Roles encontrados:');
      roles.forEach(role => {
        console.log(`   - ${JSON.stringify(role)}`);
      });
    }

    // 4. Si existe la tabla usuarios, verificar su contenido
    if (tables.some(t => t.table_name === 'usuarios')) {
      console.log('\n4️⃣ Verificando tabla usuarios...');
      const [usuarios] = await sequelize.query(
        "SELECT id, nombres, apellidos, email, rol_id FROM usuarios",
        { type: Sequelize.QueryTypes.SELECT }
      );

      console.log('📋 Usuarios encontrados:');
      usuarios.forEach(usuario => {
        console.log(`   - ${JSON.stringify(usuario)}`);
      });
    }

  } catch (error) {
    console.error('❌ Error durante la verificación:', error.message);
    console.error('🔍 Detalles del error:', error);
  } finally {
    await sequelize.close();
  }
}

// Ejecutar verificación
verificarSimple(); 