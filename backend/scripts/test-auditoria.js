const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api';

// Función para obtener token de admin
async function obtenerTokenAdmin() {
  try {
    const response = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'admin@psyche.com',
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
    const response = await axios.get(`${BASE_URL}/admin/psicologos`, {
      headers: { Authorization: `Bearer ${token}` }
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
    const response = await axios.get(`${BASE_URL}/admin/psicologos/${psicologoId}/pacientes`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data.data;
  } catch (error) {
    console.error('Error al obtener pacientes del psicólogo:', error.response?.data || error.message);
    throw error;
  }
}

// Función para obtener citas de un psicólogo
async function obtenerCitasPsicologo(token, psicologoId) {
  try {
    const response = await axios.get(`${BASE_URL}/admin/psicologos/${psicologoId}/citas`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data.data;
  } catch (error) {
    console.error('Error al obtener citas del psicólogo:', error.response?.data || error.message);
    throw error;
  }
}

// Función para obtener psicólogos disponibles
async function obtenerPsicologosDisponibles(token) {
  try {
    const response = await axios.get(`${BASE_URL}/admin/psicologos/disponibles`, {
      headers: { Authorization: `Bearer ${token}` }
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
    const response = await axios.delete(`${BASE_URL}/admin/citas/${citaId}`, {
      headers: { Authorization: `Bearer ${token}` }
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
    const response = await axios.post(`${BASE_URL}/admin/pacientes/reasignar`, {
      pacienteId,
      nuevoPsicologoId
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('Error al reasignar paciente:', error.response?.data || error.message);
    throw error;
  }
}

// Función para desactivar un psicólogo
async function desactivarPsicologo(token, psicologoId) {
  try {
    const response = await axios.patch(`${BASE_URL}/admin/psicologos/${psicologoId}/desactivar`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('Error al desactivar psicólogo:', error.response?.data || error.message);
    throw error;
  }
}

// Función para reactivar un psicólogo
async function reactivarPsicologo(token, psicologoId) {
  try {
    const response = await axios.patch(`${BASE_URL}/admin/psicologos/${psicologoId}/reactivar`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('Error al reactivar psicólogo:', error.response?.data || error.message);
    throw error;
  }
}

// Función principal para probar auditoría
async function testAuditoria() {
  console.log('🧪 Iniciando pruebas de auditoría...\n');

  try {
    // 1. Obtener token de admin
    console.log('1️⃣ Obteniendo token de admin...');
    const token = await obtenerTokenAdmin();
    console.log('✅ Token obtenido exitosamente\n');

    // 2. Obtener psicólogos
    console.log('2️⃣ Obteniendo lista de psicólogos...');
    const psicologos = await obtenerPsicologos(token);
    console.log(`✅ Se encontraron ${psicologos.length} psicólogos\n`);

    if (psicologos.length === 0) {
      console.log('❌ No hay psicólogos para probar. Ejecuta primero crear-datos-prueba.js');
      return;
    }

    const primerPsicologo = psicologos[0];
    console.log(`📋 Psicólogo seleccionado: ${primerPsicologo.nombres} ${primerPsicologo.apellidos} (ID: ${primerPsicologo.id})\n`);

    // 3. Probar desactivación de psicólogo
    console.log('3️⃣ Probando desactivación de psicólogo...');
    if (primerPsicologo.activo) {
      await desactivarPsicologo(token, primerPsicologo.id);
      console.log('✅ Psicólogo desactivado (debería generar log de auditoría)\n');
    } else {
      console.log('ℹ️ El psicólogo ya está desactivado\n');
    }

    // 4. Probar reactivación de psicólogo
    console.log('4️⃣ Probando reactivación de psicólogo...');
    await reactivarPsicologo(token, primerPsicologo.id);
    console.log('✅ Psicólogo reactivado (debería generar log de auditoría)\n');

    // 5. Obtener pacientes del psicólogo
    console.log('5️⃣ Obteniendo pacientes del psicólogo...');
    const pacientes = await obtenerPacientesPsicologo(token, primerPsicologo.id);
    console.log(`✅ Se encontraron ${pacientes.length} pacientes\n`);

    // 6. Obtener citas del psicólogo
    console.log('6️⃣ Obteniendo citas del psicólogo...');
    const citas = await obtenerCitasPsicologo(token, primerPsicologo.id);
    console.log(`✅ Se encontraron ${citas.length} citas\n`);

    // 7. Probar eliminación de cita (si hay citas)
    if (citas.length > 0) {
      console.log('7️⃣ Probando eliminación de cita...');
      const primeraCita = citas[0];
      console.log(`📅 Eliminando cita: ${primeraCita.fecha} ${primeraCita.hora_inicio}`);
      await eliminarCita(token, primeraCita.id);
      console.log('✅ Cita eliminada (debería generar log de auditoría)\n');
    } else {
      console.log('ℹ️ No hay citas para eliminar\n');
    }

    // 8. Probar reasignación de paciente (si hay pacientes y otros psicólogos)
    if (pacientes.length > 0) {
      console.log('8️⃣ Obteniendo psicólogos disponibles para reasignación...');
      const psicologosDisponibles = await obtenerPsicologosDisponibles(token);
      console.log(`✅ Se encontraron ${psicologosDisponibles.length} psicólogos disponibles\n`);

      if (psicologosDisponibles.length > 1) {
        console.log('9️⃣ Probando reasignación de paciente...');
        const primerPaciente = pacientes[0];
        const nuevoPsicologo = psicologosDisponibles.find(p => p.id !== primerPsicologo.id);
        
        if (nuevoPsicologo) {
          console.log(`👤 Reasignando paciente ${primerPaciente.nombres} ${primerPaciente.apellidos} a ${nuevoPsicologo.nombres} ${nuevoPsicologo.apellidos}`);
          await reasignarPaciente(token, primerPaciente.id, nuevoPsicologo.id);
          console.log('✅ Paciente reasignado (debería generar log de auditoría)\n');
        } else {
          console.log('ℹ️ No hay otros psicólogos disponibles para reasignación\n');
        }
      } else {
        console.log('ℹ️ No hay suficientes psicólogos para reasignación\n');
      }
    } else {
      console.log('ℹ️ No hay pacientes para reasignar\n');
    }

    console.log('🎉 Pruebas de auditoría completadas exitosamente!');
    console.log('\n📊 Verifica en la base de datos que se hayan creado los logs de auditoría:');
    console.log('   SELECT * FROM logs_auditoria ORDER BY created_at DESC LIMIT 10;');

  } catch (error) {
    console.error('❌ Error durante las pruebas de auditoría:', error.message);
  }
}

// Ejecutar las pruebas
testAuditoria(); 