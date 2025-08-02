'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('servicios_psicologo', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      psicologo_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'usuarios',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      tipo_servicio_id: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: 'ID del tipo de servicio predefinido'
      },
      nombre: {
        type: Sequelize.STRING,
        allowNull: false
      },
      descripcion: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      duracion: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: 'Duración en minutos'
      },
      categoria: {
        type: Sequelize.STRING,
        allowNull: false
      },
      activo: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Agregar índices
    await queryInterface.addIndex('servicios_psicologo', ['psicologo_id']);
    await queryInterface.addIndex('servicios_psicologo', ['tipo_servicio_id']);
    await queryInterface.addIndex('servicios_psicologo', ['activo']);
    
    // Índice único para evitar servicios duplicados
    await queryInterface.addIndex('servicios_psicologo', ['psicologo_id', 'tipo_servicio_id'], {
      unique: true,
      name: 'servicios_psicologo_unique'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('servicios_psicologo');
  }
}; 