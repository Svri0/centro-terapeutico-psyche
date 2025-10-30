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

async function verificarEnumSesiones() {
  try {
    console.log('🔍 Conectando a la base de datos...');
    await sequelize.authenticate();
    console.log('✅ Conexión exitosa a la base de datos');

    // Verificar los valores del enum de estado de sesiones
    const [enumEstados] = await sequelize.query(`
      SELECT unnest(enum_range(NULL::enum_sesiones_estado)) as estado
    `);

    console.log('\n📋 Estados válidos para sesiones:');
    console.log('=====================================');
    enumEstados.forEach((estado, index) => {
      console.log(`${index + 1}. ${estado.estado}`);
    });

    // Verificar los valores del enum de tipo de sesión
    const [enumTipos] = await sequelize.query(`
      SELECT unnest(enum_range(NULL::enum_sesiones_tipo)) as tipo
    `);

    console.log('\n📋 Tipos válidos para sesiones:');
    console.log('=====================================');
    enumTipos.forEach((tipo, index) => {
      console.log(`${index + 1}. ${tipo.tipo}`);
    });

    // Verificar los valores del enum de progreso del paciente
    const [enumProgreso] = await sequelize.query(`
      SELECT unnest(enum_range(NULL::enum_sesiones_progreso)) as progreso
    `);

    console.log('\n📋 Progreso válido para sesiones:');
    console.log('=====================================');
    enumProgreso.forEach((progreso, index) => {
      console.log(`${index + 1}. ${progreso.progreso}`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await sequelize.close();
  }
}

verificarEnumSesiones();


