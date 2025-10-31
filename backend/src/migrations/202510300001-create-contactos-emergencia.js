'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('contactos_emergencia', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('gen_random_uuid()')
      },
      paciente_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'pacientes', key: 'id' },
        onDelete: 'CASCADE',
      },
      nombre: { type: Sequelize.STRING(200), allowNull: false },
      telefono: { type: Sequelize.STRING(20), allowNull: true },
      relacion: { type: Sequelize.STRING(50), allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
      deleted_at: { type: Sequelize.DATE, allowNull: true },
    });

    await queryInterface.addIndex('contactos_emergencia', ['paciente_id'], { name: 'idx_contactos_emergencia_paciente' });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('contactos_emergencia');
  }
};


