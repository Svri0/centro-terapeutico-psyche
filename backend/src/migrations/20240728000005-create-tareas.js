'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('tareas', {
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
      sesion_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'sesiones',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      titulo: {
        type: Sequelize.STRING(200),
        allowNull: false
      },
      descripcion: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      instrucciones: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      tipo_tarea: {
        type: Sequelize.ENUM('ejercicio', 'lectura', 'reflexion', 'practica', 'evaluacion'),
        allowNull: false,
        defaultValue: 'ejercicio'
      },
      prioridad: {
        type: Sequelize.ENUM('baja', 'media', 'alta', 'urgente'),
        allowNull: false,
        defaultValue: 'media'
      },
      fecha_asignacion: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      fecha_vencimiento: {
        type: Sequelize.DATE,
        allowNull: true
      },
      fecha_completada: {
        type: Sequelize.DATE,
        allowNull: true
      },
      estado: {
        type: Sequelize.ENUM('pendiente', 'en_progreso', 'completada', 'vencida', 'cancelada'),
        allowNull: false,
        defaultValue: 'pendiente'
      },
      puntos_asignados: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 2
      },
      archivos_adjuntos: {
        type: Sequelize.JSONB,
        allowNull: false,
        defaultValue: []
      },
      respuesta_paciente: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      archivos_respuesta: {
        type: Sequelize.JSONB,
        allowNull: false,
        defaultValue: []
      },
      evaluacion_psicologo: {
        type: Sequelize.JSONB,
        allowNull: true
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
    await queryInterface.addIndex('tareas', ['paciente_id']);
    await queryInterface.addIndex('tareas', ['psicologo_id']);
    await queryInterface.addIndex('tareas', ['sesion_id']);
    await queryInterface.addIndex('tareas', ['estado']);
    await queryInterface.addIndex('tareas', ['fecha_vencimiento']);
    await queryInterface.addIndex('tareas', ['tipo_tarea']);
    await queryInterface.addIndex('tareas', ['prioridad']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('tareas');
  }
}; 