'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Verificar si ya existen roles antes de insertar
    const existingRoles = await queryInterface.sequelize.query(
      'SELECT id FROM roles WHERE id IN (1, 2, 3, 4)',
      { type: Sequelize.QueryTypes.SELECT }
    );

    const existingIds = existingRoles.map(role => role.id);
    const rolesToInsert = [];

    // Solo insertar roles que no existen
    if (!existingIds.includes(1)) {
      rolesToInsert.push({
        id: 1,
        nombre: 'administrador',
        descripcion: 'Administrador del sistema con acceso completo',
        permisos: JSON.stringify({
          usuarios: ['crear', 'leer', 'actualizar', 'eliminar'],
          pacientes: ['crear', 'leer', 'actualizar', 'eliminar'],
          sesiones: ['crear', 'leer', 'actualizar', 'eliminar'],
          tareas: ['crear', 'leer', 'actualizar', 'eliminar'],
          reportes: ['crear', 'leer', 'actualizar', 'eliminar'],
          configuracion: ['leer', 'actualizar'],
          auditoria: ['leer'],
          dashboard: ['leer']
        }),
        activo: true,
        created_at: new Date(),
        updated_at: new Date()
      });
    }

    if (!existingIds.includes(2)) {
      rolesToInsert.push({
        id: 2,
        nombre: 'psicologo',
        descripcion: 'Psicólogo con acceso a pacientes asignados',
        permisos: JSON.stringify({
          pacientes: ['crear', 'leer', 'actualizar'],
          sesiones: ['crear', 'leer', 'actualizar'],
          tareas: ['crear', 'leer', 'actualizar'],
          mensajes: ['crear', 'leer', 'actualizar'],
          reportes: ['crear', 'leer'],
          dashboard: ['leer']
        }),
        activo: true,
        created_at: new Date(),
        updated_at: new Date()
      });
    }

    if (!existingIds.includes(3)) {
      rolesToInsert.push({
        id: 3,
        nombre: 'paciente',
        descripcion: 'Paciente con acceso limitado a su información',
        permisos: JSON.stringify({
          perfil: ['leer', 'actualizar'],
          sesiones: ['leer'],
          tareas: ['leer', 'actualizar'],
          mensajes: ['crear', 'leer'],
          archivos: ['leer']
        }),
        activo: true,
        created_at: new Date(),
        updated_at: new Date()
      });
    }

    if (!existingIds.includes(4)) {
      rolesToInsert.push({
        id: 4,
        nombre: 'recepcionista',
        descripcion: 'Personal de recepción con acceso a gestión de agenda, pacientes y pagos',
        permisos: JSON.stringify({
          pacientes: ['crear', 'leer', 'actualizar'],
          citas: ['crear', 'leer', 'actualizar', 'eliminar'],
          pagos: ['crear', 'leer', 'actualizar'],
          agenda: ['leer', 'actualizar'],
          mensajes: ['crear', 'leer'],
          reportes: ['leer'],
          dashboard: ['leer']
        }),
        activo: true,
        created_at: new Date(),
        updated_at: new Date()
      });
    }

    // Solo insertar si hay roles para insertar
    if (rolesToInsert.length > 0) {
      await queryInterface.bulkInsert('roles', rolesToInsert, {});
      console.log(`✅ Se insertaron ${rolesToInsert.length} roles nuevos`);
    } else {
      console.log('ℹ️  Todos los roles ya existen, no se insertaron nuevos');
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('roles', null, {});
  }
}; 