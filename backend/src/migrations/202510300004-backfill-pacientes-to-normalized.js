'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    // Contactos de emergencia: insertar 1er contacto si hay datos en columnas legacy
    await queryInterface.sequelize.query(`
      INSERT INTO contactos_emergencia (id, paciente_id, nombre, telefono, relacion, created_at, updated_at)
      SELECT gen_random_uuid(), p.id, p.contacto_emergencia_nombre, p.contacto_emergencia_telefono, p.contacto_emergencia_relacion, NOW(), NOW()
      FROM pacientes p
      WHERE p.deleted_at IS NULL
        AND (
          p.contacto_emergencia_nombre IS NOT NULL
          OR p.contacto_emergencia_telefono IS NOT NULL
          OR p.contacto_emergencia_relacion IS NOT NULL
        )
        AND NOT EXISTS (
          SELECT 1 FROM contactos_emergencia ce WHERE ce.paciente_id = p.id AND ce.deleted_at IS NULL
        );
    `);

    // Etiquetas: crear etiquetas por nombre y vincular
    await queryInterface.sequelize.query(`
      WITH etiquetas_raw AS (
        SELECT p.id as paciente_id, e as nombre
        FROM pacientes p,
        LATERAL (
          SELECT jsonb_array_elements_text(p.etiquetas) AS e
        ) t
        WHERE p.deleted_at IS NULL
      ),
      etiquetas_distintas AS (
        SELECT DISTINCT trim(nombre) as nombre FROM etiquetas_raw WHERE nombre IS NOT NULL AND nombre <> ''
      )
      INSERT INTO etiquetas (id, nombre, created_at, updated_at)
      SELECT gen_random_uuid(), nombre, NOW(), NOW()
      FROM etiquetas_distintas ed
      WHERE NOT EXISTS (
        SELECT 1 FROM etiquetas e WHERE e.nombre = ed.nombre AND e.deleted_at IS NULL
      );
    `);

    await queryInterface.sequelize.query(`
      INSERT INTO paciente_etiquetas (paciente_id, etiqueta_id, created_at)
      SELECT er.paciente_id, e.id, NOW()
      FROM (
        SELECT p.id as paciente_id, trim(jsonb_array_elements_text(p.etiquetas)) as nombre
        FROM pacientes p
        WHERE p.deleted_at IS NULL
      ) er
      JOIN etiquetas e ON e.nombre = er.nombre
      ON CONFLICT DO NOTHING;
    `);

    // Diagnósticos: soporte para array de strings y de objetos {codigo, nombre}
    // 1) Crear diagnósticos desde objetos
    await queryInterface.sequelize.query(`
      WITH diag_obj AS (
        SELECT 
          p.id as paciente_id,
          (elem->>'codigo')::text as codigo,
          trim(elem->>'nombre') as nombre
        FROM pacientes p,
        LATERAL (
          SELECT jsonb_array_elements(p.diagnosticos) AS elem
        ) t
        WHERE p.deleted_at IS NULL AND jsonb_typeof(elem) = 'object'
      ), diag_clean AS (
        SELECT DISTINCT NULLIF(nombre, '') as nombre, NULLIF(codigo, '') as codigo
        FROM diag_obj
        WHERE nombre IS NOT NULL
      )
      INSERT INTO diagnosticos (id, codigo, nombre, created_at, updated_at)
      SELECT gen_random_uuid(), dc.codigo, dc.nombre, NOW(), NOW()
      FROM diag_clean dc
      WHERE NOT EXISTS (
        SELECT 1 FROM diagnosticos d 
        WHERE (dc.codigo IS NOT NULL AND d.codigo = dc.codigo) OR (dc.codigo IS NULL AND d.nombre = dc.nombre)
      );
    `);

    // 2) Crear diagnósticos desde strings
    await queryInterface.sequelize.query(`
      WITH diag_str AS (
        SELECT DISTINCT trim(jsonb_array_elements_text(p.diagnosticos)) as nombre
        FROM pacientes p
        WHERE p.deleted_at IS NULL
      )
      INSERT INTO diagnosticos (id, nombre, created_at, updated_at)
      SELECT gen_random_uuid(), ds.nombre, NOW(), NOW()
      FROM diag_str ds
      WHERE ds.nombre IS NOT NULL AND ds.nombre <> ''
        AND NOT EXISTS (
          SELECT 1 FROM diagnosticos d WHERE d.nombre = ds.nombre AND d.deleted_at IS NULL
        );
    `);

    // 3) Vincular paciente_diagnosticos desde objetos
    await queryInterface.sequelize.query(`
      INSERT INTO paciente_diagnosticos (paciente_id, diagnostico_id, created_at)
      SELECT p.id, d.id, NOW()
      FROM pacientes p,
      LATERAL (
        SELECT jsonb_array_elements(p.diagnosticos) AS elem
      ) t
      JOIN diagnosticos d
        ON (
          (jsonb_typeof(elem) = 'object' AND (
            (d.codigo IS NOT NULL AND d.codigo = elem->>'codigo') OR
            (d.codigo IS NULL AND d.nombre = elem->>'nombre')
          ))
        )
      WHERE p.deleted_at IS NULL
      ON CONFLICT DO NOTHING;
    `);

    // 4) Vincular paciente_diagnosticos desde strings
    await queryInterface.sequelize.query(`
      INSERT INTO paciente_diagnosticos (paciente_id, diagnostico_id, created_at)
      SELECT p.id, d.id, NOW()
      FROM pacientes p,
      LATERAL (
        SELECT jsonb_array_elements_text(p.diagnosticos) AS nombre
      ) t
      JOIN diagnosticos d ON d.nombre = t.nombre
      WHERE p.deleted_at IS NULL
      ON CONFLICT DO NOTHING;
    `);
  },

  async down() {
    // No se elimina backfill
  }
};


