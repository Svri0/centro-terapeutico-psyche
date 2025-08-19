'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Agregar columna deleted_at a la tabla chats
    await queryInterface.addColumn('chats', 'deleted_at', {
      type: Sequelize.DATE,
      allowNull: true,
    });

    // Agregar columna deleted_at a la tabla mensajes_chat
    await queryInterface.addColumn('mensajes_chat', 'deleted_at', {
      type: Sequelize.DATE,
      allowNull: true,
    });
  },

  async down (queryInterface, Sequelize) {
    // Remover columna deleted_at de la tabla chats
    await queryInterface.removeColumn('chats', 'deleted_at');

    // Remover columna deleted_at de la tabla mensajes_chat
    await queryInterface.removeColumn('mensajes_chat', 'deleted_at');
  }
};
