const { Pool } = require('pg');

async function verificarAndrea() {
  const pool = new Pool({
    host: 'localhost',
    port: 5432,
    database: 'psyche_db',
    user: 'postgres',
    password: 'VMlover01!'
  });

  try {
    console.log('🔍 Verificando si Andrea Pérez tiene psicólogo asignado...');
    
    // Buscar a Andrea en la tabla pacientes
    const result = await pool.query(`
      SELECT 
        p.id,
        p.usuario_id,
        p.psicologo_id,
        p.nombres,
        p.apellidos,
        p.email,
        u.nombres as usuario_nombres,
        u.apellidos as usuario_apellidos
      FROM pacientes p
      LEFT JOIN usuarios u ON p.usuario_id = u.id
      WHERE p.nombres = 'Andrea' AND p.apellidos = 'Pérez'
    `);
    
    if (result.rows.length === 0) {
      console.log('❌ No se encontró a Andrea Pérez en la tabla pacientes');
      return;
    }
    
    const andrea = result.rows[0];
    console.log('✅ Andrea Pérez encontrada:');
    console.log('   ID:', andrea.id);
    console.log('   Usuario ID:', andrea.usuario_id);
    console.log('   Psicólogo ID:', andrea.psicologo_id);
    console.log('   Nombres (pacientes):', andrea.nombres);
    console.log('   Apellidos (pacientes):', andrea.apellidos);
    console.log('   Nombres (usuarios):', andrea.usuario_nombres);
    console.log('   Apellidos (usuarios):', andrea.usuario_apellidos);
    
    if (!andrea.psicologo_id) {
      console.log('❌ Andrea NO tiene psicólogo asignado (psicologo_id es NULL)');
      
      // Buscar psicólogos disponibles
      const psicologosResult = await pool.query(`
        SELECT id, nombres, apellidos, email
        FROM usuarios 
        WHERE rol_id = 2 AND deleted_at IS NULL
      `);
      
      console.log('\n🔍 Psicólogos disponibles:');
      psicologosResult.rows.forEach(ps => {
        console.log(`   - ${ps.nombres} ${ps.apellidos} (ID: ${ps.id})`);
      });
      
    } else {
      console.log('✅ Andrea SÍ tiene psicólogo asignado');
      
      // Verificar que el psicólogo existe
      const psicologoResult = await pool.query(`
        SELECT id, nombres, apellidos, email
        FROM usuarios 
        WHERE id = $1
      `, [andrea.psicologo_id]);
      
      if (psicologoResult.rows.length > 0) {
        const psicologo = psicologoResult.rows[0];
        console.log('✅ Psicólogo encontrado:', `${psicologo.nombres} ${psicologo.apellidos}`);
      } else {
        console.log('❌ El psicólogo asignado no existe en la tabla usuarios');
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await pool.end();
  }
}

verificarAndrea();
