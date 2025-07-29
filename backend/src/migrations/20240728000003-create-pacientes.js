'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('pacientes', {
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
      numero_ficha: {
        type: Sequelize.STRING(20),
        allowNull: false,
        unique: true
      },
      rut: {
        type: Sequelize.STRING(12),
        allowNull: true,
        unique: true
      },
      direccion: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      contacto_emergencia_nombre: {
        type: Sequelize.STRING(200),
        allowNull: true
      },
      contacto_emergencia_telefono: {
        type: Sequelize.STRING(20),
        allowNull: true
      },
      contacto_emergencia_relacion: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      diagnosticos: {
        type: Sequelize.JSONB,
        allowNull: false,
        defaultValue: []
      },
      etiquetas: {
        type: Sequelize.JSONB,
        allowNull: false,
        defaultValue: []
      },
      estrategias_autorregulacion: {
        type: Sequelize.JSONB,
        allowNull: false,
        defaultValue: []
      },
      puntos_acumulados: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      estado: {
        type: Sequelize.ENUM('activo', 'inactivo', 'alta', 'derivado'),
        allowNull: false,
        defaultValue: 'activo'
      },
      fecha_ingreso: {
        type: Sequelize.DATEONLY,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      fecha_alta: {
        type: Sequelize.DATEONLY,
        allowNull: true
      },
      observaciones: {
        type: Sequelize.TEXT,
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
    await queryInterface.addIndex('pacientes', ['usuario_id']);
    await queryInterface.addIndex('pacientes', ['psicologo_id']);
    await queryInterface.addIndex('pacientes', ['numero_ficha']);
    await queryInterface.addIndex('pacientes', ['rut']);
    await queryInterface.addIndex('pacientes', ['estado']);
    await queryInterface.addIndex('pacientes', ['fecha_ingreso']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('pacientes');
  }
}; 