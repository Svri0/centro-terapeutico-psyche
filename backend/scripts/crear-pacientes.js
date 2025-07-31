require('dotenv').config();
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');
const { Sequelize } = require('sequelize');

// Configuración de la base de datos
const sequelize = new Sequelize({
  dialect: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Ferreteriakm6',
  database: process.env.DB_NAME || 'psyche_db',
  logging: false
});

async function crearPacientes() {
  try {
    console.log('🏥 Creando pacientes de ejemplo...');

    // Obtener un psicólogo existente
    const [psicologos] = await sequelize.query(
      `SELECT id, nombres, apellidos FROM usuarios WHERE rol_id = (SELECT id FROM roles WHERE nombre = 'psicologo') LIMIT 1`
    );

    if (psicologos.length === 0) {
      console.log('❌ No hay psicólogos disponibles. Primero crea un psicólogo.');
      return;
    }

    const psicologo = psicologos[0];
    console.log(`👨‍⚕️ Psicólogo asignado: ${psicologo.nombres} ${psicologo.apellidos}`);

    // Datos de pacientes de ejemplo
    const pacientes = [
      {
        nombres: 'María',
        apellidos: 'González',
        email: 'maria.gonzalez.paciente@email.com',
        telefono: '+56912345678',
        fecha_nacimiento: '1990-05-15',
        genero: 'femenino',
        numero_ficha: 'PAC001',
        rut: '12345678-1',
        direccion: 'Av. Providencia 123, Santiago',
        contacto_emergencia_nombre: 'Juan González',
        contacto_emergencia_telefono: '+56987654321',
        contacto_emergencia_relacion: 'Padre',
        diagnosticos: ['Ansiedad', 'Depresión leve'],
        etiquetas: ['Adulto', 'Primera consulta'],
        estrategias_autorregulacion: ['Respiración diafragmática', 'Meditación'],
        puntos_acumulados: 150,
        estado: 'activo',
        observaciones: 'Paciente muy comprometida con su tratamiento'
      },
      {
        nombres: 'Carlos',
        apellidos: 'Rodríguez',
        email: 'carlos.rodriguez.paciente@email.com',
        telefono: '+56923456789',
        fecha_nacimiento: '1985-08-22',
        genero: 'masculino',
        numero_ficha: 'PAC002',
        rut: '23456789-2',
        direccion: 'Calle Las Condes 456, Las Condes',
        contacto_emergencia_nombre: 'Ana Rodríguez',
        contacto_emergencia_telefono: '+56976543210',
        contacto_emergencia_relacion: 'Esposa',
        diagnosticos: ['Trastorno de estrés postraumático'],
        etiquetas: ['Adulto', 'Veterano'],
        estrategias_autorregulacion: ['Grounding', 'Progressive muscle relaxation'],
        puntos_acumulados: 75,
        estado: 'activo',
        observaciones: 'Necesita apoyo adicional para manejo de flashbacks'
      },
      {
        nombres: 'Sofía',
        apellidos: 'Martínez',
        email: 'sofia.martinez.paciente@email.com',
        telefono: '+56934567890',
        fecha_nacimiento: '2000-12-03',
        genero: 'femenino',
        numero_ficha: 'PAC003',
        rut: '34567890-3',
        direccion: 'Pasaje Ñuñoa 789, Ñuñoa',
        contacto_emergencia_nombre: 'Pedro Martínez',
        contacto_emergencia_telefono: '+56965432109',
        contacto_emergencia_relacion: 'Padre',
        diagnosticos: ['Trastorno de ansiedad social'],
        etiquetas: ['Joven adulto', 'Estudiante'],
        estrategias_autorregulacion: ['Exposición gradual', 'Técnicas de respiración'],
        puntos_acumulados: 200,
        estado: 'activo',
        observaciones: 'Excelente progreso en las últimas sesiones'
      }
    ];

    for (const pacienteData of pacientes) {
      // Crear usuario para el paciente
      const usuarioId = uuidv4();
      const passwordHash = await bcrypt.hash('paciente123', 10);

      await sequelize.query(
        `INSERT INTO usuarios (
          id, nombres, apellidos, email, password_hash, telefono, fecha_nacimiento, 
          genero, rol_id, activo, email_verificado, created_at, updated_at
        ) VALUES (
          :id, :nombres, :apellidos, :email, :password_hash, :telefono, :fecha_nacimiento,
          :genero, (SELECT id FROM roles WHERE nombre = 'paciente'), true, false,
          NOW(), NOW()
        )`,
        {
          replacements: {
            id: usuarioId,
            nombres: pacienteData.nombres,
            apellidos: pacienteData.apellidos,
            email: pacienteData.email,
            password_hash: passwordHash,
            telefono: pacienteData.telefono,
            fecha_nacimiento: pacienteData.fecha_nacimiento,
            genero: pacienteData.genero
          }
        }
      );

      // Crear paciente
      await sequelize.query(
        `INSERT INTO pacientes (
          id, usuario_id, psicologo_id, nombres, apellidos, email, telefono,
          fecha_nacimiento, genero, numero_ficha, rut, direccion,
          contacto_emergencia_nombre, contacto_emergencia_telefono, contacto_emergencia_relacion,
          diagnosticos, etiquetas, estrategias_autorregulacion, puntos_acumulados,
          estado, fecha_ingreso, observaciones, created_at, updated_at
        ) VALUES (
          :id, :usuario_id, :psicologo_id, :nombres, :apellidos, :email, :telefono,
          :fecha_nacimiento, :genero, :numero_ficha, :rut, :direccion,
          :contacto_emergencia_nombre, :contacto_emergencia_telefono, :contacto_emergencia_relacion,
          :diagnosticos, :etiquetas, :estrategias_autorregulacion, :puntos_acumulados,
          :estado, NOW(), :observaciones, NOW(), NOW()
        )`,
        {
          replacements: {
            id: uuidv4(),
            usuario_id: usuarioId,
            psicologo_id: psicologo.id,
            nombres: pacienteData.nombres,
            apellidos: pacienteData.apellidos,
            email: pacienteData.email,
            telefono: pacienteData.telefono,
            fecha_nacimiento: pacienteData.fecha_nacimiento,
            genero: pacienteData.genero,
            numero_ficha: pacienteData.numero_ficha,
            rut: pacienteData.rut,
            direccion: pacienteData.direccion,
            contacto_emergencia_nombre: pacienteData.contacto_emergencia_nombre,
            contacto_emergencia_telefono: pacienteData.contacto_emergencia_telefono,
            contacto_emergencia_relacion: pacienteData.contacto_emergencia_relacion,
            diagnosticos: JSON.stringify(pacienteData.diagnosticos),
            etiquetas: JSON.stringify(pacienteData.etiquetas),
            estrategias_autorregulacion: JSON.stringify(pacienteData.estrategias_autorregulacion),
            puntos_acumulados: pacienteData.puntos_acumulados,
            estado: pacienteData.estado,
            observaciones: pacienteData.observaciones
          }
        }
      );

      console.log(`✅ Paciente creado: ${pacienteData.nombres} ${pacienteData.apellidos} (${pacienteData.numero_ficha})`);
      console.log(`   📧 Email: ${pacienteData.email}`);
      console.log(`   🔑 Contraseña: paciente123`);
      console.log(`   📱 Teléfono: ${pacienteData.telefono}`);
      console.log(`   🏥 Psicólogo: ${psicologo.nombres} ${psicologo.apellidos}`);
      console.log('');
    }

    console.log('🎉 ¡Pacientes creados exitosamente!');
    console.log('📋 Resumen:');
    console.log('   • 3 pacientes creados');
    console.log('   • Todos asignados al mismo psicólogo');
    console.log('   • Contraseña por defecto: paciente123');
    console.log('   • Información personal completa incluida');

  } catch (error) {
    console.error('❌ Error al crear pacientes:', error);
  } finally {
    await sequelize.close();
  }
}

crearPacientes(); 