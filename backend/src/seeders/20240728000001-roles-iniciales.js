'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('roles', [
      {
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
      },
      {
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
      },
      {
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
      },
      {
        id: 4,
        nombre: 'recepcionista',
        descripcion: 'Personal de recepción con acceso limitado',
        permisos: JSON.stringify({
          pacientes: ['leer'],
          sesiones: ['crear', 'leer', 'actualizar'],
          agenda: ['leer', 'actualizar']
        }),
        activo: true,
        created_at: new Date(),
        updated_at: new Date()
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('roles', null, {});
  }
}; 