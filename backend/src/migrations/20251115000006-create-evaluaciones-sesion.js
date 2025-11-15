'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('evaluaciones_sesion', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      sesion_id: {
        type: Sequelize.UUID,
        allowNull: false,
        unique: true,
        references: {
          model: 'sesiones',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      animo_paciente: {
        type: Sequelize.INTEGER,
        allowNull: true,
        validate: {
          min: 1,
          max: 10,
        },
      },
      nivel_ansiedad: {
        type: Sequelize.INTEGER,
        allowNull: true,
        validate: {
          min: 1,
          max: 10,
        },
      },
      cooperacion: {
        type: Sequelize.INTEGER,
        allowNull: true,
        validate: {
          min: 1,
          max: 10,
        },
      },
      insight: {
        type: Sequelize.INTEGER,
        allowNull: true,
        validate: {
          min: 1,
          max: 10,
        },
      },
      observaciones_evaluacion: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    // Crear índice
    await queryInterface.addIndex('evaluaciones_sesion', ['sesion_id'], {
      unique: true,
      name: 'uk_evaluaciones_sesion_sesion',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('evaluaciones_sesion');
  },
};

