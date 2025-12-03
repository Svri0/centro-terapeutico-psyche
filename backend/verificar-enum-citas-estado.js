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

async function verificarEnumCitasEstado() {
  try {
    console.log('🔍 Verificando enum citas.estado...');
    await sequelize.authenticate();
    console.log('✅ Conexión exitosa a la base de datos');

    // Verificar los valores del enum citas.estado
    const [enumEstados] = await sequelize.query(`
      SELECT unnest(enum_range(NULL::enum_citas_estado)) as estado
    `);

    console.log('\n📋 Estados válidos para citas:');
    console.log('=====================================');
    enumEstados.forEach((estado, index) => {
      console.log(`${index + 1}. ${estado.estado}`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await sequelize.close();
  }
}

verificarEnumCitasEstado();




