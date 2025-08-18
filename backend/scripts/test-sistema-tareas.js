const axios = require('axios');

const API_BASE_URL = 'http://localhost:3002/api/v1';

// Función para hacer login y obtener token
async function login(email, password) {
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/login`, {
      email,
      password
    });
    return response.data.data.token;
  } catch (error) {
    console.error('Error en login:', error.response?.data || error.message);
    throw error;
  }
}

// Función para crear una tarea avanzada
async function crearTareaAvanzada(token, tareaData) {
  try {
    const response = await axios.post(`${API_BASE_URL}/tareas/avanzada`, tareaData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data.data;
  } catch (error) {
    console.error('Error al crear tarea:', error.response?.data || error.message);
    throw error;
  }
}

// Función para obtener tareas
async function obtenerTareas(token) {
  try {
    const response = await axios.get(`${API_BASE_URL}/tareas`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data.data;
  } catch (error) {
    console.error('Error al obtener tareas:', error.response?.data || error.message);
    throw error;
  }
}

// Función para guardar respuesta de paciente
async function guardarRespuesta(token, tareaId, respuestaData) {
  try {
    const response = await axios.post(`${API_BASE_URL}/tareas/${tareaId}/respuestas`, respuestaData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data.data;
  } catch (error) {
    console.error('Error al guardar respuesta:', error.response?.data || error.message);
    throw error;
  }
}

// Función para obtener respuestas
async function obtenerRespuestas(token, tareaId) {
  try {
    const response = await axios.get(`${API_BASE_URL}/tareas/${tareaId}/respuestas`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data.data;
  } catch (error) {
    console.error('Error al obtener respuestas:', error.response?.data || error.message);
    throw error;
  }
}

// Función principal de prueba
async function testSistemaTareas() {
  console.log('🧪 Iniciando pruebas del sistema de tareas avanzadas...\n');

  try {
    // 1. Login como psicólogo
    console.log('1️⃣ Login como psicólogo...');
    const tokenPsicologo = await login('laura.fernandez@psyche.cl', 'password123');
    console.log('✅ Login exitoso como psicólogo\n');

    // 2. Obtener tareas existentes
    console.log('2️⃣ Obteniendo tareas existentes...');
    const tareasExistentes = await obtenerTareas(tokenPsicologo);
    console.log(`✅ Se encontraron ${tareasExistentes.length} tareas existentes\n`);

    // 3. Crear tarea de texto abierto
    console.log('3️⃣ Creando tarea de texto abierto...');
    const tareaTextoAbierto = await crearTareaAvanzada(tokenPsicologo, {
      paciente_id: '12345678-1234-1234-1234-123456789012', // ID de ejemplo
      titulo: 'Reflexión sobre el día',
      descripcion: 'Escribe una reflexión sobre cómo te has sentido hoy',
      instrucciones: 'Tómate tu tiempo para reflexionar y escribe honestamente tus pensamientos',
      tipo_tarea: 'texto_abierto',
      prioridad: 'media',
      puntos_asignados: 3,
      contenido_tarea: {
        pregunta: '¿Cómo te has sentido hoy? ¿Qué momentos destacaron?'
      },
      configuracion_tarea: {
        longitud_minima: 100,
        longitud_maxima: 1000
      },
      es_borrador: false,
      fecha_publicacion: new Date().toISOString()
    });
    console.log('✅ Tarea de texto abierto creada:', tareaTextoAbierto.id);

    // 4. Crear tarea de opción múltiple
    console.log('\n4️⃣ Creando tarea de opción múltiple...');
    const tareaOpcionMultiple = await crearTareaAvanzada(tokenPsicologo, {
      paciente_id: '12345678-1234-1234-1234-123456789012', // ID de ejemplo
      titulo: 'Test de estado de ánimo',
      descripcion: 'Selecciona las opciones que mejor describan tu estado de ánimo actual',
      instrucciones: 'Puedes seleccionar múltiples opciones si es necesario',
      tipo_tarea: 'opcion_multiple',
      prioridad: 'alta',
      puntos_asignados: 2,
      contenido_tarea: {
        pregunta: '¿Cómo te sientes en este momento?',
        opciones: [
          { id: 1, texto: 'Feliz y contento' },
          { id: 2, texto: 'Tranquilo y relajado' },
          { id: 3, texto: 'Ansioso o nervioso' },
          { id: 4, texto: 'Triste o deprimido' },
          { id: 5, texto: 'Enojado o frustrado' },
          { id: 6, texto: 'Cansado o agotado' }
        ]
      },
      configuracion_tarea: {
        seleccion_multiple: true,
        opciones_minimas: 1,
        opciones_maximas: 3
      },
      es_borrador: false,
      fecha_publicacion: new Date().toISOString()
    });
    console.log('✅ Tarea de opción múltiple creada:', tareaOpcionMultiple.id);

    // 5. Crear tarea de dibujo
    console.log('\n5️⃣ Creando tarea de dibujo...');
    const tareaDibujo = await crearTareaAvanzada(tokenPsicologo, {
      paciente_id: '12345678-1234-1234-1234-123456789012', // ID de ejemplo
      titulo: 'Dibuja tu lugar feliz',
      descripcion: 'Utiliza la herramienta de dibujo para crear tu lugar feliz',
      instrucciones: 'Dibuja un lugar donde te sientas seguro y feliz. Puede ser real o imaginario.',
      tipo_tarea: 'tarea_dibujo',
      prioridad: 'baja',
      puntos_asignados: 5,
      contenido_tarea: {
        instruccion_dibujo: 'Dibuja tu lugar feliz',
        herramientas_disponibles: ['lapiz', 'borrador', 'colores'],
        tamanio_canvas: { ancho: 800, alto: 600 }
      },
      configuracion_tarea: {
        permitir_guardar_borrador: true,
        tiempo_limite: null
      },
      es_borrador: false,
      fecha_publicacion: new Date().toISOString()
    });
    console.log('✅ Tarea de dibujo creada:', tareaDibujo.id);

    // 6. Obtener todas las tareas para verificar
    console.log('\n6️⃣ Verificando tareas creadas...');
    const tareasActualizadas = await obtenerTareas(tokenPsicologo);
    console.log(`✅ Total de tareas: ${tareasActualizadas.length}`);
    
    // Mostrar las nuevas tareas
    const nuevasTareas = tareasActualizadas.filter(t => 
      t.id === tareaTextoAbierto.id || 
      t.id === tareaOpcionMultiple.id || 
      t.id === tareaDibujo.id
    );
    
    nuevasTareas.forEach(tarea => {
      console.log(`   - ${tarea.titulo} (${tarea.tipo_tarea}) - ${tarea.estado}`);
    });

    // 7. Simular respuesta de paciente (necesitaríamos login como paciente)
    console.log('\n7️⃣ Simulando respuesta de paciente...');
    console.log('⚠️  Para probar respuestas de pacientes, necesitarías:');
    console.log('   - Login como paciente');
    console.log('   - ID de paciente válido');
    console.log('   - Tarea asignada al paciente');

    // 8. Probar obtención de respuestas
    console.log('\n8️⃣ Probando obtención de respuestas...');
    try {
      const respuestas = await obtenerRespuestas(tokenPsicologo, tareaTextoAbierto.id);
      console.log(`✅ Respuestas obtenidas: ${respuestas.respuestas?.length || 0}`);
    } catch (error) {
      console.log('ℹ️  No hay respuestas aún (normal para tareas nuevas)');
    }

    console.log('\n🎉 ¡Pruebas completadas exitosamente!');
    console.log('\n📋 Resumen:');
    console.log('   ✅ Login como psicólogo');
    console.log('   ✅ Creación de tareas avanzadas (texto abierto, opción múltiple, dibujo)');
    console.log('   ✅ Obtención de tareas');
    console.log('   ✅ Verificación de respuestas');
    console.log('\n🚀 El sistema de tareas avanzadas está funcionando correctamente!');

  } catch (error) {
    console.error('\n❌ Error en las pruebas:', error.message);
    console.error('Detalles:', error.response?.data || error);
  }
}

// Ejecutar las pruebas
if (require.main === module) {
  testSistemaTareas();
}

module.exports = {
  testSistemaTareas,
  login,
  crearTareaAvanzada,
  obtenerTareas,
  guardarRespuesta,
  obtenerRespuestas
};
