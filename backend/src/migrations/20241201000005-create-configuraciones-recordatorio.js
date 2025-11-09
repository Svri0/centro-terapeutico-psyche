'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('configuraciones_recordatorio', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4
      },
      usuario_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'usuarios',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      tipo_evento: {
        type: Sequelize.ENUM(
          'sesion_programada',
          'sesion_confirmada', 
          'sesion_24h_antes',
          'sesion_1h_antes',
          'tarea_asignada',
          'tarea_vencida',
          'tarea_1semana_antes',
          'tarea_1dia_antes'
        ),
        allowNull: false
      },
      canal_notificacion: {
        type: Sequelize.ENUM('email', 'whatsapp', 'push', 'sms'),
        allowNull: false
      },
      activo: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      configuracion_personalizada: {
        type: Sequelize.JSONB,
        allowNull: true,
        defaultValue: {}
      },
      horario_preferido: {
        type: Sequelize.STRING(5), // Formato HH:MM
        allowNull: true
      },
      dias_semana: {
        type: Sequelize.ARRAY(Sequelize.INTEGER),
        allowNull: true,
        defaultValue: [1, 2, 3, 4, 5] // Lunes a Viernes por defecto
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
        allowNull: true,
        type: Sequelize.DATE
      }
    });

    // Crear índices para mejorar el rendimiento
    await queryInterface.addIndex('configuraciones_recordatorio', ['usuario_id']);
    await queryInterface.addIndex('configuraciones_recordatorio', ['tipo_evento']);
    await queryInterface.addIndex('configuraciones_recordatorio', ['canal_notificacion']);
    await queryInterface.addIndex('configuraciones_recordatorio', ['activo']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('configuraciones_recordatorio');
  }
};
