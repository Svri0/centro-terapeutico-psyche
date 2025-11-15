'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('tecnicas_terapeuticas', {
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
        type: Sequelize.ENUM('cognitivo-conductual', 'humanista', 'psicodinamica', 'sistemica'),
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
    await queryInterface.addIndex('tecnicas_terapeuticas', ['nombre'], {
      unique: true,
      name: 'uk_tecnicas_terapeuticas_nombre',
    });
    await queryInterface.addIndex('tecnicas_terapeuticas', ['categoria'], {
      name: 'idx_tecnicas_terapeuticas_categoria',
    });
    await queryInterface.addIndex('tecnicas_terapeuticas', ['activo'], {
      name: 'idx_tecnicas_terapeuticas_activo',
    });

    // Insertar técnicas predefinidas
    await queryInterface.bulkInsert('tecnicas_terapeuticas', [
      {
        id: Sequelize.literal('gen_random_uuid()'),
        nombre: 'Exposición gradual',
        descripcion: 'Técnica para enfrentar miedos de forma progresiva',
        categoria: 'cognitivo-conductual',
        activo: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: Sequelize.literal('gen_random_uuid()'),
        nombre: 'Reestructuración cognitiva',
        descripcion: 'Identificar y modificar pensamientos irracionales',
        categoria: 'cognitivo-conductual',
        activo: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: Sequelize.literal('gen_random_uuid()'),
        nombre: 'Mindfulness',
        descripcion: 'Técnicas de atención plena',
        categoria: 'humanista',
        activo: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: Sequelize.literal('gen_random_uuid()'),
        nombre: 'Role-playing',
        descripcion: 'Simulación de situaciones para practicar habilidades',
        categoria: 'sistemica',
        activo: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: Sequelize.literal('gen_random_uuid()'),
        nombre: 'Técnica de la silla vacía',
        descripcion: 'Trabajo con conflictos internos',
        categoria: 'humanista',
        activo: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: Sequelize.literal('gen_random_uuid()'),
        nombre: 'Relajación progresiva',
        descripcion: 'Técnica de relajación muscular',
        categoria: 'cognitivo-conductual',
        activo: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: Sequelize.literal('gen_random_uuid()'),
        nombre: 'Registro de pensamientos',
        descripcion: 'Documentar y analizar patrones de pensamiento',
        categoria: 'cognitivo-conductual',
        activo: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: Sequelize.literal('gen_random_uuid()'),
        nombre: 'Genograma familiar',
        descripcion: 'Mapeo de relaciones familiares',
        categoria: 'sistemica',
        activo: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('tecnicas_terapeuticas');
  },
};

