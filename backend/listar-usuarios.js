const { Sequelize } = require('sequelize');

// Configuración de la base de datos
const sequelize = new Sequelize({
  dialect: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: 'VMlover01!',
  database: 'psyche_db',
  logging: false
});

async function listarUsuarios() {
  try {
    console.log('🔍 Conectando a la base de datos...');
    await sequelize.authenticate();
    console.log('✅ Conexión exitosa\n');

    // Listar todos los usuarios con sus credenciales
    console.log('🔍 Usuarios disponibles:');
    const [usuarios] = await sequelize.query(`
      SELECT 
        u.id,
        u.email,
        u.password,
        u.nombres,
        u.apellidos,
        u.rol_id,
        r.nombre as rol_nombre
      FROM usuarios u
      LEFT JOIN roles r ON u.rol_id = r.id
      ORDER BY u.rol_id, u.nombres
    `);
    
    usuarios.forEach((user, index) => {
      console.log(`\n${index + 1}. ${user.nombres} ${user.apellidos}`);
      console.log(`   - ID: ${user.id}`);
      console.log(`   - Email: ${user.email}`);
      console.log(`   - Password: ${user.password}`);
      console.log(`   - Rol: ${user.rol_nombre} (ID: ${user.rol_id})`);
    });

    // Mostrar roles disponibles
    console.log('\n🔍 Roles disponibles:');
    const [roles] = await sequelize.query('SELECT id, nombre FROM roles ORDER BY id');
    roles.forEach(rol => {
      console.log(`   - ${rol.id}: ${rol.nombre}`);
    });

    // Sugerir credenciales para probar
    console.log('\n🔍 Sugerencias para probar:');
    const usuariosPacientes = usuarios.filter(u => u.rol_id === 4);
    if (usuariosPacientes.length > 0) {
      const paciente = usuariosPacientes[0];
      console.log(`   - Paciente: ${paciente.email} / ${paciente.password}`);
    }

    const usuariosPsicologos = usuarios.filter(u => u.rol_id === 3);
    if (usuariosPsicologos.length > 0) {
      const psicologo = usuariosPsicologos[0];
      console.log(`   - Psicólogo: ${psicologo.email} / ${psicologo.password}`);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await sequelize.close();
  }
}

listarUsuarios();
