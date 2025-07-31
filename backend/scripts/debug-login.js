const { Sequelize } = require('sequelize');
require('dotenv').config();

// Configuración de la base de datos
const sequelize = new Sequelize({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'VMlover01!',
  database: process.env.DB_NAME || 'psyche_db',
  dialect: 'postgres',
  logging: false
});

async function diagnosticarLogin() {
  try {
    console.log('🔍 Iniciando diagnóstico de login...\n');

    // 1. Probar conexión a la base de datos
    console.log('1️⃣ Probando conexión a la base de datos...');
    await sequelize.authenticate();
    console.log('✅ Conexión exitosa\n');

    // 2. Verificar si existen las tablas
    console.log('2️⃣ Verificando tablas...');
    const [tablas] = await sequelize.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('roles', 'usuarios')
      ORDER BY table_name
    `);
    
    console.log('📋 Tablas encontradas:');
    tablas.forEach(tabla => {
      console.log(`   - ${tabla.table_name}`);
    });
    console.log('');

    // 3. Verificar roles
    console.log('3️⃣ Verificando roles...');
    const [roles] = await sequelize.query('SELECT id, nombre, activo FROM roles ORDER BY id');
    
    if (roles.length === 0) {
      console.log('❌ No se encontraron roles');
      console.log('💡 Ejecuta: npx sequelize-cli db:seed:all');
    } else {
      console.log('✅ Roles encontrados:');
      roles.forEach(rol => {
        console.log(`   - ID: ${rol.id}, Nombre: ${rol.nombre}, Activo: ${rol.activo}`);
      });
    }
    console.log('');

    // 4. Verificar usuario admin
    console.log('4️⃣ Verificando usuario administrador...');
    const [usuarios] = await sequelize.query(`
      SELECT u.id, u.nombres, u.apellidos, u.email, u.activo, u.rol_id, r.nombre as rol_nombre
      FROM usuarios u
      INNER JOIN roles r ON u.rol_id = r.id
      WHERE u.email = 'admin@terapia.cl'
    `);

    if (usuarios.length === 0) {
      console.log('❌ Usuario admin@terapia.cl no encontrado');
      console.log('💡 Ejecuta: npx sequelize-cli db:seed:all');
    } else {
      const usuario = usuarios[0];
      console.log('✅ Usuario administrador encontrado:');
      console.log(`   - ID: ${usuario.id}`);
      console.log(`   - Nombre: ${usuario.nombres} ${usuario.apellidos}`);
      console.log(`   - Email: ${usuario.email}`);
      console.log(`   - Rol: ${usuario.rol_nombre}`);
      console.log(`   - Activo: ${usuario.activo}`);
    }
    console.log('');

    // 5. Probar consulta de login
    console.log('5️⃣ Probando consulta de login...');
    const [resultadoLogin] = await sequelize.query(`
      SELECT u.id, u.nombres, u.apellidos, u.email, u.password_hash, u.activo, u.rol_id, r.nombre as rol_nombre
      FROM usuarios u
      INNER JOIN roles r ON u.rol_id = r.id
      WHERE u.email = 'admin@terapia.cl'
    `);

    if (resultadoLogin.length === 0) {
      console.log('❌ La consulta de login no encuentra el usuario');
    } else {
      const usuario = resultadoLogin[0];
      console.log('✅ Consulta de login exitosa:');
      console.log(`   - Usuario encontrado: ${usuario.nombres} ${usuario.apellidos}`);
      console.log(`   - Password hash existe: ${usuario.password_hash ? 'Sí' : 'No'}`);
      console.log(`   - Usuario activo: ${usuario.activo}`);
    }

    console.log('\n🎯 Credenciales de prueba:');
    console.log('   Email: admin@terapia.cl');
    console.log('   Contraseña: Admin123!');

  } catch (error) {
    console.error('❌ Error durante el diagnóstico:', error.message);
    
    if (error.message.includes('ECONNREFUSED')) {
      console.log('\n💡 Posible solución:');
      console.log('   - Verifica que PostgreSQL esté corriendo');
      console.log('   - Verifica las credenciales de la base de datos');
    }
  } finally {
    await sequelize.close();
  }
}

// Ejecutar diagnóstico
diagnosticarLogin(); 