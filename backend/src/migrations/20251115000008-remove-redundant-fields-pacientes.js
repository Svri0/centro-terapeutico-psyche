'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // CRÍTICO: Eliminar campos redundantes de pacientes
    // Estos campos ya existen en usuarios, por lo que se obtienen via JOIN
    
    console.log('🔄 Eliminando campos redundantes de pacientes...');
    
    // Verificar que no haya datos inconsistentes antes de eliminar
    const [inconsistencias] = await queryInterface.sequelize.query(`
      SELECT COUNT(*) as total
      FROM pacientes p
      INNER JOIN usuarios u ON p.usuario_id = u.id
      WHERE 
        (p.nombres IS NOT NULL AND p.nombres != u.nombres) OR
        (p.apellidos IS NOT NULL AND p.apellidos != u.apellidos) OR
        (p.email IS NOT NULL AND p.email != u.email)
    `);
    
    if (inconsistencias[0].total > 0) {
      console.warn(`⚠️ Se encontraron ${inconsistencias[0].total} registros con datos inconsistentes`);
      console.log('🔄 Sincronizando datos antes de eliminar columnas...');
      
      // Sincronizar datos de pacientes con usuarios (preferir usuarios)
      await queryInterface.sequelize.query(`
        UPDATE pacientes p
        SET 
          nombres = u.nombres,
          apellidos = u.apellidos,
          email = u.email,
          telefono = u.telefono,
          fecha_nacimiento = u.fecha_nacimiento,
          genero = u.genero
        FROM usuarios u
        WHERE p.usuario_id = u.id
      `);
    }
    
    // Eliminar columnas redundantes
    await queryInterface.removeColumn('pacientes', 'nombres');
    await queryInterface.removeColumn('pacientes', 'apellidos');
    await queryInterface.removeColumn('pacientes', 'email');
    await queryInterface.removeColumn('pacientes', 'telefono');
    await queryInterface.removeColumn('pacientes', 'fecha_nacimiento');
    await queryInterface.removeColumn('pacientes', 'genero');
    
    console.log('✅ Campos redundantes eliminados de pacientes');
  },

  async down(queryInterface, Sequelize) {
    // Restaurar columnas (para rollback)
    await queryInterface.addColumn('pacientes', 'nombres', {
      type: Sequelize.STRING(100),
      allowNull: true,
    });
    await queryInterface.addColumn('pacientes', 'apellidos', {
      type: Sequelize.STRING(100),
      allowNull: true,
    });
    await queryInterface.addColumn('pacientes', 'email', {
      type: Sequelize.STRING(255),
      allowNull: true,
    });
    await queryInterface.addColumn('pacientes', 'telefono', {
      type: Sequelize.STRING(20),
      allowNull: true,
    });
    await queryInterface.addColumn('pacientes', 'fecha_nacimiento', {
      type: Sequelize.DATEONLY,
      allowNull: true,
    });
    await queryInterface.addColumn('pacientes', 'genero', {
      type: Sequelize.ENUM('masculino', 'femenino', 'no_binario', 'prefiero_no_decir'),
      allowNull: true,
    });
    
    // Restaurar datos desde usuarios
    await queryInterface.sequelize.query(`
      UPDATE pacientes p
      SET 
        nombres = u.nombres,
        apellidos = u.apellidos,
        email = u.email,
        telefono = u.telefono,
        fecha_nacimiento = u.fecha_nacimiento,
        genero = u.genero::text
      FROM usuarios u
      WHERE p.usuario_id = u.id
    `);
  },
};

