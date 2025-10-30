const sequelize = require('./src/configuracion/database').default;

async function verificarMigraciones() {
  try {
    console.log('🔍 Verificando migraciones ejecutadas...\n');
    
    const [results] = await sequelize.query('SELECT * FROM "SequelizeMeta" ORDER BY name');
    
    console.log('📋 Migraciones ejecutadas:');
    results.forEach((row, index) => {
      console.log(`${index + 1}. ✅ ${row.name}`);
    });
    
    console.log(`\n📊 Total de migraciones: ${results.length}`);
    
    // Verificar si hay migraciones pendientes
    const fs = require('fs');
    const path = require('path');
    const migrationsDir = path.join(__dirname, 'src', 'migrations');
    
    if (fs.existsSync(migrationsDir)) {
      const archivosMigracion = fs.readdirSync(migrationsDir)
        .filter(file => file.endsWith('.js'))
        .sort();
      
      console.log(`\n📁 Archivos de migración encontrados: ${archivosMigracion.length}`);
      
      const migracionesEjecutadas = results.map(r => r.name);
      const migracionesPendientes = archivosMigracion.filter(archivo => 
        !migracionesEjecutadas.includes(archivo)
      );
      
      if (migracionesPendientes.length > 0) {
        console.log('\n⚠️ Migraciones pendientes:');
        migracionesPendientes.forEach(archivo => {
          console.log(`   - ${archivo}`);
        });
      } else {
        console.log('\n✅ Todas las migraciones están ejecutadas');
      }
    }
    
  } catch (error) {
    console.error('❌ Error al verificar migraciones:', error.message);
  } finally {
    await sequelize.close();
  }
}

verificarMigraciones();






