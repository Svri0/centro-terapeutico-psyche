'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('objetivos_terapeuticos', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      nombre: {
        type: Sequelize.STRING(200),
        allowNull: false,
        unique: true,
      },
      descripcion: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      categoria: {
        type: Sequelize.ENUM('emocional', 'cognitivo', 'conductual', 'social'),
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
    await queryInterface.addIndex('objetivos_terapeuticos', ['nombre'], {
      unique: true,
      name: 'uk_objetivos_terapeuticos_nombre',
    });
    await queryInterface.addIndex('objetivos_terapeuticos', ['categoria'], {
      name: 'idx_objetivos_terapeuticos_categoria',
    });
    await queryInterface.addIndex('objetivos_terapeuticos', ['activo'], {
      name: 'idx_objetivos_terapeuticos_activo',
    });

    // Insertar objetivos predefinidos
    await queryInterface.bulkInsert('objetivos_terapeuticos', [
      {
        id: Sequelize.literal('gen_random_uuid()'),
        nombre: 'Reducir ansiedad',
        descripcion: 'Trabajar técnicas para disminuir niveles de ansiedad',
        categoria: 'emocional',
        activo: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: Sequelize.literal('gen_random_uuid()'),
        nombre: 'Mejorar autoestima',
        descripcion: 'Fortalecer la percepción positiva de sí mismo',
        categoria: 'cognitivo',
        activo: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: Sequelize.literal('gen_random_uuid()'),
        nombre: 'Manejo de ira',
        descripcion: 'Desarrollar estrategias de control emocional',
        categoria: 'emocional',
        activo: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: Sequelize.literal('gen_random_uuid()'),
        nombre: 'Habilidades sociales',
        descripcion: 'Mejorar comunicación y relaciones interpersonales',
        categoria: 'social',
        activo: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: Sequelize.literal('gen_random_uuid()'),
        nombre: 'Reestructuración cognitiva',
        descripcion: 'Modificar pensamientos distorsionados',
        categoria: 'cognitivo',
        activo: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: Sequelize.literal('gen_random_uuid()'),
        nombre: 'Control de impulsos',
        descripcion: 'Desarrollar autocontrol y reflexión antes de actuar',
        categoria: 'conductual',
        activo: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: Sequelize.literal('gen_random_uuid()'),
        nombre: 'Resolución de conflictos',
        descripcion: 'Mejorar habilidades para resolver conflictos interpersonales',
        categoria: 'social',
        activo: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: Sequelize.literal('gen_random_uuid()'),
        nombre: 'Manejo del estrés',
        descripcion: 'Técnicas de afrontamiento del estrés',
        categoria: 'emocional',
        activo: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('objetivos_terapeuticos');
  },
};

