'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('mensajes_chat', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      contenido: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      remitente_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'usuarios',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      destinatario_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'usuarios',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      tipo: {
        type: Sequelize.ENUM('psicologo', 'paciente'),
        allowNull: false,
      },
      leido: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
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

    // Crear índices para optimizar consultas
    await queryInterface.addIndex('mensajes_chat', ['remitente_id', 'destinatario_id'], {
      name: 'idx_mensajes_chat_participantes'
    });

    await queryInterface.addIndex('mensajes_chat', ['created_at'], {
      name: 'idx_mensajes_chat_timestamp'
    });

    await queryInterface.addIndex('mensajes_chat', ['leido'], {
      name: 'idx_mensajes_chat_leido'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('mensajes_chat');
  }
};
