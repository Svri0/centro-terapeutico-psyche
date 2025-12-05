'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('articulos', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
        primaryKey: true,
        allowNull: false,
      },
      titulo: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      slug: {
        type: Sequelize.STRING(255),
        allowNull: false,
        unique: true,
      },
      resumen: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      contenido: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      imagen_url: {
        type: Sequelize.STRING(500),
        allowNull: false,
      },
      categoria: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      autor_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'usuarios',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      tiempo_lectura: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 5,
      },
      publicado: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      fecha_publicacion: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      vistas: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      etiquetas: {
        type: Sequelize.ARRAY(Sequelize.STRING),
        allowNull: false,
        defaultValue: [],
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
    await queryInterface.addIndex('articulos', ['slug'], {
      unique: true,
      name: 'idx_articulos_slug',
    });

    await queryInterface.addIndex('articulos', ['categoria'], {
      name: 'idx_articulos_categoria',
    });

    await queryInterface.addIndex('articulos', ['publicado'], {
      name: 'idx_articulos_publicado',
    });

    await queryInterface.addIndex('articulos', ['fecha_publicacion'], {
      name: 'idx_articulos_fecha_publicacion',
    });

    await queryInterface.addIndex('articulos', ['autor_id'], {
      name: 'idx_articulos_autor_id',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('articulos');
  }
};

