#!/usr/bin/env node

/**
 * Script para insertar roles en la base de datos
 * Centro Terapéutico Psyche
 */

const { Sequelize } = require('sequelize');
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

// Función para insertar roles
const insertRoles = async () => {
  try {
    log.title('👥 Insertando roles...');

    const roles = [
      {
        id: 1,
        nombre: 'admin',
        descripcion: 'Administrador del sistema',
        permisos: JSON.stringify(['all']),
        activo: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 2,
        nombre: 'psicologo',
        descripcion: 'Psicólogo/Terapeuta',
        permisos: JSON.stringify(['pacientes', 'sesiones', 'tareas', 'reportes']),
        activo: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 3,
        nombre: 'paciente',
        descripcion: 'Paciente del centro',
        permisos: JSON.stringify(['perfil_propio', 'sesiones_propias', 'tareas_propias']),
        activo: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 4,
        nombre: 'recepcionista',
        descripcion: 'Personal de recepción',
        permisos: JSON.stringify(['pacientes_ver', 'sesiones_ver']),
        activo: true,
        created_at: new Date(),
        updated_at: new Date()
      }
    ];

    // Insertar roles uno por uno
    for (const role of roles) {
      try {
        await sequelize.query(
          `
          INSERT INTO roles (
            id, nombre, descripcion, permisos, activo, created_at, updated_at
          ) VALUES (
            :id, :nombre, :descripcion, :permisos, :activo, :created_at, :updated_at
          )
        `,
          {
            replacements: role,
            type: Sequelize.QueryTypes.INSERT
          }
        );

        log.success(`Rol creado: ${role.nombre} (${role.descripcion})`);
      } catch (error) {
        if (error.message.includes('duplicate key')) {
          log.warning(`Rol ya existe: ${role.nombre}`);
        } else {
          log.error(`Error creando rol ${role.nombre}: ${error.message}`);
        }
      }
    }

    log.success('✅ Roles insertados correctamente');
  } catch (error) {
    log.error(`Error insertando roles: ${error.message}`);
    throw error;
  }
};

// Función principal
const main = async () => {
  try {
    log.title('🚀 INSERTANDO ROLES');

    // Probar conexión
    log.info('🔍 Probando conexión a la base de datos...');
    await sequelize.authenticate();
    log.success('✅ Conexión a la base de datos establecida');

    // Insertar roles
    await insertRoles();

    log.title('🎉 ROLES INSERTADOS EXITOSAMENTE');
    log.success('Los roles han sido creados');
    log.info('Ahora puedes ejecutar el seeder de usuarios');
  } catch (error) {
    log.error(`Error: ${error.message}`);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
};

// Ejecutar si se llama directamente
if (require.main === module) {
  main();
}
