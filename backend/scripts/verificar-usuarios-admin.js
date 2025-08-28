const { Usuario } = require('../dist/modelos');
const bcrypt = require('bcrypt');

async function verificarUsuariosAdmin() {
  try {
    console.log('🔍 VERIFICANDO USUARIOS ADMINISTRADORES');
    console.log('========================================\n');

    // 1. Verificar todos los usuarios admin
    const usuariosAdmin = await Usuario.findAll({
      where: { rol_id: 1 },
      attributes: ['id', 'nombres', 'apellidos', 'email', 'password', 'rol_id', 'created_at', 'updated_at']
    });

    console.log(`📊 Usuarios administradores encontrados: ${usuariosAdmin.length}\n`);

    if (usuariosAdmin.length === 0) {
      console.log('❌ NO HAY USUARIOS ADMINISTRADORES EN LA BASE DE DATOS');
      console.log('💡 Esto explica por qué no puedes entrar como admin');
      return;
    }

    // 2. Mostrar información de cada admin
    usuariosAdmin.forEach((admin, index) => {
      console.log(`👤 ADMIN ${index + 1}:`);
      console.log(`   ID: ${admin.id}`);
      console.log(`   Nombre: ${admin.nombres} ${admin.apellidos}`);
      console.log(`   Email: ${admin.email}`);
      console.log(`   Rol ID: ${admin.rol_id}`);
      console.log(`   Password Hash: ${admin.password ? '✅ Presente' : '❌ Ausente'}`);
      console.log(`   Creado: ${admin.created_at}`);
      console.log(`   Actualizado: ${admin.updated_at}`);
      console.log('');
    });

    // 3. Verificar si hay problemas con las contraseñas
    console.log('🔐 VERIFICANDO CONTRASEÑAS:');
    console.log('----------------------------');

    for (const admin of usuariosAdmin) {
      if (!admin.password) {
        console.log(`❌ ${admin.email}: SIN CONTRASEÑA`);
        continue;
      }

      // Verificar si la contraseña es muy corta (posible problema)
      if (admin.password.length < 10) {
        console.log(`⚠️  ${admin.email}: Contraseña sospechosamente corta (${admin.password.length} chars)`);
      } else {
        console.log(`✅ ${admin.email}: Contraseña parece válida (${admin.password.length} chars)`);
      }
    }

    // 4. Sugerencias de solución
    console.log('\n💡 SUGERENCIAS DE SOLUCIÓN:');
    console.log('=============================');
    console.log('1. Si no hay admins: Crear uno nuevo con el script crear-admin.js');
    console.log('2. Si hay admins pero no entran:');
    console.log('   - Verificar que la contraseña esté correctamente hasheada');
    console.log('   - Probar resetear la contraseña');
    console.log('3. Verificar que la base de datos esté sincronizada');
    console.log('4. Revisar logs del servidor para errores de autenticación');

    // 5. Opción para crear admin
    console.log('\n🚀 ¿Quieres crear un nuevo usuario administrador?');
    console.log('   Ejecuta: node scripts/crear-admin.js');

  } catch (error) {
    console.error('❌ Error durante la verificación:', error);
  }
}

// Ejecutar verificación
verificarUsuariosAdmin();
