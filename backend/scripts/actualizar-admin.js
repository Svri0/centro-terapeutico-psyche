const { Sequelize } = require('sequelize');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

// Configuración de la base de datos
const sequelize = new Sequelize({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'psyche_db',
  dialect: 'postgres',
  logging: false
});

async function actualizarAdmin() {
  try {
    console.log('🔧 Actualizando usuario administrador...\n');

    // 1. Verificar conexión
    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos exitosa');

    // 2. Verificar si existe el usuario admin@admin.cl
    console.log('2️⃣ Verificando si existe admin@admin.cl...');
    const [existingAdmin] = await sequelize.query(
      "SELECT id FROM usuarios WHERE email = 'admin@admin.cl'",
      { type: Sequelize.QueryTypes.SELECT }
    );

    if (existingAdmin.length > 0) {
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
      console.log('📝 Creando nuevo usuario admin@admin.cl...');
      
      // Crear hash de la contraseña
      const passwordHash = await bcrypt.hash('admin123', 12);
      
      // Crear nuevo usuario administrador
      const newAdminUser = {
        id: uuidv4(),
        nombres: 'Admin',
        apellidos: 'Sistema',
        email: 'admin@admin.cl',
        password_hash: passwordHash,
        telefono: '+56912345678',
        rol_id: 1, // ID del rol administrador
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

    // 3. Verificar que el usuario existe y funciona
    console.log('\n3️⃣ Verificando usuario creado...');
    const [verificacion] = await sequelize.query(
      "SELECT id, nombres, apellidos, email, rol_id FROM usuarios WHERE email = 'admin@admin.cl'",
      { type: Sequelize.QueryTypes.SELECT }
    );

    if (verificacion.length > 0) {
      const usuario = verificacion[0];
      console.log('✅ Usuario verificado:');
      console.log(`   - ID: ${usuario.id}`);
      console.log(`   - Nombre: ${usuario.nombres} ${usuario.apellidos}`);
      console.log(`   - Email: ${usuario.email}`);
      console.log(`   - Rol ID: ${usuario.rol_id}`);
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
    console.error('❌ Error durante la actualización:', error.message);
    console.error('🔍 Detalles del error:', error);
  } finally {
    await sequelize.close();
  }
}

// Ejecutar actualización
actualizarAdmin(); 