require('dotenv').config();
const { Sequelize } = require('sequelize');

async function actualizarUrlsImagenes() {
  console.log('🔧 Actualizando URLs de imágenes...\n');
  
  // Configurar conexión a la base de datos
  const sequelize = new Sequelize({
    dialect: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'psyche_db',
    logging: false
  });
  
  try {
    // Conectar a la base de datos
    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos establecida');
    
    // Obtener el puerto actual del backend
    const backendPort = 3002; // Puerto actual del backend
    const nuevaUrlBase = `http://localhost:${backendPort}`;
    
    console.log(`📋 Configuración:`);
    console.log(`   Puerto backend: ${backendPort}`);
    console.log(`   Nueva URL base: ${nuevaUrlBase}`);
    
    // Actualizar URLs de imágenes que apunten al puerto 3002
    const [resultado] = await sequelize.query(`
      UPDATE usuarios 
      SET avatar_url = REPLACE(avatar_url, 'http://localhost:3002', '${nuevaUrlBase}')
      WHERE avatar_url LIKE '%http://localhost:3002%'
    `);
    
    console.log(`✅ URLs actualizadas: ${resultado[1]} registros modificados`);
    
    // Verificar las URLs actualizadas
    const [usuarios] = await sequelize.query(`
      SELECT id, nombres, apellidos, avatar_url 
      FROM usuarios 
      WHERE avatar_url IS NOT NULL
      ORDER BY created_at DESC
      LIMIT 5
    `);
    
    console.log('\n📋 URLs actualizadas:');
    usuarios.forEach(usuario => {
      console.log(`   ${usuario.nombres} ${usuario.apellidos}: ${usuario.avatar_url}`);
    });
    
    console.log('\n🎉 ¡URLs de imágenes actualizadas correctamente!');
    console.log('💡 Ahora las imágenes deberían verse en el panel de administración');
    
  } catch (error) {
    console.error('❌ Error al actualizar URLs:', error.message);
  } finally {
    await sequelize.close();
  }
}

actualizarUrlsImagenes(); 