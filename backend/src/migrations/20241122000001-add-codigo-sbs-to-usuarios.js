'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Verificar si la columna ya existe
    const tableDescription = await queryInterface.describeTable('usuarios');
    
    if (!tableDescription.codigo_sbs) {
      await queryInterface.addColumn('usuarios', 'codigo_sbs', {
        type: Sequelize.STRING(50),
        allowNull: true,
        comment: 'Código SBS (Superintendencia de Salud) del psicólogo - 6 dígitos'
      });
    }

    // Verificar si el índice ya existe antes de crearlo
    const indexes = await queryInterface.showIndex('usuarios');
    const indexExists = indexes.some(idx => idx.name === 'idx_usuarios_codigo_sbs');
    
    if (!indexExists) {
      await queryInterface.addIndex('usuarios', ['codigo_sbs'], {
        name: 'idx_usuarios_codigo_sbs'
      });
    }
  },

  down: async (queryInterface, Sequelize) => {
    // Remover índice
    await queryInterface.removeIndex('usuarios', 'idx_usuarios_codigo_sbs');
    
    // Remover columna
    await queryInterface.removeColumn('usuarios', 'codigo_sbs');
  }
};

