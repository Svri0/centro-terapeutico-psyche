require('dotenv').config();
const { Pool } = require('pg');

async function verificarCitas() {
  console.log('🔍 Verificando citas en la base de datos...\n');
  
  const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'psyche_db',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'VMlover01!'
  });
  
  try {
    // 1. Verificar si hay citas en general
    console.log('1️⃣ Verificando todas las citas...');
    const todasCitas = await pool.query('SELECT COUNT(*) as total FROM citas');
    console.log('📊 Total de citas en la base de datos:', todasCitas.rows[0].total);
    
    if (todasCitas.rows[0].total > 0) {
      // 2. Mostrar algunas citas de ejemplo
      console.log('\n2️⃣ Mostrando algunas citas de ejemplo...');
      const citasEjemplo = await pool.query(`
        SELECT 
          c.id,
          c.paciente_id,
          c.psicologo_id,
          c.fecha,
          c.hora_inicio,
          c.estado
        FROM citas c
        LIMIT 5
      `);
      
      console.log('📋 Citas de ejemplo:');
      citasEjemplo.rows.forEach((cita, index) => {
        console.log(`  ${index + 1}. ID: ${cita.id} | Paciente: ${cita.paciente_id} | Psicólogo: ${cita.psicologo_id} | Fecha: ${cita.fecha} | Estado: ${cita.estado}`);
      });
    }
    
    // 3. Verificar si hay citas para Diego Olave específicamente
    console.log('\n3️⃣ Verificando citas para Diego Olave...');
    const citasDiego = await pool.query(`
      SELECT COUNT(*) as total 
      FROM citas c
      INNER JOIN usuarios u ON c.paciente_id = u.id
      WHERE u.email = 'bajaj90266@mogash.com'
    `);
    
    console.log('📊 Citas para Diego Olave (bajaj90266@mogash.com):', citasDiego.rows[0].total);
    
    // 4. Verificar si hay citas para el ID específico
    console.log('\n4️⃣ Verificando citas para el ID específico...');
    const citasPorId = await pool.query(`
      SELECT COUNT(*) as total 
      FROM citas 
      WHERE paciente_id = '4c1f616c-078e-46ad-b711-2d55a7171c69'
    `);
    
    console.log('📊 Citas para ID 4c1f616c-078e-46ad-b711-2d55a7171c69:', citasPorId.rows[0].total);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

verificarCitas();
