const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Ferreteriakm6',
  database: process.env.DB_NAME || 'psyche_db'
});

async function crearCitasPrueba() {
  try {
    console.log('🔍 Conectando a la base de datos...');
    const client = await pool.connect();
    
    console.log('✅ Conexión exitosa');

    // Obtener IDs de psicólogos y pacientes existentes
    const { rows: psicologos } = await client.query(
      "SELECT u.id FROM usuarios u INNER JOIN roles r ON u.rol_id = r.id WHERE r.nombre = 'psicologo' LIMIT 3"
    );

    const { rows: pacientes } = await client.query(
      "SELECT id, psicologo_id FROM pacientes LIMIT 5"
    );

    if (psicologos.length === 0) {
      console.log('❌ No hay psicólogos en la base de datos');
      return;
    }

    if (pacientes.length === 0) {
      console.log('❌ No hay pacientes en la base de datos');
      return;
    }

    console.log(`📊 Encontrados ${psicologos.length} psicólogos y ${pacientes.length} pacientes`);

    // Crear citas de prueba
    const citasPrueba = [
      {
        paciente_id: pacientes[0]?.id,
        psicologo_id: pacientes[0]?.psicologo_id || psicologos[0].id,
        fecha: new Date().toISOString().split('T')[0], // Hoy
        hora_inicio: '09:00',
        hora_fin: '10:00',
        duracion_minutos: 60,
        tipo_sesion: 'individual',
        modalidad: 'presencial',
        estado: 'programada',
        notas_paciente: 'Primera sesión, me siento ansioso',
        notas_psicologo: null,
        recordatorio_enviado: false
      },
      {
        paciente_id: pacientes[1]?.id,
        psicologo_id: pacientes[1]?.psicologo_id || psicologos[0].id,
        fecha: new Date().toISOString().split('T')[0], // Hoy
        hora_inicio: '11:00',
        hora_fin: '12:00',
        duracion_minutos: 60,
        tipo_sesion: 'individual',
        modalidad: 'virtual',
        estado: 'confirmada',
        notas_paciente: 'Seguimiento de la terapia',
        notas_psicologo: 'Paciente muestra mejoría',
        recordatorio_enviado: true
      },
      {
        paciente_id: pacientes[2]?.id,
        psicologo_id: pacientes[2]?.psicologo_id || psicologos[0].id,
        fecha: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Mañana
        hora_inicio: '14:00',
        hora_fin: '15:00',
        duracion_minutos: 60,
        tipo_sesion: 'individual',
        modalidad: 'presencial',
        estado: 'programada',
        notas_paciente: 'Necesito hablar sobre mi trabajo',
        notas_psicologo: null,
        recordatorio_enviado: false
      },
      {
        paciente_id: pacientes[0]?.id,
        psicologo_id: pacientes[0]?.psicologo_id || psicologos[0].id,
        fecha: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Ayer
        hora_inicio: '16:00',
        hora_fin: '17:00',
        duracion_minutos: 60,
        tipo_sesion: 'individual',
        modalidad: 'virtual',
        estado: 'completada',
        notas_paciente: 'Sesión muy productiva',
        notas_psicologo: 'Paciente progresando bien',
        recordatorio_enviado: true
      },
      {
        paciente_id: pacientes[1]?.id,
        psicologo_id: pacientes[1]?.psicologo_id || psicologos[0].id,
        fecha: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Hace 2 días
        hora_inicio: '10:00',
        hora_fin: '11:00',
        duracion_minutos: 60,
        tipo_sesion: 'individual',
        modalidad: 'presencial',
        estado: 'cancelada',
        notas_paciente: 'Tuve una emergencia',
        notas_psicologo: 'Paciente canceló por emergencia',
        recordatorio_enviado: true
      }
    ];

    console.log('📝 Creando citas de prueba...');

    for (const cita of citasPrueba) {
      if (!cita.paciente_id || !cita.psicologo_id) {
        console.log('⚠️ Saltando cita - faltan datos de paciente o psicólogo');
        continue;
      }

      await client.query(
        `INSERT INTO citas (
          id, paciente_id, psicologo_id, fecha, hora_inicio, hora_fin,
          duracion_minutos, tipo_sesion, modalidad, estado,
          notas_paciente, notas_psicologo, recordatorio_enviado,
          created_at, updated_at
        ) VALUES (
          gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW(), NOW()
        )`,
        [
          cita.paciente_id,
          cita.psicologo_id,
          cita.fecha,
          cita.hora_inicio,
          cita.hora_fin,
          cita.duracion_minutos,
          cita.tipo_sesion,
          cita.modalidad,
          cita.estado,
          cita.notas_paciente,
          cita.notas_psicologo,
          cita.recordatorio_enviado
        ]
      );

      console.log(`✅ Cita creada: ${cita.fecha} ${cita.hora_inicio} - ${cita.paciente_id}`);
    }

    // Verificar citas creadas
    const { rows: citasCreadas } = await client.query(
      'SELECT COUNT(*) as total FROM citas'
    );

    console.log(`📊 Total de citas en la base de datos: ${citasCreadas[0].total}`);

    client.release();
    console.log('🎉 Script completado exitosamente');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await pool.end();
  }
}

crearCitasPrueba(); 