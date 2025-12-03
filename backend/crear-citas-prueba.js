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

async function crearCitasPrueba() {
  try {
    console.log('🚀 Iniciando creación de citas de prueba...');
    
    // Obtener un psicólogo existente
    const [psicologo] = await sequelize.query(`
      SELECT u.id, u.nombres, u.apellidos 
      FROM usuarios u 
      JOIN roles r ON u.rol_id = r.id 
      WHERE r.nombre = 'psicologo' 
      AND u.deleted_at IS NULL 
      LIMIT 1
    `);
    
    if (!psicologo) {
      console.error('❌ No se encontró ningún psicólogo en la base de datos');
      return;
    }
    
    console.log(`👨‍⚕️ Psicólogo encontrado: ${psicologo.nombres} ${psicologo.apellidos}`);
    
    // Obtener pacientes existentes
    const pacientes = await sequelize.query(`
      SELECT p.id, u.nombres, u.apellidos 
      FROM pacientes p 
      JOIN usuarios u ON p.usuario_id = u.id 
      WHERE p.deleted_at IS NULL 
      LIMIT 5
    `);
    
    if (pacientes.length === 0) {
      console.error('❌ No se encontraron pacientes en la base de datos');
      return;
    }
    
    console.log(`👥 Pacientes encontrados: ${pacientes.length}`);
    
    // Crear citas para los próximos 7 días
    const hoy = new Date();
    const citas = [];
    
    for (let i = 0; i < 7; i++) {
      const fecha = new Date(hoy);
      fecha.setDate(hoy.getDate() + i);
      const fechaStr = fecha.toISOString().split('T')[0];
      
      // Crear 2-3 citas por día
      const citasDelDia = Math.floor(Math.random() * 2) + 2; // 2-3 citas
      
      for (let j = 0; j < citasDelDia; j++) {
        const paciente = pacientes[Math.floor(Math.random() * pacientes.length)];
        const horaInicio = 9 + (j * 2); // 9:00, 11:00, 13:00, etc.
        const horaFin = horaInicio + 1;
        
        const cita = {
          id: require('crypto').randomUUID(),
          paciente_id: paciente.id,
          psicologo_id: psicologo.id,
          fecha: fechaStr,
          hora_inicio: `${horaInicio.toString().padStart(2, '0')}:00:00`,
          hora_fin: `${horaFin.toString().padStart(2, '0')}:00:00`,
          duracion_minutos: 60,
          estado: 'confirmada',
          tipo_sesion: 'individual',
          modalidad: Math.random() > 0.5 ? 'presencial' : 'online',
          notas_paciente: `Cita de prueba - ${fechaStr}`,
          pago_estado: 'pendiente',
          pago_monto: 50000,
          recordatorio_enviado: false,
          created_at: new Date(),
          updated_at: new Date()
        };
        
        citas.push(cita);
      }
    }
    
    console.log(`📅 Creando ${citas.length} citas...`);
    
    // Insertar citas en la base de datos
    for (const cita of citas) {
      await sequelize.query(`
        INSERT INTO citas (
          id, paciente_id, psicologo_id, fecha, hora_inicio, hora_fin,
          duracion_minutos, estado, tipo_sesion, modalidad, notas_paciente,
          pago_estado, pago_monto, recordatorio_enviado, created_at, updated_at
        ) VALUES (
          :id, :paciente_id, :psicologo_id, :fecha, :hora_inicio, :hora_fin,
          :duracion_minutos, :estado, :tipo_sesion, :modalidad, :notas_paciente,
          :pago_estado, :pago_monto, :recordatorio_enviado, :created_at, :updated_at
        )
      `, {
        replacements: cita
      });
    }
    
    console.log('✅ Citas creadas exitosamente!');
    console.log('\n📋 Resumen de citas creadas:');
    
    // Mostrar resumen por fecha
    const citasPorFecha = {};
    citas.forEach(cita => {
      if (!citasPorFecha[cita.fecha]) {
        citasPorFecha[cita.fecha] = [];
      }
      citasPorFecha[cita.fecha].push(cita);
    });
    
    Object.keys(citasPorFecha).sort().forEach(fecha => {
      console.log(`\n📅 ${fecha}:`);
      citasPorFecha[fecha].forEach(cita => {
        console.log(`  - ${cita.hora_inicio} - ${cita.hora_fin} (${cita.estado})`);
      });
    });
    
  } catch (error) {
    console.error('❌ Error al crear citas:', error);
  } finally {
    await sequelize.close();
  }
}

// Ejecutar el script
crearCitasPrueba();




