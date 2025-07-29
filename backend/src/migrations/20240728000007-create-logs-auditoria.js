'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('logs_auditoria', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4
      },
      usuario_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'usuarios',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      accion: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      tabla_afectada: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      registro_id: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      valores_anteriores: {
        type: Sequelize.JSONB,
        allowNull: true
      },
      valores_nuevos: {
        type: Sequelize.JSONB,
        allowNull: true
      },
      ip_address: {
        type: Sequelize.INET,
        allowNull: true
      },
      user_agent: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      metadatos: {
        type: Sequelize.JSONB,
        allowNull: false,
        defaultValue: {}
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      }
    });

    // Crear índices
    await queryInterface.addIndex('logs_auditoria', ['usuario_id']);
    await queryInterface.addIndex('logs_auditoria', ['accion']);
    await queryInterface.addIndex('logs_auditoria', ['tabla_afectada']);
    await queryInterface.addIndex('logs_auditoria', ['registro_id']);
    await queryInterface.addIndex('logs_auditoria', ['created_at']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('logs_auditoria');
  }
}; 