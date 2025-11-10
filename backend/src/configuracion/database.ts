import { Sequelize, Options } from 'sequelize';
import dotenv from 'dotenv';
import path from 'path';

// Cargar variables de entorno desde la raíz del proyecto
dotenv.config({ path: path.join(__dirname, '..', '..', '..', '.env') });

// Importar modelos para configurar asociaciones
// Los modelos se importan desde servidor.ts para evitar importación circular

// Configuración de la base de datos
const dbConfig: Options = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Babu2001',
  database: process.env.DB_NAME || 'psyche_db',
  dialect: 'postgres',
  dialectOptions: {
    ssl: process.env.NODE_ENV === 'production' ? {
      require: true,
      rejectUnauthorized: false
    } : false,
  },
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  timezone: '-03:00', // Chile timezone
  define: {
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at',
    paranoid: true, // Soft deletes
  }
};

// Crear instancia de Sequelize
const sequelize = new Sequelize(dbConfig);

// Función para probar la conexión
export const testConnection = async (): Promise<void> => {
  try {
    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos establecida correctamente');
  } catch (error: any) {
    console.error('❌ Error al conectar con la base de datos');
    
    // Mensajes más específicos según el tipo de error
    if (error.original?.code === '28P01') {
      console.error('🔐 Error de autenticación: La contraseña del usuario PostgreSQL no coincide');
      console.error(`   Usuario: ${dbConfig.username}`);
      console.error('💡 Solución: Verifica la variable DB_PASSWORD en tu archivo .env');
      console.error('   O cambia la contraseña del usuario en PostgreSQL');
    } else if (error.original?.code === 'ECONNREFUSED') {
      console.error('🔌 Error de conexión: PostgreSQL no está corriendo o no está accesible');
      console.error(`   Host: ${dbConfig.host}:${dbConfig.port}`);
      console.error('💡 Solución: Asegúrate de que PostgreSQL esté corriendo');
    } else if (error.original?.code === 'ENOTFOUND') {
      console.error('🌐 Error de DNS: No se puede encontrar el host de la base de datos');
      console.error(`   Host: ${dbConfig.host}`);
    } else if (error.message?.includes('password')) {
      console.error('🔐 Error de autenticación: Contraseña incorrecta');
      console.error('💡 Solución: Verifica la variable DB_PASSWORD en tu archivo .env');
    } else {
      console.error('📝 Detalles del error:', error.message || error);
    }
    
    throw error;
  }
};

// Función para sincronizar modelos (solo para desarrollo)
export const syncDatabase = async (force = false): Promise<void> => {
  try {
    await sequelize.sync({ force });
    console.log('✅ Base de datos sincronizada correctamente');
  } catch (error) {
    console.error('❌ Error al sincronizar la base de datos:', error);
    throw error;
  }
};

// Función para cerrar la conexión
export const closeConnection = async (): Promise<void> => {
  try {
    await sequelize.close();
    console.log('✅ Conexión a la base de datos cerrada correctamente');
  } catch (error) {
    console.error('❌ Error al cerrar la conexión:', error);
    throw error;
  }
};

export default sequelize; 