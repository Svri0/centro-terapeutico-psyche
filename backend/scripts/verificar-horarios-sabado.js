const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');

dotenv.config();

const sequelize = new Sequelize(
  process.env.DB_NAME || 'psyche_db',
  process.env.DB_USER || 'postgres',
  process.env.DB_PASSWORD || 'password',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: false
  }
);

async function verificarHorariosSabado() {
  try {
    console.log('🔍 Verificando horarios para el sábado 16 de agosto...');
    
    // Verificar horarios para el 16 de agosto
    const [horarios16] = await sequelize.query(`
      SELECT 
        id, psicologo_id, fecha, hora_inicio, hora_fin, 
        servicio_id, tipo, estado, created_at, updated_at
      FROM disponibilidad_horarios 
      WHERE fecha = '2025-08-16' AND deleted_at IS NULL
      ORDER BY hora_inicio ASC
    `);
    
    console.log(`📊 Horarios para el 16 de agosto: ${horarios16.length}`);
    horarios16.forEach(horario => {
      console.log(`  - ${horario.hora_inicio} - ${horario.hora_fin} (${horario.tipo}) - ${horario.estado}`);
    });
    
    // Verificar horarios para el 11 de agosto
    const [horarios11] = await sequelize.query(`
      SELECT 
        id, psicologo_id, fecha, hora_inicio, hora_fin, 
        servicio_id, tipo, estado, created_at, updated_at
      FROM disponibilidad_horarios 
      WHERE fecha = '2025-08-11' AND deleted_at IS NULL
      ORDER BY hora_inicio ASC
    `);
    
    console.log(`📊 Horarios para el 11 de agosto: ${horarios11.length}`);
    horarios11.forEach(horario => {
      console.log(`  - ${horario.hora_inicio} - ${horario.hora_fin} (${horario.tipo}) - ${horario.estado}`);
    });
    
    // Verificar horarios para el 5 de agosto
    const [horarios5] = await sequelize.query(`
      SELECT 
        id, psicologo_id, fecha, hora_inicio, hora_fin, 
        servicio_id, tipo, estado, created_at, updated_at
      FROM disponibilidad_horarios 
      WHERE fecha = '2025-08-05' AND deleted_at IS NULL
      ORDER BY hora_inicio ASC
    `);
    
    console.log(`📊 Horarios para el 5 de agosto: ${horarios5.length}`);
    horarios5.forEach(horario => {
      console.log(`  - ${horario.hora_inicio} - ${horario.hora_fin} (${horario.tipo}) - ${horario.estado}`);
    });
    
    // Verificar todos los horarios de la semana del 10-16
    const [horariosSemana] = await sequelize.query(`
      SELECT 
        fecha, COUNT(*) as total_horarios
      FROM disponibilidad_horarios 
      WHERE fecha BETWEEN '2025-08-10' AND '2025-08-16' AND deleted_at IS NULL
      GROUP BY fecha
      ORDER BY fecha ASC
    `);
    
    console.log(`📊 Horarios por día (semana del 10-16):`);
    horariosSemana.forEach(dia => {
      console.log(`  - ${dia.fecha}: ${dia.total_horarios} horarios`);
    });
    
  } catch (error) {
    console.error('❌ Error al verificar horarios:', error);
  } finally {
    await sequelize.close();
  }
}

verificarHorariosSabado(); 