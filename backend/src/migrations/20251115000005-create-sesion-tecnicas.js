'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('sesion_tecnicas', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      sesion_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'sesiones',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      tecnica_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'tecnicas_terapeuticas',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      notas_aplicacion: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    // Crear índices
    await queryInterface.addIndex('sesion_tecnicas', ['sesion_id', 'tecnica_id'], {
      unique: true,
      name: 'uk_sesion_tecnicas_sesion_tecnica',
    });
    await queryInterface.addIndex('sesion_tecnicas', ['sesion_id'], {
      name: 'idx_sesion_tecnicas_sesion',
    });
    await queryInterface.addIndex('sesion_tecnicas', ['tecnica_id'], {
      name: 'idx_sesion_tecnicas_tecnica',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('sesion_tecnicas');
  },
};

