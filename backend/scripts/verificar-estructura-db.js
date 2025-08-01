const { Sequelize } = require('sequelize');
require('dotenv').config();

// Configuración de la base de datos
const sequelize = new Sequelize({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Ferreteriakm6',
  database: process.env.DB_NAME || 'psyche_db',
  dialect: 'postgres',
  logging: false
});

async function verificarEstructuraDB() {
  console.log('🔍 Verificando estructura de la base de datos...\n');

  try {
    // 1. Verificar conexión
    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos exitosa');

    // 2. Verificar tablas existentes
    console.log('\n2️⃣ Verificando tablas existentes...');
    
    const [tablas] = await sequelize.query(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name"
    );

    console.log('📋 Tablas encontradas:');
    tablas.forEach((tabla, index) => {
      console.log(`   ${index + 1}. ${tabla.table_name}`);
    });

    // 3. Verificar estructura de la tabla usuarios
    console.log('\n3️⃣ Verificando estructura de la tabla usuarios...');
    
    const [columnasUsuarios] = await sequelize.query(
      "SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_name = 'usuarios' ORDER BY ordinal_position"
    );

    console.log('📋 Columnas de la tabla usuarios:');
    columnasUsuarios.forEach((columna, index) => {
      console.log(`   ${index + 1}. ${columna.column_name} (${columna.data_type}) - Nullable: ${columna.is_nullable}`);
    });

    // 4. Verificar roles
    console.log('\n4️⃣ Verificando roles...');
    
    const [roles] = await sequelize.query(
      "SELECT id, nombre FROM roles ORDER BY id"
    );

    console.log('📋 Roles encontrados:');
    roles.forEach((rol, index) => {
      console.log(`   ${index + 1}. ID: ${rol.id} - Nombre: ${rol.nombre}`);
    });

    // 5. Verificar psicólogos
    console.log('\n5️⃣ Verificando psicólogos...');
    
    const [psicologos] = await sequelize.query(
      `SELECT u.id, u.nombres, u.apellidos, u.email, u.activo, r.nombre as rol_nombre
       FROM usuarios u
       INNER JOIN roles r ON u.rol_id = r.id
       WHERE r.nombre = 'psicologo'
       ORDER BY u.created_at DESC`
    );

    console.log(`📋 Psicólogos encontrados: ${psicologos.length}`);
    psicologos.forEach((psicologo, index) => {
      console.log(`   ${index + 1}. ${psicologo.nombres} ${psicologo.apellidos} (${psicologo.email}) - Activo: ${psicologo.activo}`);
    });

    // 6. Verificar restricciones de clave foránea
    console.log('\n6️⃣ Verificando restricciones de clave foránea...');
    
    const [restricciones] = await sequelize.query(
      `SELECT 
        tc.table_name, 
        kcu.column_name, 
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name 
       FROM 
        information_schema.table_constraints AS tc 
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
          AND tc.table_schema = kcu.table_schema
        JOIN information_schema.constraint_column_usage AS ccu
          ON ccu.constraint_name = tc.constraint_name
          AND ccu.table_schema = tc.table_schema
       WHERE tc.constraint_type = 'FOREIGN KEY' 
       ORDER BY tc.table_name, kcu.column_name`
    );

    console.log('📋 Restricciones de clave foránea:');
    restricciones.forEach((restriccion, index) => {
      console.log(`   ${index + 1}. ${restriccion.table_name}.${restriccion.column_name} -> ${restriccion.foreign_table_name}.${restriccion.foreign_column_name}`);
    });

    // 7. Verificar si hay registros relacionados para el primer psicólogo
    if (psicologos.length > 0) {
      const primerPsicologo = psicologos[0];
      console.log(`\n7️⃣ Verificando registros relacionados para ${primerPsicologo.nombres} ${primerPsicologo.apellidos}...`);
      
      // Verificar sesiones
      const [sesiones] = await sequelize.query(
        'SELECT COUNT(*) as total FROM sesiones WHERE psicologo_id = :id',
        { replacements: { id: primerPsicologo.id } }
      );
      console.log(`   - Sesiones: ${sesiones[0].total}`);

      // Verificar citas
      const [citas] = await sequelize.query(
        'SELECT COUNT(*) as total FROM citas WHERE psicologo_id = :id',
        { replacements: { id: primerPsicologo.id } }
      );
      console.log(`   - Citas: ${citas[0].total}`);

      // Verificar pacientes
      const [pacientes] = await sequelize.query(
        'SELECT COUNT(*) as total FROM pacientes WHERE psicologo_id = :id',
        { replacements: { id: primerPsicologo.id } }
      );
      console.log(`   - Pacientes: ${pacientes[0].total}`);

      // Verificar disponibilidad
      const [disponibilidad] = await sequelize.query(
        'SELECT COUNT(*) as total FROM disponibilidad_psicologos WHERE psicologo_id = :id',
        { replacements: { id: primerPsicologo.id } }
      );
      console.log(`   - Disponibilidad: ${disponibilidad[0].total}`);

      // Verificar tareas
      const [tareas] = await sequelize.query(
        'SELECT COUNT(*) as total FROM tareas WHERE psicologo_id = :id',
        { replacements: { id: primerPsicologo.id } }
      );
      console.log(`   - Tareas: ${tareas[0].total}`);

      // Verificar mensajes
      const [mensajes] = await sequelize.query(
        'SELECT COUNT(*) as total FROM mensajes WHERE psicologo_id = :id',
        { replacements: { id: primerPsicologo.id } }
      );
      console.log(`   - Mensajes: ${mensajes[0].total}`);

      // Verificar logs de auditoría
      const [logs] = await sequelize.query(
        'SELECT COUNT(*) as total FROM logs_auditoria WHERE usuario_id = :id',
        { replacements: { id: primerPsicologo.id } }
      );
      console.log(`   - Logs de auditoría: ${logs[0].total}`);
    }

  } catch (error) {
    console.error('❌ Error durante la verificación:', error.message);
    console.error('🔍 Detalles del error:', error);
  } finally {
    await sequelize.close();
  }
}

// Ejecutar verificación
verificarEstructuraDB(); 