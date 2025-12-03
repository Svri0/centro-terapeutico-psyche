const { Sequelize } = require('sequelize');

// Configuración de la base de datos
const sequelize = new Sequelize({
  dialect: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'centro_terapeutico',
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  logging: false
});

async function buscarOCrearMaria() {
  try {
    console.log('🔍 Buscando paciente María González...');
    
    // Buscar paciente María González
    const [maria] = await sequelize.query(`
      SELECT p.id, u.nombres, u.apellidos, u.email
      FROM pacientes p 
      JOIN usuarios u ON p.usuario_id = u.id 
      WHERE u.nombres ILIKE '%maría%' 
      AND u.apellidos ILIKE '%gonzález%'
      AND p.deleted_at IS NULL
      LIMIT 1
    `);
    
    if (maria) {
      console.log('✅ María González encontrada:', maria);
      return maria.id;
    }
    
    console.log('❌ María González no encontrada. Creando...');
    
    // Obtener rol de paciente
    const [rolPaciente] = await sequelize.query(`
      SELECT id FROM roles WHERE nombre = 'paciente'
    `);
    
    if (!rolPaciente) {
      console.error('❌ No se encontró el rol de paciente');
      return null;
    }
    
    // Crear usuario María González
    const [usuarioCreado] = await sequelize.query(`
      INSERT INTO usuarios (
        id, nombres, apellidos, email, telefono, fecha_nacimiento, 
        genero, rol_id, created_at, updated_at
      ) VALUES (
        gen_random_uuid(), 'María', 'González', 'maria.gonzalez@email.com', 
        '+56912345678', '1985-03-15', 'Femenino', :rol_id, NOW(), NOW()
      ) RETURNING id, nombres, apellidos, email
    `, {
      replacements: { rol_id: rolPaciente.id }
    });
    
    if (!usuarioCreado) {
      console.error('❌ Error al crear usuario');
      return null;
    }
    
    const usuario = usuarioCreado[0];
    console.log('✅ Usuario creado:', usuario);
    
    // Crear paciente
    const numeroFicha = `P${String(usuario.id).padStart(6, '0')}`;
    
    const [pacienteCreado] = await sequelize.query(`
      INSERT INTO pacientes (
        id, usuario_id, numero_ficha, rut, direccion,
        contacto_emergencia_nombre, contacto_emergencia_telefono, 
        contacto_emergencia_relacion, observaciones, estado,
        fecha_ingreso, created_at, updated_at
      ) VALUES (
        gen_random_uuid(), :usuario_id, :numero_ficha, '12.345.678-9', 
        'Av. Principal 123, Santiago', 'Juan González', '+56987654321',
        'Esposo', 'Paciente de prueba para testing', 'activo',
        NOW(), NOW(), NOW()
      ) RETURNING id, numero_ficha
    `, {
      replacements: {
        usuario_id: usuario.id,
        numero_ficha: numeroFicha
      }
    });
    
    if (!pacienteCreado) {
      console.error('❌ Error al crear paciente');
      return null;
    }
    
    const paciente = pacienteCreado[0];
    console.log('✅ Paciente creado:', paciente);
    
    return paciente.id;
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    return null;
  } finally {
    await sequelize.close();
  }
}

// Ejecutar el script
buscarOCrearMaria().then(pacienteId => {
  if (pacienteId) {
    console.log(`\n🎉 María González lista con ID: ${pacienteId}`);
    console.log('Ahora puedes usar este ID en el componente de crear citas de prueba.');
  } else {
    console.log('\n❌ No se pudo crear o encontrar María González');
  }
});




