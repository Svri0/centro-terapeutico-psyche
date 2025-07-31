import { Sequelize, QueryTypes } from 'sequelize';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';

dotenv.config();

// Configuración de la base de datos
const sequelize = new Sequelize({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Ferreteriakm6',
  database: process.env.DB_NAME || 'psyche_db',
  dialect: 'postgres',
  logging: false
});

interface PsicologoData {
  id: string;
  nombres: string;
  apellidos: string;
  email: string;
  password_hash: string;
  telefono: string;
  rol_id: number;
  activo: boolean;
  email_verificado: boolean;
  configuracion: string;
  created_at: Date;
  updated_at: Date;
}

const psicologosEjemplo = [
  {
    nombres: 'Dra. María',
    apellidos: 'González',
    email: 'maria.gonzalez@psyche.cl',
    telefono: '+56987654321',
    genero: 'Femenino'
  },
  {
    nombres: 'Dr. Juan',
    apellidos: 'Pérez',
    email: 'juan.perez@psyche.cl',
    telefono: '+56912345678',
    genero: 'Masculino'
  },
  {
    nombres: 'Dra. Ana',
    apellidos: 'Martínez',
    email: 'ana.martinez@psyche.cl',
    telefono: '+56923456789',
    genero: 'Femenino'
  },
  {
    nombres: 'Dr. Carlos',
    apellidos: 'Rodríguez',
    email: 'carlos.rodriguez@psyche.cl',
    telefono: '+56934567890',
    genero: 'Masculino'
  },
  {
    nombres: 'Dra. Laura',
    apellidos: 'Fernández',
    email: 'laura.fernandez@psyche.cl',
    telefono: '+56945678901',
    genero: 'Femenino'
  }
];

async function crearPsicologos(): Promise<void> {
  try {
    console.log('🔧 Creando psicólogos de ejemplo...\n');

    // 1. Verificar conexión
    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos exitosa');

    // 2. Obtener el rol de psicólogo
    console.log('2️⃣ Buscando rol de psicólogo...');
    const psicologoRoles = await sequelize.query(
      'SELECT id FROM roles WHERE nombre = \'psicologo\'',
      { type: QueryTypes.SELECT }
    ) as any[];

    console.log('Roles encontrados:', psicologoRoles);

    if (psicologoRoles.length === 0) {
      console.log('❌ No se encontró el rol de psicólogo');
      console.log('💡 Ejecuta: npx sequelize-cli db:seed:all');
      return;
    }

    const psicologoRole = psicologoRoles[0];
    console.log('✅ Rol de psicólogo encontrado:', psicologoRole);

    // 3. Crear psicólogos
    console.log('3️⃣ Creando psicólogos...');
    
    for (const psicologoData of psicologosEjemplo) {
      try {
        // Verificar si ya existe
        const [existingUser] = await sequelize.query(
          'SELECT id FROM usuarios WHERE email = :email',
          { 
            replacements: { email: psicologoData.email },
            type: QueryTypes.SELECT 
          }
        ) as any[];

        if (existingUser) {
          console.log(`⚠️  El psicólogo ${psicologoData.email} ya existe, saltando...`);
          continue;
        }

        // Crear hash de la contraseña
        const passwordHash = await bcrypt.hash('psicologo123', 12);

        // Crear usuario psicólogo
        const newPsicologo = {
          id: uuidv4(),
          nombres: psicologoData.nombres,
          apellidos: psicologoData.apellidos,
          email: psicologoData.email,
          password_hash: passwordHash,
          telefono: psicologoData.telefono,
          rol_id: psicologoRole.id,
          activo: true,
          email_verificado: true,
          configuracion: JSON.stringify({
            genero: psicologoData.genero,
            especialidad: 'Psicología Clínica',
            experiencia: '5+ años'
          }),
          created_at: new Date(),
          updated_at: new Date()
        };

        await sequelize.query(`
          INSERT INTO usuarios (id, nombres, apellidos, email, password_hash, telefono, rol_id, activo, email_verificado, configuracion, created_at, updated_at)
          VALUES (:id, :nombres, :apellidos, :email, :password_hash, :telefono, :rol_id, :activo, :email_verificado, :configuracion, :created_at, :updated_at)
        `, {
          replacements: newPsicologo as any
        });

        console.log(`✅ Psicólogo creado: ${psicologoData.nombres} ${psicologoData.apellidos}`);
        console.log(`   📧 Email: ${psicologoData.email}`);
        console.log('   🔑 Contraseña: psicologo123');
        console.log('');

      } catch (error) {
        console.error(`❌ Error creando psicólogo ${psicologoData.email}:`, error);
      }
    }

    console.log('🎉 ¡Psicólogos creados exitosamente!');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('📋 Credenciales de psicólogos:');
    console.log('   📧 Email: [email]@psyche.cl');
    console.log('   🔑 Contraseña: psicologo123');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('');
    console.log('💡 Ahora puedes usar estas credenciales para probar el login de psicólogos');

  } catch (error) {
    console.error('❌ Error durante la creación:', error);
  } finally {
    await sequelize.close();
  }
}

