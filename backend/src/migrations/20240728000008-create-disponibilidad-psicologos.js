'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('disponibilidad_psicologos', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4
      },
      psicologo_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'usuarios',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      dia_semana: {
        type: Sequelize.INTEGER, // 0 = Domingo, 1 = Lunes, ..., 6 = Sábado
        allowNull: false
      },
      hora_inicio: {
        type: Sequelize.TIME,
        allowNull: false
      },
      hora_fin: {
        type: Sequelize.TIME,
        allowNull: false
      },
      activo: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Índices para optimizar consultas
    await queryInterface.addIndex('disponibilidad_psicologos', ['psicologo_id', 'dia_semana']);
    await queryInterface.addIndex('disponibilidad_psicologos', ['psicologo_id', 'activo']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('disponibilidad_psicologos');
  }
}; 