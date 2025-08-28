'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('usuarios', 'codigo_sbs', {
      type: Sequelize.STRING(50),
      allowNull: true,
      comment: 'Código único SBS del psicólogo en el sistema de salud'
    });

    // Agregar índice para mejorar el rendimiento de búsquedas
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
