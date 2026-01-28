const { Sequelize, QueryTypes } = require('sequelize');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

// Configuración de la base de datos
const sequelize = new Sequelize({
  dialect: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'psyche_db',
  logging: false
});

// Función para generar fecha aleatoria en el pasado
function generarFechaPasado(diasAtras) {
  const hoy = new Date();
  const diasAleatorios = Math.floor(Math.random() * diasAtras);
  const fecha = new Date(hoy);
  fecha.setDate(fecha.getDate() - diasAleatorios);
  return fecha;
}

// Función para generar fecha futura
function generarFechaFutura(diasAdelante) {
  const hoy = new Date();
  const diasAleatorios = Math.floor(Math.random() * diasAdelante) + 1;
  const fecha = new Date(hoy);
  fecha.setDate(fecha.getDate() + diasAleatorios);
  return fecha;
}

// Función para generar hora de sesión
function generarHoraSesion() {
  const horas = [9, 10, 11, 12, 14, 15, 16, 17, 18];
  const hora = horas[Math.floor(Math.random() * horas.length)];
  const minutos = [0, 15, 30, 45][Math.floor(Math.random() * 4)];
  return { hora, minutos };
}

// Notas de evolución realistas
const notasEvolucion = [
  "Paciente muestra progreso significativo en el manejo de ansiedad. Practica técnicas de respiración regularmente.",
  "Sesión productiva. Paciente logra identificar patrones de pensamiento negativo y trabaja en reformulación cognitiva.",
  "Buena disposición al trabajo terapéutico. Se observa mejoría en autoestima y relaciones interpersonales.",
  "Paciente reporta disminución de síntomas depresivos. Continúa con adherencia al tratamiento.",
  "Trabajamos en técnicas de afrontamiento del estrés. Paciente muestra compromiso con tareas asignadas.",
  "Excelente sesión. Paciente logra avances en comunicación asertiva y establecimiento de límites.",
  "Se abordaron conflictos familiares. Paciente muestra mayor insight sobre dinámicas relacionales.",
  "Continúa progreso en regulación emocional. Practica mindfulness diariamente con buenos resultados.",
  "Sesión enfocada en estrategias de afrontamiento. Paciente identifica recursos personales de apoyo.",
  "Paciente muestra mayor capacidad de introspección. Trabaja activamente en objetivos terapéuticos.",
  "Avances en manejo de crisis. Paciente utiliza herramientas aprendidas de forma efectiva.",
  "Sesión centrada en técnicas cognitivo-conductuales. Paciente completa registros de pensamiento.",
  "Buena evolución. Se observa reducción en frecuencia e intensidad de síntomas ansiosos.",
  "Paciente reporta mejor calidad de sueño y mayor energía. Continúa con rutinas de autocuidado.",
  "Trabajamos en reestructuración cognitiva de creencias limitantes. Paciente muestra motivación al cambio."
];

// Objetivos de sesión
const objetivosSesion = [
  ["Reducir síntomas de ansiedad", "Practicar técnicas de respiración"],
  ["Identificar pensamientos automáticos negativos", "Desarrollar estrategias de afrontamiento"],
  ["Mejorar autoestima", "Fortalecer habilidades sociales"],
  ["Trabajar duelo y pérdida", "Expresar emociones de forma saludable"],
  ["Establecer límites personales", "Mejorar comunicación asertiva"],
  ["Reducir síntomas depresivos", "Activar conductualmente"],
  ["Manejo del estrés", "Implementar técnicas de relajación"],
  ["Resolver conflictos familiares", "Mejorar vínculos afectivos"],
  ["Desarrollar resiliencia", "Identificar fortalezas personales"],
  ["Trabajar autoconocimiento", "Fomentar insight"]
];

// Técnicas utilizadas
const tecnicasUtilizadas = [
  ["Terapia Cognitivo-Conductual", "Reestructuración cognitiva"],
  ["Mindfulness", "Técnicas de respiración"],
  ["Relajación muscular progresiva", "Visualización guiada"],
  ["Exposición gradual", "Desensibilización sistemática"],
  ["Activación conductual", "Programación de actividades"],
  ["Técnicas de comunicación asertiva", "Role-playing"],
  ["Análisis funcional de conducta", "Reforzamiento positivo"],
  ["Terapia de aceptación y compromiso", "Defusión cognitiva"],
  ["Técnicas de resolución de problemas", "Toma de decisiones"],
  ["Psicoeducación", "Registros de pensamiento"]
];

