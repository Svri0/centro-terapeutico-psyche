const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  dialect: 'postgres',
  logging: false
});

async function verificarCitasPsicologo() {
  try {
    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos establecida');

    // Obtener fecha de hoy
    const hoy = new Date();
    const hoyString = hoy.toISOString().split('T')[0];
    console.log('📅 Fecha de hoy:', hoyString);

    // ID del psicólogo (el que vimos en los logs)
    const psicologoId = '559a9710-7a5b-48a5-bd7a-055ec9c114d6';

    // Consultar citas del psicólogo para hoy
    const citasHoy = await sequelize.query(`
      SELECT 
        c.id,
        c.fecha,
        c.hora_inicio,
        c.estado,
        u.nombres as paciente_nombres,
        u.apellidos as paciente_apellidos
      FROM citas c
      INNER JOIN pacientes p ON c.paciente_id = p.id
      INNER JOIN usuarios u ON p.usuario_id = u.id
      WHERE c.psicologo_id = :psicologoId AND c.fecha = :hoy
      ORDER BY c.hora_inicio ASC
    `, {
      replacements: { psicologoId, hoy: hoyString },
      type: Sequelize.QueryTypes.SELECT
    });

    console.log('🔍 Citas del psicólogo para hoy:', citasHoy.length);
    
    if (citasHoy.length > 0) {
      console.log('📋 Detalles de las citas:');
      citasHoy.forEach((cita, index) => {
        console.log(`${index + 1}. ${cita.paciente_nombres} ${cita.paciente_apellidos} - ${cita.hora_inicio} (${cita.estado})`);
      });
    } else {
      console.log('❌ No hay citas programadas para hoy para este psicólogo');
    }

    // Consultar todas las citas del psicólogo
    const todasLasCitas = await sequelize.query(`
      SELECT 
        c.id,
        c.fecha,
        c.hora_inicio,
        c.estado,
        u.nombres as paciente_nombres,
        u.apellidos as paciente_apellidos
      FROM citas c
      INNER JOIN pacientes p ON c.paciente_id = p.id
      INNER JOIN usuarios u ON p.usuario_id = u.id
      WHERE c.psicologo_id = :psicologoId
      ORDER BY c.fecha DESC, c.hora_inicio ASC
      LIMIT 10
    `, {
      replacements: { psicologoId },
      type: Sequelize.QueryTypes.SELECT
    });

    console.log('\n📋 Últimas 10 citas del psicólogo:');
    todasLasCitas.forEach((cita, index) => {
      console.log(`${index + 1}. ${cita.fecha} - ${cita.paciente_nombres} ${cita.paciente_apellidos} - ${cita.hora_inicio} (${cita.estado})`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await sequelize.close();
  }
}

verificarCitasPsicologo(); 