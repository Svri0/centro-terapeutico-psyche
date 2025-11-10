'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('configuraciones_sistema', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
        primaryKey: true,
        allowNull: false,
      },
      clave: {
        type: Sequelize.STRING(100),
        allowNull: false,
        unique: true,
      },
      valor: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      descripcion: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      tipo: {
        type: Sequelize.ENUM('boolean', 'number', 'string', 'json'),
        allowNull: false,
        defaultValue: 'string',
      },
      categoria: {
        type: Sequelize.ENUM('chat', 'mensajes', 'general', 'backup'),
        allowNull: false,
        defaultValue: 'general',
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
    await queryInterface.addIndex('configuraciones_sistema', ['clave'], {
      unique: true,
      name: 'idx_configuraciones_sistema_clave',
    });

    await queryInterface.addIndex('configuraciones_sistema', ['categoria'], {
      name: 'idx_configuraciones_sistema_categoria',
    });

    await queryInterface.addIndex('configuraciones_sistema', ['activo'], {
      name: 'idx_configuraciones_sistema_activo',
    });

    // Insertar configuraciones iniciales
    await queryInterface.bulkInsert('configuraciones_sistema', [
      {
        id: Sequelize.literal('gen_random_uuid()'),
        clave: 'chat.respuestas_pacientes_habilitadas',
        valor: 'true',
        descripcion: 'Permite o deshabilita que los pacientes puedan responder mensajes',
        tipo: 'boolean',
        categoria: 'chat',
        activo: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: Sequelize.literal('gen_random_uuid()'),
        clave: 'chat.limite_mensajes_por_paciente',
        valor: '0',
        descripcion: 'Límite de mensajes que puede enviar un paciente. 0 = ilimitado',
        tipo: 'number',
        categoria: 'chat',
        activo: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: Sequelize.literal('gen_random_uuid()'),
        clave: 'chat.modo_mensajeria',
        valor: 'libre',
        descripcion: 'Modo de mensajería: libre (sin límites) o limitado (con límite de mensajes)',
        tipo: 'string',
        categoria: 'chat',
        activo: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('configuraciones_sistema');
  }
};

