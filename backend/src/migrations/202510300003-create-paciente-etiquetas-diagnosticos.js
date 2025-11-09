'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Tabla puente paciente_etiquetas
    await queryInterface.createTable('paciente_etiquetas', {
      paciente_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'pacientes', key: 'id' },
        onDelete: 'CASCADE',
        primaryKey: true,
      },
      etiqueta_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'etiquetas', key: 'id' },
        onDelete: 'CASCADE',
        primaryKey: true,
      },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
    });

    // Tabla puente paciente_diagnosticos
    await queryInterface.createTable('paciente_diagnosticos', {
      paciente_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'pacientes', key: 'id' },
        onDelete: 'CASCADE',
        primaryKey: true,
      },
      diagnostico_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'diagnosticos', key: 'id' },
        onDelete: 'CASCADE',
        primaryKey: true,
      },
      observaciones: { type: Sequelize.TEXT, allowNull: true },
      fecha_diagnostico: { type: Sequelize.DATEONLY, allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
    });

    await queryInterface.addIndex('paciente_etiquetas', ['paciente_id'], { name: 'idx_paciente_etiquetas_paciente' });
    await queryInterface.addIndex('paciente_etiquetas', ['etiqueta_id'], { name: 'idx_paciente_etiquetas_etiqueta' });
    await queryInterface.addIndex('paciente_diagnosticos', ['paciente_id'], { name: 'idx_paciente_diagnosticos_paciente' });
    await queryInterface.addIndex('paciente_diagnosticos', ['diagnostico_id'], { name: 'idx_paciente_diagnosticos_diag' });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('paciente_diagnosticos');
    await queryInterface.dropTable('paciente_etiquetas');
  }
};


