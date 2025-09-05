'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('usuarios', 'especialidad', {
      type: Sequelize.TEXT,
      allowNull: true,
      comment: 'Especialización del psicólogo'
    });

    await queryInterface.addColumn('usuarios', 'descripcion', {
      type: Sequelize.TEXT,
      allowNull: true,
      comment: 'Descripción personal y profesional del psicólogo'
    });

    // Agregar índices para mejorar el rendimiento de búsquedas
    await queryInterface.addIndex('usuarios', ['especialidad'], {
      name: 'idx_usuarios_especialidad'
    });

    await queryInterface.addIndex('usuarios', ['descripcion'], {
      name: 'idx_usuarios_descripcion'
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Remover índices
    await queryInterface.removeIndex('usuarios', 'idx_usuarios_especialidad');
    await queryInterface.removeIndex('usuarios', 'idx_usuarios_descripcion');

    // Remover columnas
    await queryInterface.removeColumn('usuarios', 'especialidad');
    await queryInterface.removeColumn('usuarios', 'descripcion');
  }
}; 