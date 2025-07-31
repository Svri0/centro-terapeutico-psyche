'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('pacientes', 'nombres', {
      type: Sequelize.STRING(100),
      allowNull: true,
      after: 'usuario_id'
    });

    await queryInterface.addColumn('pacientes', 'apellidos', {
      type: Sequelize.STRING(100),
      allowNull: true,
      after: 'nombres'
    });

    await queryInterface.addColumn('pacientes', 'email', {
      type: Sequelize.STRING(255),
      allowNull: true,
      after: 'apellidos'
    });

    await queryInterface.addColumn('pacientes', 'telefono', {
      type: Sequelize.STRING(20),
      allowNull: true,
      after: 'email'
    });

    await queryInterface.addColumn('pacientes', 'fecha_nacimiento', {
      type: Sequelize.DATEONLY,
      allowNull: true,
      after: 'telefono'
    });

    await queryInterface.addColumn('pacientes', 'genero', {
      type: Sequelize.ENUM('masculino', 'femenino', 'no_binario', 'prefiero_no_decir'),
      allowNull: true,
      after: 'fecha_nacimiento'
    });

    // Crear índices para las nuevas columnas
    await queryInterface.addIndex('pacientes', ['nombres']);
    await queryInterface.addIndex('pacientes', ['apellidos']);
    await queryInterface.addIndex('pacientes', ['email']);
    await queryInterface.addIndex('pacientes', ['genero']);
  },

  async down(queryInterface, Sequelize) {
    // Eliminar índices
    await queryInterface.removeIndex('pacientes', ['nombres']);
    await queryInterface.removeIndex('pacientes', ['apellidos']);
    await queryInterface.removeIndex('pacientes', ['email']);
    await queryInterface.removeIndex('pacientes', ['genero']);

    // Eliminar columnas
    await queryInterface.removeColumn('pacientes', 'genero');
    await queryInterface.removeColumn('pacientes', 'fecha_nacimiento');
    await queryInterface.removeColumn('pacientes', 'telefono');
    await queryInterface.removeColumn('pacientes', 'email');
    await queryInterface.removeColumn('pacientes', 'apellidos');
    await queryInterface.removeColumn('pacientes', 'nombres');
  }
}; 