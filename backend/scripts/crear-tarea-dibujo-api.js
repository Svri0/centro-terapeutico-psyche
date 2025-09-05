const { Sequelize } = require('sequelize');
const { v4: uuidv4 } = require('uuid');

// Usar la misma configuración que el backend
const sequelize = new Sequelize({
  dialect: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'admin',
  database: process.env.DB_NAME || 'psyche_db',
  logging: false
});

async function crearTareaDibujo() {
  try {
    console.log('🔍 Conectando a la base de datos...');
    await sequelize.authenticate();
    console.log('✅ Conexión exitosa');

    // Obtener un psicólogo y un paciente existentes
    const [psicologos] = await sequelize.query(`
      SELECT u.id, u.nombres, u.apellidos 
      FROM usuarios u 
      INNER JOIN roles r ON u.rol_id = r.id 
      WHERE r.nombre = 'psicologo' 
      LIMIT 1
    `);

    const [pacientes] = await sequelize.query(`
      SELECT p.id, u.nombres, u.apellidos 
      FROM pacientes p 
      INNER JOIN usuarios u ON p.usuario_id = u.id 
      LIMIT 1
    `);

    if (!psicologos.length || !pacientes.length) {
      console.log('❌ No se encontraron psicólogos o pacientes');
      return;
    }

    const psicologo = psicologos[0];
    const paciente = pacientes[0];

    console.log(`👨‍⚕️ Psicólogo: ${psicologo.nombres} ${psicologo.apellidos}`);
    console.log(`👤 Paciente: ${paciente.nombres} ${paciente.apellidos}`);

    // Crear la tarea de dibujo
    const tareaId = uuidv4();
    const tareaData = {
      id: tareaId,
      paciente_id: paciente.id,
      psicologo_id: psicologo.id,
      titulo: 'Dibuja tu casa ideal',
      descripcion: 'Esta tarea te ayudará a expresar tus deseos y aspiraciones a través del dibujo.',
      instrucciones: 'Utiliza la herramienta de dibujo para crear una imagen de tu casa ideal. Piensa en cómo te gustaría que fuera tu hogar perfecto.',
      tipo_tarea: 'tarea_dibujo',
      prioridad: 'media',
      fecha_asignacion: new Date(),
      estado: 'pendiente',
      puntos_asignados: 5,
      archivos_adjuntos: '[]',
      archivos_respuesta: '[]',
      contenido_tarea: JSON.stringify({
        instruccionesDibujo: 'Dibuja tu casa ideal. Incluye detalles como el color, el tamaño, el jardín, las habitaciones que te gustaría tener. Esta tarea te ayudará a explorar tus deseos y aspiraciones.',
        tiempoEstimado: '15-20 minutos',
        materialesNecesarios: 'Herramienta de dibujo digital'
      }),
      configuracion_tarea: JSON.stringify({
        canvasSize: { width: 800, height: 600 },
        allowUndo: true,
        allowRedo: true,
        maxFileSize: '2MB'
      }),
      es_borrador: false,
      fecha_publicacion: new Date(),
      created_at: new Date(),
      updated_at: new Date()
    };

    await sequelize.query(`
      INSERT INTO tareas (
        id, paciente_id, psicologo_id, titulo, descripcion, instrucciones,
        tipo_tarea, prioridad, fecha_asignacion, estado, puntos_asignados,
        archivos_adjuntos, archivos_respuesta, contenido_tarea, configuracion_tarea,
        es_borrador, fecha_publicacion, created_at, updated_at
      ) VALUES (
        :id, :paciente_id, :psicologo_id, :titulo, :descripcion, :instrucciones,
        :tipo_tarea, :prioridad, :fecha_asignacion, :estado, :puntos_asignados,
        :archivos_adjuntos, :archivos_respuesta, :contenido_tarea, :configuracion_tarea,
        :es_borrador, :fecha_publicacion, :created_at, :updated_at
      )
    `, {
      replacements: tareaData
    });

    console.log('✅ Tarea de dibujo creada exitosamente');
    console.log(`📋 ID de la tarea: ${tareaId}`);
    console.log(`🎨 Tipo: Tarea de Dibujo`);
    console.log(`📝 Título: ${tareaData.titulo}`);
    console.log(`👤 Asignada a: ${paciente.nombres} ${paciente.apellidos}`);

  } catch (error) {
    console.error('❌ Error al crear la tarea:', error);
  } finally {
    await sequelize.close();
  }
}

crearTareaDibujo();
