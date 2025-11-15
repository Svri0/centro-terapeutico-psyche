'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    console.log('🔄 Normalizando servicios_psicologo...');
    
    // Paso 1: Crear columna temporal UUID
    await queryInterface.addColumn('servicios_psicologo', 'tipo_servicio_id_uuid', {
      type: Sequelize.UUID,
      allowNull: true,
    });
    
    // Paso 2: Mapear códigos existentes a UUIDs de tipos_servicio
    const [tipos] = await queryInterface.sequelize.query(`
      SELECT id, codigo FROM tipos_servicio
    `);
    
    for (const tipo of tipos) {
      await queryInterface.sequelize.query(`
        UPDATE servicios_psicologo
        SET tipo_servicio_id_uuid = :uuid
        WHERE tipo_servicio_id = :codigo
      `, {
        replacements: {
          uuid: tipo.id,
          codigo: tipo.codigo,
        },
      });
    }
    
    // Paso 3: Eliminar columna antigua
    await queryInterface.removeColumn('servicios_psicologo', 'tipo_servicio_id');
    
    // Paso 4: Renombrar columna temporal
    await queryInterface.renameColumn('servicios_psicologo', 'tipo_servicio_id_uuid', 'tipo_servicio_id');
    
    // Paso 5: Hacer la columna NOT NULL y agregar FK
    await queryInterface.changeColumn('servicios_psicologo', 'tipo_servicio_id', {
      type: Sequelize.UUID,
      allowNull: false,
      references: {
        model: 'tipos_servicio',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    });
    
    // Paso 6: Agregar índice
    await queryInterface.addIndex('servicios_psicologo', ['tipo_servicio_id'], {
      name: 'idx_servicios_psicologo_tipo_servicio',
    });
    
    console.log('✅ servicios_psicologo normalizado');
  },

  async down(queryInterface, Sequelize) {
    // Restaurar a STRING
    await queryInterface.removeConstraint('servicios_psicologo', 'servicios_psicologo_tipo_servicio_id_fkey');
    await queryInterface.removeIndex('servicios_psicologo', 'idx_servicios_psicologo_tipo_servicio');
    
    await queryInterface.addColumn('servicios_psicologo', 'tipo_servicio_id_string', {
      type: Sequelize.STRING(50),
      allowNull: true,
    });
    
    // Mapear UUIDs de vuelta a códigos
    const [tipos] = await queryInterface.sequelize.query(`
      SELECT id, codigo FROM tipos_servicio
    `);
    
    for (const tipo of tipos) {
      await queryInterface.sequelize.query(`
        UPDATE servicios_psicologo
        SET tipo_servicio_id_string = :codigo
        WHERE tipo_servicio_id = :uuid
      `, {
        replacements: {
          codigo: tipo.codigo,
          uuid: tipo.id,
        },
      });
    }
    
    await queryInterface.removeColumn('servicios_psicologo', 'tipo_servicio_id');
    await queryInterface.renameColumn('servicios_psicologo', 'tipo_servicio_id_string', 'tipo_servicio_id');
  },
};

