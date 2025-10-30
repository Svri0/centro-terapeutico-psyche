'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Crear el ENUM para progreso_general
    await queryInterface.sequelize.query(`
      DO $$ BEGIN
        CREATE TYPE "enum_reportes_progreso_progreso_general" AS ENUM ('excelente', 'muy_bueno', 'bueno', 'regular', 'necesita_atencion');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    // Crear el ENUM para estado
    await queryInterface.sequelize.query(`
      DO $$ BEGIN
        CREATE TYPE "enum_reportes_progreso_estado" AS ENUM ('borrador', 'completado', 'archivado');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await queryInterface.createTable('reportes_progreso', {
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
      fecha_reporte: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      periodo_inicio: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      periodo_fin: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      resumen_evolucion: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      objetivos_cumplidos: {
        type: Sequelize.JSONB,
        allowNull: false,
        defaultValue: []
      },
      objetivos_pendientes: {
        type: Sequelize.JSONB,
        allowNull: false,
        defaultValue: []
      },
      areas_trabajadas: {
        type: Sequelize.JSONB,
        allowNull: false,
        defaultValue: []
      },
      conductas_observadas: {
        type: Sequelize.JSONB,
        allowNull: false,
        defaultValue: []
      },
      logros_importantes: {
        type: Sequelize.JSONB,
        allowNull: false,
        defaultValue: []
      },
      desafios_identificados: {
        type: Sequelize.JSONB,
        allowNull: false,
        defaultValue: []
      },
      sugerencias_terapeuticas: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      progreso_general: {
        type: 'enum_reportes_progreso_progreso_general',
        allowNull: false
      },
      metrica_satisfaccion: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      observaciones_adicionales: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      documento_adjunto: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      estado: {
        type: 'enum_reportes_progreso_estado',
        allowNull: false,
        defaultValue: 'borrador'
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
    await queryInterface.addIndex('reportes_progreso', ['paciente_id']);
    await queryInterface.addIndex('reportes_progreso', ['psicologo_id']);
    await queryInterface.addIndex('reportes_progreso', ['sesion_id']);
    await queryInterface.addIndex('reportes_progreso', ['fecha_reporte']);
    await queryInterface.addIndex('reportes_progreso', ['estado']);
    await queryInterface.addIndex('reportes_progreso', ['progreso_general']);
    await queryInterface.addIndex('reportes_progreso', ['periodo_inicio', 'periodo_fin']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('reportes_progreso');
    
    // Eliminar los ENUMs
    await queryInterface.sequelize.query(`
      DROP TYPE IF EXISTS "enum_reportes_progreso_progreso_general";
    `);
    await queryInterface.sequelize.query(`
      DROP TYPE IF EXISTS "enum_reportes_progreso_estado";
    `);
  }
};

