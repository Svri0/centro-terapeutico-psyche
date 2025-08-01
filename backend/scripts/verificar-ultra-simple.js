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

async function verificarUltraSimple() {
  try {
    console.log('🔍 Verificación ultra simple de la base de datos...\n');

    // 1. Verificar conexión
    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos exitosa');

    // 2. Listar todas las tablas de forma simple
    console.log('2️⃣ Listando todas las tablas...');
    const result = await sequelize.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
    console.log('📋 Resultado completo:', result);

    // 3. Intentar verificar roles directamente
    console.log('\n3️⃣ Verificando tabla roles directamente...');
    try {
      const rolesResult = await sequelize.query("SELECT * FROM roles");
      console.log('📋 Roles resultado:', rolesResult);
    } catch (error) {
      console.log('❌ Error al consultar roles:', error.message);
    }

    // 4. Intentar verificar usuarios directamente
    console.log('\n4️⃣ Verificando tabla usuarios directamente...');
    try {
      const usuariosResult = await sequelize.query("SELECT * FROM usuarios");
      console.log('📋 Usuarios resultado:', usuariosResult);
    } catch (error) {
      console.log('❌ Error al consultar usuarios:', error.message);
    }

  } catch (error) {
    console.error('❌ Error durante la verificación:', error.message);
    console.error('🔍 Detalles del error:', error);
  } finally {
    await sequelize.close();
  }
}

// Ejecutar verificación
verificarUltraSimple(); 