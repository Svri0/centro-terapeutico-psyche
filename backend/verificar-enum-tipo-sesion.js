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

async function verificarEnumTipoSesion() {
  try {
    console.log('🔍 Verificando enum tipo_sesion...');
    await sequelize.authenticate();
    console.log('✅ Conexión exitosa a la base de datos');

    // Verificar los valores del enum tipo_sesion
    const [enumTipos] = await sequelize.query(`
      SELECT unnest(enum_range(NULL::enum_sesiones_tipo_sesion)) as tipo
    `);

    console.log('\n📋 Tipos válidos para sesiones:');
    console.log('=====================================');
    enumTipos.forEach((tipo, index) => {
      console.log(`${index + 1}. ${tipo.tipo}`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await sequelize.close();
  }
}

verificarEnumTipoSesion();




