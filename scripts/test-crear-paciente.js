const { Sequelize } = require('sequelize');
const bcrypt = require('bcryptjs');

// Configuración de la base de datos
const sequelize = new Sequelize({
  dialect: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'centro_terapeutico',
  logging: false
});

async function testCrearPaciente() {
  try {
    console.log('🔍 Conectando a la base de datos...');
    await sequelize.authenticate();
    console.log('✅ Conexión exitosa');

    // Buscar el psicólogo
    console.log('🔍 Buscando psicólogo...');
    const [psicologos] = await sequelize.query(`
      SELECT u.id, u.email, u.nombres, u.apellidos, u.rol_id, r.nombre as rol_nombre
      FROM usuarios u
      INNER JOIN roles r ON u.rol_id = r.id
      WHERE u.email = 'psicologo@terapia.cl'
    `);

    if (!Array.isArray(psicologos) || psicologos.length === 0) {
      console.log('❌ No se encontró el psicólogo');
      process.exit(1);
    }

    const psicologo = psicologos[0];
    console.log('✅ Psicólogo encontrado:', psicologo.id);

    // Obtener rol de paciente
    console.log('🔍 Buscando rol de paciente...');
    const [roles] = await sequelize.query("SELECT id FROM roles WHERE nombre = 'paciente'");
    
    if (!Array.isArray(roles) || roles.length === 0) {
      console.log('❌ Rol de paciente no encontrado');
      process.exit(1);
    }

    const rolPacienteId = roles[0].id;
    console.log('✅ Rol de paciente encontrado:', rolPacienteId);

    // Generar contraseña temporal
    const passwordTemporal = Math.random().toString(36).slice(-8);
    const passwordHash = await bcrypt.hash(passwordTemporal, 12);

    // Crear usuario del paciente
    console.log('👤 Creando usuario del paciente...');
    const [usuarioCreado] = await sequelize.query(`
      INSERT INTO usuarios (
        id, email, password_hash, nombres, apellidos, telefono, 
        fecha_nacimiento, genero, rol_id, activo, email_verificado, 
        configuracion, created_at, updated_at
      ) VALUES (
        gen_random_uuid(), 'test@test.com', :passwordHash, 'Test', 'Paciente', '+56987654321',
        '1990-01-01', 'masculino', :rolId, true, false,
        '{}', NOW(), NOW()
      ) RETURNING id
    `, {
      replacements: {
        passwordHash,
        rolId: rolPacienteId
      }
    });

    const usuarioId = usuarioCreado[0].id;
    console.log('✅ Usuario creado:', usuarioId);

    // Generar número de ficha
    console.log('🔍 Generando número de ficha...');
    const [ultimaFicha] = await sequelize.query(`
      SELECT numero_ficha 
      FROM pacientes 
      WHERE psicologo_id = :psicologoId 
      AND deleted_at IS NULL 
      ORDER BY id DESC 
      LIMIT 1
    `, {
      replacements: { psicologoId: psicologo.id }
    });

    // Obtener el número de psicólogo (asignar un número secuencial)
    const [psicologoNumero] = await sequelize.query(`
      SELECT COUNT(DISTINCT psicologo_id) + 1 as numero
      FROM pacientes 
      WHERE deleted_at IS NULL
    `);
    
    const numeroPsicologo = Array.isArray(psicologoNumero) && psicologoNumero.length > 0 
      ? psicologoNumero[0].numero 
      : 1;
    
    let numeroFicha;
    if (Array.isArray(ultimaFicha) && ultimaFicha.length > 0) {
      const fichaExistente = ultimaFicha[0].numero_ficha;
      console.log('🔍 Ficha existente:', fichaExistente);
      
      const match = fichaExistente.match(/PSI-(\d+)-(\d+)/);
      if (match) {
        const ultimoNumero = parseInt(match[2]) || 0;
        numeroFicha = `PSI-${numeroPsicologo}-${String(ultimoNumero + 1).padStart(4, '0')}`;
      } else {
        numeroFicha = `PSI-${numeroPsicologo}-0001`;
      }
    } else {
      numeroFicha = `PSI-${numeroPsicologo}-0001`;
    }

    console.log('🎯 Número de ficha:', numeroFicha);

    // Crear paciente
    console.log('👤 Creando paciente...');
    const [pacienteCreado] = await sequelize.query(`
      INSERT INTO pacientes (
        id, usuario_id, psicologo_id, numero_ficha, rut, direccion,
        contacto_emergencia_nombre, contacto_emergencia_telefono, 
        contacto_emergencia_relacion, diagnosticos, etiquetas,
        estrategias_autorregulacion, puntos_acumulados, estado,
        fecha_ingreso, observaciones, created_at, updated_at
      ) VALUES (
        gen_random_uuid(), :usuarioId, :psicologoId, :numeroFicha, '12345678-9', 'Test Dirección',
        'Test Contacto', '+56912345678', 'Familiar', '[]', '[]', '[]', 0, 'activo',
        NOW(), 'Paciente de prueba', NOW(), NOW()
      ) RETURNING id, numero_ficha
    `, {
      replacements: {
        usuarioId,
        psicologoId: psicologo.id,
        numeroFicha
      }
    });

    console.log('✅ Paciente creado exitosamente!');
    console.log('📋 Datos del paciente:');
    console.log('   ID:', pacienteCreado[0].id);
    console.log('   Ficha:', pacienteCreado[0].numero_ficha);
    console.log('   Email: test@test.com');
    console.log('   Contraseña temporal:', passwordTemporal);

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('❌ Stack:', error.stack);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

// Ejecutar el script
testCrearPaciente(); 