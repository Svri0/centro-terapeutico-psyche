'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('disponibilidad_semanal', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      psicologo_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'usuarios',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      semana_inicio: {
        type: Sequelize.DATEONLY,
        allowNull: false,
        comment: 'Fecha de inicio de la semana (lunes)'
      },
      semana_fin: {
        type: Sequelize.DATEONLY,
        allowNull: false,
        comment: 'Fecha de fin de la semana (domingo)'
      },
      lunes_horarios: {
        type: Sequelize.JSONB,
        allowNull: true,
        comment: 'Array de horarios para lunes: [{hora_inicio, hora_fin, activo}]'
      },
      martes_horarios: {
        type: Sequelize.JSONB,
        allowNull: true,
        comment: 'Array de horarios para martes'
      },
      miercoles_horarios: {
        type: Sequelize.JSONB,
        allowNull: true,
        comment: 'Array de horarios para miércoles'
      },
      jueves_horarios: {
        type: Sequelize.JSONB,
        allowNull: true,
        comment: 'Array de horarios para jueves'
      },
      viernes_horarios: {
        type: Sequelize.JSONB,
        allowNull: true,
        comment: 'Array de horarios para viernes'
      },
      sabado_horarios: {
        type: Sequelize.JSONB,
        allowNull: true,
        comment: 'Array de horarios para sábado'
      },
      domingo_horarios: {
        type: Sequelize.JSONB,
        allowNull: true,
        comment: 'Array de horarios para domingo'
      },
      total_horas_semana: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: 'Total de horas trabajadas en la semana'
      },
      feriados: {
        type: Sequelize.JSONB,
        allowNull: true,
        comment: 'Array de fechas de feriados: [{fecha, nombre}]'
      },
      dias_vacaciones: {
        type: Sequelize.JSONB,
        allowNull: true,
        comment: 'Array de fechas de vacaciones: [{fecha_inicio, fecha_fin, motivo}]'
      },
      estado: {
        type: Sequelize.ENUM('borrador', 'confirmada', 'activa'),
        allowNull: false,
        defaultValue: 'borrador'
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

    // Índices para optimizar consultas
    await queryInterface.addIndex('disponibilidad_semanal', ['psicologo_id', 'semana_inicio']);
    await queryInterface.addIndex('disponibilidad_semanal', ['estado']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('disponibilidad_semanal');
  }
}; 