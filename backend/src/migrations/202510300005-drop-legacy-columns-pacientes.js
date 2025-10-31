'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Quitar columnas normalizadas a tablas nuevas
    const table = 'pacientes';
    // Usar try/catch por columna para entornos parcialmente migrados
    const dropIfExists = async (col) => {
      try {
        await queryInterface.removeColumn(table, col);
      } catch (e) {
        // ignorar si no existe
      }
    };

    await dropIfExists('contacto_emergencia_nombre');
    await dropIfExists('contacto_emergencia_telefono');
    await dropIfExists('contacto_emergencia_relacion');
    await dropIfExists('diagnosticos');
    await dropIfExists('etiquetas');
  },

  async down(queryInterface, Sequelize) {
    // Restaurar columnas (sin datos)
    await queryInterface.addColumn('pacientes', 'contacto_emergencia_nombre', { type: Sequelize.STRING(200), allowNull: true });
    await queryInterface.addColumn('pacientes', 'contacto_emergencia_telefono', { type: Sequelize.STRING(20), allowNull: true });
    await queryInterface.addColumn('pacientes', 'contacto_emergencia_relacion', { type: Sequelize.STRING(50), allowNull: true });
    await queryInterface.addColumn('pacientes', 'diagnosticos', { type: Sequelize.JSONB, allowNull: false, defaultValue: [] });
    await queryInterface.addColumn('pacientes', 'etiquetas', { type: Sequelize.JSONB, allowNull: false, defaultValue: [] });
  }
};


