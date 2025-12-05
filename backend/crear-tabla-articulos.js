/**
 * Script para crear la tabla articulos si no existe
 * Ejecutar con: node crear-tabla-articulos.js
 */

require('dotenv').config();
const { Sequelize, DataTypes } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_NAME || 'psyche_db',
  process.env.DB_USER || 'postgres',
  process.env.DB_PASSWORD || 'Babu2001',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: false,
  }
);

async function crearTablaArticulos() {
  try {
    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos establecida');

    // Verificar si la tabla existe
    const [results] = await sequelize.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'articulos'
      );
    `);

    if (results[0].exists) {
      console.log('✅ La tabla articulos ya existe');
      process.exit(0);
    }

    console.log('📦 Creando tabla articulos...');

    // Crear la tabla
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS articulos (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        titulo VARCHAR(255) NOT NULL,
        slug VARCHAR(255) NOT NULL UNIQUE,
        resumen TEXT NOT NULL,
        contenido TEXT NOT NULL,
        imagen_url VARCHAR(500) NOT NULL,
        categoria VARCHAR(100) NOT NULL,
        autor_id UUID REFERENCES usuarios(id) ON UPDATE CASCADE ON DELETE SET NULL,
        tiempo_lectura INTEGER NOT NULL DEFAULT 5,
        publicado BOOLEAN NOT NULL DEFAULT true,
        fecha_publicacion TIMESTAMP,
        vistas INTEGER NOT NULL DEFAULT 0,
        etiquetas TEXT[] NOT NULL DEFAULT '{}',
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        deleted_at TIMESTAMP
      );
    `);

    // Crear índices
    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_articulos_slug ON articulos(slug);
      CREATE INDEX IF NOT EXISTS idx_articulos_categoria ON articulos(categoria);
      CREATE INDEX IF NOT EXISTS idx_articulos_publicado ON articulos(publicado);
      CREATE INDEX IF NOT EXISTS idx_articulos_fecha_publicacion ON articulos(fecha_publicacion);
      CREATE INDEX IF NOT EXISTS idx_articulos_autor_id ON articulos(autor_id);
    `);

    console.log('✅ Tabla articulos creada exitosamente');
    console.log('💡 Ahora puedes ejecutar: node poblar-articulos.js');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error al crear tabla:', error.message);
    process.exit(1);
  }
}

crearTablaArticulos();