// Función para crear un psicólogo específico
async function crearPsicologoEspecifico(
  nombres: string,
  apellidos: string,
  email: string,
  telefono: string = '+56912345678'
): Promise<void> {
  try {
    console.log(`🔧 Creando psicólogo específico: ${nombres} ${apellidos}...\n`);

    // 1. Verificar conexión
    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos exitosa');

    // 2. Obtener el rol de psicólogo
    const psicologoRoles = await sequelize.query(
      'SELECT id FROM roles WHERE nombre = \'psicologo\'',
      { type: QueryTypes.SELECT }
    ) as any[];

    if (psicologoRoles.length === 0) {
      console.log('❌ No se encontró el rol de psicólogo');
      return;
    }

    const psicologoRole = psicologoRoles[0];

    // 3. Verificar si ya existe
    const [existingUser] = await sequelize.query(
      'SELECT id FROM usuarios WHERE email = :email',
      { 
        replacements: { email },
        type: QueryTypes.SELECT 
      }
    ) as any[];

    if (existingUser) {
      console.log(`⚠️  El psicólogo ${email} ya existe`);
      return;
    }

    // 4. Crear hash de la contraseña
    const passwordHash = await bcrypt.hash('psicologo123', 12);

    // 5. Crear usuario psicólogo
    const newPsicologo = {
      id: uuidv4(),
      nombres,
      apellidos,
      email,
      password_hash: passwordHash,
      telefono,
      rol_id: psicologoRole.id,
      activo: true,
      email_verificado: true,
      configuracion: JSON.stringify({
        genero: 'No especificado',
        especialidad: 'Psicología Clínica',
        experiencia: '3+ años'
      }),
      created_at: new Date(),
      updated_at: new Date()
    };

    await sequelize.query(`
      INSERT INTO usuarios (id, nombres, apellidos, email, password_hash, telefono, rol_id, activo, email_verificado, configuracion, created_at, updated_at)
      VALUES (:id, :nombres, :apellidos, :email, :password_hash, :telefono, :rol_id, :activo, :email_verificado, :configuracion, :created_at, :updated_at)
    `, {
      replacements: newPsicologo as any
    });

    console.log('✅ Psicólogo creado exitosamente');
    console.log('');
    console.log('🎉 ¡Psicólogo creado!');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log(`📧 Email: ${email}`);
    console.log('🔑 Contraseña: psicologo123');
    console.log('═══════════════════════════════════════════════════════════════');

  } catch (error) {
    console.error('❌ Error durante la creación:', error);
  } finally {
    await sequelize.close();
  }
}

// Verificar argumentos de línea de comandos
const args = process.argv.slice(2);

if (args.length >= 3) {
  // Crear psicólogo específico
  const nombres = args[0];
  const apellidos = args[1];
  const email = args[2];
  const telefono = args[3] || '+56912345678';
  
  if (nombres && apellidos && email) {
    crearPsicologoEspecifico(nombres, apellidos, email, telefono);
  } else {
    console.log('❌ Error: Faltan argumentos requeridos');
    console.log('💡 Uso: npm run crear-psicologos "Nombres" "Apellidos" "email@ejemplo.com" [telefono]');
  }
} else {
  // Crear psicólogos de ejemplo
  crearPsicologos();
} 