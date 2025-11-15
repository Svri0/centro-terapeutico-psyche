'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    console.log('🔄 Renombrando disponibilidad_mensual a horarios_disponibles...');
    
    // Renombrar tabla
    await queryInterface.renameTable('disponibilidad_mensual', 'horarios_disponibles');
    
    // Actualizar índices (si tienen el nombre de la tabla antigua)
    await queryInterface.sequelize.query(`
      ALTER INDEX IF EXISTS disponibilidad_mensual_pkey RENAME TO horarios_disponibles_pkey;
    `);
    
    console.log('✅ Tabla renombrada a horarios_disponibles');
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.renameTable('horarios_disponibles', 'disponibilidad_mensual');
    
    await queryInterface.sequelize.query(`
      ALTER INDEX IF EXISTS horarios_disponibles_pkey RENAME TO disponibilidad_mensual_pkey;
    `);
  },
};

