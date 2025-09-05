'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      // Por ahora, solo vamos a agregar una columna temporal para los nuevos tipos
      await queryInterface.addColumn('tareas', 'tipo_tarea_avanzado', {
        type: Sequelize.STRING,
        allowNull: true,
        comment: 'Tipo de tarea avanzado para el nuevo sistema',
      });

      // Migrar los datos existentes
      await queryInterface.sequelize.query(`
        UPDATE tareas 
        SET tipo_tarea_avanzado = CASE 
          WHEN tipo_tarea = 'ejercicio' THEN 'ejercicio'
          WHEN tipo_tarea = 'lectura' THEN 'lectura'
          WHEN tipo_tarea = 'reflexion' THEN 'reflexion'
          WHEN tipo_tarea = 'practica' THEN 'practica'
          WHEN tipo_tarea = 'evaluacion' THEN 'evaluacion'
          ELSE 'texto_abierto'
        END;
      `);

      console.log('Migración de tipos de tarea completada exitosamente');
    } catch (error) {
      console.log('Error en migración de tipos:', error.message);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    try {
      await queryInterface.removeColumn('tareas', 'tipo_tarea_avanzado');
      console.log('Revertida migración de tipos de tarea');
    } catch (error) {
      console.log('Error al revertir migración de tipos:', error.message);
      throw error;
    }
  }
};
