'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      // Agregar los valores faltantes al ENUM existente
      await queryInterface.sequelize.query(`
        ALTER TYPE enum_tareas_tipo_tarea ADD VALUE IF NOT EXISTS 'texto_abierto';
      `);
      
      await queryInterface.sequelize.query(`
        ALTER TYPE enum_tareas_tipo_tarea ADD VALUE IF NOT EXISTS 'opcion_multiple';
      `);
      
      await queryInterface.sequelize.query(`
        ALTER TYPE enum_tareas_tipo_tarea ADD VALUE IF NOT EXISTS 'test_psicologico';
      `);
      
      await queryInterface.sequelize.query(`
        ALTER TYPE enum_tareas_tipo_tarea ADD VALUE IF NOT EXISTS 'test_imagenes';
      `);
      
      await queryInterface.sequelize.query(`
        ALTER TYPE enum_tareas_tipo_tarea ADD VALUE IF NOT EXISTS 'tarea_dibujo';
      `);

      console.log('✅ Valores agregados al ENUM tipo_tarea correctamente');
    } catch (error) {
      console.error('❌ Error agregando valores al ENUM:', error);
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    try {
      console.log('⚠️ No se puede revertir la adición de valores a ENUM en PostgreSQL');
      console.log('⚠️ Los valores permanecerán en el ENUM');
    } catch (error) {
      console.error('❌ Error en down migration:', error);
      throw error;
    }
  }
};
