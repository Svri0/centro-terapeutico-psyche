'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Agregar campo para antecedentes médicos generales
    await queryInterface.addColumn('pacientes', 'antecedentes_medicos', {
      type: Sequelize.JSONB,
      allowNull: false,
      defaultValue: [],
      comment: 'Lista de antecedentes médicos relevantes (diabetes, epilepsia, etc.)'
    });

    // Agregar campo para medicación actual
    await queryInterface.addColumn('pacientes', 'medicacion_actual', {
      type: Sequelize.JSONB,
      allowNull: false,
      defaultValue: [],
      comment: 'Lista de medicamentos que toma actualmente (físicos y psiquiátricos)'
    });

    // Agregar campo para alergias
    await queryInterface.addColumn('pacientes', 'alergias', {
      type: Sequelize.JSONB,
      allowNull: false,
      defaultValue: [],
      comment: 'Lista de alergias conocidas'
    });

    // Agregar campo para condiciones crónicas
    await queryInterface.addColumn('pacientes', 'condiciones_cronicas', {
      type: Sequelize.JSONB,
      allowNull: false,
      defaultValue: [],
      comment: 'Condiciones médicas crónicas'
    });

    // Agregar campo para historial psiquiátrico
    await queryInterface.addColumn('pacientes', 'historial_psiquiatrico', {
      type: Sequelize.JSONB,
      allowNull: false,
      defaultValue: [],
      comment: 'Historial de tratamientos psiquiátricos previos'
    });

    // Agregar campo para observaciones médicas
    await queryInterface.addColumn('pacientes', 'observaciones_medicas', {
      type: Sequelize.TEXT,
      allowNull: true,
      comment: 'Observaciones médicas adicionales'
    });

    // Agregar índices para mejorar el rendimiento
    await queryInterface.addIndex('pacientes', ['antecedentes_medicos'], {
      name: 'idx_pacientes_antecedentes_medicos',
      using: 'gin'
    });

    await queryInterface.addIndex('pacientes', ['medicacion_actual'], {
      name: 'idx_pacientes_medicacion_actual',
      using: 'gin'
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Remover índices
    await queryInterface.removeIndex('pacientes', 'idx_pacientes_antecedentes_medicos');
    await queryInterface.removeIndex('pacientes', 'idx_pacientes_medicacion_actual');

    // Remover columnas
    await queryInterface.removeColumn('pacientes', 'antecedentes_medicos');
    await queryInterface.removeColumn('pacientes', 'medicacion_actual');
    await queryInterface.removeColumn('pacientes', 'alergias');
    await queryInterface.removeColumn('pacientes', 'condiciones_cronicas');
    await queryInterface.removeColumn('pacientes', 'historial_psiquiatrico');
    await queryInterface.removeColumn('pacientes', 'observaciones_medicas');
  }
};
