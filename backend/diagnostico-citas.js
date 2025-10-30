const { Sequelize } = require('sequelize');

// Configuración de la base de datos
const sequelize = new Sequelize({
  dialect: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'psyche_db',
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Ferreteriakm6',
  logging: console.log
});

async function diagnosticarCitas() {
  try {
    console.log('🔍 Iniciando diagnóstico de citas...');
    
    // 1. Verificar conexión a la base de datos
    console.log('\n1️⃣ Verificando conexión a la base de datos...');
    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos exitosa');
    
    // 2. Verificar estructura de la tabla citas
    console.log('\n2️⃣ Verificando estructura de la tabla citas...');
    const [columnas] = await sequelize.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'citas' 
      ORDER BY ordinal_position
    `);
    
    console.log('📋 Columnas de la tabla citas:');
    columnas.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'nullable' : 'not null'})`);
    });
    
    // 3. Verificar usuarios y roles
    console.log('\n3️⃣ Verificando usuarios y roles...');
    const [usuarios] = await sequelize.query(`
      SELECT u.id, u.nombres, u.apellidos, u.email, r.nombre as rol
      FROM usuarios u 
      JOIN roles r ON u.rol_id = r.id 
      WHERE u.deleted_at IS NULL
      LIMIT 5
    `);
    
    console.log('👥 Usuarios encontrados:');
    usuarios.forEach(user => {
      console.log(`  - ${user.nombres} ${user.apellidos} (${user.rol}) - ${user.email}`);
    });
    
    // 4. Verificar pacientes
    console.log('\n4️⃣ Verificando pacientes...');
    const [pacientes] = await sequelize.query(`
      SELECT p.id, u.nombres, u.apellidos, p.numero_ficha
      FROM pacientes p 
      JOIN usuarios u ON p.usuario_id = u.id 
      WHERE p.deleted_at IS NULL
      LIMIT 5
    `);
    
    console.log('🏥 Pacientes encontrados:');
    pacientes.forEach(paciente => {
      console.log(`  - ${paciente.nombres} ${paciente.apellidos} (${paciente.numero_ficha})`);
    });
    
    // 5. Verificar citas existentes
    console.log('\n5️⃣ Verificando citas existentes...');
    const [citas] = await sequelize.query(`
      SELECT c.id, c.fecha, c.hora_inicio, c.estado, 
             u.nombres as paciente_nombre, u.apellidos as paciente_apellidos
      FROM citas c
      JOIN usuarios u ON c.paciente_id = u.id
      WHERE c.deleted_at IS NULL
      ORDER BY c.fecha DESC
      LIMIT 5
    `);
    
    console.log('📅 Citas existentes:');
    if (citas.length > 0) {
      citas.forEach(cita => {
        console.log(`  - ${cita.fecha} ${cita.hora_inicio} - ${cita.paciente_nombre} ${cita.paciente_apellidos} (${cita.estado})`);
      });
    } else {
      console.log('  ❌ No hay citas existentes');
    }
    
    // 6. Intentar crear una cita de prueba
    console.log('\n6️⃣ Intentando crear una cita de prueba...');
    
    if (usuarios.length > 0 && pacientes.length > 0) {
      const psicologo = usuarios.find(u => u.rol === 'psicologo');
      const paciente = pacientes[0];
      
      if (psicologo && paciente) {
        const hoy = new Date().toISOString().split('T')[0];
        
        try {
          const [citaCreada] = await sequelize.query(`
            INSERT INTO citas (
              id, paciente_id, psicologo_id, fecha, hora_inicio, hora_fin,
              duracion_minutos, estado, tipo_sesion, modalidad, notas_paciente,
              pago_estado, pago_monto, recordatorio_enviado, created_at, updated_at
            ) VALUES (
              gen_random_uuid(), :paciente_id, :psicologo_id, :fecha, :hora_inicio, :hora_fin,
              :duracion_minutos, :estado, :tipo_sesion, :modalidad, :notas_paciente,
              :pago_estado, :pago_monto, :recordatorio_enviado, NOW(), NOW()
            ) RETURNING id, fecha, hora_inicio, estado
          `, {
            replacements: {
              paciente_id: paciente.id,
              psicologo_id: psicologo.id,
              fecha: hoy,
              hora_inicio: '15:00:00',
              hora_fin: '16:00:00',
              duracion_minutos: 60,
              estado: 'programada',
              tipo_sesion: 'individual',
              modalidad: 'presencial',
              notas_paciente: 'Cita de diagnóstico',
              pago_estado: 'pendiente',
              pago_monto: 50000,
              recordatorio_enviado: false
            }
          });
          
          console.log('✅ Cita de prueba creada exitosamente:', citaCreada[0]);
          
          // Limpiar la cita de prueba
          await sequelize.query(`
            DELETE FROM citas WHERE id = :id
          `, {
            replacements: { id: citaCreada[0].id }
          });
          console.log('🧹 Cita de prueba eliminada');
          
        } catch (error) {
          console.error('❌ Error al crear cita de prueba:', error.message);
          console.error('Detalles del error:', error);
        }
      } else {
        console.log('❌ No se encontró psicólogo o paciente para la prueba');
      }
    } else {
      console.log('❌ No hay usuarios o pacientes suficientes para la prueba');
    }
    
    console.log('\n🎉 Diagnóstico completado');
    
  } catch (error) {
    console.error('❌ Error en el diagnóstico:', error.message);
    console.error('Detalles:', error);
  } finally {
    await sequelize.close();
  }
}

diagnosticarCitas();
