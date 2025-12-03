// Script simple para debuggear el problema del botón
console.log('🔍 Debug: Verificando lógica del botón...');

// Simular diferentes estados de citas
const citasEjemplo = [
  { id: '1', fecha: '2024-10-22', estado: 'programada', paciente_nombre: 'María González' },
  { id: '2', fecha: '2024-10-22', estado: 'confirmada', paciente_nombre: 'Carlos López' },
  { id: '3', fecha: '2024-10-23', estado: 'confirmada', paciente_nombre: 'Ana Martínez' },
  { id: '4', fecha: '2024-10-23', estado: 'en_curso', paciente_nombre: 'Luis Pérez' },
  { id: '5', fecha: '2024-10-24', estado: 'completada', paciente_nombre: 'Sofia Rodríguez' }
];

console.log('\n📋 Análisis de botones por cita:');
citasEjemplo.forEach(cita => {
  const hoy = new Date();
  const fechaCita = new Date(cita.fecha);
  const esFechaFutura = fechaCita >= hoy;
  
  let botones = [];
  
  if (cita.estado === 'programada') {
    botones.push('✅ Confirmar Cita');
  }
  
  if (cita.estado === 'confirmada') {
    if (esFechaFutura) {
      botones.push('🧠 Iniciar Sesión Terapéutica');
    } else {
      botones.push('❌ Fecha pasada - Botón bloqueado');
    }
  }
  
  if (cita.estado === 'en_curso') {
    botones.push('✅ Completar Sesión');
  }
  
  if (cita.estado === 'completada') {
    botones.push('ℹ️ Sesión completada');
  }
  
  console.log(`\n📅 ${cita.fecha} - ${cita.paciente_nombre} (${cita.estado})`);
  console.log(`   Botones: ${botones.join(', ')}`);
  console.log(`   Fecha futura: ${esFechaFutura ? 'Sí' : 'No'}`);
});

console.log('\n💡 Posibles causas del problema:');
console.log('1. Las citas del día 2 podrían tener estado diferente a "confirmada"');
console.log('2. Podría haber un problema con la fecha (formato o zona horaria)');
console.log('3. El estado de la cita podría no estar actualizándose correctamente');

console.log('\n🔧 Soluciones recomendadas:');
console.log('1. Verificar el estado de las citas en la base de datos');
console.log('2. Asegurar que las fechas estén en formato correcto');
console.log('3. Verificar que el componente se esté re-renderizando correctamente');




