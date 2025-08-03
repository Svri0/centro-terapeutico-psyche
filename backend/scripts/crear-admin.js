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

async function crearAdmin() {
  try {
    console.log('🔧 Creando nuevo usuario administrador...\n');

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

    // 3. Crear hash de la contraseña
    console.log('3️⃣ Creando hash de la contraseña...');
    const passwordHash = await bcrypt.hash('admin123', 12);
    console.log('✅ Hash de contraseña creado');

    // 4. Crear usuario administrador
    console.log('4️⃣ Creando usuario administrador...');
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
    console.log('');
    console.log('🎉 ¡Nuevas credenciales creadas!');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('📧 Email: admin@admin.com');
    console.log('🔑 Contraseña: admin123');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('');
    console.log('💡 Ahora puedes usar estas credenciales para ingresar al sistema');

  } catch (error) {
    console.error('❌ Error durante la creación:', error.message);
    
    if (error.message.includes('duplicate key')) {
      console.log('💡 El usuario ya existe, intentando con credenciales diferentes...');
      
      // Intentar con un email diferente
      const newEmail = 'admin2@admin.com';
      console.log(`📧 Intentando con email: ${newEmail}`);
      
      const newAdminUser2 = {
        id: uuidv4(),
        nombres: 'Admin',
        apellidos: 'Sistema',
        email: newEmail,
        password_hash: await bcrypt.hash('admin123', 12),
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
        replacements: newAdminUser2
      });

      console.log('✅ Usuario administrador creado exitosamente');
      console.log('');
      console.log('🎉 ¡Nuevas credenciales creadas!');
      console.log('═══════════════════════════════════════════════════════════════');
      console.log(`📧 Email: ${newEmail}`);
      console.log('🔑 Contraseña: admin123');
      console.log('═══════════════════════════════════════════════════════════════');
    }
  } finally {
    await sequelize.close();
  }
}

// Ejecutar creación
crearAdmin(); 