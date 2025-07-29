'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('sesiones', {
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
        onDelete: 'RESTRICT'
      },
      fecha_programada: {
        type: Sequelize.DATE,
        allowNull: false
      },
      fecha_inicio: {
        type: Sequelize.DATE,
        allowNull: true
      },
      fecha_fin: {
        type: Sequelize.DATE,
        allowNull: true
      },
      duracion_minutos: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      tipo_sesion: {
        type: Sequelize.ENUM('presencial', 'virtual', 'telefonica'),
        allowNull: false,
        defaultValue: 'presencial'
      },
      estado: {
        type: Sequelize.ENUM('programada', 'confirmada', 'en_curso', 'completada', 'cancelada', 'no_asistio'),
        allowNull: false,
        defaultValue: 'programada'
      },
      notas_evolucion: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      objetivos_sesion: {
        type: Sequelize.JSONB,
        allowNull: false,
        defaultValue: []
      },
      tecnicas_utilizadas: {
        type: Sequelize.JSONB,
        allowNull: false,
        defaultValue: []
      },
      evaluacion_paciente: {
        type: Sequelize.JSONB,
        allowNull: true
      },
      observaciones: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      archivos_adjuntos: {
        type: Sequelize.JSONB,
        allowNull: false,
        defaultValue: []
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      },
      deleted_at: {
        type: Sequelize.DATE,
        allowNull: true
      }
    });

    // Crear índices
    await queryInterface.addIndex('sesiones', ['paciente_id']);
    await queryInterface.addIndex('sesiones', ['psicologo_id']);
    await queryInterface.addIndex('sesiones', ['fecha_programada']);
    await queryInterface.addIndex('sesiones', ['estado']);
    await queryInterface.addIndex('sesiones', ['tipo_sesion']);
    await queryInterface.addIndex('sesiones', ['fecha_inicio']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('sesiones');
  }
}; 