'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      // Crear tabla de respuestas solo si no existe
      await queryInterface.createTable('respuestas_tareas', {
        id: {
          type: Sequelize.UUID,
          defaultValue: Sequelize.UUIDV4,
          primaryKey: true,
        },
        tarea_id: {
          type: Sequelize.UUID,
          allowNull: false,
          references: {
            model: 'tareas',
            key: 'id',
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE',
        },
        paciente_id: {
          type: Sequelize.UUID,
          allowNull: false,
          references: {
            model: 'pacientes',
            key: 'id',
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE',
        },
        contenido_respuesta: {
          type: Sequelize.TEXT,
          allowNull: true,
        },
        archivo_respuesta: {
          type: Sequelize.TEXT,
          allowNull: true,
        },
        fecha_envio: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.NOW,
        },
        evaluacion_psicologo: {
          type: Sequelize.JSONB,
          allowNull: true,
        },
        created_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.NOW,
        },
        updated_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.NOW,
        },
      });
    } catch (error) {
      console.log('Tabla respuestas_tareas ya existe o error:', error.message);
    }

    // Agregar nuevas columnas a la tabla tareas
    try {
      await queryInterface.addColumn('tareas', 'contenido_tarea', {
        type: Sequelize.JSONB,
        allowNull: true,
        comment: 'Contenido específico según el tipo de tarea (preguntas, opciones, imágenes, etc.)',
      });
    } catch (error) {
      console.log('Columna contenido_tarea ya existe');
    }

    try {
      await queryInterface.addColumn('tareas', 'configuracion_tarea', {
        type: Sequelize.JSONB,
        allowNull: true,
        comment: 'Configuración específica (múltiple selección, tiempo límite, etc.)',
      });
    } catch (error) {
      console.log('Columna configuracion_tarea ya existe');
    }

    try {
      await queryInterface.addColumn('tareas', 'es_borrador', {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      });
    } catch (error) {
      console.log('Columna es_borrador ya existe');
    }

    try {
      await queryInterface.addColumn('tareas', 'fecha_publicacion', {
        type: Sequelize.DATE,
        allowNull: true,
      });
    } catch (error) {
      console.log('Columna fecha_publicacion ya existe');
    }

    // Agregar índices
    try {
      await queryInterface.addIndex('respuestas_tareas', ['tarea_id']);
      await queryInterface.addIndex('respuestas_tareas', ['paciente_id']);
      await queryInterface.addIndex('respuestas_tareas', ['fecha_envio']);
      await queryInterface.addIndex('tareas', ['es_borrador']);
      await queryInterface.addIndex('tareas', ['fecha_publicacion']);
    } catch (error) {
      console.log('Algunos índices ya existen:', error.message);
    }
  },

  down: async (queryInterface, Sequelize) => {
    try {
      await queryInterface.dropTable('respuestas_tareas');
    } catch (error) {
      console.log('Error al eliminar tabla respuestas_tareas:', error.message);
    }

    try {
      await queryInterface.removeColumn('tareas', 'contenido_tarea');
    } catch (error) {
      console.log('Error al eliminar contenido_tarea:', error.message);
    }

    try {
      await queryInterface.removeColumn('tareas', 'configuracion_tarea');
    } catch (error) {
      console.log('Error al eliminar configuracion_tarea:', error.message);
    }

    try {
      await queryInterface.removeColumn('tareas', 'es_borrador');
    } catch (error) {
      console.log('Error al eliminar es_borrador:', error.message);
    }

    try {
      await queryInterface.removeColumn('tareas', 'fecha_publicacion');
    } catch (error) {
      console.log('Error al eliminar fecha_publicacion:', error.message);
    }
  }
};
