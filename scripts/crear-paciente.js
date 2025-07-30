const { Client } = require('pg');

const client = new Client({
  host: 'localhost',
  port: 5432,
  database: 'psyche_db',
  user: 'postgres',
  password: 'VMlover01!'
});

async function crearPaciente() {
  try {
    await client.connect();
    console.log('✅ Conectado a la base de datos');

    // Primero, obtener un psicólogo existente
    const psicologoResult = await client.query(`
      SELECT id FROM usuarios 
      WHERE rol_id = 2 
      LIMIT 1
    `);

    if (psicologoResult.rows.length === 0) {
      console.log('❌ No hay psicólogos en la base de datos. Primero crea un psicólogo.');
      return;
    }

    const psicologoId = psicologoResult.rows[0].id;
    console.log('📋 Psicólogo encontrado:', psicologoId);

    // Crear usuario paciente
    const usuarioResult = await client.query(`
      INSERT INTO usuarios (
        id, nombres, apellidos, email, password_hash, rol_id, activo, created_at, updated_at
      ) VALUES (
        gen_random_uuid(), 
        'Juan', 
        'Pérez', 
        'paciente@test.com', 
        '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- password: password
        3, 
        true, 
        NOW(), 
        NOW()
      ) RETURNING id
    `);

    const pacienteUsuarioId = usuarioResult.rows[0].id;
    console.log('✅ Usuario paciente creado:', pacienteUsuarioId);

    // Obtener el número de pacientes del psicólogo
    const countResult = await client.query(`
      SELECT COUNT(*) as count FROM pacientes 
      WHERE psicologo_id = $1 AND deleted_at IS NULL
    `, [psicologoId]);

    const numeroPaciente = countResult.rows[0].count + 1;
    const numeroFicha = `PSI-1-${numeroPaciente.toString().padStart(4, '0')}`;

    // Crear registro de paciente
    const pacienteResult = await client.query(`
      INSERT INTO pacientes (
        id, usuario_id, psicologo_id, rut, numero_ficha, created_at, updated_at
      ) VALUES (
        gen_random_uuid(), 
        $1, 
        $2, 
        '12345678-9', 
        $3, 
        NOW(), 
        NOW()
      ) RETURNING id
    `, [pacienteUsuarioId, psicologoId, numeroFicha]);

    console.log('✅ Paciente creado:', pacienteResult.rows[0].id);
    console.log('📋 Número de ficha:', numeroFicha);

    console.log('\n🎉 Paciente de prueba creado exitosamente!');
    console.log('📧 Email: paciente@test.com');
    console.log('🔑 Contraseña: password');
    console.log('👤 Rol: Paciente (rol_id: 3)');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.end();
  }
}

crearPaciente(); 