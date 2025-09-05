const { Sequelize } = require('sequelize');
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

async function verificarRoles() {
  try {
    console.log('🔍 Verificando roles en la base de datos...\n');

    // 1. Verificar conexión
    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos exitosa');

    // 2. Verificar si existe la tabla roles
    console.log('2️⃣ Verificando tabla roles...');
    const [tables] = await sequelize.query(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'roles'",
      { type: Sequelize.QueryTypes.SELECT }
    );

    if (tables.length === 0) {
      console.log('❌ La tabla roles no existe');
      console.log('💡 Ejecuta: npm run db:migrate');
      return;
    }

    console.log('✅ La tabla roles existe');

    // 3. Verificar roles existentes
    console.log('3️⃣ Verificando roles existentes...');
    const [roles] = await sequelize.query(
      "SELECT id, nombre, descripcion FROM roles",
      { type: Sequelize.QueryTypes.SELECT }
    );

    if (roles.length === 0) {
      console.log('❌ No hay roles en la tabla');
      console.log('💡 Ejecuta: npm run db:seed');
      return;
    }

    console.log('✅ Roles encontrados:');
    roles.forEach(role => {
      console.log(`   - ID: ${role.id}, Nombre: ${role.nombre}, Descripción: ${role.descripcion}`);
    });

    // 4. Verificar usuarios existentes
    console.log('\n4️⃣ Verificando usuarios existentes...');
    const [usuarios] = await sequelize.query(
      "SELECT id, nombres, apellidos, email, rol_id FROM usuarios",
      { type: Sequelize.QueryTypes.SELECT }
    );

    if (usuarios.length === 0) {
      console.log('❌ No hay usuarios en la tabla');
    } else {
      console.log('✅ Usuarios encontrados:');
      usuarios.forEach(usuario => {
        console.log(`   - ID: ${usuario.id}, Nombre: ${usuario.nombres} ${usuario.apellidos}, Email: ${usuario.email}, Rol ID: ${usuario.rol_id}`);
      });
    }

  } catch (error) {
    console.error('❌ Error durante la verificación:', error.message);
    console.error('🔍 Detalles del error:', error);
  } finally {
    await sequelize.close();
  }
}

// Ejecutar verificación
verificarRoles(); 