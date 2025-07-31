const axios = require('axios');

const API_BASE_URL = 'http://localhost:3001/api/v1';

// Función para obtener el token de administrador
async function obtenerTokenAdmin() {
  try {
    const response = await axios.post(`${API_BASE_URL}/autenticacion/login`, {
      email: 'admin@psyche.cl',
      password: 'admin123'
    });
    return response.data.data.token;
  } catch (error) {
    console.error('Error al obtener token de admin:', error.response?.data || error.message);
    throw error;
  }
}

// Función para crear un paciente
async function crearPaciente(token, datosPaciente) {
  try {
    const response = await axios.post(`${API_BASE_URL}/pacientes`, datosPaciente, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    console.log(`✅ Paciente creado: ${datosPaciente.nombres} ${datosPaciente.apellidos}`);
    return response.data.data;
  } catch (error) {
    console.error('Error al crear paciente:', error.response?.data || error.message);
    throw error;
  }
}

// Función para crear una cita
async function crearCita(token, datosCita) {
  try {
    const response = await axios.post(`${API_BASE_URL}/citas`, datosCita, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    console.log(`✅ Cita creada para ${datosCita.paciente_id} con psicólogo ${datosCita.psicologo_id}`);
    return response.data.data;
  } catch (error) {
    console.error('Error al crear cita:', error.response?.data || error.message);
    throw error;
  }
}

// Función para obtener psicólogos
async function obtenerPsicologos(token) {
  try {
    const response = await axios.get(`${API_BASE_URL}/admin/psicologos`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data.data;
  } catch (error) {
    console.error('Error al obtener psicólogos:', error.response?.data || error.message);
    throw error;
  }
}

// Función principal
async function crearDatosPrueba() {
  try {
    console.log('🔧 Creando datos de prueba...\n');

    // Obtener token de admin
    console.log('1. Obteniendo token de administrador...');
    const token = await obtenerTokenAdmin();
    console.log('✅ Token obtenido correctamente\n');

    // Obtener psicólogos existentes
    console.log('2. Obteniendo psicólogos existentes...');
    const psicologos = await obtenerPsicologos(token);
    console.log(`✅ Se encontraron ${psicologos.length} psicólogos\n`);

    if (psicologos.length === 0) {
      console.log('❌ No hay psicólogos disponibles. Crea algunos psicólogos primero.');
      return;
    }

    const primerPsicologo = psicologos[0];
    console.log(`📋 Usando psicólogo: ${primerPsicologo.nombres} ${primerPsicologo.apellidos} (ID: ${primerPsicologo.id})\n`);

    // Crear pacientes de prueba
    console.log('3. Creando pacientes de prueba...');
    const pacientes = [
      {
        nombres: 'Juan Carlos',
        apellidos: 'Pérez González',
        email: 'juan.perez@email.com',
        telefono: '+56912345678',
        fecha_nacimiento: '1990-05-15',
        genero: 'masculino',
        psicologo_id: primerPsicologo.id
      },
      {
        nombres: 'María Elena',
        apellidos: 'González Silva',
        email: 'maria.gonzalez@email.com',
        telefono: '+56987654321',
        fecha_nacimiento: '1985-08-22',
        genero: 'femenino',
        psicologo_id: primerPsicologo.id
      },
      {
        nombres: 'Carlos Alberto',
        apellidos: 'Rodríguez Martínez',
        email: 'carlos.rodriguez@email.com',
        telefono: '+56955555555',
        fecha_nacimiento: '1992-12-10',
        genero: 'masculino',
        psicologo_id: primerPsicologo.id
      }
    ];

    const pacientesCreados = [];
    for (const paciente of pacientes) {
      try {
        const pacienteCreado = await crearPaciente(token, paciente);
        pacientesCreados.push(pacienteCreado);
      } catch (error) {
        console.log(`⚠️  Error al crear paciente ${paciente.nombres}:`, error.message);
      }
    }

    console.log(`✅ Se crearon ${pacientesCreados.length} pacientes\n`);

    // Crear citas de prueba
    console.log('4. Creando citas de prueba...');
    const citas = [
      {
        paciente_id: pacientesCreados[0]?.id,
        psicologo_id: primerPsicologo.id,
        fecha: '2024-02-20',
        hora_inicio: '10:00',
        hora_fin: '11:00',
        tipo_sesion: 'individual',
        modalidad: 'presencial',
        estado: 'programada',
        notas: 'Primera sesión de evaluación'
      },
      {
        paciente_id: pacientesCreados[1]?.id,
        psicologo_id: primerPsicologo.id,
        fecha: '2024-02-21',
        hora_inicio: '14:00',
        hora_fin: '15:00',
        tipo_sesion: 'individual',
        modalidad: 'virtual',
        estado: 'confirmada',
        notas: 'Sesión de seguimiento'
      },
      {
        paciente_id: pacientesCreados[2]?.id,
        psicologo_id: primerPsicologo.id,
        fecha: '2024-02-22',
        hora_inicio: '16:00',
        hora_fin: '17:00',
        tipo_sesion: 'individual',
        modalidad: 'presencial',
        estado: 'programada',
        notas: 'Sesión de terapia'
      }
    ];

    for (const cita of citas) {
      if (cita.paciente_id) {
        try {
          await crearCita(token, cita);
        } catch (error) {
          console.log(`⚠️  Error al crear cita:`, error.message);
        }
      }
    }

    console.log('✅ Datos de prueba creados exitosamente\n');
    console.log('📊 Resumen:');
    console.log(`   - Psicólogos: ${psicologos.length}`);
    console.log(`   - Pacientes creados: ${pacientesCreados.length}`);
    console.log(`   - Citas creadas: ${citas.length}`);
    console.log('\n🎉 ¡Datos de prueba listos para probar las funcionalidades!');

  } catch (error) {
    console.error('❌ Error en crearDatosPrueba:', error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', error.response.data);
    }
  }
}

// Ejecutar el script
crearDatosPrueba(); 