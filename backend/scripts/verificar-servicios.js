const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');

// Cargar variables de entorno
dotenv.config();

// Crear conexión a la base de datos
const sequelize = new Sequelize(
  process.env.DB_NAME || 'psyche_db',
  process.env.DB_USER || 'postgres',
  process.env.DB_PASSWORD || 'password',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: false
  }
);

async function verificarServicios() {
  try {
    console.log('🔍 Verificando servicios en la base de datos...');
    
    // Verificar si la tabla servicios_psicologo existe
    const [tables] = await sequelize.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'servicios_psicologo'
    `);
    
    if (tables.length === 0) {
      console.log('❌ La tabla servicios_psicologo no existe');
      return;
    }
    
    // Verificar si hay servicios
    const [servicios] = await sequelize.query(`
      SELECT id, nombre, descripcion, duracion 
      FROM servicios_psicologo
    `);
    
    console.log(`📊 Servicios encontrados: ${servicios.length}`);
    
    if (servicios.length === 0) {
      console.log('⚠️  No hay servicios. Creando servicios básicos...');
      
      // Crear servicios básicos
      const serviciosBasicos = [
        {
          id: 1,
          nombre: 'Consulta General',
          descripcion: 'Consulta psicológica general de 60 minutos',
          duracion: 60,
          precio: 50000,
          activo: true
        },
        {
          id: 2,
          nombre: 'Evaluación Psicológica',
          descripcion: 'Evaluación psicológica completa de 90 minutos',
          duracion: 90,
          precio: 75000,
          activo: true
        },
        {
          id: 3,
          nombre: 'Sesión de Terapia',
          descripcion: 'Sesión de terapia de 60 minutos',
          duracion: 60,
          precio: 60000,
          activo: true
        }
      ];
      
      for (const servicio of serviciosBasicos) {
        await sequelize.query(`
          INSERT INTO servicios_psicologo (id, nombre, descripcion, duracion, precio, activo, created_at, updated_at)
          VALUES (${servicio.id}, '${servicio.nombre}', '${servicio.descripcion}', ${servicio.duracion}, ${servicio.precio}, ${servicio.activo}, NOW(), NOW())
          ON CONFLICT (id) DO NOTHING
        `);
      }
      
      console.log('✅ Servicios básicos creados exitosamente');
    } else {
      console.log('✅ Servicios encontrados:');
      servicios.forEach(servicio => {
        console.log(`  - ID: ${servicio.id}, Nombre: ${servicio.nombre}, Duración: ${servicio.duracion} min`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error al verificar servicios:', error);
  } finally {
    await sequelize.close();
  }
}

verificarServicios(); 