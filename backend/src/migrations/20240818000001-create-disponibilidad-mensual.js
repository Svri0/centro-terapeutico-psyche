'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('disponibilidad_mensual', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
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
      fecha: {
        type: Sequelize.DATEONLY,
        allowNull: false,
        comment: 'Fecha específica (YYYY-MM-DD)'
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
        allowNull: false,
        defaultValue: true
      },
      tipo_disponibilidad: {
        type: Sequelize.ENUM('individual', 'recurrente'),
        allowNull: false,
        defaultValue: 'individual',
        comment: 'individual: fecha específica, recurrente: se repite semanalmente'
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
      },
      deleted_at: {
        type: Sequelize.DATE,
        allowNull: true
      }
    });

    // Índices para mejorar el rendimiento
    await queryInterface.addIndex('disponibilidad_mensual', ['psicologo_id']);
    await queryInterface.addIndex('disponibilidad_mensual', ['psicologo_id', 'fecha']);
    await queryInterface.addIndex('disponibilidad_mensual', ['fecha']);
    await queryInterface.addIndex('disponibilidad_mensual', ['activo']);
    await queryInterface.addIndex('disponibilidad_mensual', ['tipo_disponibilidad']);
    
    // Índice único para evitar duplicados de fecha por psicólogo
    await queryInterface.addIndex('disponibilidad_mensual', ['psicologo_id', 'fecha'], {
      unique: true,
      name: 'idx_disponibilidad_mensual_psicologo_fecha_unique'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('disponibilidad_mensual');
  }
};
