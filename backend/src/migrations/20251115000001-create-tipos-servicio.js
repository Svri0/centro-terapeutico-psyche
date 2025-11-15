'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('tipos_servicio', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      codigo: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true,
      },
      nombre: {
        type: Sequelize.STRING(200),
        allowNull: false,
      },
      descripcion: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      duracion_estandar_minutos: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      categoria: {
        type: Sequelize.ENUM('evaluacion', 'terapia', 'consulta'),
        allowNull: false,
      },
      activo: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
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
    await queryInterface.addIndex('tipos_servicio', ['codigo'], {
      unique: true,
      name: 'uk_tipos_servicio_codigo',
    });
    await queryInterface.addIndex('tipos_servicio', ['categoria'], {
      name: 'idx_tipos_servicio_categoria',
    });
    await queryInterface.addIndex('tipos_servicio', ['activo'], {
      name: 'idx_tipos_servicio_activo',
    });

    // Insertar tipos de servicio predefinidos
    await queryInterface.bulkInsert('tipos_servicio', [
      {
        id: Sequelize.literal('gen_random_uuid()'),
        codigo: 'EVAL_INICIAL',
        nombre: 'Evaluación Inicial',
        descripcion: 'Primera sesión de evaluación del paciente',
        duracion_estandar_minutos: 60,
        categoria: 'evaluacion',
        activo: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: Sequelize.literal('gen_random_uuid()'),
        codigo: 'TERAPIA_IND',
        nombre: 'Terapia Individual',
        descripcion: 'Sesión de terapia individual estándar',
        duracion_estandar_minutos: 45,
        categoria: 'terapia',
        activo: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: Sequelize.literal('gen_random_uuid()'),
        codigo: 'TERAPIA_PAREJA',
        nombre: 'Terapia de Pareja',
        descripcion: 'Sesión de terapia de pareja',
        duracion_estandar_minutos: 60,
        categoria: 'terapia',
        activo: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: Sequelize.literal('gen_random_uuid()'),
        codigo: 'TERAPIA_FAM',
        nombre: 'Terapia Familiar',
        descripcion: 'Sesión de terapia familiar',
        duracion_estandar_minutos: 90,
        categoria: 'terapia',
        activo: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: Sequelize.literal('gen_random_uuid()'),
        codigo: 'CONSULTA',
        nombre: 'Consulta General',
        descripcion: 'Consulta breve',
        duracion_estandar_minutos: 30,
        categoria: 'consulta',
        activo: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('tipos_servicio');
  },
};

