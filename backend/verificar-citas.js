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

async function verificarCitas() {
  try {
    console.log('🔍 Verificando citas existentes...');
    
    // Verificar citas existentes
    const citas = await sequelize.query(`
      SELECT 
        c.id,
        c.fecha,
        c.hora_inicio,
        c.hora_fin,
        c.estado,
        u.nombres as paciente_nombre,
        u.apellidos as paciente_apellidos
      FROM citas c
      JOIN usuarios u ON c.paciente_id = u.id
      WHERE c.deleted_at IS NULL
      ORDER BY c.fecha, c.hora_inicio
    `);
    
    console.log(`📊 Total de citas encontradas: ${citas.length}`);
    
    if (citas.length > 0) {
      console.log('\n📋 Citas existentes:');
      citas.forEach(cita => {
        console.log(`- ${cita.fecha} ${cita.hora_inicio} - ${cita.paciente_nombre} ${cita.paciente_apellidos} (${cita.estado})`);
      });
    }
    
    // Crear citas de prueba para hoy y mañana
    const hoy = new Date();
    const mañana = new Date(hoy);
    mañana.setDate(hoy.getDate() + 1);
    
    const fechas = [
      hoy.toISOString().split('T')[0],
      mañana.toISOString().split('T')[0]
    ];
    
    console.log('\n🚀 Creando citas de prueba...');
    
    // Obtener psicólogo
    const [psicologo] = await sequelize.query(`
      SELECT u.id, u.nombres, u.apellidos 
      FROM usuarios u 
      JOIN roles r ON u.rol_id = r.id 
      WHERE r.nombre = 'psicologo' 
      AND u.deleted_at IS NULL 
      LIMIT 1
    `);
    
    if (!psicologo) {
      console.error('❌ No se encontró psicólogo');
      return;
    }
    
    // Obtener pacientes
    const pacientes = await sequelize.query(`
      SELECT p.id, u.nombres, u.apellidos 
      FROM pacientes p 
      JOIN usuarios u ON p.usuario_id = u.id 
      WHERE p.deleted_at IS NULL 
      LIMIT 3
    `);
    
    if (pacientes.length === 0) {
      console.error('❌ No se encontraron pacientes');
      return;
    }
    
    // Crear citas para hoy y mañana
    for (const fecha of fechas) {
      for (let i = 0; i < 2; i++) {
        const paciente = pacientes[i % pacientes.length];
        const horaInicio = 10 + (i * 2);
        const horaFin = horaInicio + 1;
        
        const cita = {
          id: require('crypto').randomUUID(),
          paciente_id: paciente.id,
          psicologo_id: psicologo.id,
          fecha: fecha,
          hora_inicio: `${horaInicio.toString().padStart(2, '0')}:00:00`,
          hora_fin: `${horaFin.toString().padStart(2, '0')}:00:00`,
          duracion_minutos: 60,
          estado: 'confirmada',
          tipo_sesion: 'individual',
          modalidad: 'presencial',
          notas_paciente: `Cita de prueba - ${fecha}`,
          pago_estado: 'pendiente',
          pago_monto: 50000,
          recordatorio_enviado: false,
          created_at: new Date(),
          updated_at: new Date()
        };
        
        try {
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
          
          console.log(`✅ Cita creada: ${fecha} ${cita.hora_inicio} - ${paciente.nombres} ${paciente.apellidos}`);
        } catch (error) {
          console.log(`⚠️ Cita ya existe o error: ${fecha} ${cita.hora_inicio}`);
        }
      }
    }
    
    console.log('\n🎉 Proceso completado!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await sequelize.close();
  }
}

verificarCitas();


