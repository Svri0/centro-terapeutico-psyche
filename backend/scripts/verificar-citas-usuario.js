require('dotenv').config();
const sequelize = require('../dist/configuracion/database');

async function verificarCitasUsuario() {
  console.log('🔍 Verificando citas en la base de datos...\n');
  
  try {
    // 1. Verificar si hay citas en general
    console.log('1️⃣ Verificando todas las citas...');
    const [todasCitas] = await sequelize.query(
      'SELECT COUNT(*) as total FROM citas'
    );
    console.log('📊 Total de citas en la base de datos:', todasCitas[0].total);
    
    if (todasCitas[0].total > 0) {
      // 2. Mostrar algunas citas de ejemplo
      console.log('\n2️⃣ Mostrando algunas citas de ejemplo...');
      const [citasEjemplo] = await sequelize.query(
        `SELECT 
          c.id,
          c.paciente_id,
          c.psicologo_id,
          c.fecha,
          c.hora_inicio,
          c.estado,
          p.nombres as paciente_nombre,
          u.nombres as psicologo_nombre
         FROM citas c
         LEFT JOIN pacientes p ON c.paciente_id = p.id
         LEFT JOIN usuarios u ON c.psicologo_id = u.id
         LIMIT 5`
      );
      
      console.log('📋 Citas de ejemplo:');
      citasEjemplo.forEach((cita, index) => {
        console.log(`  ${index + 1}. ID: ${cita.id} | Paciente: ${cita.paciente_nombre} | Psicólogo: ${cita.psicologo_nombre} | Fecha: ${cita.fecha} | Estado: ${cita.estado}`);
      });
    }
    
    // 3. Verificar usuarios pacientes
    console.log('\n3️⃣ Verificando usuarios pacientes...');
    const [pacientes] = await sequelize.query(
      `SELECT 
        u.id,
        u.nombres,
        u.apellidos,
        u.email,
        u.rol_id
       FROM usuarios u
       WHERE u.rol_id = 3
       LIMIT 5`
    );
    
    console.log('👥 Usuarios pacientes encontrados:', pacientes.length);
    pacientes.forEach((paciente, index) => {
      console.log(`  ${index + 1}. ${paciente.nombres} ${paciente.apellidos} (${paciente.email}) - ID: ${paciente.id}`);
    });
    
    // 4. Verificar si hay citas para un paciente específico
    if (pacientes.length > 0) {
      const primerPaciente = pacientes[0];
      console.log(`\n4️⃣ Verificando citas para el paciente: ${primerPaciente.nombres} ${primerPaciente.apellidos}`);
      
      const [citasPaciente] = await sequelize.query(
        `SELECT COUNT(*) as total FROM citas WHERE paciente_id = :pacienteId`,
        { replacements: { pacienteId: primerPaciente.id } }
      );
      
      console.log(`📊 Citas para ${primerPaciente.nombres}: ${citasPaciente[0].total}`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await sequelize.close();
  }
}

verificarCitasUsuario();
