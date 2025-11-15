'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('sesion_objetivos', {
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
      objetivo_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'objetivos_terapeuticos',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      alcanzado: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      notas: {
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
    await queryInterface.addIndex('sesion_objetivos', ['sesion_id', 'objetivo_id'], {
      unique: true,
      name: 'uk_sesion_objetivos_sesion_objetivo',
    });
    await queryInterface.addIndex('sesion_objetivos', ['sesion_id'], {
      name: 'idx_sesion_objetivos_sesion',
    });
    await queryInterface.addIndex('sesion_objetivos', ['objetivo_id'], {
      name: 'idx_sesion_objetivos_objetivo',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('sesion_objetivos');
  },
};

