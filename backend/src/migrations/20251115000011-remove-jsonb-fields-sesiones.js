'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    console.log('🔄 Migrando campos JSONB de sesiones a tablas normalizadas...');
    
    // IMPORTANTE: Antes de eliminar, migrar datos existentes
    // Esto es opcional si no hay datos históricos importantes
    
    const [sesiones] = await queryInterface.sequelize.query(`
      SELECT id, objetivos_sesion, tecnicas_utilizadas, evaluacion_paciente
      FROM sesiones
      WHERE objetivos_sesion IS NOT NULL 
         OR tecnicas_utilizadas IS NOT NULL
         OR evaluacion_paciente IS NOT NULL
    `);
    
    console.log(`📊 Encontradas ${sesiones.length} sesiones con datos JSONB para migrar`);
    
    // TODO: Migrar objetivos_sesion → sesion_objetivos
    // TODO: Migrar tecnicas_utilizadas → sesion_tecnicas
    // TODO: Migrar evaluacion_paciente → evaluaciones_sesion
    
    // Por ahora, solo eliminamos las columnas
    // En producción, primero deberías migrar los datos
    
    await queryInterface.removeColumn('sesiones', 'objetivos_sesion');
    await queryInterface.removeColumn('sesiones', 'tecnicas_utilizadas');
    await queryInterface.removeColumn('sesiones', 'evaluacion_paciente');
    await queryInterface.removeColumn('sesiones', 'objetivos_alcanzados');
    await queryInterface.removeColumn('sesiones', 'tareas_asignadas');
    await queryInterface.removeColumn('sesiones', 'archivos_sesion');
    await queryInterface.removeColumn('sesiones', 'archivos_adjuntos');
    await queryInterface.removeColumn('sesiones', 'derivacion_recomendada');
    
    console.log('✅ Campos JSONB eliminados de sesiones');
  },

  async down(queryInterface, Sequelize) {
    // Restaurar columnas JSONB
    await queryInterface.addColumn('sesiones', 'objetivos_sesion', {
      type: Sequelize.JSONB,
      allowNull: false,
      defaultValue: [],
    });
    await queryInterface.addColumn('sesiones', 'tecnicas_utilizadas', {
      type: Sequelize.JSONB,
      allowNull: false,
      defaultValue: [],
    });
    await queryInterface.addColumn('sesiones', 'evaluacion_paciente', {
      type: Sequelize.JSONB,
      allowNull: true,
    });
    await queryInterface.addColumn('sesiones', 'objetivos_alcanzados', {
      type: Sequelize.JSONB,
      allowNull: false,
      defaultValue: [],
    });
    await queryInterface.addColumn('sesiones', 'tareas_asignadas', {
      type: Sequelize.JSONB,
      allowNull: false,
      defaultValue: [],
    });
    await queryInterface.addColumn('sesiones', 'archivos_sesion', {
      type: Sequelize.JSONB,
      allowNull: false,
      defaultValue: [],
    });
    await queryInterface.addColumn('sesiones', 'archivos_adjuntos', {
      type: Sequelize.JSONB,
      allowNull: false,
      defaultValue: [],
    });
    await queryInterface.addColumn('sesiones', 'derivacion_recomendada', {
      type: Sequelize.JSONB,
      allowNull: false,
      defaultValue: {},
    });
  },
};

