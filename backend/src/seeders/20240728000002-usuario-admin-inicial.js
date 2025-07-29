'use strict';

const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Verificar si ya existe un usuario administrador
    const existingAdmin = await queryInterface.sequelize.query(
      `SELECT u.id FROM usuarios u 
       INNER JOIN roles r ON u.rol_id = r.id 
       WHERE r.nombre = 'administrador' LIMIT 1`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    if (existingAdmin.length > 0) {
      console.log('ℹ️  Ya existe un usuario administrador, no se creará uno nuevo');
      return;
    }

    // Obtener el rol de administrador
    const adminRole = await queryInterface.sequelize.query(
      "SELECT id FROM roles WHERE nombre = 'administrador'",
      { type: Sequelize.QueryTypes.SELECT }
    );

    if (adminRole.length === 0) {
      console.log('❌ Error: No se encontró el rol de administrador');
      return;
    }

    // Crear hash de la contraseña
    const passwordHash = await bcrypt.hash('Admin123!', 12);

    // Crear usuario administrador inicial
    const adminUser = {
      id: uuidv4(),
      nombres: 'Administrador',
      apellidos: 'Sistema',
      email: 'admin@terapia.cl',
      password_hash: passwordHash,
      telefono: '+56912345678',
      rol_id: adminRole[0].id,
      activo: true,
      email_verificado: true,
      configuracion: JSON.stringify({}),
      created_at: new Date(),
      updated_at: new Date()
    };

    await queryInterface.bulkInsert('usuarios', [adminUser], {});
    
    console.log('✅ Usuario administrador creado exitosamente');
    console.log('📧 Email: admin@terapia.cl');
    console.log('🔑 Contraseña: Admin123!');
    console.log('⚠️  IMPORTANTE: Cambia la contraseña después del primer inicio de sesión');
  },

  async down(queryInterface, Sequelize) {
    // Eliminar usuario administrador inicial
    await queryInterface.sequelize.query(
      "DELETE FROM usuarios WHERE email = 'admin@terapia.cl'"
    );
  }
}; 