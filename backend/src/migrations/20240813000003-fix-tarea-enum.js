'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      // Por ahora, solo vamos a actualizar los datos existentes para usar el nuevo sistema
      await queryInterface.sequelize.query(`
        UPDATE tareas 
        SET tipo_tarea_avanzado = CASE 
          WHEN tipo_tarea = 'ejercicio' THEN 'ejercicio'
          WHEN tipo_tarea = 'lectura' THEN 'lectura'
          WHEN tipo_tarea = 'reflexion' THEN 'reflexion'
          WHEN tipo_tarea = 'practica' THEN 'practica'
          WHEN tipo_tarea = 'evaluacion' THEN 'evaluacion'
          ELSE 'texto_abierto'
        END
        WHERE tipo_tarea_avanzado IS NULL;
      `);

      console.log('Migración de datos de tipo_tarea completada exitosamente');
    } catch (error) {
      console.log('Error en migración de datos:', error.message);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    try {
      console.log('No se puede revertir esta migración de datos');
    } catch (error) {
      console.log('Error al revertir migración de datos:', error.message);
      throw error;
    }
  }
};
