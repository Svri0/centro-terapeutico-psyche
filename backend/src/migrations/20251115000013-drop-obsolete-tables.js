'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    console.log('🗑️ Eliminando tablas obsoletas post-migración...');
    
    // IMPORTANTE: Estas tablas solo se eliminan si ya se renombraron/migraron
    
    // Verificar que horarios_disponibles existe antes de eliminar disponibilidad_mensual
    const [tables] = await queryInterface.sequelize.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('horarios_disponibles', 'disponibilidad_mensual')
    `);
    
    const tableNames = tables.map(t => t.table_name);
    
    if (tableNames.includes('horarios_disponibles') && tableNames.includes('disponibilidad_mensual')) {
      console.log('⚠️ Advertencia: Ambas tablas existen. Verifica que la migración de rename se ejecutó correctamente.');
      
      // Verificar si tienen los mismos datos
      const [countOld] = await queryInterface.sequelize.query(
        'SELECT COUNT(*) as count FROM disponibilidad_mensual'
      );
      const [countNew] = await queryInterface.sequelize.query(
        'SELECT COUNT(*) as count FROM horarios_disponibles'
      );
      
      if (countOld[0].count === countNew[0].count) {
        console.log('✅ Los datos coinciden. Eliminando tabla antigua disponibilidad_mensual...');
        await queryInterface.dropTable('disponibilidad_mensual');
      } else {
        console.log('⚠️ Los datos NO coinciden. NO se eliminará la tabla antigua.');
        console.log(`  - disponibilidad_mensual: ${countOld[0].count} registros`);
        console.log(`  - horarios_disponibles: ${countNew[0].count} registros`);
      }
    } else if (tableNames.includes('disponibilidad_mensual')) {
      console.log('⚠️ La tabla horarios_disponibles no existe. NO se eliminará disponibilidad_mensual.');
    } else {
      console.log('✅ La tabla disponibilidad_mensual ya no existe (fue renombrada correctamente).');
    }
    
    console.log('✅ Limpieza de tablas obsoletas completada');
  },

  async down(queryInterface, Sequelize) {
    // No se puede restaurar tablas eliminadas sin datos
    console.log('⚠️ No se pueden restaurar tablas eliminadas. Usa backup si necesitas revertir.');
  },
};

