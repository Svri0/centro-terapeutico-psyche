const { Client } = require('pg');

const client = new Client({
  host: 'localhost',
  port: 5432,
  database: 'psyche_db',
  user: 'postgres',
  password: 'VMlover01!'
});

async function verificarUsuarios() {
  try {
    await client.connect();
    console.log('✅ Conectado a la base de datos');

    // Verificar todos los usuarios
    const usuariosResult = await client.query(`
      SELECT u.id, u.nombres, u.apellidos, u.email, u.rol_id, u.activo, r.nombre as rol_nombre
      FROM usuarios u
      INNER JOIN roles r ON u.rol_id = r.id
      ORDER BY u.rol_id, u.nombres
    `);

    console.log('\n📋 Usuarios en la base de datos:');
    console.log('='.repeat(80));
    
    usuariosResult.rows.forEach((usuario, index) => {
      console.log(`${index + 1}. ${usuario.nombres} ${usuario.apellidos}`);
      console.log(`   Email: ${usuario.email}`);
      console.log(`   Rol: ${usuario.rol_nombre} (ID: ${usuario.rol_id})`);
      console.log(`   Activo: ${usuario.activo ? 'Sí' : 'No'}`);
      console.log(`   ID: ${usuario.id}`);
      console.log('');
    });

    // Verificar específicamente pacientes
    const pacientesResult = await client.query(`
      SELECT p.id, p.numero_ficha, p.rut, u.nombres, u.apellidos, u.email, u.rol_id
      FROM pacientes p
      INNER JOIN usuarios u ON p.usuario_id = u.id
      WHERE p.deleted_at IS NULL
      ORDER BY p.numero_ficha
    `);

    console.log('📋 Pacientes registrados:');
    console.log('='.repeat(80));
    
    if (pacientesResult.rows.length === 0) {
      console.log('❌ No hay pacientes registrados');
    } else {
      pacientesResult.rows.forEach((paciente, index) => {
        console.log(`${index + 1}. ${paciente.nombres} ${paciente.apellidos}`);
        console.log(`   Email: ${paciente.email}`);
        console.log(`   Ficha: ${paciente.numero_ficha}`);
        console.log(`   RUT: ${paciente.rut}`);
        console.log(`   Rol ID: ${paciente.rol_id}`);
        console.log('');
      });
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.end();
  }
}

verificarUsuarios(); 