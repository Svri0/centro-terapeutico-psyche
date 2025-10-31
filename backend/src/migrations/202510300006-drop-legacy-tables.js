'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    // Eliminar tablas legacy si existen
    await queryInterface.sequelize.query(`
      DO $$ BEGIN
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'citas') THEN
          DROP TABLE citas CASCADE;
        END IF;
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'disponibilidad_psicologos') THEN
          DROP TABLE disponibilidad_psicologos CASCADE;
        END IF;
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'disponibilidad_semanal') THEN
          DROP TABLE disponibilidad_semanal CASCADE;
        END IF;
      END $$;
    `);
  },

  async down() {
    // No se recrean tablas legacy
  }
};


