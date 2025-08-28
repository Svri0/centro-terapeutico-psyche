const { Usuario } = require('../dist/modelos');
const bcrypt = require('bcrypt');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function pregunta(pregunta) {
  return new Promise((resolve) => {
    rl.question(pregunta, resolve);
  });
}

async function crearAdmin() {
  try {
    console.log('👑 CREADOR DE USUARIO ADMINISTRADOR');
    console.log('=====================================\n');

    // Usar credenciales predefinidas
    const nombres = 'Administrador';
    const apellidos = 'Sistema';
    const email = 'admin@admin.cl';
    const telefono = '+56 9 0000 0000';
    const password = 'admin123';

    console.log('🎯 USANDO CREDENCIALES PREDEFINIDAS:');
    console.log('-------------------------------------');
    console.log(`👤 Nombre: ${nombres} ${apellidos}`);
    console.log(`📧 Email: ${email}`);
    console.log(`🔐 Contraseña: ${password}`);
    console.log(`📱 Teléfono: ${telefono}`);

    // Verificar si el email ya existe
    const usuarioExistente = await Usuario.findOne({ where: { email } });
    if (usuarioExistente) {
      console.log('\n⚠️  Ya existe un usuario con ese email');
      console.log('💡 Puedes usar estas credenciales para iniciar sesión:');
      console.log(`   📧 Email: ${email}`);
      console.log(`   🔐 Contraseña: ${password}`);
      rl.close();
      return;
    }

    // Generar hash de la contraseña
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Crear el usuario administrador
    const nuevoAdmin = await Usuario.create({
      nombres,
      apellidos,
      email,
      telefono,
      password: passwordHash,
      rol_id: 1, // Rol de administrador
      activo: true,
      email_verificado: true
    });

    console.log('\n✅ USUARIO ADMINISTRADOR CREADO EXITOSAMENTE');
    console.log('=============================================');
    console.log(`👤 Nombre: ${nombres} ${apellidos}`);
    console.log(`📧 Email: ${email}`);
    console.log(`📱 Teléfono: ${telefono}`);
    console.log(`🔐 Contraseña: ${password}`);
    console.log(`🆔 ID del usuario: ${nuevoAdmin.id}`);
    console.log(`👑 Rol: Administrador`);

    console.log('\n💡 CREDENCIALES DE ACCESO:');
    console.log('----------------------------');
    console.log(`📧 Email: ${email}`);
    console.log(`🔐 Contraseña: ${password}`);
    console.log('\n🚀 ¡Ya puedes iniciar sesión como administrador!');

    console.log('\n📋 INFORMACIÓN IMPORTANTE:');
    console.log('----------------------------');
    console.log('🔒 Estas credenciales son estándar para desarrollo');
    console.log('⚠️  Cambia la contraseña en producción');
    console.log('💡 Puedes compartir estas credenciales con tu equipo');

  } catch (error) {
    console.error('❌ Error al crear el administrador:', error);
  } finally {
    rl.close();
  }
}

// Ejecutar creación
crearAdmin(); 