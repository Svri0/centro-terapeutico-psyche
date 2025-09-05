const { Sequelize } = require('sequelize');
const axios = require('axios');
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

async function verificarConfiguracion() {
  console.log('🔍 Verificando configuración del sistema...\n');

  try {
    // 1. Verificar conexión a la base de datos
    console.log('1️⃣ Verificando conexión a la base de datos...');
    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos exitosa');

    // 2. Verificar que existe el usuario admin correcto
    console.log('2️⃣ Verificando usuario admin...');
    const [adminUser] = await sequelize.query(
      "SELECT id, email, activo, rol_id FROM usuarios WHERE email = 'admin@admin.cl'",
      { type: Sequelize.QueryTypes.SELECT }
    );

    if (adminUser.length === 0) {
      console.log('❌ No se encontró el usuario admin@admin.cl');
      console.log('💡 Ejecuta: node scripts/crear-admin-correcto.js');
      return;
    }

    console.log('✅ Usuario admin@admin.cl encontrado');
    console.log(`   - ID: ${adminUser[0].id}`);
    console.log(`   - Activo: ${adminUser[0].activo ? 'Sí' : 'No'}`);
    console.log(`   - Rol ID: ${adminUser[0].rol_id}`);

    // 3. Verificar rol de administrador
    console.log('3️⃣ Verificando rol de administrador...');
    const [adminRole] = await sequelize.query(
      "SELECT id, nombre FROM roles WHERE nombre = 'administrador'",
      { type: Sequelize.QueryTypes.SELECT }
    );

    if (adminRole.length === 0) {
      console.log('❌ No se encontró el rol de administrador');
      return;
    }

    console.log('✅ Rol de administrador encontrado');
    console.log(`   - ID: ${adminRole[0].id}`);
    console.log(`   - Nombre: ${adminRole[0].nombre}`);

    // 4. Verificar que el backend esté funcionando
    console.log('4️⃣ Verificando backend (puerto 3002)...');
    try {
      const response = await axios.get('http://localhost:3002/salud', { timeout: 5000 });
      console.log('✅ Backend funcionando correctamente');
      console.log(`   - Puerto: ${response.data.data.puerto}`);
      console.log(`   - Estado: ${response.data.data.estado}`);
    } catch (error) {
      console.log('❌ Backend no está funcionando en puerto 3002');
      console.log('💡 Asegúrate de que el backend esté corriendo');
    }

    // 5. Verificar que el frontend esté funcionando
    console.log('5️⃣ Verificando frontend (puerto 3000)...');
    try {
      const response = await axios.get('http://localhost:3000', { timeout: 5000 });
      console.log('✅ Frontend funcionando correctamente');
    } catch (error) {
      console.log('❌ Frontend no está funcionando en puerto 3000');
      console.log('💡 Asegúrate de que el frontend esté corriendo');
    }

    console.log('');
    console.log('🎉 Resumen de la configuración:');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('📧 Usuario Admin: admin@admin.cl');
    console.log('🔑 Contraseña: admin123');
    console.log('🚀 Frontend: http://localhost:3000');
    console.log('🔧 Backend: http://localhost:3002');
    console.log('🗄️ Base de datos: PostgreSQL');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('');
    console.log('💡 Para probar el login:');
    console.log('   1. Ve a http://localhost:3000');
    console.log('   2. Usa las credenciales: admin@admin.cl / admin123');
    console.log('   3. Deberías poder acceder al panel de administración');

  } catch (error) {
    console.error('❌ Error durante la verificación:', error.message);
  } finally {
    await sequelize.close();
  }
}

// Ejecutar verificación
verificarConfiguracion(); 