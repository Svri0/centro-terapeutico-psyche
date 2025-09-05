const { Sequelize, DataTypes } = require('sequelize');

// Configuración de la base de datos
const sequelize = new Sequelize({
  dialect: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: 'postgres',
  database: 'centro_terapeutico_psyche',
  logging: false
});

async function verificarPassword() {
  try {
    await sequelize.authenticate();
    console.log('✅ Conexión a BD exitosa');

    // Buscar usuario Salomón
    const [results] = await sequelize.query(`
      SELECT u.id, u.nombres, u.apellidos, u.email, u.password_hash, u.rol_id, r.nombre as rol_nombre
      FROM usuarios u
      INNER JOIN roles r ON u.rol_id = r.id
      WHERE u.email = 'salomon@gmail.com' AND u.deleted_at IS NULL
    `);

    if (results.length === 0) {
      console.log('❌ Usuario Salomón no encontrado');
      return;
    }

    const usuario = results[0];
    console.log('🔍 Usuario encontrado:');
    console.log('   - ID:', usuario.id);
    console.log('   - Nombre:', usuario.nombres, usuario.apellidos);
    console.log('   - Email:', usuario.email);
    console.log('   - Rol:', usuario.rol_nombre);
    console.log('   - Password hash:', usuario.password_hash ? usuario.password_hash.substring(0, 20) + '...' : 'NULL');

    // Verificar si la contraseña es '123456' (hash común)
    const bcrypt = require('bcrypt');
    const testPassword = '123456';
    
    if (usuario.password_hash) {
      const isValid = await bcrypt.compare(testPassword, usuario.password_hash);
      console.log('🔐 Contraseña "123456" es válida:', isValid);
      
      if (!isValid) {
        console.log('💡 Intenta con estas contraseñas comunes:');
        console.log('   - 123456');
        console.log('   - password');
        console.log('   - admin');
        console.log('   - salomon');
      }
    } else {
      console.log('⚠️ El usuario no tiene contraseña hash');
    }

  } catch (error) {
    console.error('💥 Error:', error.message);
  } finally {
    await sequelize.close();
  }
}

verificarPassword();
