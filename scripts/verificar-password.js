const { Client } = require('pg');

const client = new Client({
  host: 'localhost',
  port: 5432,
  database: 'psyche_db',
  user: 'postgres',
  password: 'VMlover01!'
});

async function verificarPassword() {
  try {
    await client.connect();
    console.log('✅ Conectado a la base de datos');

    // Verificar usuarios y sus contraseñas
    const usuariosResult = await client.query(`
      SELECT u.id, u.nombres, u.apellidos, u.email, u.password_hash, u.updated_at
      FROM usuarios u
      ORDER BY u.updated_at DESC
    `);

    console.log('\n📋 Usuarios y sus contraseñas:');
    console.log('='.repeat(80));
    
    usuariosResult.rows.forEach((usuario, index) => {
      console.log(`${index + 1}. ${usuario.nombres} ${usuario.apellidos}`);
      console.log(`   Email: ${usuario.email}`);
      console.log(`   ID: ${usuario.id}`);
      console.log(`   Password Hash: ${usuario.password_hash ? usuario.password_hash.substring(0, 20) + '...' : 'NULL'}`);
      console.log(`   Updated At: ${usuario.updated_at}`);
      console.log('');
    });

    // Verificar específicamente el paciente de prueba
    const pacienteResult = await client.query(`
      SELECT u.id, u.nombres, u.apellidos, u.email, u.password_hash, u.updated_at
      FROM usuarios u
      WHERE u.email = 'paciente@test.com'
    `);

    if (pacienteResult.rows.length > 0) {
      const paciente = pacienteResult.rows[0];
      console.log('🔍 Paciente de prueba:');
      console.log(`   Email: ${paciente.email}`);
      console.log(`   Password Hash: ${paciente.password_hash ? paciente.password_hash.substring(0, 20) + '...' : 'NULL'}`);
      console.log(`   Updated At: ${paciente.updated_at}`);
    } else {
      console.log('❌ No se encontró el paciente de prueba');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.end();
  }
}

verificarPassword(); 