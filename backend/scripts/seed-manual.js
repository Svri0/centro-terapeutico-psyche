#!/usr/bin/env node

/**
 * Script para poblar la base de datos manualmente
 * Centro Terapéutico Psyche
 */

const { Sequelize } = require('sequelize');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Configuración de la base de datos
const sequelize = new Sequelize({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'psyche_db',
  dialect: 'postgres',
  logging: false
});

// Colores para la consola
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

const log = {
  success: msg => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  error: msg => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  warning: msg => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
  info: msg => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
  title: msg => console.log(`\n${colors.bold}${colors.blue}${msg}${colors.reset}`)
};

// Función para hashear contraseñas
const hashPassword = async password => {
  return await bcrypt.hash(password, 12);
};

// Función para insertar usuarios
const insertUsers = async () => {
  try {
    log.title('👥 Insertando usuarios de prueba...');

    const users = [
      {
        id: '550e8400-e29b-41d4-a716-446655440001',
        email: 'admin@psyche.cl',
        password_hash: await hashPassword('admin123'),
        nombres: 'Administrador',
        apellidos: 'Sistema',
        telefono: '+56900000000',
        rol_id: 1, // admin
        activo: true,
        email_verificado: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440002',
        email: 'juan.perez@psyche.cl',
        password_hash: await hashPassword('password123'),
        nombres: 'Juan',
        apellidos: 'Pérez',
        telefono: '+56912345678',
        rol_id: 2, // psicologo
        activo: true,
        email_verificado: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440003',
        email: 'maria.gonzalez@psyche.cl',
        password_hash: await hashPassword('password123'),
        nombres: 'María',
        apellidos: 'González',
        telefono: '+56987654321',
        rol_id: 2, // psicologo
        activo: true,
        email_verificado: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440004',
        email: 'carlos.rodriguez@psyche.cl',
        password_hash: await hashPassword('password123'),
        nombres: 'Carlos',
        apellidos: 'Rodríguez',
        telefono: '+56911223344',
        rol_id: 3, // paciente
        activo: true,
        email_verificado: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440005',
        email: 'ana.silva@psyche.cl',
        password_hash: await hashPassword('password123'),
        nombres: 'Ana',
        apellidos: 'Silva',
        telefono: '+56955667788',
        rol_id: 3, // paciente
        activo: true,
        email_verificado: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440006',
        email: 'pedro.lopez@psyche.cl',
        password_hash: await hashPassword('password123'),
        nombres: 'Pedro',
        apellidos: 'López',
        telefono: '+56999887766',
        rol_id: 4, // recepcionista
        activo: true,
        email_verificado: true,
        created_at: new Date(),
        updated_at: new Date()
      }
    ];

    // Insertar usuarios uno por uno
    for (const user of users) {
      try {
        await sequelize.query(
          `
          INSERT INTO usuarios (
            id, email, password_hash, nombres, apellidos, telefono, 
            rol_id, activo, email_verificado, created_at, updated_at
          ) VALUES (
            :id, :email, :password_hash, :nombres, :apellidos, :telefono,
            :rol_id, :activo, :email_verificado, :created_at, :updated_at
          )
        `,
          {
            replacements: user,
            type: Sequelize.QueryTypes.INSERT
          }
        );

        log.success(`Usuario creado: ${user.email} (${user.nombres} ${user.apellidos})`);
      } catch (error) {
        if (error.message.includes('duplicate key')) {
          log.warning(`Usuario ya existe: ${user.email}`);
        } else {
          log.error(`Error creando usuario ${user.email}: ${error.message}`);
        }
      }
    }

    log.success('✅ Usuarios insertados correctamente');
  } catch (error) {
    log.error(`Error insertando usuarios: ${error.message}`);
    throw error;
  }
};

// Función principal
const main = async () => {
  try {
    log.title('🚀 INICIANDO SEEDER MANUAL');

    // Probar conexión
    log.info('🔍 Probando conexión a la base de datos...');
    await sequelize.authenticate();
    log.success('✅ Conexión a la base de datos establecida');

    // Insertar usuarios
    await insertUsers();

    log.title('🎉 SEEDER COMPLETADO EXITOSAMENTE');
    log.success('Los usuarios de prueba han sido creados');
    log.info('Ahora puedes probar el sistema de autenticación');
  } catch (error) {
    log.error(`Error en el seeder: ${error.message}`);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
};

// Ejecutar si se llama directamente
if (require.main === module) {
  main();
}
