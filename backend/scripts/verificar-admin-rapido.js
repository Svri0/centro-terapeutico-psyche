const { Usuario } = require('../dist/modelos');

async function verificarAdminRapido() {
  try {
    console.log('🔍 VERIFICACIÓN RÁPIDA DEL ADMIN ESTÁNDAR');
    console.log('==========================================\n');

    const email = 'admin@admin.cl';
    const password = 'admin123';

    console.log('🎯 BUSCANDO ADMIN ESTÁNDAR:');
    console.log('----------------------------');
    console.log(`📧 Email: ${email}`);
    console.log(`🔐 Contraseña: ${password}`);

    // Buscar el usuario admin
    const admin = await Usuario.findOne({ 
      where: { 
        email: email,
        rol_id: 1 // Rol de administrador
      },
      attributes: ['id', 'nombres', 'apellidos', 'email', 'rol_id', 'activo', 'email_verificado', 'created_at']
    });

    if (admin) {
      console.log('\n✅ ADMIN ENCONTRADO:');
      console.log('---------------------');
      console.log(`🆔 ID: ${admin.id}`);
      console.log(`👤 Nombre: ${admin.nombres} ${admin.apellidos}`);
      console.log(`📧 Email: ${admin.email}`);
      console.log(`👑 Rol: Administrador`);
      console.log(`✅ Activo: ${admin.activo ? 'Sí' : 'No'}`);
      console.log(`✅ Email verificado: ${admin.email_verificado ? 'Sí' : 'No'}`);
      console.log(`📅 Creado: ${admin.created_at}`);

      console.log('\n💡 CREDENCIALES DE ACCESO:');
      console.log('----------------------------');
      console.log(`📧 Email: ${email}`);
      console.log(`🔐 Contraseña: ${password}`);
      console.log('\n🚀 ¡Ya puedes iniciar sesión como administrador!');

    } else {
      console.log('\n❌ ADMIN NO ENCONTRADO');
      console.log('------------------------');
      console.log('💡 Para crear el admin estándar, ejecuta:');
      console.log('   node scripts/crear-admin.js');
      console.log('\n🎯 Este script creará automáticamente:');
      console.log(`   📧 Email: ${email}`);
      console.log(`   🔐 Contraseña: ${password}`);
    }

    // Verificar si hay otros usuarios admin
    const otrosAdmins = await Usuario.findAll({ 
      where: { rol_id: 1 },
      attributes: ['id', 'nombres', 'apellidos', 'email', 'created_at']
    });

    if (otrosAdmins.length > 0) {
      console.log('\n📋 OTROS USUARIOS ADMINISTRADORES:');
      console.log('-----------------------------------');
      otrosAdmins.forEach((admin, index) => {
        if (admin.email !== email) {
          console.log(`${index + 1}. ${admin.nombres} ${admin.apellidos} (${admin.email})`);
        }
      });
    }

  } catch (error) {
    console.error('❌ Error durante la verificación:', error);
    console.log('\n💡 Asegúrate de que:');
    console.log('   1. La base de datos esté corriendo');
    console.log('   2. Las migraciones estén ejecutadas');
    console.log('   3. El proyecto esté compilado (npm run build)');
  }
}

// Ejecutar verificación
verificarAdminRapido();
