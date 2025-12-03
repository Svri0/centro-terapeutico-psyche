const { Sequelize } = require('sequelize');
const bcrypt = require('bcryptjs');

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

async function resetearPasswordLaura() {
  try {
    console.log('🔍 Conectando a la base de datos...');
    await sequelize.authenticate();
    console.log('✅ Conexión exitosa a la base de datos');

    // Nueva contraseña
    const nuevaPassword = 'laura123';
    const passwordHash = await bcrypt.hash(nuevaPassword, 12);

    // Actualizar contraseña de Laura Fernández
    const [resultado] = await sequelize.query(
      `UPDATE usuarios 
       SET password_hash = :passwordHash, updated_at = NOW()
       WHERE email = 'laura.fernandez@psyche.cl'
       RETURNING id, nombres, apellidos, email`,
      {
        replacements: { passwordHash }
      }
    );

    if (resultado.length > 0) {
      console.log('✅ Contraseña actualizada exitosamente');
      console.log('👤 Usuario:', resultado[0].nombres, resultado[0].apellidos);
      console.log('📧 Email:', resultado[0].email);
      console.log('🔑 Nueva contraseña:', nuevaPassword);
    } else {
      console.log('❌ No se encontró el usuario Laura Fernández');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await sequelize.close();
  }
}

resetearPasswordLaura();




