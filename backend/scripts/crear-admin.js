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
    console.log('====================================\n');

    // Solicitar datos del admin
    const nombres = await pregunta('👤 Nombres del administrador: ');
    const apellidos = await pregunta('👤 Apellidos del administrador: ');
    const email = await pregunta('📧 Email del administrador: ');
    const telefono = await pregunta('📱 Teléfono (opcional): ') || null;
    const password = await pregunta('🔑 Contraseña: ');
    const confirmPassword = await pregunta('🔑 Confirmar contraseña: ');

    // Validaciones
    if (!nombres || !apellidos || !email || !password) {
      console.log('❌ Todos los campos obligatorios deben estar completos');
      rl.close();
      return;
    }

    if (password !== confirmPassword) {
      console.log('❌ Las contraseñas no coinciden');
      rl.close();
      return;
    }

    if (password.length < 6) {
      console.log('❌ La contraseña debe tener al menos 6 caracteres');
      rl.close();
      return;
    }

    // Verificar si el email ya existe
    const usuarioExistente = await Usuario.findOne({ where: { email } });
    if (usuarioExistente) {
      console.log('❌ Ya existe un usuario con ese email');
      rl.close();
      return;
    }

    // Hash de la contraseña
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Crear el usuario administrador
    const nuevoAdmin = await Usuario.create({
      nombres,
      apellidos,
      email,
      telefono,
      password: passwordHash,
      rol_id: 1, // 1 = Administrador
      activo: true,
      email_verificado: true
    });

    console.log('\n✅ USUARIO ADMINISTRADOR CREADO EXITOSAMENTE');
    console.log('=============================================');
    console.log(`👤 ID: ${nuevoAdmin.id}`);
    console.log(`👤 Nombre: ${nuevoAdmin.nombres} ${nuevoAdmin.apellidos}`);
    console.log(`📧 Email: ${nuevoAdmin.email}`);
    console.log(`🔑 Contraseña: ${password} (guardada en hash)`);
    console.log(`👑 Rol: Administrador`);
    console.log(`📅 Creado: ${nuevoAdmin.created_at}`);
    console.log('\n🚀 ¡Ya puedes iniciar sesión como administrador!');

    // Mostrar credenciales de acceso
    console.log('\n🔑 CREDENCIALES DE ACCESO:');
    console.log('---------------------------');
    console.log(`📧 Email: ${email}`);
    console.log(`🔑 Contraseña: ${password}`);
    console.log('\n⚠️  GUARDA ESTAS CREDENCIALES EN UN LUGAR SEGURO');

  } catch (error) {
    console.error('❌ Error al crear el administrador:', error);
  } finally {
    rl.close();
  }
}

// Ejecutar creación
crearAdmin(); 