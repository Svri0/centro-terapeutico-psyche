const { Sequelize } = require('sequelize');

// Configuración de la base de datos
const sequelize = new Sequelize('psyche_db', 'postgres', 'Ferreteriakm6', {
  host: 'localhost',
  port: 5432,
  dialect: 'postgres',
  logging: false
});

async function crearDisponibilidadPrueba() {
  try {
    console.log('🚀 Iniciando creación de disponibilidad de prueba...');

    // Buscar un psicólogo
    const [psicologos] = await sequelize.query(`
      SELECT u.id, u.nombres, u.apellidos, u.email, sp.id as servicio_id, sp.nombre as servicio_nombre
      FROM usuarios u
      INNER JOIN servicios_psicologo sp ON u.id = sp.psicologo_id
      WHERE u.rol_id = 2 AND u.deleted_at IS NULL
      LIMIT 1
    `);

    if (!psicologos || psicologos.length === 0) {
      console.error('❌ No se encontró ningún psicólogo con servicios');
      return;
    }

    const psicologo = psicologos[0];
    console.log(`📋 Psicólogo encontrado: ${psicologo.nombres} ${psicologo.apellidos}`);

    // Generar horarios para la próxima semana
    const horarios = [];
    const fechaInicio = new Date();
    fechaInicio.setDate(fechaInicio.getDate() + 1); // Empezar mañana

    const tipos = ['presencial', 'virtual', 'sobrecupo'];
    const horasInicio = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'];

    // Generar horarios para 7 días
    for (let dia = 0; dia < 7; dia++) {
      const fecha = new Date(fechaInicio);
      fecha.setDate(fecha.getDate() + dia);
      
      // Solo lunes a sábado (0 = domingo, 1 = lunes, etc.)
      if (fecha.getDay() === 0) continue; // Saltar domingos

      // Generar 3-5 horarios por día
      const numHorarios = Math.floor(Math.random() * 3) + 3;
      const horasSeleccionadas = [...horasInicio].sort(() => Math.random() - 0.5).slice(0, numHorarios);

      for (let i = 0; i < numHorarios; i++) {
        const horaInicio = horasSeleccionadas[i];
        const horaFin = new Date(`2000-01-01T${horaInicio}:00`);
        horaFin.setMinutes(horaFin.getMinutes() + 60); // 1 hora de duración
        
        const tipo = tipos[Math.floor(Math.random() * tipos.length)];
        
        horarios.push({
          psicologo_id: psicologo.id,
          fecha: fecha.toISOString().split('T')[0],
          hora_inicio: horaInicio,
          hora_fin: horaFin.toTimeString().slice(0, 5),
          servicio_id: psicologo.servicio_id,
          tipo: tipo,
          estado: 'disponible'
        });
      }
    }

    console.log(`📅 Generando ${horarios.length} horarios de disponibilidad...`);

    // Insertar horarios
    for (const horario of horarios) {
      const query = `
        INSERT INTO disponibilidad_horarios (
          id, psicologo_id, fecha, hora_inicio, hora_fin, 
          servicio_id, tipo, estado, created_at, updated_at
        ) VALUES (
          gen_random_uuid(), '${horario.psicologo_id}', '${horario.fecha}', '${horario.hora_inicio}', '${horario.hora_fin}', 
          ${horario.servicio_id}, '${horario.tipo}', '${horario.estado}', NOW(), NOW()
        )
      `;

      await sequelize.query(query);
    }

    console.log(`✅ Disponibilidad creada exitosamente para ${psicologo.nombres} ${psicologo.apellidos}`);
    console.log(`📊 Total de horarios creados: ${horarios.length}`);

    // Mostrar algunos ejemplos
    console.log('📋 Ejemplos de horarios creados:');
    horarios.slice(0, 5).forEach((horario, index) => {
      console.log(`   ${index + 1}. ${horario.fecha} ${horario.hora_inicio}-${horario.hora_fin} (${horario.tipo})`);
    });

  } catch (error) {
    console.error('❌ Error al crear disponibilidad de prueba:', error);
  } finally {
    await sequelize.close();
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  crearDisponibilidadPrueba();
}

module.exports = { crearDisponibilidadPrueba }; 