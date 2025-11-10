'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('tokens_mensajes_paciente', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      paciente_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'pacientes',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        unique: true,
      },
      tokens_disponibles: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      tokens_usados: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      fecha_ultimo_reset: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      periodo_reset: {
        type: Sequelize.ENUM('diario', 'semanal', 'mensual', 'ilimitado'),
        allowNull: false,
        defaultValue: 'ilimitado',
      },
      activo: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      deleted_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
    });

    // Crear índices
    await queryInterface.addIndex('tokens_mensajes_paciente', ['paciente_id'], {
      unique: true,
      name: 'idx_tokens_mensajes_paciente_id'
    });

    await queryInterface.addIndex('tokens_mensajes_paciente', ['activo'], {
      name: 'idx_tokens_mensajes_paciente_activo'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('tokens_mensajes_paciente');
  }
};

