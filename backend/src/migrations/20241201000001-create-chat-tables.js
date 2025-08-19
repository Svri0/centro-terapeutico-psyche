'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Crear tabla de chats
    await queryInterface.createTable('chats', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      tipo: {
        type: Sequelize.ENUM('individual', 'grupo'),
        allowNull: false,
        defaultValue: 'individual',
      },
      nombre: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      descripcion: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      psicologo_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'usuarios',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      paciente_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'usuarios',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      ultimo_mensaje: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      ultimo_mensaje_timestamp: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      ultimo_mensaje_remitente: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'usuarios',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      no_leidos_psicologo: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      no_leidos_paciente: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      activo: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      fecha_creacion: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      fecha_ultima_actividad: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
    });

    // Crear tabla de mensajes de chat
    await queryInterface.createTable('mensajes_chat', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      chat_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'chats',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
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
      contenido: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      tipo: {
        type: Sequelize.ENUM('texto', 'imagen', 'audio', 'documento'),
        allowNull: false,
        defaultValue: 'texto',
      },
      leido: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      metadata: {
        type: Sequelize.JSON,
        allowNull: true,
      },
      fecha_envio: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
    });

    // Crear índices para mejorar el rendimiento
    await queryInterface.addIndex('chats', ['psicologo_id', 'activo']);
    await queryInterface.addIndex('chats', ['paciente_id', 'activo']);
    await queryInterface.addIndex('chats', ['fecha_ultima_actividad']);
    await queryInterface.addIndex('mensajes_chat', ['chat_id']);
    await queryInterface.addIndex('mensajes_chat', ['remitente_id']);
    await queryInterface.addIndex('mensajes_chat', ['fecha_envio']);
  },

  down: async (queryInterface, Sequelize) => {
    // Eliminar índices
    await queryInterface.removeIndex('chats', ['psicologo_id', 'activo']);
    await queryInterface.removeIndex('chats', ['paciente_id', 'activo']);
    await queryInterface.removeIndex('chats', ['fecha_ultima_actividad']);
    await queryInterface.removeIndex('mensajes_chat', ['chat_id']);
    await queryInterface.removeIndex('mensajes_chat', ['remitente_id']);
    await queryInterface.removeIndex('mensajes_chat', ['fecha_envio']);

    // Eliminar tablas
    await queryInterface.dropTable('mensajes_chat');
    await queryInterface.dropTable('chats');
  }
};
