const { Sequelize } = require('sequelize');
require('dotenv').config();

// Configuración de la base de datos
const sequelize = new Sequelize({
  database: process.env.DB_NAME || 'psyche_db',
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  dialect: 'postgres',
  logging: false
});

async function verificarPoliticas() {
  try {
    console.log('🔍 Conectando a la base de datos...');
    await sequelize.authenticate();
    console.log('✅ Conexión exitosa a la base de datos\n');

    // Verificar si existe la tabla politicas
    console.log('1️⃣ Verificando si existe la tabla "politicas"...');
    const [tablaExiste] = await sequelize.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'politicas'
    `);

    if (tablaExiste.length === 0) {
      console.log('❌ La tabla "politicas" NO existe');
      console.log('🔧 Necesitas ejecutar la migración: npm run db:migrate\n');
      await sequelize.close();
      return;
    }

    console.log('✅ La tabla "politicas" existe\n');

    // Verificar estructura de la tabla
    console.log('2️⃣ Verificando estructura de la tabla...');
    const [columnas] = await sequelize.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'politicas'
      ORDER BY ordinal_position
    `);

    console.log('📋 Columnas de la tabla politicas:');
    columnas.forEach(col => {
      console.log(`   - ${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'nullable' : 'not null'})`);
    });
    console.log('');

    // Verificar datos
    console.log('3️⃣ Verificando datos en la tabla...');
    const [politicas] = await sequelize.query(`
      SELECT id, tipo, titulo, version, activo, created_at
      FROM politicas
      ORDER BY tipo, version DESC
    `);

    if (politicas.length === 0) {
      console.log('⚠️ No hay políticas en la tabla');
      console.log('🔧 La migración se ejecutó pero no insertó datos. Revisa la migración.\n');
    } else {
      console.log(`✅ Se encontraron ${politicas.length} política(s):\n`);
      politicas.forEach((pol, index) => {
        console.log(`${index + 1}. ${pol.tipo.toUpperCase()} - ${pol.titulo}`);
        console.log(`   Versión: ${pol.version}, Activo: ${pol.activo ? 'Sí' : 'No'}`);
        console.log(`   Creado: ${pol.created_at}\n`);
      });

      // Verificar políticas activas
      const [politicasActivas] = await sequelize.query(`
        SELECT tipo, COUNT(*) as total
        FROM politicas
        WHERE activo = true
        GROUP BY tipo
      `);

      console.log('4️⃣ Políticas activas por tipo:');
      politicasActivas.forEach(pa => {
        console.log(`   - ${pa.tipo}: ${pa.total} política(s) activa(s)`);
      });
      console.log('');

      // Verificar contenido de una política
      if (politicas.length > 0) {
        console.log('5️⃣ Verificando contenido de una política...');
        const [politicaEjemplo] = await sequelize.query(`
          SELECT tipo, titulo, contenido, version
          FROM politicas
          WHERE activo = true
          ORDER BY tipo, version DESC
          LIMIT 1
        `);

        if (politicaEjemplo.length > 0) {
          const pol = politicaEjemplo[0];
          console.log(`   Tipo: ${pol.tipo}`);
          console.log(`   Título: ${pol.titulo}`);
          console.log(`   Versión: ${pol.version}`);
          
          try {
            const contenido = JSON.parse(pol.contenido);
            if (contenido.secciones && Array.isArray(contenido.secciones)) {
              console.log(`   ✅ Contenido válido: ${contenido.secciones.length} sección(es)`);
            } else {
              console.log(`   ⚠️ Contenido no tiene el formato esperado (secciones)`);
            }
          } catch (e) {
            console.log(`   ❌ Error al parsear contenido JSON: ${e.message}`);
          }
        }
      }
    }

    // Verificar migración en SequelizeMeta
    console.log('\n6️⃣ Verificando migración en SequelizeMeta...');
    const [migracion] = await sequelize.query(`
      SELECT name 
      FROM "SequelizeMeta" 
      WHERE name LIKE '%politicas%'
      ORDER BY name DESC
      LIMIT 1
    `);

    if (migracion.length > 0) {
      console.log(`✅ Migración encontrada: ${migracion[0].name}`);
    } else {
      console.log('⚠️ No se encontró la migración en SequelizeMeta');
      console.log('   Esto puede indicar que la migración no se ejecutó correctamente');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.original) {
      console.error('   Detalle:', error.original.message);
    }
  } finally {
    await sequelize.close();
  }
}

verificarPoliticas();