// Títulos de tareas
const titulosTareas = [
  "Registro de pensamientos automáticos",
  "Práctica de respiración diafragmática",
  "Ejercicio de mindfulness diario",
  "Reflexión sobre emociones de la semana",
  "Identificación de patrones de pensamiento",
  "Práctica de comunicación asertiva",
  "Ejercicio de relajación muscular",
  "Registro de actividades placenteras",
  "Reflexión sobre objetivos personales",
  "Práctica de técnicas de afrontamiento"
];

// Descripciones de tareas
const descripcionesTareas = [
  "Durante esta semana, registra al menos 3 situaciones donde identifiques pensamientos automáticos negativos. Anota la situación, el pensamiento y la emoción asociada.",
  "Practica la respiración diafragmática durante 10 minutos cada día. Puedes hacerlo al despertar o antes de dormir.",
  "Realiza un ejercicio de mindfulness de 15 minutos diarios. Puedes usar una aplicación guiada o simplemente enfocarte en tu respiración.",
  "Escribe una reflexión sobre las emociones que experimentaste durante la semana. Identifica qué situaciones las desencadenaron.",
  "Identifica al menos 2 patrones de pensamiento que notes que se repiten en tu vida. Reflexiona sobre cómo estos patrones afectan tu bienestar.",
  "Practica la comunicación asertiva en al menos una situación esta semana. Puede ser con un familiar, amigo o colega.",
  "Realiza el ejercicio de relajación muscular progresiva que aprendimos en sesión. Hazlo al menos 3 veces esta semana.",
  "Registra al menos 5 actividades que te generen placer o satisfacción. Intenta realizar al menos 2 de ellas esta semana.",
  "Reflexiona sobre tus objetivos personales y cómo te sientes respecto a tu progreso. Escribe tus pensamientos.",
  "Cuando enfrentes una situación estresante esta semana, intenta aplicar al menos una de las técnicas de afrontamiento que hemos trabajado."
];

