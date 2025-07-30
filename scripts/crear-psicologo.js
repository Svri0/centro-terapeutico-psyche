const { Sequelize } = require('sequelize');
const bcrypt = require('bcryptjs');

// Configuración de la base de datos
const sequelize = new Sequelize({
  dialect: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'centro_terapeutico',
  logging: false
});

async function crearPsicologo() {
  try {
    console.log('🔍 Conectando a la base de datos...');
    await sequelize.authenticate();
    console.log('✅ Conexión exitosa');

    // Obtener el rol de psicólogo
    console.log('🔍 Buscando rol de psicólogo...');
    const [roles] = await sequelize.query("SELECT id FROM roles WHERE nombre = 'psicologo'");
    
    if (!Array.isArray(roles) || roles.length === 0) {
      console.error('❌ Error: Rol de psicólogo no encontrado');
      console.log('💡 Asegúrate de haber ejecutado las migraciones y seeders');
      process.exit(1);
    }

    const rolPsicologoId = roles[0].id;
    console.log('✅ Rol de psicólogo encontrado:', rolPsicologoId);

    // Verificar si el psicólogo ya existe
    console.log('🔍 Verificando si el psicólogo ya existe...');
    const [psicologoExistente] = await sequelize.query(
      "SELECT id FROM usuarios WHERE email = 'psicologo@terapia.cl'"
    );

    if (Array.isArray(psicologoExistente) && psicologoExistente.length > 0) {
      console.log('⚠️  El psicólogo ya existe en la base de datos');
      console.log('📧 Email: psicologo@terapia.cl');
      console.log('🔑 Contraseña: Psicologo123!');
      process.exit(0);
    }

    // Crear hash de la contraseña
    console.log('🔐 Generando hash de contraseña...');
    const passwordHash = await bcrypt.hash('Psicologo123!', 12);

    // Crear el psicólogo
    console.log('👤 Creando psicólogo...');
    const [psicologoCreado] = await sequelize.query(`
      INSERT INTO usuarios (
        id, email, password_hash, nombres, apellidos, telefono, 
        fecha_nacimiento, genero, rol_id, activo, email_verificado, 
        configuracion, created_at, updated_at
      ) VALUES (
        gen_random_uuid(), 'psicologo@terapia.cl', :passwordHash, 'Dr. Juan', 'Pérez', '+56912345678',
        '1985-03-15', 'masculino', :rolId, true, true,
        '{}', NOW(), NOW()
      ) RETURNING id, email, nombres, apellidos
    `, {
      replacements: {
        passwordHash,
        rolId: rolPsicologoId
      }
    });

    console.log('✅ Psicólogo creado exitosamente!');
    console.log('📋 Datos del psicólogo:');
    console.log('   ID:', psicologoCreado[0].id);
    console.log('   Email:', psicologoCreado[0].email);
    console.log('   Nombre:', psicologoCreado[0].nombres, psicologoCreado[0].apellidos);
    console.log('   Contraseña: Psicologo123!');
    console.log('');
    console.log('🎯 Ahora puedes iniciar sesión en el frontend con:');
    console.log('   Email: psicologo@terapia.cl');
    console.log('   Contraseña: Psicologo123!');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

// Ejecutar el script
crearPsicologo(); 