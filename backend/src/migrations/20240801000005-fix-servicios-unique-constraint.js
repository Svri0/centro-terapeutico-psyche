'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Eliminar el índice único existente
    await queryInterface.removeIndex('servicios_psicologo', 'servicios_psicologo_unique');
    
    // Crear un índice único parcial que solo considere servicios activos
    await queryInterface.addIndex('servicios_psicologo', ['psicologo_id', 'tipo_servicio_id'], {
      unique: true,
      name: 'servicios_psicologo_unique_active',
      where: {
        activo: true
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Eliminar el nuevo índice
    await queryInterface.removeIndex('servicios_psicologo', 'servicios_psicologo_unique_active');
    
    // Restaurar el índice original
    await queryInterface.addIndex('servicios_psicologo', ['psicologo_id', 'tipo_servicio_id'], {
      unique: true,
      name: 'servicios_psicologo_unique'
    });
  }
}; 