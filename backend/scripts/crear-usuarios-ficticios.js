const { Sequelize, QueryTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

// Configuración de la base de datos
const sequelize = new Sequelize({
  dialect: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'psyche_db',
  logging: false
});

// Datos de psicólogos ficticios
const psicologosFicticios = [
  {
    nombres: 'María José',
    apellidos: 'González Rodríguez',
    email: 'maria.gonzalez@psyche.cl',
    telefono: '+56987654321',
    fecha_nacimiento: '1985-03-15',
    genero: 'femenino',
    especialidad: 'Psicología Clínica - Terapia Cognitivo Conductual',
    descripcion: 'Especialista en terapia cognitivo-conductual con más de 10 años de experiencia en el tratamiento de trastornos de ansiedad y depresión. Magíster en Psicología Clínica por la Universidad de Chile.',
    codigo_sbs: 'PSC-12458',
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=maria&backgroundColor=ffdfbf'
  },
  {
    nombres: 'Carlos Eduardo',
    apellidos: 'Muñoz Sepúlveda',
    email: 'carlos.munoz@psyche.cl',
    telefono: '+56912345678',
    fecha_nacimiento: '1982-07-22',
    genero: 'masculino',
    especialidad: 'Psicología Clínica - Terapia Breve',
    descripcion: 'Psicólogo clínico con enfoque en terapia breve y solución de problemas. Especializado en el tratamiento de crisis y trauma. Diplomado en Terapia Sistémica.',
    codigo_sbs: 'PSC-11234',
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=carlos&backgroundColor=bfdfff'
  },
  {
    nombres: 'Andrea Francisca',
    apellidos: 'Soto Valenzuela',
    email: 'andrea.soto@psyche.cl',
    telefono: '+56965432198',
    fecha_nacimiento: '1988-11-08',
    genero: 'femenino',
    especialidad: 'Psicología Clínica - ACT',
    descripcion: 'Psicóloga clínica especializada en terapia de aceptación y compromiso (ACT). Experiencia en el tratamiento de trastornos del ánimo y problemas de autoestima.',
    codigo_sbs: 'PSC-13567',
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=andrea&backgroundColor=ffb6c1'
  },
  {
    nombres: 'Patricia Alejandra',
    apellidos: 'Ramírez Torres',
    email: 'patricia.ramirez@psyche.cl',
    telefono: '+56998765432',
    fecha_nacimiento: '1987-05-20',
    genero: 'femenino',
    especialidad: 'Psicología Clínica - Terapia Familiar',
    descripcion: 'Especialista en terapia familiar y de pareja. Con más de 8 años de experiencia trabajando con familias y relaciones interpersonales. Magíster en Terapia Familiar.',
    codigo_sbs: 'PSC-14589',
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=patricia&backgroundColor=d4a5ff'
  },
  {
    nombres: 'Roberto Andrés',
    apellidos: 'Fernández López',
    email: 'roberto.fernandez@psyche.cl',
    telefono: '+56976543210',
    fecha_nacimiento: '1984-09-12',
    genero: 'masculino',
    especialidad: 'Psicología Clínica - Terapia Humanista',
    descripcion: 'Psicólogo clínico con enfoque humanista y existencial. Especializado en el trabajo con adolescentes y adultos jóvenes. Experiencia en prevención y promoción de salud mental.',
    codigo_sbs: 'PSC-15678',
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=roberto&backgroundColor=c4e4ff'
  },
  {
    nombres: 'Camila Estefanía',
    apellidos: 'Morales Silva',
    email: 'camila.morales@psyche.cl',
    telefono: '+56954321098',
    fecha_nacimiento: '1990-02-28',
    genero: 'femenino',
    especialidad: 'Psicología Clínica - Terapia de Apego',
    descripcion: 'Psicóloga clínica especializada en terapia de apego y trauma. Experiencia en el tratamiento de trastornos relacionados con el trauma y el apego. Certificada en EMDR.',
    codigo_sbs: 'PSC-16789',
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=camila&backgroundColor=ffc4e4'
  }
];

// Datos de recepcionistas ficticios
const recepcionistasFicticios = [
  {
    nombres: 'Francisca Alejandra',
    apellidos: 'Vargas Martínez',
    email: 'francisca.vargas@psyche.cl',
    telefono: '+56987651234',
    fecha_nacimiento: '1995-06-15',
    genero: 'femenino',
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=francisca&backgroundColor=ffdfbf'
  },
  {
    nombres: 'Diego Ignacio',
    apellidos: 'Torres Herrera',
    email: 'diego.torres@psyche.cl',
    telefono: '+56912348765',
    fecha_nacimiento: '1993-08-22',
    genero: 'masculino',
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=diego&backgroundColor=bfdfff'
  },
  {
    nombres: 'Valentina Constanza',
    apellidos: 'Jiménez Rojas',
    email: 'valentina.jimenez@psyche.cl',
    telefono: '+56965439876',
    fecha_nacimiento: '1996-11-10',
    genero: 'femenino',
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=valentina&backgroundColor=ffb6c1'
  },
  {
    nombres: 'Sebastián Andrés',
    apellidos: 'Castro Muñoz',
    email: 'sebastian.castro@psyche.cl',
    telefono: '+56998761234',
    fecha_nacimiento: '1994-04-18',
    genero: 'masculino',
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sebastian&backgroundColor=c4e4ff'
  }
];

async function crearUsuariosFicticios() {
  try {
    console.log('🚀 Iniciando creación de usuarios ficticios...\n');
    
    // 1. Conectar a la base de datos
    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos exitosa\n');

    // 2. Obtener IDs de roles
    console.log('2️⃣ Obteniendo IDs de roles...');
    const [rolPsicologo] = await sequelize.query(`
      SELECT id FROM roles WHERE nombre = 'psicologo' LIMIT 1
    `, { type: QueryTypes.SELECT });

    const [rolRecepcionista] = await sequelize.query(`
      SELECT id FROM roles WHERE nombre = 'recepcionista' LIMIT 1
    `, { type: QueryTypes.SELECT });

    if (!rolPsicologo || !rolRecepcionista) {
      console.log('❌ No se encontraron los roles necesarios');
      console.log('💡 Asegúrate de que los roles "psicologo" y "recepcionista" existan en la base de datos');
      await sequelize.close();
      return;
    }

    console.log(`✅ Rol psicólogo ID: ${rolPsicologo.id}`);
    console.log(`✅ Rol recepcionista ID: ${rolRecepcionista.id}\n`);

    // 3. Crear psicólogos
    console.log('3️⃣ Creando psicólogos ficticios...');
    let psicologosCreados = 0;
    let psicologosExistentes = 0;
    const passwordHash = await bcrypt.hash('Psyche2024!', 12);

    for (const psicologo of psicologosFicticios) {
      try {
        // Verificar si ya existe
        const [existente] = await sequelize.query(`
          SELECT id FROM usuarios WHERE email = :email AND deleted_at IS NULL
        `, {
          replacements: { email: psicologo.email },
          type: QueryTypes.SELECT
        });

        if (existente) {
          console.log(`   ⚠️  Ya existe: ${psicologo.nombres} ${psicologo.apellidos} (${psicologo.email})`);
          psicologosExistentes++;
          continue;
        }

        await sequelize.query(`
          INSERT INTO usuarios (
            id, nombres, apellidos, email, password_hash, telefono,
            fecha_nacimiento, genero, avatar_url, especialidad, descripcion,
            codigo_sbs, rol_id, activo, email_verificado,
            politica_seguridad_aceptada, politica_privacidad_aceptada,
            configuracion, created_at, updated_at
          ) VALUES (
            gen_random_uuid(), :nombres, :apellidos, :email, :password_hash, :telefono,
            :fecha_nacimiento, :genero, :avatar_url, :especialidad, :descripcion,
            :codigo_sbs, :rol_id, true, true,
            true, true,
            '{}'::jsonb, NOW(), NOW()
          )
        `, {
          replacements: {
            nombres: psicologo.nombres,
            apellidos: psicologo.apellidos,
            email: psicologo.email,
            password_hash: passwordHash,
            telefono: psicologo.telefono,
            fecha_nacimiento: psicologo.fecha_nacimiento,
            genero: psicologo.genero,
            avatar_url: psicologo.avatar_url,
            especialidad: psicologo.especialidad,
            descripcion: psicologo.descripcion,
            codigo_sbs: psicologo.codigo_sbs,
            rol_id: rolPsicologo.id
          }
        });

        console.log(`   ✅ Creado: ${psicologo.nombres} ${psicologo.apellidos} (${psicologo.email})`);
        psicologosCreados++;
      } catch (error) {
        if (error.original?.code === '23505') { // Violación de unique constraint
          console.log(`   ⚠️  Ya existe: ${psicologo.nombres} ${psicologo.apellidos} (${psicologo.email})`);
          psicologosExistentes++;
        } else {
          console.error(`   ❌ Error al crear ${psicologo.nombres}:`, error.message);
        }
      }
    }

    console.log(`\n✅ Psicólogos: ${psicologosCreados} creados, ${psicologosExistentes} ya existían\n`);

    // 4. Crear recepcionistas
    console.log('4️⃣ Creando recepcionistas ficticios...');
    let recepcionistasCreados = 0;
    let recepcionistasExistentes = 0;

    for (const recepcionista of recepcionistasFicticios) {
      try {
        // Verificar si ya existe
        const [existente] = await sequelize.query(`
          SELECT id FROM usuarios WHERE email = :email AND deleted_at IS NULL
        `, {
          replacements: { email: recepcionista.email },
          type: QueryTypes.SELECT
        });

        if (existente) {
          console.log(`   ⚠️  Ya existe: ${recepcionista.nombres} ${recepcionista.apellidos} (${recepcionista.email})`);
          recepcionistasExistentes++;
          continue;
        }

        await sequelize.query(`
          INSERT INTO usuarios (
            id, nombres, apellidos, email, password_hash, telefono,
            fecha_nacimiento, genero, avatar_url, rol_id, activo, email_verificado,
            politica_seguridad_aceptada, politica_privacidad_aceptada,
            configuracion, created_at, updated_at
          ) VALUES (
            gen_random_uuid(), :nombres, :apellidos, :email, :password_hash, :telefono,
            :fecha_nacimiento, :genero, :avatar_url, :rol_id, true, true,
            true, true,
            '{}'::jsonb, NOW(), NOW()
          )
        `, {
          replacements: {
            nombres: recepcionista.nombres,
            apellidos: recepcionista.apellidos,
            email: recepcionista.email,
            password_hash: passwordHash,
            telefono: recepcionista.telefono,
            fecha_nacimiento: recepcionista.fecha_nacimiento,
            genero: recepcionista.genero,
            avatar_url: recepcionista.avatar_url,
            rol_id: rolRecepcionista.id
          }
        });

        console.log(`   ✅ Creado: ${recepcionista.nombres} ${recepcionista.apellidos} (${recepcionista.email})`);
        recepcionistasCreados++;
      } catch (error) {
        if (error.original?.code === '23505') { // Violación de unique constraint
          console.log(`   ⚠️  Ya existe: ${recepcionista.nombres} ${recepcionista.apellidos} (${recepcionista.email})`);
          recepcionistasExistentes++;
        } else {
          console.error(`   ❌ Error al crear ${recepcionista.nombres}:`, error.message);
        }
      }
    }

    console.log(`\n✅ Recepcionistas: ${recepcionistasCreados} creados, ${recepcionistasExistentes} ya existían\n`);

    // 5. Resumen final
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('✅ USUARIOS FICTICIOS CREADOS EXITOSAMENTE');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log(`👨‍⚕️ Psicólogos creados: ${psicologosCreados}`);
    console.log(`👥 Recepcionistas creados: ${recepcionistasCreados}`);
    console.log(`📧 Contraseña para todos: Psyche2024!`);
    console.log('═══════════════════════════════════════════════════════════════\n');

    // 6. Mostrar lista de usuarios creados
    if (psicologosCreados > 0 || recepcionistasCreados > 0) {
      console.log('📋 LISTA DE USUARIOS CREADOS:\n');
      
      if (psicologosCreados > 0) {
        console.log('👨‍⚕️ PSICÓLOGOS:');
        psicologosFicticios.forEach((p, i) => {
          console.log(`   ${i + 1}. ${p.nombres} ${p.apellidos}`);
          console.log(`      📧 ${p.email}`);
          console.log(`      🆔 ${p.codigo_sbs}`);
          console.log(`      📚 ${p.especialidad}`);
          console.log('');
        });
      }

      if (recepcionistasCreados > 0) {
        console.log('👥 RECEPCIONISTAS:');
        recepcionistasFicticios.forEach((r, i) => {
          console.log(`   ${i + 1}. ${r.nombres} ${r.apellidos}`);
          console.log(`      📧 ${r.email}`);
          console.log('');
        });
      }
    }

  } catch (error) {
    console.error('❌ Error al crear usuarios ficticios:', error);
    if (error.original) {
      console.error('   Detalle:', error.original.message);
    }
  } finally {
    await sequelize.close();
  }
}

// Ejecutar el script
crearUsuariosFicticios();
