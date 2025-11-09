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

async function verificarUsuarios() {
  try {
    console.log('🔍 Conectando a la base de datos...');
    await sequelize.authenticate();
    console.log('✅ Conexión exitosa a la base de datos');

    // Obtener todos los usuarios
    const [usuarios] = await sequelize.query(`
      SELECT 
        u.id, u.nombres, u.apellidos, u.email, u.rol_id,
        r.nombre as rol_nombre
      FROM usuarios u
      LEFT JOIN roles r ON u.rol_id = r.id
      ORDER BY u.id
    `);

    console.log('\n📋 Usuarios en la base de datos:');
    console.log('=====================================');
    
    usuarios.forEach((usuario, index) => {
      console.log(`${index + 1}. ${usuario.nombres} ${usuario.apellidos}`);
      console.log(`   Email: ${usuario.email}`);
      console.log(`   Rol: ${usuario.rol_nombre} (ID: ${usuario.rol_id})`);
      console.log(`   ID: ${usuario.id}`);
      console.log('   ---');
    });

    // Buscar específicamente a Laura Fernández
    const [laura] = await sequelize.query(`
      SELECT 
        u.id, u.nombres, u.apellidos, u.email, u.rol_id,
        r.nombre as rol_nombre
      FROM usuarios u
      LEFT JOIN roles r ON u.rol_id = r.id
      WHERE u.email = 'laura.fernandez@psyche.cl'
    `);

    if (laura.length > 0) {
      console.log('\n✅ Laura Fernández encontrada:');
      console.log('=============================');
      console.log(`Nombre: ${laura[0].nombres} ${laura[0].apellidos}`);
      console.log(`Email: ${laura[0].email}`);
      console.log(`Rol: ${laura[0].rol_nombre} (ID: ${laura[0].rol_id})`);
      console.log(`ID: ${laura[0].id}`);
    } else {
      console.log('\n❌ Laura Fernández NO encontrada');
    }

    // Buscar pacientes de Laura
    if (laura.length > 0) {
      const [pacientes] = await sequelize.query(`
        SELECT 
          p.id, p.numero_ficha, p.rut,
          u.nombres, u.apellidos, u.email
        FROM pacientes p
        INNER JOIN usuarios u ON p.usuario_id = u.id
        WHERE p.psicologo_id = :psicologoId
      `, {
        replacements: { psicologoId: laura[0].id }
      });

      console.log('\n👥 Pacientes de Laura Fernández:');
      console.log('==================================');
      
      if (pacientes.length > 0) {
        pacientes.forEach((paciente, index) => {
          console.log(`${index + 1}. ${paciente.nombres} ${paciente.apellidos}`);
          console.log(`   Email: ${paciente.email}`);
          console.log(`   RUT: ${paciente.rut || 'No especificado'}`);
          console.log(`   Ficha: ${paciente.numero_ficha}`);
          console.log(`   ID: ${paciente.id}`);
          console.log('   ---');
        });
      } else {
        console.log('❌ No se encontraron pacientes para Laura Fernández');
      }
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await sequelize.close();
  }
}

verificarUsuarios();


