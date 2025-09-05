'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('chat', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      emisor_id: {
        type: Sequelize.UUID,
        allowNull: false
      },
      receptor_id: {
        type: Sequelize.UUID,
        allowNull: false
      },
      contenido: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      leido: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false
      },
      timestamp: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
        allowNull: false
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('chat');
  }
};
