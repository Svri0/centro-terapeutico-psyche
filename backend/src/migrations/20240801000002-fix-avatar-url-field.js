'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Cambiar el tipo de dato de avatar_url de VARCHAR(500) a TEXT
    await queryInterface.changeColumn('usuarios', 'avatar_url', {
      type: Sequelize.TEXT,
      allowNull: true,
      comment: 'URL del avatar o imagen base64 del usuario'
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Revertir el cambio de vuelta a VARCHAR(500)
    await queryInterface.changeColumn('usuarios', 'avatar_url', {
      type: Sequelize.STRING(500),
      allowNull: true,
      comment: 'URL del avatar del usuario'
    });
  }
}; 