async function crearDatosFicticios() {
  try {
    console.log('🚀 Iniciando creación de datos ficticios para Bairon Campos...\n');
    
    // 1. Conectar a la base de datos
    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos exitosa\n');

    // 2. Buscar o crear psicólogo Bairon Campos
    console.log('2️⃣ Buscando psicólogo Bairon Campos...');
    let [psicologo] = await sequelize.query(`
      SELECT u.id, u.nombres, u.apellidos, u.email, u.rol_id
      FROM usuarios u
      WHERE u.nombres ILIKE '%Bairon%' 
        AND u.apellidos ILIKE '%Campos%'
        AND u.rol_id = 2
        AND u.deleted_at IS NULL
      LIMIT 1
    `, { type: QueryTypes.SELECT });

    if (!psicologo) {
      console.log('⚠️ No se encontró el psicólogo Bairon Campos');
      console.log('💡 Por favor, crea primero el psicólogo Bairon Campos en el sistema');
      await sequelize.close();
      return;
    }

    console.log(`✅ Psicólogo encontrado: ${psicologo.nombres} ${psicologo.apellidos} (${psicologo.email})\n`);

    // 3. Buscar pacientes del psicólogo
    console.log('3️⃣ Buscando pacientes del psicólogo...');
    const pacientes = await sequelize.query(`
      SELECT p.id, p.usuario_id, u.nombres, u.apellidos, u.email, p.numero_ficha
      FROM pacientes p
      INNER JOIN usuarios u ON p.usuario_id = u.id
      WHERE p.psicologo_id = :psicologo_id
        AND p.deleted_at IS NULL
        AND u.deleted_at IS NULL
      ORDER BY p.created_at
      LIMIT 4
    `, {
      replacements: { psicologo_id: psicologo.id },
      type: QueryTypes.SELECT
    });

    if (pacientes.length === 0) {
      console.log('⚠️ No se encontraron pacientes para este psicólogo');
      console.log('💡 Por favor, asigna al menos 4 pacientes a Bairon Campos primero');
      await sequelize.close();
      return;
    }

    console.log(`✅ Se encontraron ${pacientes.length} paciente(s):`);
    pacientes.forEach((p, i) => {
      console.log(`   ${i + 1}. ${p.nombres} ${p.apellidos} (${p.numero_ficha})`);
    });
    console.log('');

    // 4. Crear sesiones ficticias
    console.log('4️⃣ Creando sesiones ficticias...');
    const estadosSesion = ['completada', 'completada', 'completada', 'programada', 'confirmada'];
    const tiposSesion = ['presencial', 'virtual', 'telefonica'];
    
    let sesionesCreadas = 0;
    const sesionesIds = [];

    for (let i = 0; i < pacientes.length; i++) {
      const paciente = pacientes[i];
      const numSesiones = 5 + Math.floor(Math.random() * 5); // Entre 5 y 9 sesiones por paciente
      
      console.log(`   Creando ${numSesiones} sesiones para ${paciente.nombres} ${paciente.apellidos}...`);

      for (let j = 0; j < numSesiones; j++) {
        const estado = estadosSesion[Math.floor(Math.random() * estadosSesion.length)];
        const tipo = tiposSesion[Math.floor(Math.random() * tiposSesion.length)];
        
        // Fechas: algunas en el pasado (completadas), algunas en el futuro (programadas)
        let fechaProgramada;
        let fechaInicio = null;
        let fechaFin = null;
        let duracionMinutos = null;

        if (estado === 'completada' || estado === 'confirmada') {
          // Sesiones completadas en el pasado
          fechaProgramada = generarFechaPasado(90); // Últimos 90 días
          const hora = generarHoraSesion();
          fechaProgramada.setHours(hora.hora, hora.minutos, 0, 0);
          
          fechaInicio = new Date(fechaProgramada);
          fechaFin = new Date(fechaInicio);
          fechaFin.setMinutes(fechaFin.getMinutes() + 50); // Sesión de 50 minutos
          duracionMinutos = 50;
        } else {
          // Sesiones programadas en el futuro
          fechaProgramada = generarFechaFutura(30); // Próximos 30 días
          const hora = generarHoraSesion();
          fechaProgramada.setHours(hora.hora, hora.minutos, 0, 0);
        }

        const objetivos = objetivosSesion[Math.floor(Math.random() * objetivosSesion.length)];
        const tecnicas = tecnicasUtilizadas[Math.floor(Math.random() * tecnicasUtilizadas.length)];
        const nota = notasEvolucion[Math.floor(Math.random() * notasEvolucion.length)];
        const progreso = ['excelente', 'bueno', 'regular', 'bueno'][Math.floor(Math.random() * 4)];

        const sesionId = uuidv4();
        sesionesIds.push({ id: sesionId, paciente_id: paciente.id, fecha: fechaProgramada });

        await sequelize.query(`
          INSERT INTO sesiones (
            id, paciente_id, psicologo_id, fecha_programada, fecha_inicio, fecha_fin,
            duracion_minutos, tipo_sesion, estado, notas_evolucion, objetivos_sesion,
            tecnicas_utilizadas, resumen_sesion, objetivos_alcanzados, tareas_asignadas,
            progreso_paciente, derivacion_recomendada, archivos_sesion, archivos_adjuntos,
            created_at, updated_at
          ) VALUES (
            :id, :paciente_id, :psicologo_id, :fecha_programada, :fecha_inicio, :fecha_fin,
            :duracion_minutos, :tipo_sesion, :estado, :notas_evolucion, :objetivos_sesion::jsonb,
            :tecnicas_utilizadas::jsonb, :resumen_sesion, :objetivos_alcanzados::jsonb,
            :tareas_asignadas::jsonb, :progreso_paciente, :derivacion_recomendada::jsonb,
            :archivos_sesion::jsonb, :archivos_adjuntos::jsonb, :created_at, :updated_at
          )
        `, {
          replacements: {
            id: sesionId,
            paciente_id: paciente.id,
            psicologo_id: psicologo.id,
            fecha_programada: fechaProgramada,
            fecha_inicio: fechaInicio,
            fecha_fin: fechaFin,
            duracion_minutos: duracionMinutos,
            tipo_sesion: tipo,
            estado: estado,
            notas_evolucion: estado === 'completada' ? nota : null,
            objetivos_sesion: JSON.stringify(objetivos),
            tecnicas_utilizadas: JSON.stringify(tecnicas),
            resumen_sesion: estado === 'completada' ? `Sesión ${tipo} realizada con éxito. ${nota}` : null,
            objetivos_alcanzados: JSON.stringify(estado === 'completada' ? objetivos.slice(0, Math.floor(Math.random() * objetivos.length) + 1) : []),
            tareas_asignadas: JSON.stringify([]),
            progreso_paciente: estado === 'completada' ? progreso : null,
            derivacion_recomendada: JSON.stringify({}),
            archivos_sesion: JSON.stringify([]),
            archivos_adjuntos: JSON.stringify([]),
            created_at: new Date(),
            updated_at: new Date()
          }
        });

        sesionesCreadas++;
      }
    }

    console.log(`✅ Se crearon ${sesionesCreadas} sesiones\n`);

    // 5. Crear tareas asociadas a las sesiones
    console.log('5️⃣ Creando tareas para las sesiones...');
    let tareasCreadas = 0;
    const estadosTarea = ['completada', 'completada', 'pendiente', 'en_progreso', 'vencida'];
    const prioridades = ['baja', 'media', 'alta'];

    for (const sesionInfo of sesionesIds) {
      // Solo crear tareas para sesiones completadas (70% de probabilidad)
      if (Math.random() < 0.7) {
        const numTareas = 1 + Math.floor(Math.random() * 2); // 1 o 2 tareas por sesión
        
        for (let k = 0; k < numTareas; k++) {
          const estado = estadosTarea[Math.floor(Math.random() * estadosTarea.length)];
          const prioridad = prioridades[Math.floor(Math.random() * prioridades.length)];
          const titulo = titulosTareas[Math.floor(Math.random() * titulosTareas.length)];
          const descripcion = descripcionesTareas[Math.floor(Math.random() * descripcionesTareas.length)];
          
          const fechaAsignacion = new Date(sesionInfo.fecha);
          let fechaVencimiento = null;
          let fechaCompletada = null;
          
          if (estado === 'completada') {
            fechaVencimiento = new Date(fechaAsignacion);
            fechaVencimiento.setDate(fechaVencimiento.getDate() + 7);
            fechaCompletada = new Date(fechaVencimiento);
            fechaCompletada.setDate(fechaCompletada.getDate() - Math.floor(Math.random() * 3));
          } else if (estado === 'vencida') {
            fechaVencimiento = new Date(fechaAsignacion);
            fechaVencimiento.setDate(fechaVencimiento.getDate() + 7);
          } else {
            fechaVencimiento = generarFechaFutura(14);
          }

          const puntos = [2, 3, 5, 10][Math.floor(Math.random() * 4)];

          await sequelize.query(`
            INSERT INTO tareas (
              id, paciente_id, psicologo_id, sesion_id, titulo, descripcion,
              tipo_tarea, prioridad, fecha_asignacion, fecha_vencimiento, fecha_completada,
              estado, puntos_asignados, archivos_adjuntos, archivos_respuesta,
              contenido_tarea, configuracion_tarea, es_borrador, created_at, updated_at
            ) VALUES (
              :id, :paciente_id, :psicologo_id, :sesion_id, :titulo, :descripcion,
              :tipo_tarea, :prioridad, :fecha_asignacion, :fecha_vencimiento, :fecha_completada,
              :estado, :puntos_asignados, :archivos_adjuntos::jsonb, :archivos_respuesta::jsonb,
              :contenido_tarea::jsonb, :configuracion_tarea::jsonb, :es_borrador, :created_at, :updated_at
            )
          `, {
            replacements: {
              id: uuidv4(),
              paciente_id: sesionInfo.paciente_id,
              psicologo_id: psicologo.id,
              sesion_id: sesionInfo.id,
              titulo: titulo,
              descripcion: descripcion,
              tipo_tarea: 'texto_abierto',
              prioridad: prioridad,
              fecha_asignacion: fechaAsignacion,
              fecha_vencimiento: fechaVencimiento,
              fecha_completada: fechaCompletada,
              estado: estado,
              puntos_asignados: puntos,
              archivos_adjuntos: JSON.stringify([]),
              archivos_respuesta: JSON.stringify([]),
              contenido_tarea: JSON.stringify({}),
              configuracion_tarea: JSON.stringify({}),
              es_borrador: false,
              created_at: new Date(),
              updated_at: new Date()
            }
          });

          tareasCreadas++;
        }
      }
    }

    console.log(`✅ Se crearon ${tareasCreadas} tareas\n`);

    // 6. Resumen final
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('✅ DATOS FICTICIOS CREADOS EXITOSAMENTE');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log(`👤 Psicólogo: ${psicologo.nombres} ${psicologo.apellidos}`);
    console.log(`👥 Pacientes: ${pacientes.length}`);
    console.log(`📅 Sesiones creadas: ${sesionesCreadas}`);
    console.log(`📝 Tareas creadas: ${tareasCreadas}`);
    console.log('═══════════════════════════════════════════════════════════════\n');

  } catch (error) {
    console.error('❌ Error al crear datos ficticios:', error);
    if (error.original) {
      console.error('   Detalle:', error.original.message);
    }
  } finally {
    await sequelize.close();
  }
}

// Ejecutar el script
crearDatosFicticios();
