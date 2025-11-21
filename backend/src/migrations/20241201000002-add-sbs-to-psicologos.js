'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Verificar si la columna ya existe
    const tableDescription = await queryInterface.describeTable('usuarios');
    
    if (!tableDescription.codigo_sbs) {
      await queryInterface.addColumn('usuarios', 'codigo_sbs', {
        type: Sequelize.STRING(50),
        allowNull: true,
        comment: 'Código único SBS del psicólogo en el sistema de salud'
      });
    }

    // Verificar si el índice ya existe antes de agregarlo
    const indexes = await queryInterface.showIndex('usuarios');
    const indexExists = indexes.some(index => index.name === 'idx_usuarios_codigo_sbs');
    
    if (!indexExists) {
      await queryInterface.addIndex('usuarios', ['codigo_sbs'], {
        name: 'idx_usuarios_codigo_sbs'
      });
    }
  },

  down: async (queryInterface, Sequelize) => {
    // Verificar si el índice existe antes de removerlo
    const indexes = await queryInterface.showIndex('usuarios');
    const indexExists = indexes.some(index => index.name === 'idx_usuarios_codigo_sbs');
    
    if (indexExists) {
      await queryInterface.removeIndex('usuarios', 'idx_usuarios_codigo_sbs');
    }

    // Verificar si la columna existe antes de removerla
    const tableDescription = await queryInterface.describeTable('usuarios');
    if (tableDescription.codigo_sbs) {
      await queryInterface.removeColumn('usuarios', 'codigo_sbs');
    }
  }
};
