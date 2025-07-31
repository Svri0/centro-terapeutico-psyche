const { Sequelize } = require('sequelize');

// Configuración de la base de datos
const sequelize = new Sequelize({
  dialect: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'centro_terapeutico',
  logging: false
});

async function debugPsicologo() {
  try {
    console.log('🔍 Conectando a la base de datos...');
    await sequelize.authenticate();
    console.log('✅ Conexión exitosa');

    // Buscar el psicólogo
    console.log('🔍 Buscando psicólogo...');
    const [psicologos] = await sequelize.query(`
      SELECT u.id, u.email, u.nombres, u.apellidos, u.rol_id, r.nombre as rol_nombre
      FROM usuarios u
      INNER JOIN roles r ON u.rol_id = r.id
      WHERE u.email = 'psicologo@terapia.cl'
    `);

    if (!Array.isArray(psicologos) || psicologos.length === 0) {
      console.log('❌ No se encontró el psicólogo');
      console.log('💡 Ejecuta primero: node scripts/crear-psicologo.js');
      process.exit(1);
    }

    const psicologo = psicologos[0];
    console.log('✅ Psicólogo encontrado:');
    console.log('   ID:', psicologo.id);
    console.log('   Email:', psicologo.email);
    console.log('   Nombre:', psicologo.nombres, psicologo.apellidos);
    console.log('   Rol ID:', psicologo.rol_id);
    console.log('   Rol:', psicologo.rol_nombre);

    // Verificar si hay pacientes
    console.log('\n🔍 Verificando pacientes existentes...');
    const [pacientes] = await sequelize.query(`
      SELECT id, numero_ficha, psicologo_id
      FROM pacientes
      WHERE psicologo_id = :psicologoId
      AND deleted_at IS NULL
    `, {
      replacements: { psicologoId: psicologo.id }
    });

    console.log('📋 Pacientes encontrados:', pacientes.length);
    pacientes.forEach(p => {
      console.log(`   - ID: ${p.id}, Ficha: ${p.numero_ficha}, Psicólogo: ${p.psicologo_id}`);
    });

    // Probar la consulta de última ficha
    console.log('\n🔍 Probando consulta de última ficha...');
    const [ultimaFicha] = await sequelize.query(`
      SELECT numero_ficha 
      FROM pacientes 
      WHERE psicologo_id = :psicologoId 
      AND deleted_at IS NULL 
      ORDER BY CAST(SUBSTRING(numero_ficha FROM '\\d+$') AS INTEGER) DESC 
      LIMIT 1
    `, {
      replacements: { psicologoId: psicologo.id }
    });

    console.log('📋 Última ficha:', ultimaFicha);

    // Generar próxima ficha
    let numeroFicha;
    if (Array.isArray(ultimaFicha) && ultimaFicha.length > 0) {
      const ultimoNumero = parseInt(ultimaFicha[0].numero_ficha.split('-').pop() || '0');
      numeroFicha = `PSI-${psicologo.id}-${String(ultimoNumero + 1).padStart(4, '0')}`;
    } else {
      numeroFicha = `PSI-${psicologo.id}-0001`;
    }

    console.log('🎯 Próxima ficha a generar:', numeroFicha);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

// Ejecutar el script
debugPsicologo(); 