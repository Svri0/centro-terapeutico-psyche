'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('archivos', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      nombre_original: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      nombre_almacenado: {
        type: Sequelize.STRING(255),
        allowNull: false,
        unique: true,
      },
      ruta_almacenamiento: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      tipo_mime: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      tamano_bytes: {
        type: Sequelize.BIGINT,
        allowNull: true,
      },
      entidad_tipo: {
        type: Sequelize.ENUM('sesion', 'tarea', 'respuesta_tarea', 'reporte', 'paciente'),
        allowNull: false,
      },
      entidad_id: {
        type: Sequelize.UUID,
        allowNull: false,
      },
      subido_por: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'usuarios',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      deleted_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
    });

    // Crear índices
    await queryInterface.addIndex('archivos', ['nombre_almacenado'], {
      unique: true,
      name: 'uk_archivos_nombre_almacenado',
    });
    await queryInterface.addIndex('archivos', ['entidad_tipo', 'entidad_id'], {
      name: 'idx_archivos_entidad',
    });
    await queryInterface.addIndex('archivos', ['subido_por'], {
      name: 'idx_archivos_subido_por',
    });
    await queryInterface.addIndex('archivos', ['created_at'], {
      name: 'idx_archivos_created_at',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('archivos');
  },
};

