'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Agregar campo para resumen de la sesión (bitácora)
    await queryInterface.addColumn('sesiones', 'resumen_sesion', {
      type: Sequelize.TEXT,
      allowNull: true,
      comment: 'Resumen breve de la sesión para bitácora (ej: "se trabajó en objetivos de ansiedad")'
    });

    // Agregar campo para objetivos alcanzados
    await queryInterface.addColumn('sesiones', 'objetivos_alcanzados', {
      type: Sequelize.JSONB,
      allowNull: false,
      defaultValue: [],
      comment: 'Objetivos que se lograron en esta sesión'
    });

    // Agregar campo para tareas asignadas al paciente
    await queryInterface.addColumn('sesiones', 'tareas_asignadas', {
      type: Sequelize.JSONB,
      allowNull: false,
      defaultValue: [],
      comment: 'Tareas o ejercicios asignados al paciente para la próxima sesión'
    });

    // Agregar campo para progreso del paciente
    await queryInterface.addColumn('sesiones', 'progreso_paciente', {
      type: Sequelize.ENUM('excelente', 'bueno', 'regular', 'necesita_mejora'),
      allowNull: true,
      comment: 'Evaluación del progreso del paciente en esta sesión'
    });

    // Agregar campo para derivación recomendada
    await queryInterface.addColumn('sesiones', 'derivacion_recomendada', {
      type: Sequelize.JSONB,
      allowNull: false,
      defaultValue: {},
      comment: 'Información sobre derivación a otros profesionales (psiquiatra, etc.)'
    });

    // Agregar campo para archivos de sesión
    await queryInterface.addColumn('sesiones', 'archivos_sesion', {
      type: Sequelize.JSONB,
      allowNull: false,
      defaultValue: [],
      comment: 'Archivos relacionados con la sesión (formularios, evaluaciones, etc.)'
    });

    // Agregar índices para mejorar el rendimiento
    await queryInterface.addIndex('sesiones', ['resumen_sesion'], {
      name: 'idx_sesiones_resumen_sesion'
    });

    await queryInterface.addIndex('sesiones', ['progreso_paciente'], {
      name: 'idx_sesiones_progreso_paciente'
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Remover índices
    await queryInterface.removeIndex('sesiones', 'idx_sesiones_resumen_sesion');
    await queryInterface.removeIndex('sesiones', 'idx_sesiones_progreso_paciente');

    // Remover columnas
    await queryInterface.removeColumn('sesiones', 'resumen_sesion');
    await queryInterface.removeColumn('sesiones', 'objetivos_alcanzados');
    await queryInterface.removeColumn('sesiones', 'tareas_asignadas');
    await queryInterface.removeColumn('sesiones', 'progreso_paciente');
    await queryInterface.removeColumn('sesiones', 'derivacion_recomendada');
    await queryInterface.removeColumn('sesiones', 'archivos_sesion');
  }
};
