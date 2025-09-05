const { Sequelize } = require('sequelize');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

// Configuración de la base de datos
const sequelize = new Sequelize({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Ferreteriakm6',
  database: process.env.DB_NAME || 'psyche_db',
  dialect: 'postgres',
  logging: false
});

async function crearAdminCorrecto() {
  try {
    console.log('🔧 Creando usuario administrador con credenciales correctas...\n');

    // 1. Verificar conexión
    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos exitosa');

    // 2. Obtener el rol de administrador
    console.log('2️⃣ Buscando rol de administrador...');
    const [adminRole] = await sequelize.query(
      "SELECT id FROM roles WHERE nombre = 'administrador'",
      { type: Sequelize.QueryTypes.SELECT }
    );

    if (adminRole.length === 0) {
      console.log('❌ No se encontró el rol de administrador');
      console.log('💡 Ejecuta: npx sequelize-cli db:seed:all');
      return;
    }

    console.log('✅ Rol de administrador encontrado');

    // 3. Verificar si ya existe el usuario
    console.log('3️⃣ Verificando si existe el usuario admin@admin.cl...');
    const [existingUser] = await sequelize.query(
      "SELECT id FROM usuarios WHERE email = 'admin@admin.cl'",
      { type: Sequelize.QueryTypes.SELECT }
    );

    if (existingUser.length > 0) {
      console.log('⚠️ El usuario admin@admin.cl ya existe');
      console.log('🔄 Actualizando contraseña...');
      
      // Actualizar contraseña
      const passwordHash = await bcrypt.hash('admin123', 12);
      await sequelize.query(
        "UPDATE usuarios SET password_hash = :password_hash, updated_at = NOW() WHERE email = 'admin@admin.cl'",
        { replacements: { password_hash: passwordHash } }
      );
      
      console.log('✅ Contraseña actualizada correctamente');
    } else {
      // 4. Crear hash de la contraseña
      console.log('4️⃣ Creando hash de la contraseña...');
      const passwordHash = await bcrypt.hash('admin123', 12);
      console.log('✅ Hash de contraseña creado');

      // 5. Crear usuario administrador
      console.log('5️⃣ Creando usuario administrador...');
      const newAdminUser = {
        id: uuidv4(),
        nombres: 'Admin',
        apellidos: 'Sistema',
        email: 'admin@admin.cl',
        password_hash: passwordHash,
        telefono: '+56912345678',
        rol_id: adminRole[0].id,
        activo: true,
        email_verificado: true,
        configuracion: JSON.stringify({}),
        created_at: new Date(),
        updated_at: new Date()
      };

      await sequelize.query(`
        INSERT INTO usuarios (id, nombres, apellidos, email, password_hash, telefono, rol_id, activo, email_verificado, configuracion, created_at, updated_at)
        VALUES (:id, :nombres, :apellidos, :email, :password_hash, :telefono, :rol_id, :activo, :email_verificado, :configuracion, :created_at, :updated_at)
      `, {
        replacements: newAdminUser
      });

      console.log('✅ Usuario administrador creado exitosamente');
    }

    console.log('');
    console.log('🎉 ¡Credenciales configuradas correctamente!');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('📧 Email: admin@admin.cl');
    console.log('🔑 Contraseña: admin123');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('');
    console.log('💡 Ahora puedes usar estas credenciales para ingresar al sistema');
    console.log('🚀 Frontend: http://localhost:3000');
    console.log('🔧 Backend: http://localhost:3002');

  } catch (error) {
    console.error('❌ Error durante la creación:', error.message);
    console.error('🔍 Detalles del error:', error);
  } finally {
    await sequelize.close();
  }
}

// Ejecutar creación
crearAdminCorrecto(); 