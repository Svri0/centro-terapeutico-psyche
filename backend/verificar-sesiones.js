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

async function verificarSesiones() {
  try {
    console.log('🔍 Conectando a la base de datos...');
    await sequelize.authenticate();
    console.log('✅ Conexión exitosa a la base de datos');

    // Verificar si hay sesiones existentes
    const [sesiones] = await sequelize.query(`
      SELECT COUNT(*) as total_sesiones
      FROM sesiones
    `);

    console.log(`\n📊 Total de sesiones en la base de datos: ${sesiones[0].total_sesiones}`);

    // Verificar si hay sesiones para el paciente Test Laura
    const [sesionesPaciente] = await sequelize.query(`
      SELECT s.id, s.fecha_programada, s.estado, s.resumen_sesion
      FROM sesiones s
      INNER JOIN pacientes p ON s.paciente_id = p.id
      WHERE p.numero_ficha = 'PSI-3-0001'
      ORDER BY s.fecha_programada DESC
      LIMIT 5
    `);

    console.log('\n🏥 Sesiones del paciente Test Laura:');
    if (sesionesPaciente.length > 0) {
      sesionesPaciente.forEach((sesion, index) => {
        console.log(`${index + 1}. ${sesion.fecha_programada} - ${sesion.estado}`);
        if (sesion.resumen_sesion) {
          console.log(`   Resumen: ${sesion.resumen_sesion.substring(0, 50)}...`);
        }
      });
    } else {
      console.log('❌ No hay sesiones para el paciente Test Laura');
    }

    // Verificar si hay sesiones activas
    const [sesionesActivas] = await sequelize.query(`
      SELECT s.id, s.estado, s.fecha_inicio, s.fecha_fin
      FROM sesiones s
      WHERE s.estado IN ('iniciada', 'en_curso')
      ORDER BY s.created_at DESC
      LIMIT 5
    `);

    console.log('\n🔄 Sesiones activas:');
    if (sesionesActivas.length > 0) {
      sesionesActivas.forEach((sesion, index) => {
        console.log(`${index + 1}. ID: ${sesion.id} - Estado: ${sesion.estado}`);
        console.log(`   Inicio: ${sesion.fecha_inicio}`);
        console.log(`   Fin: ${sesion.fecha_fin || 'No finalizada'}`);
      });
    } else {
      console.log('✅ No hay sesiones activas');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await sequelize.close();
  }
}

verificarSesiones();


