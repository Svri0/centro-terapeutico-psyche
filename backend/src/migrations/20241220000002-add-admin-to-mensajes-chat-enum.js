'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Agregar 'admin' al enum existente
    await queryInterface.sequelize.query(`
      ALTER TYPE "enum_mensajes_chat_tipo" ADD VALUE 'admin';
    `);
  },

  async down(queryInterface, Sequelize) {
    // PostgreSQL no permite eliminar valores de un enum directamente
    // Necesitaríamos recrear el enum completo, pero por simplicidad
    // dejamos el valor 'admin' en el enum
    console.log('No se puede revertir la adición de valores a un enum en PostgreSQL');
  }
};
