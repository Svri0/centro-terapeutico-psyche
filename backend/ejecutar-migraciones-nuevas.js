const { execSync } = require('child_process');
const path = require('path');

console.log('🚀 Ejecutando nuevas migraciones para el Centro Terapéutico Psyche...\n');

try {
  // Verificar el estado actual de las migraciones
  console.log('📊 Verificando estado actual de las migraciones...');
  execSync('npm run db:check', { stdio: 'inherit' });
  
  console.log('\n🔄 Ejecutando nuevas migraciones...');
  
  // Ejecutar las nuevas migraciones
  execSync('npm run db:migrate', { stdio: 'inherit' });
  
  console.log('\n✅ Migraciones ejecutadas exitosamente!');
  console.log('\n📋 Resumen de cambios implementados:');
  console.log('   • Campo SBS agregado a psicólogos');
  console.log('   • Antecedentes médicos agregados a pacientes');
  console.log('   • Sistema de bitácora mejorado para sesiones');
  console.log('   • Cálculo automático de edad exacta');
  console.log('\n🎯 Próximos pasos:');
  console.log('   1. Reiniciar el servidor backend');
  console.log('   2. Verificar que los nuevos campos aparezcan en los formularios');
  console.log('   3. Probar la creación de psicólogos con código SBS');
  console.log('   4. Probar la creación de pacientes con antecedentes médicos');
  console.log('   5. Verificar la ficha clínica completa');
  
} catch (error) {
  console.error('\n❌ Error ejecutando las migraciones:', error.message);
  console.log('\n🔧 Solución de problemas:');
  console.log('   1. Verificar que la base de datos esté corriendo');
  console.log('   2. Verificar las credenciales de la base de datos');
  console.log('   3. Verificar que sequelize-cli esté instalado');
  console.log('   4. Ejecutar: npm install -g sequelize-cli');
  process.exit(1);
}
