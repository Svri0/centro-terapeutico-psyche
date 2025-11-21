'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('usuarios', 'codigo_sbs', {
      type: Sequelize.STRING(50),
      allowNull: true,
      comment: 'Código SBS (Superintendencia de Salud) del psicólogo - 6 dígitos'
    });

    // Agregar índice para mejorar búsquedas por código SBS
    await queryInterface.addIndex('usuarios', ['codigo_sbs'], {
      name: 'idx_usuarios_codigo_sbs'
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Remover índice
    await queryInterface.removeIndex('usuarios', 'idx_usuarios_codigo_sbs');
    
    // Remover columna
    await queryInterface.removeColumn('usuarios', 'codigo_sbs');
  }
};

