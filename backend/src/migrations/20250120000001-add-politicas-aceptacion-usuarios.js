'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Verificar qué columnas ya existen
    const tableDescription = await queryInterface.describeTable('usuarios');
    
    // Agregar politica_seguridad_aceptada si no existe
    if (!tableDescription.politica_seguridad_aceptada) {
      await queryInterface.addColumn('usuarios', 'politica_seguridad_aceptada', {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      });
    }

    // Agregar politica_privacidad_aceptada si no existe
    if (!tableDescription.politica_privacidad_aceptada) {
      await queryInterface.addColumn('usuarios', 'politica_privacidad_aceptada', {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      });
    }

    // Agregar fecha_aceptacion_politicas si no existe
    if (!tableDescription.fecha_aceptacion_politicas) {
      await queryInterface.addColumn('usuarios', 'fecha_aceptacion_politicas', {
        type: Sequelize.DATE,
        allowNull: true
      });
    }

    // Verificar si el índice ya existe antes de crearlo
    const indexes = await queryInterface.showIndex('usuarios');
    const indexExists = indexes.some(idx => idx.name === 'idx_usuarios_politicas_aceptadas');
    
    if (!indexExists) {
      await queryInterface.addIndex('usuarios', ['politica_seguridad_aceptada', 'politica_privacidad_aceptada'], {
        name: 'idx_usuarios_politicas_aceptadas'
      });
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex('usuarios', 'idx_usuarios_politicas_aceptadas');
    await queryInterface.removeColumn('usuarios', 'fecha_aceptacion_politicas');
    await queryInterface.removeColumn('usuarios', 'politica_privacidad_aceptada');
    await queryInterface.removeColumn('usuarios', 'politica_seguridad_aceptada');
  }
};

