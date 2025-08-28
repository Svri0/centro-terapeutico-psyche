const { LimpiadorCitasService } = require('../dist/utilidades/limpiador-citas.service');

async function testLimpiador() {
  try {
    console.log('🧪 Probando Limpiador de Citas Canceladas...\n');

    // 1. Obtener estadísticas actuales
    console.log('📊 Obteniendo estadísticas actuales...');
    const stats = await LimpiadorCitasService.obtenerEstadisticas();
    console.log('✅ Estadísticas obtenidas:', stats);

    // 2. Ejecutar limpieza manual
    console.log('\n🧹 Ejecutando limpieza manual...');
    const citasEliminadas = await LimpiadorCitasService.limpiarManual();
    console.log(`✅ Limpieza completada - ${citasEliminadas} citas eliminadas`);

    // 3. Obtener estadísticas después de la limpieza
    console.log('\n📊 Obteniendo estadísticas después de la limpieza...');
    const statsDespues = await LimpiadorCitasService.obtenerEstadisticas();
    console.log('✅ Estadísticas después de la limpieza:', statsDespues);

    // 4. Mostrar resumen
    console.log('\n📋 RESUMEN:');
    console.log(`• Citas canceladas totales: ${stats.totalCanceladas}`);
    console.log(`• Citas canceladas recientes (< 24h): ${stats.canceladasRecientes}`);
    console.log(`• Citas canceladas antiguas (≥ 24h): ${stats.canceladasAntiguas}`);
    console.log(`• Citas eliminadas en esta limpieza: ${citasEliminadas}`);

  } catch (error) {
    console.error('❌ Error durante la prueba:', error);
  } finally {
    process.exit(0);
  }
}

// Ejecutar la prueba
testLimpiador();
