const { Sequelize } = require('sequelize');

// Configuración de la base de datos
const sequelize = new Sequelize({
  database: 'psyche_db',
  username: 'postgres',
  password: 'Ferreteriakm6',
  host: 'localhost',
  port: 5432,
  dialect: 'postgres',
  logging: false
});

async function debugIniciarSesion() {
  try {
    console.log('🔍 Debugging iniciar sesión...');
    await sequelize.authenticate();
    console.log('✅ Conexión exitosa a la base de datos');

    // Simular los datos que recibiría el controlador
    const citaId = 'b57b2b9f-fa9a-4ef6-a629-eca925c7a564';
    const psicologoId = '559a9710-7a5b-48a5-bd7a-055ec9c114d6'; // Laura Fernández

    console.log('\n1️⃣ Verificando cita...');
    const [citaData] = await sequelize.query(
      `SELECT 
        c.id, c.paciente_id, c.fecha, c.hora_inicio, c.hora_fin,
        c.duracion_minutos, c.estado, c.tipo_sesion, c.modalidad
       FROM citas c
       WHERE c.id = :citaId AND c.psicologo_id = :psicologoId`,
      {
        replacements: { citaId, psicologoId }
      }
    );

    if (citaData.length === 0) {
      console.log('❌ Cita no encontrada');
      return;
    }

    console.log('✅ Cita encontrada:', citaData[0]);
    const cita = citaData[0];

    console.log('\n2️⃣ Verificando estado de la cita...');
    if (!['confirmada', 'en_curso'].includes(cita.estado)) {
      console.log('❌ Estado de cita no válido:', cita.estado);
      return;
    }

    console.log('✅ Estado de cita válido');

    console.log('\n3️⃣ Verificando sesión activa...');
    const [sesionActiva] = await sequelize.query(
      `SELECT id, estado, fecha_inicio, duracion_minutos
       FROM sesiones 
       WHERE paciente_id = :pacienteId 
       AND psicologo_id = :psicologoId
       AND estado IN ('en_curso')
       ORDER BY created_at DESC
       LIMIT 1`,
      {
        replacements: { 
          pacienteId: cita.paciente_id,
          psicologoId 
        }
      }
    );

    if (sesionActiva.length > 0) {
      console.log('✅ Sesión activa encontrada:', sesionActiva[0]);
      return;
    }

    console.log('✅ No hay sesión activa, procediendo a crear nueva...');

    console.log('\n4️⃣ Intentando crear nueva sesión...');
    try {
      const [nuevaSesion] = await sequelize.query(
        `INSERT INTO sesiones (
          id, paciente_id, psicologo_id, fecha_programada,
          fecha_inicio, duracion_minutos, estado, tipo_sesion,
          objetivos_sesion, tecnicas_utilizadas, archivos_adjuntos,
          objetivos_alcanzados, tareas_asignadas, derivacion_recomendada,
          archivos_sesion, created_at, updated_at
        ) VALUES (
          gen_random_uuid(), :pacienteId, :psicologoId, :fechaSesion,
          NOW(), :duracionMinutos, 'en_curso', 'presencial',
          '[]', '[]', '[]', '[]', '[]', '[]', '[]', NOW(), NOW()
        ) RETURNING id, fecha_inicio, duracion_minutos`,
        {
          replacements: {
            pacienteId: cita.paciente_id,
            psicologoId,
            fechaSesion: cita.fecha,
            duracionMinutos: cita.duracion_minutos || 60
          }
        }
      );

      console.log('✅ Sesión creada exitosamente:', nuevaSesion[0]);

      // Actualizar estado de la cita
      await sequelize.query(
        `UPDATE citas SET estado = 'en_progreso', updated_at = NOW() 
         WHERE id = :citaId`,
        {
          replacements: { citaId }
        }
      );

      console.log('✅ Estado de cita actualizado a en_curso');

    } catch (error) {
      console.log('❌ Error al crear sesión:', error.message);
      console.log('Detalles del error:', error);
    }

  } catch (error) {
    console.error('❌ Error general:', error.message);
  } finally {
    await sequelize.close();
  }
}

debugIniciarSesion();
