'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('mensajes', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4
      },
      remitente_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'usuarios',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      destinatario_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'usuarios',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      paciente_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'pacientes',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      asunto: {
        type: Sequelize.STRING(200),
        allowNull: true
      },
      contenido: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      tipo_mensaje: {
        type: Sequelize.ENUM('chat', 'notificacion', 'recordatorio', 'alerta'),
        allowNull: false,
        defaultValue: 'chat'
      },
      prioridad: {
        type: Sequelize.ENUM('baja', 'media', 'alta', 'urgente'),
        allowNull: false,
        defaultValue: 'media'
      },
      leido: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      fecha_leido: {
        type: Sequelize.DATE,
        allowNull: true
      },
      archivos_adjuntos: {
        type: Sequelize.JSONB,
        allowNull: false,
        defaultValue: []
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      },
      deleted_at: {
        type: Sequelize.DATE,
        allowNull: true
      }
    });

    // Crear índices
    await queryInterface.addIndex('mensajes', ['remitente_id']);
    await queryInterface.addIndex('mensajes', ['destinatario_id']);
    await queryInterface.addIndex('mensajes', ['paciente_id']);
    await queryInterface.addIndex('mensajes', ['leido']);
    await queryInterface.addIndex('mensajes', ['tipo_mensaje']);
    await queryInterface.addIndex('mensajes', ['created_at']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('mensajes');
  }
}; 