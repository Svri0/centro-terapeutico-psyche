const { Sequelize } = require('sequelize');
const Usuario = require('../src/modelos/Usuario').default;
const Rol = require('../src/modelos/Rol').default;

// Configurar Sequelize
const sequelize = new Sequelize({
  dialect: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'psyche_db',
  logging: false
});

async function testUserQuery() {
  try {
    console.log('🔌 Conectando a la base de datos...');
    await sequelize.authenticate();
    console.log('✅ Conexión exitosa');

    const userId = '559a9710-7a5b-48a5-bd7a-055ec9c114d6';
    
    console.log('🔍 Buscando usuario con ID:', userId);
    
    // Buscar usuario sin incluir rol
    const usuarioSimple = await Usuario.findOne({
      where: { id: userId }
    });
    
    if (!usuarioSimple) {
      console.log('❌ Usuario no encontrado');
      return;
    }
    
    console.log('✅ Usuario encontrado:', usuarioSimple.nombres, usuarioSimple.apellidos);
    console.log('📋 Datos del usuario:', {
      id: usuarioSimple.id,
      nombres: usuarioSimple.nombres,
      apellidos: usuarioSimple.apellidos,
      email: usuarioSimple.email,
      rol_id: usuarioSimple.rol_id
    });

    // Buscar usuario con rol
    console.log('🔍 Buscando usuario con rol...');
    const usuarioConRol = await Usuario.findOne({
      where: { id: userId },
      include: [{ model: Rol }]
    });
    
    if (!usuarioConRol) {
      console.log('❌ Usuario con rol no encontrado');
      return;
    }
    
    console.log('✅ Usuario con rol encontrado');
    console.log('📋 Rol:', usuarioConRol.rol?.nombre);

    // Buscar usuario con rol específico de psicólogo
    console.log('🔍 Buscando usuario con rol de psicólogo...');
    const usuarioPsicologo = await Usuario.findOne({
      where: { id: userId },
      include: [{ model: Rol, where: { nombre: 'psicologo' } }]
    });
    
    if (!usuarioPsicologo) {
      console.log('❌ Usuario con rol de psicólogo no encontrado');
      return;
    }
    
    console.log('✅ Usuario con rol de psicólogo encontrado');
    console.log('📋 Datos completos:', {
      id: usuarioPsicologo.id,
      nombres: usuarioPsicologo.nombres,
      apellidos: usuarioPsicologo.apellidos,
      email: usuarioPsicologo.email,
      rol: usuarioPsicologo.rol?.nombre,
      especialidad: usuarioPsicologo.especialidad,
      descripcion: usuarioPsicologo.descripcion
    });

    // Probar actualización
    console.log('📝 Probando actualización...');
    await usuarioPsicologo.update({
      especialidad: 'Psicología Clínica - Terapia Cognitivo-Conductual',
      descripcion: 'Psicóloga clínica especializada en terapia cognitivo-conductual con más de 10 años de experiencia.'
    });
    
    console.log('✅ Actualización exitosa');

  } catch (error) {
    console.error('❌ Error:', error);
    console.error('📋 Stack trace:', error.stack);
  } finally {
    await sequelize.close();
  }
}

testUserQuery(); 