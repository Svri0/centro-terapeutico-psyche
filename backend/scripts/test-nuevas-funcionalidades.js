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

// Función para obtener pacientes de un psicólogo
async function obtenerPacientesPsicologo(token, psicologoId) {
  try {
    const response = await axios.get(`${API_BASE_URL}/admin/psicologos/${psicologoId}/pacientes`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data.data;
  } catch (error) {
    console.error('Error al obtener pacientes:', error.response?.data || error.message);
    throw error;
  }
}

// Función para obtener citas de un psicólogo
async function obtenerCitasPsicologo(token, psicologoId) {
  try {
    const response = await axios.get(`${API_BASE_URL}/admin/psicologos/${psicologoId}/citas`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data.data;
  } catch (error) {
    console.error('Error al obtener citas:', error.response?.data || error.message);
    throw error;
  }
}

// Función para obtener psicólogos disponibles
async function obtenerPsicologosDisponibles(token, excludeId) {
  try {
    const response = await axios.get(`${API_BASE_URL}/admin/psicologos/disponibles?excludeId=${excludeId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data.data;
  } catch (error) {
    console.error('Error al obtener psicólogos disponibles:', error.response?.data || error.message);
    throw error;
  }
}

// Función para eliminar una cita
async function eliminarCita(token, citaId) {
  try {
    const response = await axios.delete(`${API_BASE_URL}/admin/citas/${citaId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error al eliminar cita:', error.response?.data || error.message);
    throw error;
  }
}

// Función para reasignar un paciente
async function reasignarPaciente(token, pacienteId, nuevoPsicologoId) {
  try {
    const response = await axios.post(`${API_BASE_URL}/admin/pacientes/reasignar`, {
      pacienteId,
      nuevoPsicologoId
    }, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error al reasignar paciente:', error.response?.data || error.message);
    throw error;
  }
}

// Función principal de prueba
async function testNuevasFuncionalidades() {
  try {
    console.log('🧪 Iniciando pruebas de nuevas funcionalidades...\n');

    // Obtener token de admin
    console.log('1. Obteniendo token de administrador...');
    const token = await obtenerTokenAdmin();
    console.log('✅ Token obtenido correctamente\n');

    // Obtener psicólogos
    console.log('2. Obteniendo psicólogos...');
    const psicologos = await obtenerPsicologos(token);
    console.log(`✅ Se encontraron ${psicologos.length} psicólogos\n`);

    if (psicologos.length === 0) {
      console.log('❌ No hay psicólogos disponibles para probar');
      return;
    }

    const primerPsicologo = psicologos[0];
    console.log(`📋 Probando con psicólogo: ${primerPsicologo.nombres} ${primerPsicologo.apellidos} (ID: ${primerPsicologo.id})\n`);

    // Probar obtener pacientes del psicólogo
    console.log('3. Probando obtener pacientes del psicólogo...');
    try {
      const pacientes = await obtenerPacientesPsicologo(token, primerPsicologo.id);
      console.log(`✅ Se encontraron ${pacientes.length} pacientes para este psicólogo`);
      pacientes.forEach((paciente, index) => {
        console.log(`   ${index + 1}. ${paciente.nombres} ${paciente.apellidos} (${paciente.email})`);
      });
    } catch (error) {
      console.log('❌ Error al obtener pacientes:', error.message);
    }
    console.log('');

    // Probar obtener citas del psicólogo
    console.log('4. Probando obtener citas del psicólogo...');
    try {
      const citas = await obtenerCitasPsicologo(token, primerPsicologo.id);
      console.log(`✅ Se encontraron ${citas.length} citas para este psicólogo`);
      citas.forEach((cita, index) => {
        console.log(`   ${index + 1}. ${cita.paciente_nombres} ${cita.paciente_apellidos} - ${cita.fecha} ${cita.hora_inicio} (${cita.estado})`);
      });
    } catch (error) {
      console.log('❌ Error al obtener citas:', error.message);
    }
    console.log('');

    // Probar obtener psicólogos disponibles
    console.log('5. Probando obtener psicólogos disponibles...');
    try {
      const psicologosDisponibles = await obtenerPsicologosDisponibles(token, primerPsicologo.id);
      console.log(`✅ Se encontraron ${psicologosDisponibles.length} psicólogos disponibles (excluyendo el actual)`);
      psicologosDisponibles.forEach((psicologo, index) => {
        console.log(`   ${index + 1}. ${psicologo.nombres} ${psicologo.apellidos} (${psicologo.email})`);
      });
    } catch (error) {
      console.log('❌ Error al obtener psicólogos disponibles:', error.message);
    }
    console.log('');

    // Probar eliminar una cita (si hay citas disponibles)
    console.log('6. Probando eliminar cita...');
    try {
      const citas = await obtenerCitasPsicologo(token, primerPsicologo.id);
      if (citas.length > 0) {
        const primeraCita = citas[0];
        console.log(`🗑️  Intentando eliminar cita: ${primeraCita.paciente_nombres} ${primeraCita.paciente_apellidos} - ${primeraCita.fecha}`);
        
        const resultado = await eliminarCita(token, primeraCita.id);
        console.log('✅ Cita eliminada exitosamente');
        console.log('   Detalles:', resultado.data);
      } else {
        console.log('⚠️  No hay citas disponibles para eliminar');
      }
    } catch (error) {
      console.log('❌ Error al eliminar cita:', error.message);
    }
    console.log('');

    // Probar reasignar un paciente (si hay pacientes y otros psicólogos)
    console.log('7. Probando reasignar paciente...');
    try {
      const pacientes = await obtenerPacientesPsicologo(token, primerPsicologo.id);
      const psicologosDisponibles = await obtenerPsicologosDisponibles(token, primerPsicologo.id);
      
      if (pacientes.length > 0 && psicologosDisponibles.length > 0) {
        const primerPaciente = pacientes[0];
        const nuevoPsicologo = psicologosDisponibles[0];
        
        console.log(`🔄 Intentando reasignar paciente: ${primerPaciente.nombres} ${primerPaciente.apellidos}`);
        console.log(`   De: ${primerPsicologo.nombres} ${primerPsicologo.apellidos}`);
        console.log(`   A: ${nuevoPsicologo.nombres} ${nuevoPsicologo.apellidos}`);
        
        const resultado = await reasignarPaciente(token, primerPaciente.id, nuevoPsicologo.id);
        console.log('✅ Paciente reasignado exitosamente');
        console.log('   Detalles:', resultado.data);
      } else {
        console.log('⚠️  No hay pacientes o psicólogos disponibles para reasignar');
      }
    } catch (error) {
      console.log('❌ Error al reasignar paciente:', error.message);
    }
    console.log('');

    console.log('🎉 ¡Pruebas completadas!');
    console.log('\n📋 Resumen de funcionalidades probadas:');
    console.log('   ✅ Obtener pacientes de un psicólogo');
    console.log('   ✅ Obtener citas de un psicólogo');
    console.log('   ✅ Obtener psicólogos disponibles');
    console.log('   ✅ Eliminar cita específica');
    console.log('   ✅ Reasignar paciente a otro psicólogo');

  } catch (error) {
    console.error('❌ Error en las pruebas:', error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', error.response.data);
    }
  }
}

// Ejecutar las pruebas
testNuevasFuncionalidades(); 