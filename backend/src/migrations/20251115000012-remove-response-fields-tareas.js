'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    console.log('🔄 Migrando respuestas de tareas a tabla respuestas_tareas...');
    
    // Migrar respuestas existentes a respuestas_tareas
    const [tareasConRespuesta] = await queryInterface.sequelize.query(`
      SELECT id, paciente_id, respuesta_paciente, archivos_respuesta, fecha_completada, evaluacion_psicologo
      FROM tareas
      WHERE respuesta_paciente IS NOT NULL
         OR archivos_respuesta IS NOT NULL
         OR fecha_completada IS NOT NULL
    `);
    
    console.log(`📊 Encontradas ${tareasConRespuesta.length} tareas con respuestas para migrar`);
    
    // Insertar en respuestas_tareas
    for (const tarea of tareasConRespuesta) {
      if (tarea.respuesta_paciente || tarea.archivos_respuesta) {
        await queryInterface.sequelize.query(`
          INSERT INTO respuestas_tareas (id, tarea_id, paciente_id, contenido_respuesta, fecha_envio, evaluacion_psicologo, created_at, updated_at)
          VALUES (
            gen_random_uuid(),
            :tarea_id,
            :paciente_id,
            :contenido_respuesta,
            COALESCE(:fecha_completada, NOW()),
            :evaluacion_psicologo,
            NOW(),
            NOW()
          )
          ON CONFLICT DO NOTHING
        `, {
          replacements: {
            tarea_id: tarea.id,
            paciente_id: tarea.paciente_id,
            contenido_respuesta: tarea.respuesta_paciente,
            fecha_completada: tarea.fecha_completada,
            evaluacion_psicologo: tarea.evaluacion_psicologo,
          },
        });
      }
    }
    
    // Eliminar columnas de respuesta de tareas
    await queryInterface.removeColumn('tareas', 'respuesta_paciente');
    await queryInterface.removeColumn('tareas', 'archivos_respuesta');
    await queryInterface.removeColumn('tareas', 'fecha_completada');
    await queryInterface.removeColumn('tareas', 'tipo_tarea_avanzado');
    await queryInterface.removeColumn('tareas', 'archivos_adjuntos');
    
    console.log('✅ Campos de respuesta eliminados de tareas');
  },

  async down(queryInterface, Sequelize) {
    // Restaurar columnas
    await queryInterface.addColumn('tareas', 'respuesta_paciente', {
      type: Sequelize.TEXT,
      allowNull: true,
    });
    await queryInterface.addColumn('tareas', 'archivos_respuesta', {
      type: Sequelize.JSONB,
      allowNull: false,
      defaultValue: [],
    });
    await queryInterface.addColumn('tareas', 'fecha_completada', {
      type: Sequelize.DATE,
      allowNull: true,
    });
    await queryInterface.addColumn('tareas', 'tipo_tarea_avanzado', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('tareas', 'archivos_adjuntos', {
      type: Sequelize.JSONB,
      allowNull: false,
      defaultValue: [],
    });
    
    // Migrar de vuelta desde respuestas_tareas (solo la última respuesta)
    await queryInterface.sequelize.query(`
      UPDATE tareas t
      SET 
        respuesta_paciente = r.contenido_respuesta,
        fecha_completada = r.fecha_envio,
        evaluacion_psicologo = r.evaluacion_psicologo
      FROM (
        SELECT DISTINCT ON (tarea_id) 
          tarea_id, contenido_respuesta, fecha_envio, evaluacion_psicologo
        FROM respuestas_tareas
        ORDER BY tarea_id, fecha_envio DESC
      ) r
      WHERE t.id = r.tarea_id
    `);
  },
};

