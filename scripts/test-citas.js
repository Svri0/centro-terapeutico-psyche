const { Sequelize } = require('sequelize');
require('dotenv').config();

// Configuración de la base de datos
const sequelize = new Sequelize(
  process.env.DB_NAME || 'centro_terapeutico',
  process.env.DB_USER || 'postgres',
  process.env.DB_PASSWORD || 'password',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: false
  }
);

async function testCitas() {
  try {
    console.log('🔍 Conectando a la base de datos...');
    await sequelize.authenticate();
    console.log('✅ Conexión exitosa');

    // Obtener psicólogo existente
    console.log('👨‍⚕️ Buscando psicólogo...');
    const [psicologos] = await sequelize.query(`
      SELECT u.id, u.nombres, u.apellidos, u.email
      FROM usuarios u
      INNER JOIN roles r ON u.rol_id = r.id
      WHERE r.nombre = 'psicologo'
      LIMIT 1
    `);

    if (!Array.isArray(psicologos) || psicologos.length === 0) {
      console.log('❌ No se encontró ningún psicólogo');
      return;
    }

    const psicologo = psicologos[0];
    console.log('✅ Psicólogo encontrado:', psicologo.nombres, psicologo.apellidos);

    // Verificar disponibilidad
    console.log('📅 Verificando disponibilidad...');
    const [disponibilidad] = await sequelize.query(`
      SELECT * FROM disponibilidad_psicologos
      WHERE psicologo_id = :psicologoId
    `, {
      replacements: { psicologoId: psicologo.id }
    });

    console.log('📊 Disponibilidad encontrada:', disponibilidad.length, 'registros');

    // Obtener paciente existente
    console.log('👤 Buscando paciente...');
    const [pacientes] = await sequelize.query(`
      SELECT p.id, p.numero_ficha, p.usuario_id, u.nombres, u.apellidos, u.email
      FROM pacientes p
      INNER JOIN usuarios u ON p.usuario_id = u.id
      WHERE p.psicologo_id = :psicologoId
      LIMIT 1
    `, {
      replacements: { psicologoId: psicologo.id }
    });

    if (!Array.isArray(pacientes) || pacientes.length === 0) {
      console.log('❌ No se encontró ningún paciente para este psicólogo');
      return;
    }

    const paciente = pacientes[0];
    console.log('✅ Paciente encontrado:', paciente.nombres, paciente.apellidos, '- Ficha:', paciente.numero_ficha);

    // Crear una cita de prueba
    console.log('📝 Creando cita de prueba...');
    const fechaCita = new Date();
    fechaCita.setDate(fechaCita.getDate() + 1); // Mañana
    const fechaFormateada = fechaCita.toISOString().split('T')[0];

    const [citaCreada] = await sequelize.query(`
      INSERT INTO citas (
        id, paciente_id, psicologo_id, fecha, hora_inicio, hora_fin,
        duracion_minutos, estado, tipo_sesion, modalidad, notas_paciente,
        created_at, updated_at
      ) VALUES (
        gen_random_uuid(), :paciente_id, :psicologo_id, :fecha, '10:00:00', '11:00:00',
        60, 'programada', 'individual', 'presencial', 'Cita de prueba',
        NOW(), NOW()
      ) RETURNING id, fecha, hora_inicio, hora_fin
    `, {
      replacements: {
        paciente_id: paciente.id,
        psicologo_id: psicologo.id,
        fecha: fechaFormateada
      }
    });

    console.log('✅ Cita creada:', citaCreada[0]);

    // Verificar citas del psicólogo
    console.log('📋 Verificando citas del psicólogo...');
    const [citasPsicologo] = await sequelize.query(`
      SELECT 
        c.id,
        c.fecha,
        c.hora_inicio,
        c.hora_fin,
        c.estado,
        c.tipo_sesion,
        c.modalidad,
        u.nombres as paciente_nombres,
        u.apellidos as paciente_apellidos,
        p.numero_ficha
      FROM citas c
      INNER JOIN pacientes p ON c.paciente_id = p.id
      INNER JOIN usuarios u ON p.usuario_id = u.id
      WHERE c.psicologo_id = :psicologoId
      ORDER BY c.fecha ASC, c.hora_inicio ASC
    `, {
      replacements: { psicologoId: psicologo.id }
    });

    console.log('📊 Citas del psicólogo:', citasPsicologo.length, 'citas');
    citasPsicologo.forEach((cita, index) => {
      console.log(`  ${index + 1}. ${cita.fecha} ${cita.hora_inicio} - ${cita.paciente_nombres} ${cita.paciente_apellidos} (${cita.estado})`);
    });

    // Verificar citas del paciente
    console.log('📋 Verificando citas del paciente...');
    const [citasPaciente] = await sequelize.query(`
      SELECT 
        c.id,
        c.fecha,
        c.hora_inicio,
        c.hora_fin,
        c.estado,
        c.tipo_sesion,
        c.modalidad,
        u.nombres as psicologo_nombres,
        u.apellidos as psicologo_apellidos
      FROM citas c
      INNER JOIN pacientes p ON c.paciente_id = p.id
      INNER JOIN usuarios u ON c.psicologo_id = u.id
      WHERE p.usuario_id = :usuarioId
      ORDER BY c.fecha ASC, c.hora_inicio ASC
    `, {
      replacements: { usuarioId: paciente.usuario_id }
    });

    console.log('📊 Citas del paciente:', citasPaciente.length, 'citas');
    citasPaciente.forEach((cita, index) => {
      console.log(`  ${index + 1}. ${cita.fecha} ${cita.hora_inicio} - Dr. ${cita.psicologo_nombres} ${cita.psicologo_apellidos} (${cita.estado})`);
    });

    console.log('✅ Pruebas completadas exitosamente!');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await sequelize.close();
  }
}

testCitas(); 