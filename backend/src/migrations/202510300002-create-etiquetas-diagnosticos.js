'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Etiquetas
    await queryInterface.createTable('etiquetas', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('gen_random_uuid()')
      },
      nombre: { type: Sequelize.STRING(100), allowNull: false, unique: true },
      color: { type: Sequelize.STRING(20), allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
      deleted_at: { type: Sequelize.DATE, allowNull: true },
    });

    // Diagnósticos
    await queryInterface.createTable('diagnosticos', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('gen_random_uuid()')
      },
      codigo: { type: Sequelize.STRING(50), allowNull: true },
      nombre: { type: Sequelize.STRING(200), allowNull: false },
      descripcion: { type: Sequelize.TEXT, allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
      deleted_at: { type: Sequelize.DATE, allowNull: true },
    });

    await queryInterface.addIndex('diagnosticos', ['codigo'], { name: 'idx_diagnosticos_codigo' });
    await queryInterface.addIndex('diagnosticos', ['nombre'], { name: 'idx_diagnosticos_nombre' });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('diagnosticos');
    await queryInterface.dropTable('etiquetas');
  }
};


