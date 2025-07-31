const { Sequelize, QueryTypes } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Ferreteriakm6',
  database: process.env.DB_NAME || 'psyche_db',
  dialect: 'postgres',
  logging: false
});

async function verificarUsuarios() {
  try {
    console.log('🔍 Verificando usuarios en la base de datos...\n');
    
    // Verificar conexión
    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos exitosa\n');
    
    // Obtener todos los usuarios
    const usuarios = await sequelize.query(
      `SELECT u.id, u.nombres, u.apellidos, u.email, u.activo, u.rol_id, r.nombre as rol_nombre
       FROM usuarios u
       INNER JOIN roles r ON u.rol_id = r.id
       WHERE u.deleted_at IS NULL
       ORDER BY u.created_at DESC`,
      {
        type: QueryTypes.SELECT
      }
    );
    
    console.log(`📊 Total de usuarios encontrados: ${usuarios.length}\n`);
    
    if (usuarios.length === 0) {
      console.log('❌ No hay usuarios en la base de datos');
      console.log('💡 Ejecuta: npm run crear-admin');
      return;
    }
    
    console.log('👥 Lista de usuarios:');
    console.log('═══════════════════════════════════════════════════════════════');
    
    usuarios.forEach((usuario, index) => {
      console.log(`${index + 1}. ${usuario.nombres} ${usuario.apellidos}`);
      console.log(`   📧 Email: ${usuario.email}`);
      console.log(`   🏷️  Rol: ${usuario.rol_nombre} (ID: ${usuario.rol_id})`);
      console.log(`   ✅ Activo: ${usuario.activo ? 'Sí' : 'No'}`);
      console.log(`   🆔 ID: ${usuario.id}`);
      console.log('');
    });
    
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('💡 Credenciales de prueba:');
    console.log('   - admin@admin.com / admin123');
    console.log('   - laura.fernandez@psyche.cl / psicologo123');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await sequelize.close();
  }
}

verificarUsuarios(); 