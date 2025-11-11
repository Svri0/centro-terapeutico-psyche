const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'psyche_db',
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
  dialect: 'postgres',
  logging: false
});

async function diagnosticar() {
  console.log('🔍 DIAGNÓSTICO DE CONEXIÓN A BASE DE DATOS\n');
  console.log('📋 Configuración actual:');
  console.log(`   Host: ${process.env.DB_HOST || 'localhost'}`);
  console.log(`   Puerto: ${process.env.DB_PORT || '5432'}`);
  console.log(`   Base de datos: ${process.env.DB_NAME || 'psyche_db'}`);
  console.log(`   Usuario: ${process.env.DB_USER || 'postgres'}`);
  console.log(`   Contraseña: ${process.env.DB_PASSWORD ? '***' : 'NO CONFIGURADA'}\n`);

  try {
    // 1. Probar conexión
    console.log('1️⃣ Probando conexión...');
    await sequelize.authenticate();
    console.log('✅ Conexión exitosa!\n');

    // 2. Verificar que la base de datos existe
    console.log('2️⃣ Verificando base de datos...');
    const [dbCheck] = await sequelize.query(
      "SELECT datname FROM pg_database WHERE datname = :dbName",
      {
        replacements: { dbName: process.env.DB_NAME || 'psyche_db' },
        type: Sequelize.QueryTypes.SELECT
      }
    );
    if (dbCheck) {
      console.log('✅ Base de datos existe\n');
    } else {
      console.log('❌ Base de datos NO existe. Ejecuta: npm run db:migrate\n');
    }

    // 3. Verificar tabla usuarios
    console.log('3️⃣ Verificando tabla usuarios...');
    const [usuarios] = await sequelize.query(
      "SELECT COUNT(*) as total FROM usuarios WHERE deleted_at IS NULL",
      { type: Sequelize.QueryTypes.SELECT }
    );
    console.log(`✅ Tabla usuarios existe. Total usuarios: ${usuarios.total}\n`);

    // 4. Verificar tabla roles
    console.log('4️⃣ Verificando tabla roles...');
    const [roles] = await sequelize.query(
      "SELECT COUNT(*) as total FROM roles",
      { type: Sequelize.QueryTypes.SELECT }
    );
    console.log(`✅ Tabla roles existe. Total roles: ${roles.total}\n`);

    // 5. Verificar usuario admin
    console.log('5️⃣ Verificando usuario admin...');
    const [admin] = await sequelize.query(
      "SELECT id, nombres, apellidos, email, activo, rol_id FROM usuarios WHERE email = :email AND deleted_at IS NULL",
      {
        replacements: { email: 'admin@admin.cl' },
        type: Sequelize.QueryTypes.SELECT
      }
    );
    if (admin) {
      console.log(`✅ Usuario admin encontrado: ${admin.nombres} ${admin.apellidos}`);
      console.log(`   Activo: ${admin.activo}`);
      console.log(`   Rol ID: ${admin.rol_id}\n`);
    } else {
      console.log('❌ Usuario admin NO encontrado. Ejecuta: npm run crear-admin\n');
    }

    // 6. Probar query de login
    console.log('6️⃣ Probando query de login...');
    const [testLogin] = await sequelize.query(
      `SELECT u.id, u.nombres, u.apellidos, u.email, u.password_hash, u.activo, u.rol_id, r.nombre as rol_nombre
       FROM usuarios u
       LEFT JOIN roles r ON u.rol_id = r.id
       WHERE u.email = :email AND u.deleted_at IS NULL`,
      {
        replacements: { email: 'admin@admin.cl' },
        type: Sequelize.QueryTypes.SELECT
      }
    );
    if (testLogin) {
      console.log('✅ Query de login funciona correctamente\n');
    } else {
      console.log('❌ Query de login no retorna resultados\n');
    }

    console.log('✅ DIAGNÓSTICO COMPLETO - Todo está bien configurado!');

  } catch (error) {
    console.error('\n❌ ERROR ENCONTRADO:\n');
    console.error('Mensaje:', error.message);
    
    if (error.original) {
      console.error('Código:', error.original.code);
      console.error('Detalles:', error.original.message || error.original);
    }

    console.error('\n💡 SOLUCIONES:\n');

    if (error.original?.code === '28P01') {
      console.error('🔐 Error de autenticación PostgreSQL');
      console.error('   1. Verifica la contraseña en el archivo .env (DB_PASSWORD)');
      console.error('   2. O cambia la contraseña del usuario en PostgreSQL');
      console.error('   3. Ejecuta: node scripts/setup-rapido.js\n');
    } else if (error.original?.code === 'ECONNREFUSED' || error.message?.includes('ECONNREFUSED')) {
      console.error('🔌 PostgreSQL no está corriendo');
      console.error('   1. Inicia el servicio de PostgreSQL');
      console.error('   2. En Windows: Abre "Servicios" y busca "postgresql"');
      console.error('   3. O ejecuta: net start postgresql-x64-XX (donde XX es la versión)\n');
    } else if (error.original?.code === '3D000' || error.message?.includes('database')) {
      console.error('🗄️  Base de datos no existe');
      console.error('   1. Crea la base de datos: createdb psyche_db');
      console.error('   2. O ejecuta las migraciones: npm run db:migrate\n');
    } else if (error.message?.includes('relation') || error.message?.includes('table')) {
      console.error('📋 Tablas no existen');
      console.error('   1. Ejecuta las migraciones: npm run db:migrate');
      console.error('   2. Ejecuta los seeders: npm run db:seed\n');
    } else {
      console.error('🔧 Solución general:');
      console.error('   1. Verifica que PostgreSQL esté instalado y corriendo');
      console.error('   2. Verifica las credenciales en backend/.env');
      console.error('   3. Ejecuta: node scripts/setup-rapido.js\n');
    }
  } finally {
    await sequelize.close();
  }
}

diagnosticar();

