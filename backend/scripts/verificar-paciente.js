const { Sequelize } = require('sequelize');

// Configuración de la base de datos
const sequelize = new Sequelize({
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: 'Ferreteriakm6',
  database: 'psyche_db',
  dialect: 'postgres',
  logging: false
});

async function verificarPaciente() {
  try {
    console.log('🔍 Conectando a la base de datos...');
    await sequelize.authenticate();
    console.log('✅ Conexión exitosa');

    // Verificar si existe el paciente
    const [paciente] = await sequelize.query(`
      SELECT u.id, u.email, u.nombres, u.apellidos, u.password_hash, p.numero_ficha
      FROM usuarios u
      LEFT JOIN pacientes p ON u.id = p.usuario_id
      WHERE u.email = 'ptest@yopmail.com' AND u.deleted_at IS NULL
    `);

    if (paciente.length === 0) {
      console.log('❌ No se encontró el paciente ptest@yopmail.com');
      console.log('🔧 Creando paciente...');
      
      // Crear usuario paciente
      const bcrypt = require('bcrypt');
      const passwordHash = await bcrypt.hash('k4av9t09', 12);
      
      const [usuarioCreado] = await sequelize.query(`
        INSERT INTO usuarios (
          id, email, password_hash, nombres, apellidos, telefono,
          fecha_nacimiento, genero, rol_id, activo, email_verificado,
          configuracion, created_at, updated_at
        ) VALUES (
          gen_random_uuid(), 'ptest@yopmail.com', $1, 'Paciente', 'Test', '+56949576859',
          '1990-01-01', 'masculino', 3, true, false,
          '{}', NOW(), NOW()
        ) RETURNING id
      `, { replacements: [passwordHash] });

      const usuarioId = usuarioCreado[0].id;
      console.log('✅ Usuario creado con ID:', usuarioId);

      // Obtener psicólogo
      const [psicologo] = await sequelize.query(`
        SELECT id FROM usuarios 
        WHERE email = 'laura.fernandez@psyche.cl' 
        AND deleted_at IS NULL
      `);

      if (psicologo.length === 0) {
        console.log('❌ No se encontró el psicólogo Laura Fernández');
        return;
      }

      // Crear paciente
      const [pacienteCreado] = await sequelize.query(`
        INSERT INTO pacientes (
          id, usuario_id, psicologo_id, numero_ficha, rut, direccion,
          contacto_emergencia_nombre, contacto_emergencia_telefono,
          contacto_emergencia_relacion, diagnosticos, etiquetas,
          estrategias_autorregulacion, puntos_acumulados, estado,
          fecha_ingreso, observaciones, created_at, updated_at
        ) VALUES (
          gen_random_uuid(), $1, $2, 'PSI-6-0003', '218458339-0', NULL,
          NULL, NULL,
          NULL, '[]', '[]', '[]', 0, 'activo',
          NOW(), NULL, NOW(), NOW()
        ) RETURNING id, numero_ficha
      `, { replacements: [usuarioId, psicologo[0].id] });

      console.log('✅ Paciente creado:', pacienteCreado[0]);
    } else {
      console.log('✅ Paciente encontrado:');
      console.log('  - ID:', paciente[0].id);
      console.log('  - Email:', paciente[0].email);
      console.log('  - Nombres:', paciente[0].nombres);
      console.log('  - Apellidos:', paciente[0].apellidos);
      console.log('  - Número de ficha:', paciente[0].numero_ficha);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await sequelize.close();
  }
}

verificarPaciente(); 