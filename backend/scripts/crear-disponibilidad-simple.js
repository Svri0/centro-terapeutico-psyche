const { Sequelize } = require('sequelize');

// Configuración de la base de datos
const sequelize = new Sequelize('psyche_db', 'postgres', 'VMlover01!', {
  host: 'localhost',
  port: 5432,
  dialect: 'postgres',
  logging: false
});

async function crearDisponibilidadSimple() {
  try {
    console.log('🚀 Iniciando creación de disponibilidad simple...');

    // Buscar un psicólogo
    const [psicologos] = await sequelize.query(`
      SELECT u.id, u.nombres, u.apellidos, u.email
      FROM usuarios u
      WHERE u.rol_id = 2 AND u.deleted_at IS NULL
      LIMIT 1
    `);

    if (!psicologos || psicologos.length === 0) {
      console.error('❌ No se encontró ningún psicólogo');
      return;
    }

    const psicologo = psicologos[0];
    console.log(`📋 Psicólogo encontrado: ${psicologo.nombres} ${psicologo.apellidos}`);

    // Crear disponibilidad semanal por defecto
    const disponibilidades = [
      { dia_semana: 1, hora_inicio: '09:00', hora_fin: '17:00', activo: true }, // Lunes
      { dia_semana: 2, hora_inicio: '09:00', hora_fin: '17:00', activo: true }, // Martes
      { dia_semana: 3, hora_inicio: '09:00', hora_fin: '17:00', activo: true }, // Miércoles
      { dia_semana: 4, hora_inicio: '09:00', hora_fin: '17:00', activo: true }, // Jueves
      { dia_semana: 5, hora_inicio: '09:00', hora_fin: '17:00', activo: true }, // Viernes
      { dia_semana: 6, hora_inicio: '09:00', hora_fin: '13:00', activo: true }, // Sábado
      { dia_semana: 7, hora_inicio: '00:00', hora_fin: '00:00', activo: false }  // Domingo
    ];

    console.log('📅 Creando disponibilidad semanal...');

    // Limpiar disponibilidad existente
    await sequelize.query(`
      UPDATE disponibilidad 
      SET deleted_at = NOW() 
      WHERE psicologo_id = :psicologoId
    `, {
      replacements: { psicologoId: psicologo.id }
    });

    // Insertar nueva disponibilidad
    for (const disp of disponibilidades) {
      const query = `
        INSERT INTO disponibilidad (psicologo_id, dia_semana, hora_inicio, hora_fin, activo, created_at, updated_at)
        VALUES (:psicologo_id, :dia_semana, :hora_inicio, :hora_fin, :activo, NOW(), NOW())
      `;

      await sequelize.query(query, {
        replacements: {
          psicologo_id: psicologo.id,
          dia_semana: disp.dia_semana,
          hora_inicio: disp.hora_inicio,
          hora_fin: disp.hora_fin,
          activo: disp.activo
        }
      });
    }

    console.log('✅ Disponibilidad semanal creada exitosamente');
    console.log('📊 Horarios configurados:');
    console.log('   - Lunes a Viernes: 09:00-17:00');
    console.log('   - Sábado: 09:00-13:00');
    console.log('   - Domingo: No laborable');

    // Verificar que se creó correctamente
    const [verificacion] = await sequelize.query(`
      SELECT dia_semana, hora_inicio, hora_fin, activo
      FROM disponibilidad 
      WHERE psicologo_id = :psicologoId AND deleted_at IS NULL
      ORDER BY dia_semana ASC
    `, {
      replacements: { psicologoId: psicologo.id }
    });

    console.log('🔍 Verificación - Disponibilidades creadas:', verificacion);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await sequelize.close();
  }
}

crearDisponibilidadSimple();
