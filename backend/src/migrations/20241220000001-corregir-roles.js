'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    console.log('🔄 Corrigiendo mapeo de roles...');
    
    // Solo actualizar usuarios, no los nombres de roles
    // Actualizar pacientes de rol_id 3 a rol_id 4
    await queryInterface.sequelize.query(`
      UPDATE usuarios 
      SET rol_id = 4 
      WHERE rol_id = 3 AND id IN (
        SELECT usuario_id FROM pacientes
      )
    `);
    
    // Actualizar recepcionistas de rol_id 4 a rol_id 3
    await queryInterface.sequelize.query(`
      UPDATE usuarios 
      SET rol_id = 3 
      WHERE rol_id = 4 AND id NOT IN (
        SELECT usuario_id FROM pacientes
      )
    `);
    
    console.log('✅ Roles corregidos exitosamente');
  },

  async down(queryInterface, Sequelize) {
    console.log('🔄 Revirtiendo corrección de roles...');
    
    // Revertir cambios
    await queryInterface.sequelize.query(`
      UPDATE usuarios 
      SET rol_id = 3 
      WHERE rol_id = 4 AND id IN (
        SELECT usuario_id FROM pacientes
      )
    `);
    
    await queryInterface.sequelize.query(`
      UPDATE usuarios 
      SET rol_id = 4 
      WHERE rol_id = 3 AND id NOT IN (
        SELECT usuario_id FROM pacientes
      )
    `);
    
    console.log('✅ Roles revertidos exitosamente');
  }
};
