'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('citas', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4
      },
      paciente_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'pacientes',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
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
      fecha: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      hora_inicio: {
        type: Sequelize.TIME,
        allowNull: false
      },
      hora_fin: {
        type: Sequelize.TIME,
        allowNull: false
      },
      duracion_minutos: {
        type: Sequelize.INTEGER,
        defaultValue: 60
      },
      estado: {
        type: Sequelize.ENUM('programada', 'confirmada', 'en_progreso', 'completada', 'cancelada', 'no_show'),
        defaultValue: 'programada'
      },
      tipo_sesion: {
        type: Sequelize.ENUM('individual', 'grupal', 'familiar', 'evaluacion', 'seguimiento'),
        defaultValue: 'individual'
      },
      modalidad: {
        type: Sequelize.ENUM('presencial', 'virtual', 'telefonica'),
        defaultValue: 'presencial'
      },
      notas_paciente: {
        type: Sequelize.TEXT
      },
      notas_psicologo: {
        type: Sequelize.TEXT
      },
      recordatorio_enviado: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Índices para optimizar consultas
    await queryInterface.addIndex('citas', ['paciente_id']);
    await queryInterface.addIndex('citas', ['psicologo_id']);
    await queryInterface.addIndex('citas', ['fecha']);
    await queryInterface.addIndex('citas', ['estado']);
    await queryInterface.addIndex('citas', ['psicologo_id', 'fecha']);
    await queryInterface.addIndex('citas', ['paciente_id', 'fecha']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('citas');
  }
}; 